export const toJid = input => {
   const i = String(input)
   if (i.endsWith('@s.whatsapp.net')) return i
   return `${i}@s.whatsapp.net`
}

export const parsingData = (type, jid) => {
   let data = null, bot = null

   if (jid) {
      bot = global?.db?.bots?.find(v =>
         v.jid === jid || v.connector?.sessionOpts?.owner === jid
      )
   }

   if (type === 1) {
      data = {
         users: global?.db?.users || [],
         chats: global?.db?.chats || [],
         groups: global?.db?.groups || [],
         setting: global?.db?.setting || {},
         statistic: global?.db?.statistic || {},
         bot,
         bots: global?.db?.bots || []
      }
   }

   if (type === 2) {
      data = {
         users: bot?.data?.users || [],
         chats: bot?.data?.chats || [],
         groups: bot?.data?.groups || [],
         setting: bot?.data?.setting || {},
         statistic: bot?.data?.statistic || {},
         bot,
         bots: []
      }
   }

   return data
}