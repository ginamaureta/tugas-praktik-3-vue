<script setup>
// Kartu statistik KPI — didaftarkan global sebagai custom element <stat-card>.
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  sub: { type: String, default: '' },
  icon: { type: String, default: 'info' },
  tone: { type: String, default: 'blue' }, // blue | green | rose
  testid: { type: String, default: 'stat-card' },
})

const TEMA = {
  blue: {
    kartu: 'border-blue-100 bg-gradient-to-br from-blue-50/80 to-white',
    ikon: 'bg-blue-800 text-white',
    label: 'text-blue-700',
    nilai: 'text-blue-900',
  },
  green: {
    kartu: 'border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white',
    ikon: 'bg-emerald-600 text-white',
    label: 'text-emerald-700',
    nilai: 'text-emerald-900',
  },
  rose: {
    kartu: 'border-rose-100 bg-gradient-to-br from-rose-50/90 to-white',
    ikon: 'bg-rose-600 text-white',
    label: 'text-rose-700',
    nilai: 'text-rose-900',
  },
}

const tema = computed(() => TEMA[props.tone] || TEMA.blue)
</script>

<template>
  <div
    :data-testid="testid"
    class="anim-rise rounded-2xl border p-5 shadow-xs transition-shadow hover:shadow-md"
    :class="tema.kartu"
  >
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl" :class="tema.ikon">
        <app-icon :name="icon" :size="20" />
      </span>
      <p class="text-xs font-semibold uppercase tracking-wider" :class="tema.label" v-text="label" />
    </div>
    <p
      class="mt-3 text-2xl font-bold tabular-nums"
      :class="tema.nilai"
      :data-testid="testid + '-value'"
    >
      {{ value }}
    </p>
    <p v-if="sub" class="mt-1 text-[13px] text-slate-500" v-text="sub" />
  </div>
</template>
