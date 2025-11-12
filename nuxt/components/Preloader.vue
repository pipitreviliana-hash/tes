<template>
   <transition name="fade">
      <div v-if="show" class="preloader-overlay">
         <div class="line-loader">
         </div>
      </div>
   </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const show = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
   timer = setTimeout(() => {
      show.value = false
   }, 2000)
})

onBeforeUnmount(() => {
   if (timer) {
      clearTimeout(timer)
   }
})
</script>

<style scoped>
.line-loader {
   width: 80%;
   max-width: 400px;
   height: 4px;
   background-color: var(--dark-border-color);
   position: relative;
   overflow: hidden;
   border-radius: 2px;
}

body.light-mode .line-loader {
   background-color: var(--light-border-color);
}

.line-loader::before {
   content: '';
   position: absolute;
   top: 0;
   left: -50%;
   width: 50%;
   height: 100%;
   background-color: var(--dark-primary-accent);
   animation: line-load 1.5s linear infinite;
   border-radius: 2px;
}

body.light-mode .line-loader::before {
   background-color: var(--light-primary);
}

@keyframes line-load {
   0% {
      left: -50%;
   }
   100% {
      left: 100%;
   }
}
</style>