<template>
   <div>
      <Preloader />
      <!-- Navigasi Utama -->
      <nav class="navbar fixed-top py-3" id="mainNavbar" :class="{ 'scrolled': isScrolled }">
         <div class="container px-3">
            <h1 class="main-title mb-0">
               <NuxtLink to="/" class="text-decoration-none" style="color: inherit;">
                  {{ title }}
               </NuxtLink>
            </h1>

            <div class="d-flex align-items-center">
               <div class="d-none d-md-flex align-items-center me-3">
                  <ul class="navbar-nav flex-row">
                     <!-- PERBAIKAN: Menambahkan kondisi khusus untuk logout -->
                     <template v-for="link in navLinks" :key="link.text">
                        <li class="nav-item" v-if="shouldShowLink(link)">
                           <a v-if="link.isLogout" class="nav-link px-2 text-danger" href="#" @click.prevent="logout">{{ link.text }}</a>
                           <NuxtLink v-else class="nav-link px-2" :to="link.href">{{ link.text }}</NuxtLink>
                        </li>
                     </template>
                  </ul>
               </div>

               <Theme />

               <button class="navbar-toggler d-md-none ms-3" type="button" @click="toggleSidebar"
                  aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
               </button>
            </div>
         </div>
      </nav>

      <!-- Overlay -->
      <Transition name="fade">
         <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
      </Transition>

      <!-- Offcanvas Mobile Sidebar -->
      <div ref="mobileSidebarRef" class="offcanvas offcanvas-start" tabindex="-1" id="mobileSidebar">
         <div class="sidebar-cover">
            <button type="button" class="btn-close" @click="closeSidebar" aria-label="Close"></button>
            <img src="https://imgpx.com/dWg6lZ230cI2.jpeg" class="cover-image" alt="Cover Image">
         </div>

         <div class="offcanvas-body">
            <ul class="navbar-nav">
               <!-- PERBAIKAN: Menambahkan kondisi khusus untuk logout di sidebar juga -->
               <template v-for="link in navLinks" :key="link.text">
                  <li class="nav-item" v-if="shouldShowLink(link)">
                     <a v-if="link.isLogout" class="nav-link text-danger" href="#" @click.prevent="logout">{{ link.text }}</a>
                     <NuxtLink v-else class="nav-link" :to="link.href">{{ link.text }}</NuxtLink>
                  </li>
               </template>
            </ul>

            <a href="https://shop.neoxr.eu/product/TCnb" class="sidebar-footer mt-auto" target="_blank">
               <span>Buy Script</span>
               <i class="bi bi-box-arrow-up-right"></i>
            </a>
         </div>
      </div>

      <NuxtPage />
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRuntimeConfig, useRoute, useRouter } from '#app'
import { useAuth } from '@/composables/useAuth'
import { usePageEffects } from '@/composables/usePageEffects'

const config = useRuntimeConfig()
const title = config.public.title
const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { isScrolled } = usePageEffects()
const { type, isLogin, clearAuth } = useAuth()

const mobileSidebarRef = ref<HTMLElement | null>(null)
let mobileSidebarInstance: any | null = null
const isSidebarOpen = ref(false)

onMounted(async () => {
   const { Offcanvas } = await import('bootstrap')
   if (mobileSidebarRef.value) {
      mobileSidebarInstance = new Offcanvas(mobileSidebarRef.value, {
         backdrop: false,
         keyboard: true
      })
   }
})

const openSidebar = () => { isSidebarOpen.value = true }
const closeSidebar = () => { isSidebarOpen.value = false }
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }

watch(isSidebarOpen, (isOpen) => {
   if (mobileSidebarInstance) {
      if (isOpen) {
         mobileSidebarInstance.show()
      } else {
         mobileSidebarInstance.hide()
      }
   }
})

watch(() => route.fullPath, () => {
   closeSidebar()
})

const navLinks = ref([
   { text: 'Dashboard', href: '/dashboard', requiresAuth: true },
   { text: 'Pricing', href: '/#pricing' },
   { text: 'Documentation', href: '/docs', hideWhenLoggedIn: true },
   { text: 'Statistic', href: '/#statistic' },
   { text: 'Features', href: '/#features' },
   { text: 'Sessions', href: '/dashboard/sessions', requiresAuth: true, adminOnly: true },
   { text: 'Terminal', href: '/dashboard/terminal', requiresAuth: true, userOnly: true },
   { text: 'Connect', href: '/auth/login', hideWhenLoggedIn: true },
   { text: 'Logout', href: '#', requiresAuth: true, isLogout: true },
])

const shouldShowLink = (link: any) => {
   if (link.hideWhenLoggedIn && isLogin.value) return false
   if (link.requiresAuth && !isLogin.value) return false
   if (link.adminOnly && (type.value !== '1' || !isLogin.value)) return false
   if (link.userOnly && (type.value !== '2' || !isLogin.value)) return false
   return true
}

const logout = async () => {
   closeSidebar()
   try {
      await $api('/action/logout', { method: 'POST' })
      clearAuth()
      router.push('/')
   } catch (err) {
      console.error('Logout gagal:', err)
      clearAuth()
      router.push('/')
   }
}
</script>

<style scoped>
.sidebar-overlay {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.5);
   z-index: 1040;
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}
</style>