import { App } from '@neoxr/webly'
import './controllers/global.js'
import middleware from './middlewares/index.js'
import path from 'path'
import { clone } from '../lib/system/mapping.js'

const app = new App({
   staticPath: ['nuxt/.output/public'],
   routePath: './core/routes',
   middleware,
   socket: true,
   session: {
      name: 'token',
      keys: ['session'],
      maxAge: 72 * 60 * 60 * 1000, // 3 days
      httpOnly: false,
      sameSite: 'strict'
   },
   cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: '*',
      credentials: true
   },
   error: (req, res) => {
      res.sendFile(path.join(process.cwd(), 'nuxt/.output/public', '404.html'))
   }
})

app.socket?.on('connection', (socket) => {
   console.log('🟢 Client connected:', socket.id)

   socket.on('ping', (msg) => {
      console.log('📨 Received ping:', msg)
      socket.emit('pong', 'Ping from server Express + Socket.IO!')
   })

   socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id)
   })
})

app.use((req, res, next) => {
   req.bot = clone.get('sync')
   next()
})

app.start()