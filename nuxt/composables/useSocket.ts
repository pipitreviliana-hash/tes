import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useSocket = () => {
   if (!socket && process.client) {
      socket = io({
         path: '/socket.io',
         reconnection: true,
         reconnectionAttempts: Infinity,
         reconnectionDelay: 1000,
         reconnectionDelayMax: 5000,
         timeout: 10000,
         transports: ['polling', 'websocket']
      })

      socket.on('connect', () => {
         console.log('Global WebSocket Connected!', socket?.id)
      })

      socket.on('disconnect', (reason) => {
         console.log('Global WebSocket Disconnected:', reason)
      })

      socket.on('reconnect_attempt', (attempt) => {
         console.log('Global WebSocket Reconnecting... Attempt:', attempt)
      })
   }

   return socket
}