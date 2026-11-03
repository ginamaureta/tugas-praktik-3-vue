<script setup>
// Halaman Pelacakan: cari DO lewat input (Enter) atau chip cepat
// (v-for name-based atas objek tracking), lalu tampilkan status + timeline.
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import TrackingTimeline from '@/components/TrackingTimeline.vue'
import { gudang, cariPaket, judulBahan } from '@/stores/gudang'
import { inputCls, btnPrimary } from '@/utils/styles'

const route = useRoute()
const kunci = ref('')
const sudahCari = ref(false)
const hasil = ref(null)

function normalisasi(q) {
  const s = String(q || '').trim().toUpperCase()
  // "2" atau "0002" -> "DO2025-0002"
  if (/^\d+$/.test(s)) return `DO2025-${s.padStart(4, '0')}`
  return s
}

function cari() {
  const k = normalisasi(kunci.value)
  kunci.value = k
  hasil.value = gudang.tracking[k] || null
  sudahCari.value = true
}

function pilihDO(noDO) {
  kunci.value = noDO
  cari()
}

// WATCHER (5): input selalu dinormalisasi ke huruf kapital saat diketik.
watch(kunci, (v) => {
  const up = v.toUpperCase()
  if (v !== up) kunci.value = up
})

// WATCHER (6): jika diarahkan dari halaman Pengiriman (?do=DO2025-XXXX),
// langsung jalankan pencarian.
watch(
  () => route.query.do,
  (q) => {
    if (q && normalisasi(q) !== normalisasi(kunci.value)) {
      kunci.value = String(q)
      cari()
    }
  }
)

onMounted(() => {
  const q = route.query.do
  if (q) {
    kunci.value = String(q)
    cari()
  } else if (Object.keys(gudang.tracking).length) {
    pilihDO(Object.keys(gudang.tracking)[0])
  }
})

const paketDipilih = computed(() => (hasil.value ? cariPaket(hasil.value.paket) : null))

function namaLayanan(kode) {
  const l = gudang.layananList.find((x) => x.kode === kode)
  return l ? l.nama : kode
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-blue-700">Pelacakan</p>
      <h2 class="mt-1 text-3xl font-bold text-slate-900">Lacak Status Pengiriman</h2>
      <p class="mt-1 max-w-2xl text-[15px] text-slate-500">
        Masukkan nomor DO untuk melihat status terkini dan riwayat perjalanan paket —
        atau pilih langsung dari daftar DO terdaftar di bawah.
      </p>
    </div>

    <!-- Pencarian -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="relative flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="search" :size="16" />
          </span>
          <input
            v-model="kunci"
            data-testid="tracking-search-input"
            :class="inputCls"
            class="pl-9 font-mono uppercase"
            type="text"
            placeholder="Ketik nomor DO, cth. DO2025-0001  (Enter = lacak, Esc = bersihkan)"
            aria-label="Nomor delivery order"
            @keydown.enter="cari"
            @keydown.esc="kunci = ''"
          />
        </div>
        <button type="button" :class="btnPrimary" data-testid="tracking-search-btn" class="shrink-0" @click="cari">
          <app-icon name="search" :size="16" />
          Lacak
        </button>
      </div>

      <p class="mt-3 text-[13px] text-slate-500">
        DO terdaftar — klik untuk melacak:
      </p>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="(data, noDO, idx) in gudang.tracking"
          :key="noDO"
          type="button"
          data-testid="tracking-sample-chip"
          class="anim-maju inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold shadow-xs transition-all active:scale-[.97]"
          :class="kunci === noDO
            ? 'border-blue-800 bg-blue-800 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-800'"
          :style="{ animationDelay: idx * 50 + 'ms' }"
          @click="pilihDO(noDO)"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="$filters.kelasTitik(data.status)" />
          <span v-text="noDO" />
        </button>
      </div>
    </div>

    <!-- Hasil -->
    <div
      v-if="sudahCari && hasil"
      data-testid="tracking-result-card"
      class="anim-rise overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
    >
      <div class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white">
            <app-icon name="truck" :size="20" />
          </span>
          <div>
            <p class="font-mono text-lg font-bold tracking-tight text-slate-900" data-testid="tracking-do-number-display" v-text="kunci" />
            <p class="text-xs text-slate-500">Nomor Delivery Order</p>
          </div>
        </div>
        <status-badge :status="hasil.status" :pulse="hasil.status === 'Dalam Perjalanan'" testid="tracking-status-badge" />
      </div>

      <div class="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-2">
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">Penerima</dt>
            <dd data-testid="tracking-recipient-info" class="mt-0.5 font-semibold text-slate-800">
              {{ hasil.nama }} <span class="font-mono text-xs font-normal text-slate-500">• NIM {{ hasil.nim }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ekspedisi</dt>
            <dd data-testid="tracking-carrier-badge" class="mt-0.5 text-slate-700" v-text="namaLayanan(hasil.ekspedisi)" />
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal Kirim</dt>
            <dd class="mt-0.5 text-slate-700" v-text="$filters.tanggal(hasil.tanggalKirim)" />
          </div>
          <!-- v-if / v-else: tujuan hanya ditampilkan bila tercatat di DO -->
          <div v-if="hasil.upbjjTujuan">
            <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">UPBJJ Tujuan</dt>
            <dd class="mt-0.5 flex items-center gap-1.5 text-slate-700">
              <app-icon name="mapPin" :size="14" class="text-blue-700" />
              <span v-text="'UPBJJ ' + hasil.upbjjTujuan" />
            </dd>
          </div>
          <div v-else>
            <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">UPBJJ Tujuan</dt>
            <dd class="mt-0.5 text-slate-400" v-text="'Tidak tercatat pada DO awal'" />
          </div>
        </dl>

        <div>
          <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ringkasan Paket</dt>
          <div class="mt-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p class="text-sm font-semibold text-slate-800" v-text="paketDipilih ? paketDipilih.nama : hasil.paket" />
            <p class="mt-0.5 text-[13px] text-slate-500">
              Jumlah: {{ hasil.jumlah }} paket • Total:
              <span class="font-semibold tabular-nums text-slate-800">{{ $filters.rupiah(hasil.total) }}</span>
            </p>
            <ul v-if="paketDipilih" class="mt-3 space-y-1.5">
              <li v-for="kode in paketDipilih.isi" :key="kode" class="flex items-center gap-2 text-[13px] text-slate-600">
                <app-icon name="box" :size="13" class="text-slate-400" />
                <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-blue-900" v-text="kode" />
                <span v-text="judulBahan(kode)" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-100 px-6 py-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Perjalanan Pengiriman</p>
        <div class="mt-4">
          <TrackingTimeline :perjalanan="hasil.perjalanan" />
        </div>
      </div>
    </div>

    <!-- v-else-if: DO tidak ditemukan -->
    <div
      v-else-if="sudahCari"
      data-testid="tracking-not-found-state"
      class="anim-rise rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-14 text-center"
    >
      <span class="anim-pop mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <app-icon name="alert" :size="24" />
      </span>
      <p class="mt-3 text-sm font-semibold text-rose-900">
        Nomor DO <span class="font-mono" v-text="kunci" /> tidak ditemukan
      </p>
      <p class="mt-1 text-[13px] text-rose-700/80">
        Periksa kembali penulisan nomor DO, atau pilih dari daftar DO terdaftar di atas.
      </p>
    </div>

    <!-- v-else: belum mencari -->
    <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <app-icon name="route" :size="24" />
      </span>
      <p class="mt-3 text-sm font-semibold text-slate-700">Masukkan nomor DO untuk mulai melacak</p>
    </div>
  </section>
</template>
