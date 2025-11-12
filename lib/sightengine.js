import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

class Sightengine {
   constructor() {
      this.ENDPOINT_MAP = {
         image: 'https://api.sightengine.com/1.0/check.json',
         video: 'https://api.sightengine.com/1.0/video/check-sync.json'
      }
   }

   // Docs: https://sightengine.com/docs/getstarted
   isPornImage = async path => {
      try {
         let form = new FormData()
         form.append('media', fs.createReadStream(path))
         form.append('models', 'nudity-2.1,recreational_drug,medical,offensive,text-content,face-attributes,gore-2.0,text,violence,money,gambling')
         form.append('api_user', process.env.API_USER)
         form.append('api_secret', process.env.API_SECRET)
         const result = await (await axios.post(this.ENDPOINT_MAP['image'], form, {
            headers: form.getHeaders()
         })).data
         if (result.status !== 'success') return false
         if (result.nudity.sexual_activity >= 0.50 || result.nudity.suggestive >= 0.50 || result.nudity.erotica >= 0.50) return true
         return false
      } catch {
         return false
      }
   }

   // Docs: https://sightengine.com/docs/moderate-stored-video (Only 60s)
   isPornVideo = async path => {
      try {
         let form = new FormData()
         form.append('media', fs.createReadStream(path))
         form.append('models', 'nudity-2.1')
         form.append('api_user', process.env.API_USER)
         form.append('api_secret', process.env.API_SECRET)
         const result = await (await axios.post(this.ENDPOINT_MAP['video'], form, {
            headers: form.getHeaders()
         })).data
         if (result.status !== 'success') return false
         const data = result?.data?.frames?.[0]
         if (!data) return false
         if (data.nudity.sexual_activity >= 0.50 || data.nudity.suggestive >= 0.50 || data.nudity.erotica >= 0.50) return true
         return false
      } catch {
         return false
      }
   }
}

export default new Sightengine