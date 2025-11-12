<template>
   <section id="hero-banner" class="container-fluid hero-section py-5">
      <div class="container px-3 mb-4">
         <div class="row align-items-center justify-content-between">

            <div class="col-md-9 col-lg-7 text-center text-md-start mx-auto mb-5">

               <p class="hero-tagline badge rounded-pill mb-3">
                  <i class="fas fa-check-circle me-1"></i> Gateway API
               </p>

               <h1 class="hero-title fw-bold mb-3">
                  Reliable WhatsApp API <br class="d-none d-lg-inline">Gateway for Your Business
               </h1>

               <p class="hero-subtitle lead mb-4">
                  The complete solution for WhatsApp API integration. Send notifications, broadcasts, and build chatbots
                  with ease and reliability.
               </p>


               <button @click.prevent="$router.push('/auth/login')"
                  class="btn btn-custom-accent btn-lg px-5 custom-margin-right shadow-lg animate-bounce">
                  Connect
               </button>


            </div>

            <div class="col-md-5 col-lg-5 d-none d-lg-block text-center">
               <div class="hero-visual-placeholder">
                  <img :alt="config.public.title"
                     src="https://imgkub.com/images/2025/11/02/Generated_Image_November_02__2025_-_10_27AM-min-min-removebg-preview.png"
                     class="hero-mockup-img">
               </div>
            </div>

         </div>
      </div>
   </section>

   <div class="container px-3 mb-4 mt-1">
      <Pricing id="pricing" />
      <Statistic id="statistic" />
      <Feature id="features" />
   </div>

   <Footer />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
const config = useRuntimeConfig() as unknown as { public: { title: string, price_list: PricePlan[] } }

interface PricePlan {
   code: string
   name: string
   price: number
   owner: number
   response: number
   customize: boolean
   duration: number
}

const pricingList = ref<PricePlan[]>(config.public.price_list || [])
const isDarkMode = ref(true)

onMounted(() => {
   isDarkMode.value = !document.body.classList.contains('light-mode')
})
</script>

<style scoped>
.hero-section {
   position: relative;
   bottom: 17px;

   background-color: var(--dark-card-bg) !important;
   color: var(--dark-text-color);

   padding-top: 100px;
   padding-bottom: 80px;

   border-bottom: 1px solid var(--dark-border-color);
}

body.light-mode .hero-section {
   background-color: var(--light-card-bg) !important;
   color: var(--light-text-color);
   border-bottom: 1px solid var(--light-border-color);
}

.hero-title {
   font-size: 1.7rem;
   line-height: 1.2;
   color: var(--dark-text-color);
}

body.light-mode .hero-title {
   color: var(--light-text-color);
}


.hero-subtitle {
   font-size: 1rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .hero-subtitle {
   color: var(--light-text-color);
   opacity: 0.9;
}

.hero-tagline {
   font-size: 0.85rem;
   font-weight: 600;
   padding: 0.5rem 1rem;

   background-color: rgba(0, 168, 132, 0.2);
   color: var(--dark-primary-accent) !important;
}

body.light-mode .hero-tagline {
   background-color: rgba(34, 34, 34, 0.1);
   color: var(--light-primary) !important;
}

.hero-visual-placeholder {
   width: 100%;
   aspect-ratio: 1 / 1;
   background-color: none;
   border-radius: 1rem;
   overflow: hidden;
   position: relative;
}

.hero-visual-placeholder .hero-mockup-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
   display: block;
}

.hero-section.bg-dark-mode .hero-visual-placeholder {
   background-color: var(--dark-card-bg);
   border-color: var(--dark-border-color);
}

.custom-margin-right {
   margin-right: 10px;
}


@keyframes bounce {

   0%,
   100% {
      transform: translateY(-5%);
   }

   50% {
      transform: translateY(5%);
   }
}

.animate-bounce {
   animation: bounce 2s infinite ease-in-out;
}
</style>