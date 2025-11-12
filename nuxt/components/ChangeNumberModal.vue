<template>
   <div class="modal fade" id="changeNumberModal" tabindex="-1" aria-labelledby="changeNumberModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="changeNumberModalLabel">Change Bot Number</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
               <div class="mb-3">
                  <label for="newBotNumber" class="form-label">New WhatsApp Number</label>
                  <input type="number" class="form-control" id="newBotNumber" v-model="newNumber"
                     placeholder="e.g., 62812xxxx" :disabled="isSubmitting">
                  <div class="form-secondary">Enter the new number without the '+' sign.</div>
               </div>
               <div class="mb-3">
                  <label class="form-label d-block mb-2">New Connection Method</label>
                  <div class="connection-method btn-group w-100" role="group">
                     <input type="radio" class="btn-check" name="connection-method" id="modal-scan-qr" value="qr"
                        v-model="newMethod" autocomplete="off" :disabled="isSubmitting">
                     <label class="btn btn-outline-secondary" for="modal-scan-qr">Scan QR</label>
                     <input type="radio" class="btn-check" name="connection-method" id="modal-pairing-code"
                        value="pairing" v-model="newMethod" autocomplete="off" :disabled="isSubmitting">
                     <label class="btn btn-outline-secondary" for="modal-pairing-code">Pairing Code</label>
                  </div>
               </div>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                  :disabled="isSubmitting">Cancel</button>
               <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  {{ isSubmitting ? 'Changing...' : 'Change' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
   initialMethod: {
      type: String,
      default: 'qr'
   }
})
const emit = defineEmits(['submit'])

const newNumber = ref('')
const newMethod = ref('qr')
const isSubmitting = ref(false)

watch(() => props.initialMethod, (val) => {
   newMethod.value = val
}, { immediate: true })

const handleSubmit = () => {
   isSubmitting.value = true
   emit('submit', { number: newNumber.value, method: newMethod.value })
}

defineExpose({
   reset() {
      isSubmitting.value = false
      newNumber.value = ''
   }
})
</script>

<style scoped>
.connection-method .btn-check:checked+.btn {
   background-color: var(--dark-primary-accent);
   color: #000;
   border-color: var(--dark-primary-accent);
}

body.light-mode .connection-method .btn-check:checked+.btn {
   background-color: var(--light-primary);
   color: #fff;
   border-color: var(--light-primary);
}
</style>