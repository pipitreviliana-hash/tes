<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <BotManagerCard :accountData="accountData" :isLoading="isLoadingBots" :runtime="runtime"
            @open-change-modal="openChangeNumberModal" />

         <div class="row g-4">
            <div class="col-lg-7">
               <ConsoleCard :logs="logs" :welcomeMessage="welcomeMessage" :loadingStates="loadingStates"
                  :isActionLoading="isActionLoading" :isConnected="accountData?.is_connected"
                  :socketStatus="socketStatus" v-model:wrapLogs="wrapLogs" @control="handleControlAction"
                  @confirm-logout="confirmLogout" />
            </div>
            <div class="col-lg-5">
               <ConnectionStatusCard :loading="waConnect.loading" :qrCode="waConnect.qrCode"
                  :pairingCode="waConnect.pairingCode" :statusMessage="waConnect.status.message"
                  :statusType="waConnect.status.type" :isActionLoading="isActionLoading"
                  :isConnected="accountData?.is_connected" />
            </div>
         </div>
      </div>

      <ChangeNumberModal ref="changeNumberModalRef" v-if="accountData" :initialMethod="accountData.method"
         @submit="handleChangeNumber" />
   </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive } from 'vue'
import Swal from 'sweetalert2'
import { useSocket } from '@/composables/useSocket'
const config = useRuntimeConfig()

const { $api, $bootstrap } = useNuxtApp()
useHead({ title: 'Terminal', titleTemplate: `%s - ${config.public.title}` })

const accountData = ref(null)
const isLoadingBots = ref(true)
const runtime = ref('00:00:00')
let runtimeInterval = null
const logs = ref([])

const socket = useSocket()
const isSocketConnected = ref(false)

const welcomeMessage = ref(`Welcome to the ${config.public.title} Console!`)
const wrapLogs = ref(true)

const waConnect = reactive({
   method: 'qr',
   qrCode: '',
   pairingCode: '',
   status: { type: 'info', message: '' },
   loading: false,
})

const loadingStates = ref({ start: false, stop: false, logout: false })
const isActionLoading = computed(() => loadingStates.value.start || loadingStates.value.stop || loadingStates.value.logout || waConnect.loading)
const changeNumberModalRef = ref(null)
let changeNumberModalInstance = null

const fetchAccountData = async () => {
   isLoadingBots.value = true
   try {
      const response = await $api('/data/account')
      if (response.status && response.data) {
         accountData.value = response.data
      } else {
         throw new Error("Failed to fetch account data")
      }
   } catch (error) {
      console.error(error)
      accountData.value = null
   } finally {
      isLoadingBots.value = false
   }
}

const statusInfo = computed(() => {
   if (!accountData.value) return { text: 'Unknown', class: 'bg-secondary' }
   if (accountData.value.is_connected) return { text: 'Active', class: 'bg-success' }
   if (accountData.value.is_logout || accountData.value.stop) return { text: 'Offline', class: 'bg-danger' }
   return { text: 'Inactive', class: 'bg-warning text-dark' }
})

const socketStatus = computed(() => {
   return {
      text: isSocketConnected.value ? 'Connected' : 'Disconnected',
      class: isSocketConnected.value ? 'bg-success' : 'bg-danger'
   }
})

const startRuntimeTimer = () => {
   if (runtimeInterval) clearInterval(runtimeInterval)
   runtimeInterval = setInterval(() => {
      if (accountData.value?.is_connected && accountData.value.last_connect > 0) {
         const now = Date.now()
         const elapsed = now - accountData.value.last_connect
         const seconds = Math.floor((elapsed / 1000) % 60).toString().padStart(2, '0')
         const minutes = Math.floor((elapsed / (1000 * 60)) % 60).toString().padStart(2, '0')
         const hours = Math.floor(elapsed / (1000 * 60 * 60)).toString().padStart(2, '0')
         runtime.value = `${hours}:${minutes}:${seconds}`
      } else {
         runtime.value = '00:00:00'
      }
   }, 1000)
}

const addLog = (logData) => {
   const newLog = { ...logData, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }
   logs.value.push(newLog)
}

const openChangeNumberModal = () => {
   if (accountData.value?.is_connected) {
      Swal.fire({ icon: 'warning', title: 'Bot is Active', text: 'You must stop or log out the bot before changing the number.' })
   } else {
      changeNumberModalInstance?.show()
   }
}

const handleChangeNumber = async (payload) => {
   if (!payload.number || !accountData.value) return
   const modalComponent = changeNumberModalRef.value
   if (!modalComponent) return

   try {
      const response = await $api('/action/change-number', {
         method: 'POST',
         body: {
            id: accountData.value._id,
            number: payload.number,
            method: payload.method
         }
      });
      if (response.status) {
         changeNumberModalInstance?.hide()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Number change process initiated!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
         await fetchAccountData()
      } else {
         throw new Error(response.message || 'Failed to change number.')
      }
   } catch (error) {
      console.error('Error changing number:', error);
      Swal.fire({ icon: 'error', title: 'Change Failed', text: error.message })
   } finally {
      modalComponent.reset()
   }
}

const handleControlAction = (action) => {
   if (action === 'start') {
      waConnect.loading = true; waConnect.qrCode = ''; waConnect.pairingCode = ''; waConnect.status = { type: 'info', message: '' }
   }
   sendControl(action)
}

const sendControl = async (action) => {
   if (!accountData.value) return;
   loadingStates.value[action] = true
   try {
      const response = await $api('/action/control', {
         method: 'POST',
         body: { id: accountData.value._id, action: action }
      })
      if (!response.status) {
         throw new Error(response.message || 'Action failed')
      }
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Action '${action}' sent successfully!`, showConfirmButton: false, timer: 2000, timerProgressBar: true })
   } catch (error) {
      console.error(`Failed to send action '${action}':`, error)
      waConnect.loading = false;
      Swal.fire({ icon: 'error', title: 'Action Failed', text: error.message })
   } finally {
      fetchAccountData()
      loadingStates.value[action] = false
   }
}

const confirmLogout = () => {
   Swal.fire({
      title: 'Are you sure?',
      text: "This will log out the bot from WhatsApp and you will need to reconnect.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
   }).then((result) => {
      if (result.isConfirmed) {
         sendControl('logout')
      }
   })
}


const onConnect = () => {
   isSocketConnected.value = true;
   addLog({ isCmd: false, type: 'SYSTEM', body: `WebSocket connected.`, at: '', size: '', from: 'CLIENT', in_name: 'Console' });
}

const onDisconnect = (reason) => {
   isSocketConnected.value = false;
   addLog({ isCmd: false, type: 'SYSTEM', body: `WebSocket disconnected: ${reason}.`, at: '', size: '', from: 'CLIENT', in_name: 'Console' });
}

const onWaConnection = (data) => {
   waConnect.loading = false
   if (data.qr) { waConnect.qrCode = data.qr; waConnect.pairingCode = ''; waConnect.status = { type: 'info', message: 'Scan the QR code.' } }
   if (data.code) { waConnect.qrCode = ''; waConnect.pairingCode = data.code; waConnect.status = { type: 'info', message: 'Enter the code on your device.' } }
}

const onStatus = (data) => {
   waConnect.loading = false; waConnect.qrCode = ''; waConnect.pairingCode = ''
   if (data.status === 'success') {
      waConnect.status = { type: 'success', message: `Connection successful!` }
      fetchAccountData()
   } else {
      waConnect.status = { type: 'danger', message: data.message }
   }
}

let onLogs = null

onMounted(async () => {
   await fetchAccountData()
   startRuntimeTimer()

   if (process.client) {
      const modalEl = document.getElementById('changeNumberModal')
      if (modalEl) { changeNumberModalInstance = new $bootstrap.Modal(modalEl) }
   }

   if (socket) {
      isSocketConnected.value = socket.connected

      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.on('whatsapp.connection', onWaConnection)
      socket.on('status', onStatus)

      let botJid = accountData.value?.jid
      if (botJid) {
         const logChannel = `${botJid.replace(/@.+/, '')}.logs`
         onLogs = (data) => {
            if (data.data.body || data.data.media?.base64) {
               addLog(data.data)
            }
         }
         socket.on(logChannel, onLogs)
      } else {
         welcomeMessage.value += `<br>Error: Bot JID not found. Log stream cannot start.`
      }
   }
})

onBeforeUnmount(() => {
   if (runtimeInterval) clearInterval(runtimeInterval)

   if (socket) {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('whatsapp.connection', onWaConnection)
      socket.off('status', onStatus)

      let botJid = accountData.value?.jid
      if (botJid && onLogs) {
         const logChannel = `${botJid.replace(/@.+/, '')}.logs`
         socket.off(logChannel, onLogs)
      }
   }
})
</script>