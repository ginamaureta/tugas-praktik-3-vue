<script setup>
// Header institusional: brand dan navigasi tab antar halaman (vue-router).
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const route = useRoute()

const tabs = [
  { ke: '/stok', label: 'Manajemen Stok', ikon: 'box', testid: 'nav-tab-stok' },
  { ke: '/pengiriman', label: 'Delivery Order (DO)', ikon: 'truck', testid: 'nav-tab-pengiriman' },
  { ke: '/pelacakan', label: 'Pelacakan DO', ikon: 'route', testid: 'nav-tab-pelacakan' },
]

function aktif(ke) {
  return route.path === ke
}
</script>

<template>
  <header
    data-testid="app-header"
    class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-4">
        <div class="flex items-center gap-3" data-testid="app-logo-badge">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white shadow-sm">
            <app-icon name="box" :size="22" />
          </span>
          <div>
            <h1 class="text-[15px] font-bold leading-tight text-slate-900">Sistem Bahan Ajar &amp; Pengiriman</h1>
            <p class="text-xs text-slate-500">Gudang Distribusi UPBJJ • Universitas Terbuka</p>
          </div>
        </div>
      </div>

      <nav class="flex gap-1 overflow-x-auto pb-2" aria-label="Navigasi utama">
        <router-link
          v-for="tab in tabs"
          :key="tab.ke"
          :to="tab.ke"
          :data-testid="tab.testid"
          class="flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-all"
          :class="aktif(tab.ke)
            ? 'bg-blue-800 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <app-icon :name="tab.ikon" :size="16" />
          {{ tab.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>
