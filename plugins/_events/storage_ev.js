export const run = {
   async: async (m, {
      client,
      body,
      setting,
      storage,
      Utils
   }) => {
      try {
         const files = storage?.find(v => body && v.name == body.toLowerCase())
         if (files) {
            if (/audio/.test(files.mime)) {
               client.sendFile(m.chat, files.url, files.filename, '', m, {
                  ptt: files.ptt
               })
            } else if (/webp/.test(files.mime)) {
               const buffer = await Utils.fetchAsBuffer(files.url)
               client.sendSticker(m.chat, buffer, m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            } else {
               client.sendFile(m.chat, files.url, files.filename, '', m)
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   }
}