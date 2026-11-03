import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Formatter teks (pengganti "filter" pipa Vue 2) — dipakai di template
// sebagai this.$filters.xxx / $filters.xxx.
import * as filters from './utils/filters'

// Komponen global: dipakai sebagai custom element <stat-card>, <status-badge>,
// <app-hint>, <app-icon> di seluruh template (indikator 8).
import StatCard from './components/StatCard.vue'
import StatusBadge from './components/StatusBadge.vue'
import AppHint from './components/AppHint.vue'
import AppIcon from './components/AppIcon.vue'

import './index.css'

const app = createApp(App)

app.config.globalProperties.$filters = filters

app.component('stat-card', StatCard)
app.component('status-badge', StatusBadge)
app.component('app-hint', AppHint)
app.component('app-icon', AppIcon)

app.use(router)
app.mount('#app')
