<script>
// Komponen ini sengaja memakai Options API dengan property `template`
// (bukan SFC) — mendemonstrasikan indikator 8: custom element,
// Vue Component, dan Property Template. Ikon <app-icon> diselesaikan
// dari registrasi global di main.js.
export default {
  name: 'AppHint',
  props: {
    text: { type: String, required: true },
    tone: { type: String, default: 'biru' }, // biru | kuning
    testid: { type: String, default: 'app-hint' },
  },
  computed: {
    kelas() {
      return this.tone === 'kuning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-blue-200 bg-blue-50 text-blue-900'
    },
  },
  template: `
    <p :data-testid="testid" class="anim-rise flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed" :class="kelas">
      <app-icon name="info" :size="15" class="mt-0.5 shrink-0" />
      <span>{{ text }}</span>
    </p>`,
}
</script>
