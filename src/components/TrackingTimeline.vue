<script setup>
// Timeline perjalanan pengiriman — v-for dengan indeks; langkah terbaru
// (paling atas setelah dibalik) ditonjolkan lewat v-if.
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  perjalanan: { type: Array, required: true },
})

const langkah = computed(() => [...props.perjalanan].reverse())
</script>

<template>
  <ol
    data-testid="tracking-timeline"
    class="relative space-y-6 pl-8 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-0.5 before:bg-slate-200"
  >
    <li
      v-for="(step, i) in langkah"
      :key="i"
      data-testid="tracking-timeline-step"
      class="anim-maju relative"
      :style="{ animationDelay: i * 70 + 'ms' }"
    >
      <span
        class="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2"
        :class="i === 0 ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-300 bg-white text-slate-400'"
      >
        <app-icon :name="i === 0 ? 'clock' : 'check'" :size="12" />
      </span>
      <p
        data-testid="tracking-timeline-timestamp"
        class="font-mono text-xs font-medium text-slate-500"
        v-text="$filters.tanggalJam(step.waktu)"
      />
      <p
        data-testid="tracking-timeline-location"
        class="mt-0.5 text-sm font-medium text-slate-800"
        v-text="step.keterangan"
      />
      <span
        v-if="i === 0"
        class="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-600/15"
      >
        Posisi Terbaru
      </span>
    </li>
  </ol>
</template>
