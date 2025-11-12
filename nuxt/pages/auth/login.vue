<template>
   <div class="container px-3 my-4">
      <div class="text-center mb-4">
         <h1 class="main-title mb-1">Welcome Back!</h1>
         <p class="text-secondary">Please sign in to access your {{ config.public.title }} dashboard</p>
      </div>
      <div class="row g-4">
         <div class="col-12 col-lg-6">
            <div class="content-card p-4 p-md-5 rounded-3">
               <div class="btn-group form-type-selector w-100 mb-4" role="group">
                  <input type="radio" class="btn-check" name="form-type" id="type-password" value="password"
                     v-model="selectedForm" autocomplete="off">
                  <label class="btn btn-outline-custom-accent" for="type-password">Password</label>
                  <input type="radio" class="btn-check" name="form-type" id="type-token" value="token"
                     v-model="selectedForm" autocomplete="off">
                  <label class="btn btn-outline-custom-accent" for="type-token">Token</label>
                  <input type="radio" class="btn-check" name="form-type" id="type-connect" value="connect"
                     v-model="selectedForm" autocomplete="off">
                  <label class="btn btn-outline-custom-accent" for="type-connect">Connect</label>
               </div>
               <div v-if="selectedForm === 'password'">
                  <form @submit.prevent="loginByPassword">
                     <div class="mb-3"><label for="username" class="form-label">Username</label><input type="text"
                           class="form-control" id="username" v-model="username" placeholder="Enter your username">
                     </div>
                     <div class="mb-3"><label for="password" class="form-label">Password</label><input type="password"
                           class="form-control" id="password" v-model="password" placeholder="Enter your password">
                     </div>
                     <div class="form-check mb-4"><input class="form-check-input" type="checkbox" id="rememberMe"
                           v-model="rememberMe"><label class="form-check-label" for="rememberMe">Remember me</label>
                     </div>
                     <button type="submit" class="btn btn-custom-accent w-100" :disabled="loading"><span v-if="loading"
                           class="spinner-border spinner-border-sm me-1" role="status"></span>{{ loading ?
                              'Processing...' : 'Log In' }}</button>
                  </form>
               </div>
               <div v-else-if="selectedForm === 'token'">
                  <div class="alert alert-info small">Use this method to quickly access your client dashboard.</div>
                  <form @submit.prevent="loginByToken">
                     <div class="mb-3"><label for="token" class="form-label">Token</label><input type="text"
                           class="form-control" id="token" v-model="token" placeholder="Enter your token"></div>
                     <button type="submit" class="btn btn-custom-accent w-100" :disabled="loading"><span v-if="loading"
                           class="spinner-border spinner-border-sm me-1" role="status"></span>{{ loading ?
                              'Processing...' : 'Log In' }}</button>
                  </form>
               </div>
               <div v-else-if="selectedForm === 'connect'">
                  <form @submit.prevent="connectWhatsApp">
                     <div class="mb-3"><label for="whatsappNumber" class="form-label">Bot Number</label><input
                           type="text" class="form-control" id="whatsappNumber" v-model="waConnect.number"
                           placeholder="e.g. 62812xxxx" :disabled="waConnect.loading"></div>
                     <div class="mb-3"><label for="ownerNumber" class="form-label">Owner Number</label><input
                           type="text" class="form-control" id="ownerNumber" v-model="waConnect.owner"
                           placeholder="e.g. 62812xxxx" :disabled="waConnect.loading || waConnect.sameAsNumber">
                        <div class="form-check mt-2"><input class="form-check-input" type="checkbox"
                              id="sameAsNumberCheck" v-model="waConnect.sameAsNumber"><label class="form-check-label"
                              for="sameAsNumberCheck">Same as Bot Number</label></div>
                     </div>
                     <div class="mb-4"><label class="form-label d-block mb-2">Connection Method</label>
                        <div class="connection-method btn-group w-100" role="group"><input type="radio"
                              class="btn-check" name="connection-method" id="scan-qr" value="qr"
                              v-model="waConnect.method" autocomplete="off"
                              :disabled="waConnect.loading || !!waConnect.pairingCode"><label
                              class="btn btn-outline-secondary" for="scan-qr">Scan QR</label><input type="radio"
                              class="btn-check" name="connection-method" id="pairing-code" value="pairing"
                              v-model="waConnect.method" autocomplete="off" :disabled="waConnect.loading"><label
                              class="btn btn-outline-secondary" for="pairing-code">Pairing Code</label></div>
                     </div>
                     <button type="submit" class="btn btn-custom-accent w-100"
                        :disabled="waConnect.loading || !!waConnect.qrCode || !!waConnect.pairingCode"><span
                           v-if="waConnect.loading" class="spinner-border spinner-border-sm me-1"
                           role="status"></span>{{ waConnect.loading ? 'Connecting...' : 'Start Connect' }}</button>
                  </form>
               </div>
            </div>
         </div>
         <div class="col-12 col-lg-6">
            <div class="content-card rounded-3 connect-display-card">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Connection Status</h5>
               </div>
               <div class="card-body-custom d-flex flex-column align-items-center justify-content-center text-center">
                  <div v-if="!waConnect.loading && !waConnect.qrCode && !waConnect.pairingCode" class="py-5">
                     <i class="bi bi-qr-code-scan display-1 text-secondary"></i>
                     <p class="mt-3 text-secondary">QR Code or Pairing Code will appear here.</p>
                  </div>
                  <div v-if="waConnect.loading" class="py-5">
                     <div class="loader-spinner"></div>
                     <p class="mt-3">Waiting for connection...</p>
                  </div>
                  <div v-if="waConnect.qrCode" class="qr-code-wrapper">
                     <p class="fw-bold">Scan this QR code with your WhatsApp</p>
                     <img :src="`data:image/png;base64,${waConnect.qrCode}`" alt="QR Code" class="img-fluid rounded">
                     <p class="text-danger mt-3 fs-6" v-if="waConnect.status.message !== 'info'">Don't close this page
                        until you are connected!</p>
                  </div>
                  <div v-if="waConnect.pairingCode" class="pairing-code-wrapper">
                     <p class="fw-bold">Enter this code in your WhatsApp</p>
                     <div class="pairing-code-boxes">
                        <span v-for="(char, index) in waConnect.pairingCode.split('')" :key="index" class="code-box">{{
                           char }}</span>
                     </div>
                     <p class="text-danger mt-3 fs-6" v-if="waConnect.status.message !== 'info'">Don't close this page
                        until you are connected!</p>
                  </div>
                  <div class="alert mt-3 w-100" v-if="waConnect.status.message"
                     :class="`alert-${waConnect.status.type}`" role="alert">{{ waConnect.status.message }}</div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
useHead({ title: 'Login', titleTemplate: `%s - ${config.public.title}` })

const { setAuth } = useAuth()
const { $api } = useNuxtApp()
const router = useRouter()
const socket = useSocket()

const selectedForm = ref<'password' | 'token' | 'connect'>('password')
const loading = ref(false)
const username = ref('')
const password = ref('')
const rememberMe = ref(true)
const token = ref('')

const waConnect = reactive({
   number: '',
   owner: '',
   sameAsNumber: true,
   method: 'qr',
   qrCode: '',
   pairingCode: '',
   status: { type: 'info', message: '' },
   loading: false,
})

watch(() => waConnect.sameAsNumber, (isSame) => { if (isSame) waConnect.owner = waConnect.number })
watch(() => waConnect.number, (newNumber) => { if (waConnect.sameAsNumber) waConnect.owner = newNumber })
watch(selectedForm, (newForm) => {
   if (newForm !== 'connect') {
      waConnect.qrCode = ''
      waConnect.pairingCode = ''
      waConnect.status.message = ''
      waConnect.loading = false
   }
})

const onWaUpdate = (data: { jid: string, qr: string, code: string }) => {
   waConnect.loading = false
   if (data.qr) { waConnect.qrCode = data.qr; waConnect.pairingCode = ''; waConnect.status = { type: 'info', message: 'Please scan the QR code.' } }
   if (data.code) { waConnect.qrCode = ''; waConnect.pairingCode = data.code; waConnect.status = { type: 'info', message: 'Enter the code on your device.' } }
}
const onStatusUpdate = (data: { jid: string, status: string, message: string }) => {
   waConnect.loading = false; waConnect.qrCode = ''; waConnect.pairingCode = ''
   if (data.status === 'success') { waConnect.status = { type: 'success', message: data.message } }
   else { waConnect.status = { type: 'danger', message: data.message } }
}

onMounted(() => {
   waConnect.method = 'qr'
   if (socket) {
      socket.on('whatsapp.connection', onWaUpdate)
      socket.on('status', onStatusUpdate)
   }
})

onUnmounted(() => {
   if (socket) {
      socket.off('whatsapp.connection', onWaUpdate)
      socket.off('status', onStatusUpdate)
   }
})

const navigateOnSuccess = () => {
   Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Login successful!',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      willClose: () => router.push('/dashboard')
   })
}
const handleLoginError = (e: any) => {
   Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: e.data?.message || 'Something went wrong!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
   })
}

const loginByPassword = async () => {
   if (!username.value || !password.value) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Username and Password are required.', showConfirmButton: false, timer: 2000 })
      return
   }
   loading.value = true
   try {
      const json = await $api('/action/login', { method: 'POST', body: { username: username.value, password: password.value, type: 1 } })
      if (!json.status) throw { data: json }
      setAuth({ token: json.data.token, type: String(json.data.type), jid: json.data.jid })
      navigateOnSuccess()
   } catch (e: any) {
      handleLoginError(e)
   } finally {
      loading.value = false
   }
}

const loginByToken = async () => {
   if (!token.value) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Token is required.', showConfirmButton: false, timer: 2000 })
      return
   }
   loading.value = true
   try {
      const json = await $api('/action/login', { method: 'POST', body: { token: token.value, type: 2 } })
      if (!json.status) throw { data: json }
      setAuth({ token: json.data.token, type: String(json.data.type), jid: json.data.jid })
      navigateOnSuccess()
   } catch (e: any) {
      handleLoginError(e)
   } finally {
      loading.value = false
   }
}

const connectWhatsApp = async () => {
   if (!waConnect.number || !waConnect.owner) {
      waConnect.status = { type: 'warning', message: 'Bot Number and Owner Number are required.' }
      return
   }
   waConnect.loading = true
   waConnect.qrCode = ''
   waConnect.pairingCode = ''
   waConnect.status = { type: 'info', message: '' }
   try {
      const json = await $api('/action/connect', { method: 'POST', body: { number: waConnect.number, owner: waConnect.owner, method: waConnect.method } })
      if (!json.status) throw { data: json }
   } catch (e: any) {
      waConnect.status = { type: 'danger', message: e.data?.message || 'Failed to start connection process.' }
      waConnect.loading = false
   }
}
</script>

<style>
.font-play {
   font-family: 'Play', sans-serif
}

.form-type-selector .btn-outline-custom-accent {
   --bs-btn-color: var(--dark-secondary-text-color);
   --bs-btn-border-color: var(--dark-border-color);
   --bs-btn-hover-bg: var(--dark-border-color);
   --bs-btn-hover-color: var(--dark-text-color);
   --bs-btn-active-bg: var(--dark-primary-accent);
   --bs-btn-active-border-color: var(--dark-primary-accent);
   --bs-btn-active-color: #000
}

.form-type-selector .btn-check:checked+.btn-outline-custom-accent {
   background-color: var(--dark-primary-accent);
   border-color: var(--dark-primary-accent);
   color: #000
}

body.light-mode .form-type-selector .btn-outline-custom-accent {
   --bs-btn-color: #6c757d;
   --bs-btn-border-color: var(--light-border-color);
   --bs-btn-hover-bg: #e9ecef;
   --bs-btn-hover-color: var(--light-text-color);
   --bs-btn-active-bg: var(--light-primary);
   --bs-btn-active-border-color: var(--light-primary);
   --bs-btn-active-color: #fff
}

body.light-mode .form-type-selector .btn-check:checked+.btn-outline-custom-accent {
   background-color: var(--light-primary);
   border-color: var(--light-primary);
   color: #fff
}

.connection-method .btn {
   --bs-btn-color: var(--dark-secondary-text-color);
   --bs-btn-border-color: var(--dark-border-color);
   --bs-btn-hover-bg: var(--dark-border-color);
   --bs-btn-hover-color: var(--dark-text-color);
   --bs-btn-active-bg: #56636b;
   --bs-btn-active-border-color: #56636b;
   --bs-btn-active-color: #fff
}

.connection-method .btn-check:checked+.btn {
   background-color: #56636b;
   border-color: #56636b;
   color: #fff
}

body.light-mode .connection-method .btn {
   --bs-btn-color: #6c757d;
   --bs-btn-border-color: #ced4da;
   --bs-btn-hover-bg: #e9ecef;
   --bs-btn-hover-color: #212529
}

body.light-mode .connection-method .btn-check:checked+.btn {
   background-color: #6c757d;
   border-color: #6c757d;
   color: #fff
}

.qr-code-wrapper img {
   max-width: 250px;
}

.pairing-code-boxes {
   display: flex;
   gap: 0.5rem;
   flex-wrap: wrap;
   justify-content: center;
}

.code-box {
   display: flex;
   align-items: center;
   justify-content: center;
   width: 27px;
   height: 27px;
   background-color: var(--dark-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   font-family: 'Hanken Grotesk', sans-serif;
   font-size: 15px;
   font-weight: 700;
   color: var(--dark-primary-accent);
}

body.light-mode .code-box {
   background-color: var(--light-bg);
   border-color: var(--light-border-color);
   color: var(--light-primary);
}
</style>