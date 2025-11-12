export const run = {
   async: async (m, {
      client,
      users,
      setting,
      Utils
   }) => {
      try {
         if (setting.mimic?.includes(m.sender) && !users.banned && (new Date - users.ban_temporary > 1800000)) {
            client.copyNForward(m.chat, m, {
               quoted: m.quoted ? m.quoted.fakeObj : null
            })
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}