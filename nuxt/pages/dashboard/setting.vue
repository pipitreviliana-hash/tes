<template>
   <div>
      <div class="container px-3 mb-4 mt-1">

         <div v-if="isLoading" class="text-center py-5">
            <div class="loader-spinner"></div>
            <p class="mt-3">Fetching data...</p>
         </div>

         <div v-else-if="isError" class="alert alert-danger">
            Failed to load settings. Please try again later.
         </div>

         <div v-else>
            <div v-if="type === '1' && setupData" class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Security</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6">
                        <label for="sec-username" class="form-label">Admin Username</label>
                        <input type="text" id="sec-username" class="form-control" v-model="setupData.username">
                     </div>
                     <div class="col-md-6">
                        <label for="sec-password" class="form-label">Admin Password</label>
                        <input type="text" id="sec-password" class="form-control" v-model="setupData.password"
                           placeholder="Enter new password or leave blank">
                     </div>
                     <div class="col-12">
                        <label class="form-label">Operators</label>
                        <p class="form-text mt-0 mb-2">Enter operator numbers separated by commas. (e.g. 6285xxxx,
                           6287xxxx)</p>
                        <input type="text" class="form-control" v-model="localOperatorsInput" @input="updateOperators">
                     </div>
                  </div>
                  <div class="text-end mt-4">
                     <button class="btn btn-custom-accent px-4" @click="saveSecuritySettings"
                        :disabled="isSavingSecurity">
                        <span v-if="isSavingSecurity" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isSavingSecurity ? 'Saving...' : 'Save Security' }}
                     </button>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Main Settings</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div v-for="key in booleanSettingKeys" :key="key" class="col-md-4 col-6">
                        <div class="form-check form-switch">
                           <input class="form-check-input" type="checkbox" role="switch" :id="`switch-${key}`"
                              v-model="settings[key]">
                           <label class="form-check-label" :for="`switch-${key}`">{{ formatKeyToLabel(key) }}</label>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Advanced Settings</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6"><label for="adv-link" class="form-label">Group Link</label><input type="text"
                           id="adv-link" class="form-control" v-model="settings.link"></div>
                     <div class="col-md-6"><label for="adv-onlyprefix" class="form-label">Only Prefix</label><input
                           type="text" id="adv-onlyprefix" class="form-control" v-model="settings.onlyprefix"></div>
                     <div class="col-md-6"><label class="form-label">Prefixes</label>
                        <p class="form-text mt-0 mb-2">Enter items separated by commas.</p><input type="text"
                           class="form-control" v-model="localPrefixInput" @input="updatePrefixes">
                     </div>
                     <div class="col-md-6"><label class="form-label">Owners</label>
                        <p class="form-text mt-0 mb-2">Enter numbers separated by commas.</p><input type="text"
                           class="form-control" v-model="localOwnersInput" @input="updateOwners">
                     </div>
                     <div class="col-md-6"><label class="form-label">Moderators</label>
                        <p class="form-text mt-0 mb-2">Enter numbers separated by commas.</p><input type="text"
                           class="form-control" v-model="localModeratorsInput" @input="updateModerators">
                     </div>
                     <div class="col-md-6"><label class="form-label">Toxic Words</label>
                        <p class="form-text mt-0 mb-2">Enter words separated by commas.</p><textarea
                           class="form-control" v-model="localToxicInput" @input="updateToxic" rows="3"></textarea>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Other Settings</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6"><label for="sk_pack" class="form-label">Sticker Pack</label><input
                           type="text" id="sk_pack" class="form-control" v-model="settings.sk_pack"></div>
                     <div class="col-md-6"><label for="sk_author" class="form-label">Sticker Author</label><input
                           type="text" id="sk_author" class="form-control" v-model="settings.sk_author"></div>
                     <div class="col-12"><label for="msg" class="form-label">Default Message</label><textarea id="msg"
                           class="form-control" v-model="settings.msg" rows="6"></textarea></div>
                  </div>
               </div>
            </div>

            <div class="text-end">
               <button class="btn btn-custom-accent px-4" @click="saveGeneralSettings" :disabled="isSavingGeneral">
                  <span v-if="isSavingGeneral" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isSavingGeneral ? 'Saving...' : 'Save General Settings' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import { useAuth } from '@/composables/useAuth'

const { type } = useAuth()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()
useHead({ title: 'Settings', titleTemplate: `%s - ${config.public.title}` })

const settings = ref({})
const setupData = ref(null)
const isLoading = ref(true)
const isError = ref(false)
const isSavingGeneral = ref(false)
const isSavingSecurity = ref(false)

const localPrefixInput = ref('')
const localOwnersInput = ref('')
const localModeratorsInput = ref('')
const localToxicInput = ref('')
const localOperatorsInput = ref('')

const booleanSettingKeys = computed(() => {
   if (!settings.value) return []
   return Object.keys(settings.value)
      .filter(key =>
         typeof settings.value[key] === 'boolean' &&
         !(type.value === '2' && key === 'autobackup')
      )
      .sort()
})

const initializeLocalInputs = () => {
   localPrefixInput.value = Array.isArray(settings.value.prefix) ? settings.value.prefix.join(', ') : ''
   localOwnersInput.value = Array.isArray(settings.value.owners) ? settings.value.owners.join(', ') : ''
   localModeratorsInput.value = Array.isArray(settings.value.moderators) ? settings.value.moderators.join(', ') : ''
   localToxicInput.value = Array.isArray(settings.value.toxic) ? settings.value.toxic.join(', ') : ''
   if (setupData.value) {
      localOperatorsInput.value = Array.isArray(setupData.value.operators) ? setupData.value.operators.join(', ') : ''
   }
}

const updatePrefixes = () => { settings.value.prefix = localPrefixInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateOwners = () => { settings.value.owners = localOwnersInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateModerators = () => { settings.value.moderators = localModeratorsInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateToxic = () => { settings.value.toxic = localToxicInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateOperators = () => { if (setupData.value) setupData.value.operators = localOperatorsInput.value.split(',').map(p => p.trim()).filter(Boolean) }

const fetchSettings = async () => {
   try {
      const response = await $api('/data/setting')
      if (response.status && response.data) {
         settings.value = response.data
      } else {
         throw new Error("Failed to fetch settings data")
      }
   } catch (error) {
      console.error(error)
      isError.value = true
   }
}

const fetchSetupData = async () => {
   if (type.value !== '1') return
   try {
      const response = await $api('/data/setup')
      if (response.status && response.data) {
         setupData.value = response.data
      } else {
         throw new Error("Failed to fetch setup data")
      }
   } catch (error) {
      console.error(error)
      isError.value = true
   }
}

const saveGeneralSettings = async () => {
   isSavingGeneral.value = true
   try {
      const { cover, ...payload } = settings.value
      const response = await $api('/action/update-setting', {
         method: 'POST',
         body: { data: payload }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'General settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Failed to save settings.')
      }
   } catch (error) {
      console.error('Error saving settings:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error.message || 'An unexpected error occurred.' })
   } finally {
      isSavingGeneral.value = false
   }
}

const saveSecuritySettings = async () => {
   if (!setupData.value) return
   if (!setupData.value.username || !setupData.value.password) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Admin username and password cannot be empty.' })
      return
   }
   isSavingSecurity.value = true
   try {
      const response = await $api('/action/update-setup', {
         method: 'POST',
         body: { data: setupData.value }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Security settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Failed to save security settings.')
      }
   } catch (error) {
      console.error('Error saving security settings:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error.message || 'An unexpected error occurred.' })
   } finally {
      isSavingSecurity.value = false
   }
}

const formatKeyToLabel = (key) => {
   if (!key) return ''
   const result = key.replace(/([A-Z])/g, ' $1')
   return result.charAt(0).toUpperCase() + result.slice(1)
}

onMounted(async () => {
   isLoading.value = true
   await Promise.all([
      fetchSettings(),
      fetchSetupData()
   ])
   initializeLocalInputs()
   isLoading.value = false
})
</script>

<style scoped>
.form-label {
   font-weight: 500;
   margin-bottom: 0.5rem;
}

.form-text {
   font-size: 0.8rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .form-text {
   color: #6c757d;
}
</style>