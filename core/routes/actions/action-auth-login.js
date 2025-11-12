import { Instance, Config, Utils } from '@neoxr/wb'
import { toJid } from '../../utils/index.js'
import jwt from 'jsonwebtoken'

export const routes = {
   category: 'action',
   path: '/action/login',
   method: 'post',
   parameter: ['type'],
   execution: async (req, res, next) => {
      try {
         const { type, username, password, token } = req.body
         const operatorJid = toJid(Config.owner)
         const mainJid = toJid(Config.pairing.number)
         let instanceJid

         if (!type || (type !== 1 && type !== 2))
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid login type'
            })

         if (type === 1) {
            if (!username || !password)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Username and password can\'t leave empty'
               })

            const creds = global.db.setup
            if (creds?.username !== username || creds?.password != password)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Invalid username or password'
               })
         }

         if (type === 2) {
            if (!token)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Token can\'t leave empty'
               })
         }

         const instance = type === 1 ? Instance.getBotDataByJid(mainJid) : Instance.getBotDataByToken(token)
         if (!instance)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         if (type === 2) {
            if (instance.jid === mainJid)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'You are the main bot account. Please login using your username and password.'
               })

            instanceJid = global?.db?.bots?.find(v =>
               v.jid === instance.jid
            )
         }

         if (type === 2 && !instanceJid?.connector?.sessionOpts?.owner)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Account not found'
            })

         // const client = Instance.getSocketByToken(instance.token)
         // if (!client)
         //    return res.status(404).json({
         //       creator: global.creator,
         //       status: false,
         //       message: 'Bot not found'
         //    })

         const jid = type === 1 ? operatorJid : toJid(instanceJid.connector.sessionOpts.owner)
         const profilePicture = await req.bot.sock.profilePicture(jid)
         const imageUrl = profilePicture || 'https://qu.ax/mnUAl.jpg'
         const jwtToken = jwt.sign({ jid, type, username, password, hash: token }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
         req.session.login = true
         req.session.type = type
         req.session.jid = jid
         req.session.token = jwtToken
         res.json({
            creator: global.creator,
            status: true,
            data: {
               avatar: imageUrl,
               token: jwtToken,
               jid, type,
               created_at: Date.now(),
               expired_at: Utils.toMs(process.env.JWT_EXPIRY)
            }
         })
      } catch (e) {
         Utils.printError(e)
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false
}