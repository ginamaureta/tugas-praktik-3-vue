<script setup>
// Badge status — didaftarkan global sebagai custom element <status-badge>.
// Warna diambil dari $filters.kelasStatus (filter pemformatan, indikator 7).
defineProps({
  status: { type: String, required: true },
  pulse: { type: Boolean, default: false },
  testid: { type: String, default: 'status-badge' },
})
</script>

<template>
  <span
    :data-testid="testid"
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset"
    :class="$filters.kelasStatus(status)"
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="[$filters.kelasTitik(status), { 'anim-denyut': pulse }]"
    />
    <span v-text="status" />
  </span>
</template>
