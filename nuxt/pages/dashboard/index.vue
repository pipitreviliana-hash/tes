<template>
   <div class="container px-3 mb-4 mt-1">
      <div class="row g-4 mb-4">
         <div class="col-12 col-md-4">
            <NuxtLink to="/dashboard/users" class="stat-card-faded">
               <i class="bi bi-person-badge stat-icon-bg"></i>
               <div class="stat-content">
                  <div class="value">{{ allData.users.total?.toLocaleString() }}</div>
                  <div class="label">Total Users</div>
                  <div class="details-link">
                     <span>{{ allData.users.premium }} Premium</span>
                     <i class="bi bi-arrow-right-short"></i>
                  </div>
               </div>
            </NuxtLink>
         </div>
         <div class="col-12 col-md-4">
            <NuxtLink to="/dashboard/groups" class="stat-card-faded">
               <i class="bi bi-people stat-icon-bg"></i>
               <div class="stat-content">
                  <div class="value">{{ allData.groups.total?.toLocaleString() }}</div>
                  <div class="label">Total Groups</div>
                  <div class="details-link">
                     <span>{{ allData.groups.rental }} Rental</span>
                     <i class="bi bi-arrow-right-short"></i>
                  </div>
               </div>
            </NuxtLink>
         </div>
         <div class="col-12 col-md-4">
            <NuxtLink to="/dashboard/chats" class="stat-card-faded">
               <i class="bi bi-chat-dots stat-icon-bg"></i>
               <div class="stat-content">
                  <div class="value">{{ allData.chats.total?.toLocaleString() }}</div>
                  <div class="label">Total Chats</div>
                  <div class="details-link">
                     <span>View All</span>
                     <i class="bi bi-arrow-right-short"></i>
                  </div>
               </div>
            </NuxtLink>
         </div>
      </div>

      <ControlBox />

      <div class="row g-4">
         <div class="col-12 col-lg-6">
            <div class="ranking-header">
               <i class="bi bi-nut me-2 fs-5"></i>
               <h5 class="mb-0 fw-bold">Top Users</h5>
            </div>
            <div v-if="isTopDataLoading" class="text-center p-5">
               <div class="loader-spinner"></div>
            </div>
            <transition name="fade">
               <div v-if="!isTopDataLoading">
                  <div v-if="filteredTopHit.length > 0" class="ranking-list">
                     <div class="ranking-item" v-for="(user, index) in filteredTopHit" :key="user.jid">
                        <div class="rank-number">{{ String(index + 1).padStart(2, '0') }}</div>
                        <div class="rank-info font-monospace">{{ formatPhoneNumber(user.jid) }}</div>
                        <div class="rank-score">{{ user.hit.toLocaleString() }}</div>
                     </div>
                  </div>
                  <div v-else class="ranking-list-empty">
                     No top users data available.
                  </div>
               </div>
            </transition>
         </div>
         <div class="col-12 col-lg-6">
            <div class="ranking-header">
               <i class="bi bi-trophy me-2 fs-5"></i>
               <h5 class="mb-0 fw-bold">Top Ranks</h5>
            </div>
            <div v-if="isTopDataLoading" class="text-center p-5">
               <div class="loader-spinner"></div>
            </div>
            <transition name="fade">
               <div v-if="!isTopDataLoading">
                  <div v-if="filteredTopPoint.length > 0" class="ranking-list">
                     <div class="ranking-item" v-for="(user, index) in filteredTopPoint" :key="user.jid">
                        <div class="rank-number">{{ String(index + 1).padStart(2, '0') }}</div>
                        <div class="rank-info font-monospace">{{ formatPhoneNumber(user.jid) }}</div>
                        <div class="rank-score">{{ user.point.toLocaleString() }}</div>
                     </div>
                  </div>
                  <div v-else class="ranking-list-empty">
                     No top ranks data available.
                  </div>
               </div>
            </transition>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import parsePhoneNumber from 'libphonenumber-js'

const config = useRuntimeConfig()
useHead({ title: 'Dashboard', titleTemplate: `%s - ${config.public.title}` })
const { $api } = useNuxtApp()

interface AllData { users: { premium: number, banned: number, total: number }, groups: { rental: number, total: number }, chats: { total: number } }
interface TopUser { jid: string, name: string | null, hit: number, point: number, balance: number }
interface TopData { top_hit: TopUser[], top_point: TopUser[] }

const allData = ref<AllData>({ users: { premium: 0, banned: 0, total: 0 }, groups: { rental: 0, total: 0 }, chats: { total: 0 } })
const topData = ref<TopData>({ top_hit: [], top_point: [] })
const isTopDataLoading = ref(true)

const filteredTopHit = computed(() => topData.value.top_hit.filter(user => user.hit > 0))
const filteredTopPoint = computed(() => topData.value.top_point.filter(user => user.point > 0))

const fetchAllData = async () => { try { const response = await $api('/data/all'); if (response.status && response.data) allData.value = response.data as AllData } catch (error) { console.error('Failed to fetch /data/all:', error) } }
const fetchTopData = async () => { isTopDataLoading.value = true; try { const response = await $api('/data/top'); if (response.status && response.data) topData.value = response.data } catch (error) { console.error('Failed to fetch /data/top:', error) } finally { isTopDataLoading.value = false } }
const formatPhoneNumber = (jid: string) => { if (!jid) return 'Invalid Number'; const numberOnly = jid.split('@')[0]; try { const phoneNumber = parsePhoneNumber(`+${numberOnly}`); return phoneNumber ? phoneNumber.formatInternational() : `+${numberOnly}` } catch (error) { return `+${numberOnly}` } }
onMounted(() => {
   fetchAllData()
   fetchTopData()
})
</script>

<style scoped>
.stat-card-faded {
   position: relative;
   overflow: hidden;
   display: block;
   padding: 1.5rem;
   text-decoration: none;
   background-color: var(--dark-card-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   height: 100%;
   transition: border-color 0.3s ease, transform 0.3s ease;
}

body.light-mode .stat-card-faded {
   background-color: var(--light-card-bg);
   border-color: var(--light-border-color);
}

.stat-card-faded:hover {
   transform: translateY(-5px);
   border-color: var(--dark-primary-accent);
}

body.light-mode .stat-card-faded:hover {
   border-color: var(--light-primary);
}

.stat-card-faded .stat-icon-bg {
   position: absolute;
   right: -20px;
   top: 50%;
   transform: translateY(-50%);
   font-size: 6rem;
   opacity: 0.05;
   color: var(--dark-text-color);
   z-index: 1;
   transition: transform 0.3s ease;
}

body.light-mode .stat-card-faded .stat-icon-bg {
   color: var(--light-text-color);
}

.stat-card-faded:hover .stat-icon-bg {
   transform: translateY(-50%) scale(1.1) rotate(-5deg);
}

.stat-card-faded .stat-content {
   position: relative;
   z-index: 2;
   display: flex;
   flex-direction: column;
   height: 100%;
}

.stat-card-faded .value {
   font-size: 2.25rem;
   font-weight: 700;
   line-height: 1.1;
   color: var(--dark-text-color);
}

body.light-mode .stat-card-faded .value {
   color: var(--light-text-color);
}

.stat-card-faded .label {
   font-size: 1rem;
   font-weight: 500;
   color: var(--dark-secondary-text-color);
   margin-bottom: auto;
}

body.light-mode .stat-card-faded .label {
   color: #6c757d;
}

.stat-card-faded .details-link {
   margin-top: 1rem;
   display: flex;
   align-items: center;
   gap: 0.25rem;
   font-weight: 600;
   color: var(--dark-secondary-text-color);
   transition: color 0.2s;
   align-self: flex-start;
}

body.light-mode .stat-card-faded .details-link {
   color: #6c757d;
}

.stat-card-faded:hover .details-link {
   color: var(--dark-primary-accent);
}

body.light-mode .stat-card-faded:hover .details-link {
   color: var(--light-primary);
}

.stat-card-faded .details-link .value {
   font-size: 0.9rem;
   color: var(--dark-primary-accent);
}

body.light-mode .stat-card-faded .details-link .value {
   color: var(--light-primary);
}

.ranking-header {
   position: relative;
   display: flex;
   align-items: center;
   padding-bottom: 0.75rem;
   margin-bottom: 1.25rem;
}

.ranking-header::after {
   content: '';
   position: absolute;
   bottom: 0;
   left: 0;
   width: 100%;
   height: 3px;
   background: linear-gradient(to right, var(--dark-primary-accent), transparent);
}

.ranking-header h5 {
   font-size: 1.3rem;
}

body.light-mode .ranking-header::after {
   background: linear-gradient(to right, var(--light-primary), transparent);
}

.ranking-list {
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
}

.ranking-item {
   display: flex;
   align-items: center;
   background-color: var(--dark-card-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   overflow: hidden;
   font-weight: 600;
}

body.light-mode .ranking-item {
   background-color: var(--light-card-bg);
   border-color: var(--light-border-color);
}

.rank-number {
   display: flex;
   align-items: center;
   justify-content: center;
   min-width: 50px;
   padding: 0.75rem 0.5rem;
   background-color: var(--dark-primary-accent);
   color: #000;
}

body.light-mode .rank-number {
   background-color: var(--light-primary);
   color: #fff;
}

.rank-info {
   flex-grow: 1;
   padding: 0.75rem 1rem;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.rank-score {
   display: flex;
   align-items: center;
   justify-content: center;
   min-width: 80px;
   padding: 0.75rem;
   background-color: var(--dark-bg);
}

body.light-mode .rank-score {
   background-color: var(--light-bg);
}

.ranking-list-empty {
   background-color: var(--dark-card-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   padding: 2rem;
   text-align: center;
   color: var(--dark-secondary-text-color);
}

body.light-mode .ranking-list-empty {
   background-color: var(--light-card-bg);
   border-color: var(--light-border-color);
   color: #6c757d;
}
</style>