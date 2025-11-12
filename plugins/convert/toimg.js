import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { tmpdir } from 'os'

export const run = {
   usage: ['toimg'],
   use: 'reply sticker',
   category: 'converter',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply to sticker or video you want to convert to an image/photo (not supported for sticker animation).`), m)
         if (m.quoted.mimetype != 'image/webp') return client.reply(m.chat, Utils.texted('bold', `🚩 Reply to sticker or video you want to convert to an image/photo (not supported for sticker animation).`), m)
         let media = await client.saveMediaMessage(m.quoted)
         let file = Utils.filename('png')
         let isFile = path.join(tmpdir(), file)
         exec(`ffmpeg -i ${media} ${isFile}`, (err, stderr, stdout) => {
            fs.unlinkSync(media)
            if (err) return client.reply(m.chat, Utils.texted('bold', `🚩 Conversion failed.`), m)
            const buffer = fs.readFileSync(isFile)
            client.sendFile(m.chat, buffer, '', '', m)
            fs.unlinkSync(isFile)
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}