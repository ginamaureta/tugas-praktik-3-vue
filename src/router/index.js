import { createRouter, createWebHashHistory } from 'vue-router'
import StokPage from '@/pages/StokPage.vue'
import PengirimanPage from '@/pages/PengirimanPage.vue'
import PelacakanPage from '@/pages/PelacakanPage.vue'

// Hash history: halaman tetap hidup saat dibundle statis (preview CDN).
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/stok' },
    { path: '/stok', name: 'stok', component: StokPage },
    { path: '/pengiriman', name: 'pengiriman', component: PengirimanPage },
    { path: '/pelacakan', name: 'pelacakan', component: PelacakanPage },
    { path: '/:pathMatch(.*)*', redirect: '/stok' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
