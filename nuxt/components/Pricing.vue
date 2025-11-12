<template>
   <div id="pricing" class="pricing-section py-5">
      <div class="container">
         <div class="text-center mb-5">
            <h2 class="main-title mb-3">Choose The Right Plan For You</h2>
            <p class="text-secondary-custom section-subtitle">Start for free, then upgrade as your business grows.</p>
         </div>

         <div class="row g-4 justify-content-center">
            <div v-for="plan in priceList" :key="plan.code" class="col-lg-4 col-md-6">
               <div class="content-card pricing-card h-100 d-flex flex-column rounded-3"
                  :class="{ 'popular': plan.code === 'pro' }">
                  <div class="card-header-custom text-center">
                     <p v-if="plan.code === 'pro'" class="popular-label mb-2">
                        Most Popular
                     </p>
                     <h3 class="fw-bold plan-name mb-0">{{ plan.name }}</h3>
                  </div>

                  <div class="card-body-custom d-flex flex-column flex-grow-1">
                     <div class="price-display text-center mb-3">
                        <span class="price-value">{{ formatPrice(plan.price) }}</span>
                     </div>

                     <ul class="features-list list-unstyled mb-4">
                        <li class="feature-item">
                           <i class="bi bi-calendar-event-fill feature-icon"></i>
                           <span>Active for <strong>{{ plan.days }} {{ plan.days > 1 ? 'Days' : 'Day' }}</strong></span>
                        </li>
                        <li class="feature-item">
                           <i class="bi bi-person-check-fill feature-icon"></i>
                           <span><strong>{{ plan.owner }}</strong> Owner number{{ plan.owner > 1 ? 's' : '' }}</span>
                        </li>
                        <li class="feature-item">
                           <i class="bi bi-cpu-fill feature-icon"></i>
                           <span><strong>{{ plan.response.toLocaleString('en-US') }}</strong> Responses </span>
                        </li>
                        <li class="feature-item">
                           <i v-if="plan.customize"
                              class="bi bi-check-circle-fill feature-icon text-success-custom"></i>
                           <i v-else class="bi bi-x-circle-fill feature-icon text-muted"></i>
                           <span>Customization</span>
                        </li>
                     </ul>

                     <div class="mt-auto">
                        <button class="btn btn-custom-accent w-100 py-2" @click="handlePlanSelection(plan)">
                           {{ plan.price === 0 ? 'Start for Free' : 'Choose Plan' }}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const router = useRouter()
const config = useRuntimeConfig()
const priceList = ref(config.public.price_list || [])

const formatPrice = (price) => {
   if (price === 0) {
      return 'Free'
   }
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.public.currency || 'IDR',
      minimumFractionDigits: 0,
   }).format(price)
}

const handlePlanSelection = (plan) => {
   if (plan.code === 'trial') {
      router.push('/auth/login')
   } else {
      const whatsappLink = `https://wa.me/${config.public.owner}?text=Hello, I'm interested in the *${plan.name}* plan.`
      Swal.fire({
         title: 'Contact Owner',
         html: `To purchase the <strong>${plan.name}</strong> plan, contact the owner via WhatsApp.`,
         icon: 'info',
         showCancelButton: true,
         confirmButtonText: 'Contact on WhatsApp',
         cancelButtonText: 'Cancel',
         reverseButtons: true,
      }).then((result) => {
         if (result.isConfirmed) {
            window.open(whatsappLink, '_blank')
         }
      })
   }
}
</script>

<style scoped>
.pricing-card {
   position: relative;
   overflow: hidden;
   transition: transform 0.3s ease, box-shadow 0.3s ease, border-top-color 0.3s ease;
}

.pricing-card:hover {
   transform: translateY(-5px);
   box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.pricing-card.popular {
   border: 1px solid var(--dark-border-color);
   border-top: 3px solid var(--dark-primary-accent);
}

body.light-mode .pricing-card.popular {
   border: 1px solid var(--light-border-color);
   border-top: 3px solid var(--light-primary);
}

.popular-label {
   color: var(--dark-primary-accent);
   font-size: 0.8rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.05em;
   margin: 0;
}

body.light-mode .popular-label {
   color: var(--light-primary);
}

.card-header-custom:not(:has(.popular-label)) {
   padding-top: 2.35rem;
   padding-bottom: 2.35rem;
}

.section-subtitle {
   font-size: 1.1rem;
}

.plan-name {
   font-size: 2rem;
   letter-spacing: 0.025em;
}

.price-value {
   font-size: 2.0rem;
   font-weight: 700;
   line-height: 1;
}

.feature-item {
   font-size: 0.9rem;
}

.pricing-card .btn {
   font-size: 0.95rem;
   font-weight: 600;
}

.price-display {
   color: var(--dark-text-color);
}

body.light-mode .price-display {
   color: var(--light-text-color);
}

.features-list .feature-item {
   display: flex;
   align-items: center;
   margin-bottom: 0.85rem;
}

.features-list .feature-icon {
   font-size: 1.15rem;
   margin-right: 0.75rem;
   width: 20px;
   text-align: center;
   color: var(--dark-primary-accent);
}

.features-list .text-success-custom {
   color: var(--dark-primary-accent);
}

body.light-mode .features-list .text-success-custom {
   color: #198754;
}

.text-secondary-custom {
   color: var(--dark-secondary-text-color);
}

body.light-mode .text-secondary-custom {
   color: #6c757d;
}
</style>