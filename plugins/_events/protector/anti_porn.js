import { Utils } from '@neoxr/wb'
import Sightengine from '../../../lib/sightengine.js'

export const run = {
   async: async (m, {
      client,
      groupSet,
      isAdmin,
      isBotAdmin,
      Utils
   }) => {
      try {
         if (!m.fromMe && (!m.isGroup || (m.isGroup && groupSet.antiporn)) && /sticker/.test(m.mtype)) {
            const image = await Utils.convertWebp2Jpeg(await Utils.getFile(await m.download()))
            if (image) {
               const isTrue = await Sightengine.isPornImage(image.file)
               if (isTrue) return m.reply(Utils.texted('bold', `💀 Prohibited content.`)).then(() => {
                  if (!m.isGroup) client.updateBlockStatus(m.sender, 'block')
                  if (m.isGroup && !isAdmin && isBotAdmin) return client.sendMessage(m.chat, {
                     delete: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.sender
                     }
                  }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
               })
            }
         }

         if (!m.fromMe && (!m.isGroup || (m.isGroup && groupSet.antiporn)) && /image/.test(m.mtype)) {
            const image = await Utils.getFile(await m.download())
            const isTrue = await Sightengine.isPornImage(image.file)
            if (isTrue) return m.reply(Utils.texted('bold', `💀 Prohibited content.`)).then(() => {
               if (!m.isGroup) client.updateBlockStatus(m.sender, 'block')
               if (m.isGroup && !isAdmin && isBotAdmin) return client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: false,
                     id: m.key.id,
                     participant: m.sender
                  }
               }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
            })
         }

         if (!m.fromMe && (!m.isGroup || (m.isGroup && groupSet.antiporn)) && /video/.test(m.mtype) && m?.msg?.seconds <= 60) {
            const video = await Utils.getFile(await m.download())
            const isTrue = await Sightengine.isPornVideo(video.file)
            if (isTrue) return m.reply(Utils.texted('bold', `💀 Prohibited content`)).then(() => {
               if (!m.isGroup) return client.updateBlockStatus(m.sender, 'block')
               if (m.isGroup && !isAdmin && isBotAdmin) return client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: false,
                     id: m.key.id,
                     participant: m.sender
                  }
               }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
            })
         }
      } catch (e) { }
   },
   error: false,
   cache: true,
   exception: true
}