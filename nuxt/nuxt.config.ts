import config from '../config.json' assert { type: 'json'}

export default defineNuxtConfig({
   devtools: { enabled: false },
   vue: {
      compilerOptions: {
         isCustomElement: tag => tag === 'iconify-icon'
      }
   },
   vite: {
      server: {
         allowedHosts: true
      }
   },
   css: [
      '~/assets/css/style.min.css',
   ],
   app: {
      head: {
         title: config.bot_hosting.name,
         titleTemplate: '%s - WhatsApp Geteway API',
         meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
            { name: 'author', content: config.owner_name },
            { name: 'description', content: `${config.bot_hosting.name} is a powerful WhatsApp Gateway and API that helps you send automated messages, build chatbots, and integrate WhatsApp with your system easily and securely.` },
            { name: 'keywords', content: 'WhatsApp Gateway, WhatsApp API, message automation, chatbot integration, Wapify' }
         ],
         link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css', crossorigin: 'anonymous' }
         ],
         script: [
            { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', crossorigin: 'anonymous' },
         ]
      }
   },
   runtimeConfig: {
      session_expires: 3 * 24 * 60 * 60,
      public: {
         title: config.bot_hosting.name,
         currency: config.bot_hosting.currency,
         price_list: config.bot_hosting.price_list,
         owner: config.owner,
         links: [{
            icon: 'bi bi-github',
            title: 'Github',
            url: 'https://github.com/neoxr'
         }, {
            icon: 'bi bi-fire',
            title: 'Neoxr\'s API',
            url: 'https://api.neoxr.eu'
         }, {
            icon: 'bi bi-whatsapp',
            title: 'Whatsapp',
            url: `https://wa.me/${config.owner}`
         }]
      }
   }
})