<script setup>
// Ikon SVG inline tanpa dependensi eksternal — dikelola lewat v-for
// di atas daftar path (komponen tampilan murni).
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
})

const IKON = {
  box: ['M21 8l-9-5-9 5v8l9 5 9-5V8z', 'M3 8l9 5 9-5', 'M12 13v8'],
  truck: ['M1 5h14v11H1z', 'M15 9h4l4 3.5V16h-8', 'M5.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M18.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  route: ['M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M8 17h8a4 4 0 0 0 0-8H8'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M21 21l-4.35-4.35'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  x: ['M18 6L6 18', 'M6 6l12 12'],
  check: ['M20 6L9 17l-5-5'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  alert: ['M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z', 'M12 9v4', 'M12 17h.01'],
  coins: ['M12 8c4.4 0 8-1.34 8-3s-3.6-3-8-3-8 1.34-8 3 3.6 3 8 3z', 'M4 5v7c0 1.66 3.6 3 8 3s8-1.34 8-3V5', 'M4 12v7c0 1.66 3.6 3 8 3s8-1.34 8-3v-7'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16v-4', 'M12 8h.01'],
  chevronDown: ['M6 9l6 6 6-6'],
  chevronLeft: ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  arrowRight: ['M5 12h14', 'M13 6l6 6-6 6'],
  refresh: ['M21 12a9 9 0 1 1-2.64-6.36', 'M21 3v6h-6'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  send: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
  mapPin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z', 'M12 13a3 3 0 100-6 3 3 0 000 6z'],
  keyboard: ['M4 6h16v12H4z', 'M8 10h.01', 'M12 10h.01', 'M16 10h.01', 'M8 14h8'],
}

const jalur = computed(() => IKON[props.name] || IKON.info)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0"
  >
    <path v-for="(d, i) in jalur" :key="i" :d="d" />
  </svg>
</template>
