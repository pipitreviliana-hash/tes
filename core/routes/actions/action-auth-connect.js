import { Instance, Config, Utils } from '@neoxr/wb'
import qrcode from 'qrcode'
import { retry, io } from '../../../lib/system/mapping.js'
import system from '../../../lib/system/adapter.js'
import { toJid } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/connect',
   method: 'post',
   parameter: ['number', 'owner', 'method'],
   execution: async (req, res, next) => {
      try {
         const { number, owner, method } = req.body

         const result = await req.bot.sock.onWhatsApp(String(number))
         const { jid, exists } = result?.[0] || {}

         if (!exists)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'The number is not registered on WhatsApp.'
            })

         let ownerJid = toJid(owner)
         if (number != owner) {
            const result = await req.bot.sock.onWhatsApp(owner)
            const { jid, exists } = result?.[0] || {}
            if (!exists)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'The number is not registered on WhatsApp.'
               })

            ownerJid = jid
         }

         const isRegistered = global.db.bots?.find(v =>
            v.connector?.sessionOpts?.number === number || v.connector?.sessionOpts?.owner === toJid(owner)
         )

         if (isRegistered)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'The owner or bot number already registered'
            })

         if (req.io) {
            io.set(jid, req.io)
         } else {
            console.error(`[CRITICAL] req.io is undefined for JID: ${jid}. WebSocket updates will fail.`)
            return res.status(500).json({
               creator: global.creator,
               status: false,
               message: 'Internal Error: WebSocket handler not available.'
            })
         }

         if (retry.has(jid))
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'You are in the process of connecting, please wait a moment before trying again.'
            })

         if (!['pairing', 'qr'].includes(method))
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid connection method.'
            })


         if (global.db?.bots?.filter(v => v.is_connected).length >= Config.bot_hosting.slot)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Sorry, the bot host slots are full.'
            })

         if (Instance.getBotDataByJid(jid)?.is_connected)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'The bot is already connected.'
            })

         io.set(jid, req.io)

         res.status(200).json({
            creator: global.creator,
            status: true,
            message: 'The connection process has started. Please scan the QR or enter the code.'
         })

         const msisdn = jid.replace(/\D/g, '')
         const socket = await req.bot.create({
            session: ['sqlite', 'local'].includes(system.session)
               ? `./${Config.bot_hosting.session_dir}/${msisdn}`
               : String(msisdn),
            type: system.session,
            number: msisdn,
            owner: ownerJid,
            config: process.env.DATABASE_URL || ''
         }, {
            state: method === 'pairing',
            number: msisdn,
            code: Config.pairing.code
         })

         socket.register('connect', async ctx => {
            const { sock } = socket
            const timeoutDuration = 59_000
            const timers = setTimeout(() => {
               if (retry.has(jid)) {
                  req.io.emit('status', {
                     jid,
                     status: 'timeout',
                     message: 'The request has ended, the bot did not connect within the time limit.'
                  })
                  sock.end()
                  retry.delete(jid)
                  Utils.removeItem(global.db.bots, global.db.bots.find(v => v.jid === jid))
               }
            }, timeoutDuration)

            retry.set(jid, timers)

            if (ctx?.qr) {
               const buffer = await qrcode.toBuffer(ctx.qr, { type: 'png' })
               req.io.emit('whatsapp.connection', {
                  jid,
                  qr: buffer.toString('base64'),
                  code: null
               })
            }

            if (ctx?.code) {
               req.io.emit('whatsapp.connection', {
                  jid,
                  qr: null,
                  code: ctx.code
               })
            }
         })
      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false
}