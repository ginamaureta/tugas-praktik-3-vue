<script setup>
// Halaman Stok: kartu statistik (computed), filter bar (v-model + event
// keyboard), tabel stok, dan paginasi v-show. Watcher (1) mereset halaman
// ketika filter berubah.
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import StockTable from '@/components/StockTable.vue'
import StockFormModal from '@/components/StockFormModal.vue'
import { gudang, ubahQty, tambahStok } from '@/stores/gudang'
import { statusStok } from '@/utils/filters'
import { inputCls, btnPrimary, btnGhost } from '@/utils/styles'

const cari = ref('')
const fKategori = ref('Semua')
const fUpbjj = ref('Semua')
const fStatus = ref('Semua')
const halaman = ref(1)
const PER_HALAMAN = 8
const kilatFilter = ref(0)
const formTerbuka = ref(false)
const sukses = ref('')
let timerSukses = null

// Computed: daftar stok setelah pencarian & filter (data binding turunan).
const stokTersaring = computed(() =>
  gudang.stok.filter((s) => {
    const q = cari.value.trim().toLowerCase()
    const cocokQ = !q || [s.kode, s.judul, s.kategori, s.upbjj].join(' ').toLowerCase().includes(q)
    const cocokK = fKategori.value === 'Semua' || s.kategori === fKategori.value
    const cocokU = fUpbjj.value === 'Semua' || s.upbjj === fUpbjj.value
    const cocokS = fStatus.value === 'Semua' || statusStok(s.qty, s.safety) === fStatus.value
    return cocokQ && cocokK && cocokU && cocokS
  })
)

const totalHalaman = computed(() => Math.max(1, Math.ceil(stokTersaring.value.length / PER_HALAMAN)))
const stokHalamanIni = computed(() =>
  stokTersaring.value.slice((halaman.value - 1) * PER_HALAMAN, halaman.value * PER_HALAMAN)
)
const mulaiNomor = computed(() => (halaman.value - 1) * PER_HALAMAN)

// WATCHER (1): perubahan filter apa pun mengembalikan tabel ke halaman 1
// dan menandai pembaruan (kilat biru pada baris hitungan).
watch([cari, fKategori, fUpbjj, fStatus], () => {
  halaman.value = 1
  kilatFilter.value += 1
})

// Computed: statistik ringkasan gudang untuk kartu KPI.
const statistik = computed(() => {
  const totalUnit = gudang.stok.reduce((a, s) => a + Number(s.qty), 0)
  const nilaiTotal = gudang.stok.reduce((a, s) => a + Number(s.harga) * Number(s.qty), 0)
  const diBawahMin = gudang.stok.filter((s) => statusStok(s.qty, s.safety) !== 'Aman').length
  return { jenis: gudang.stok.length, unit: totalUnit, nilai: nilaiTotal, diBawahMin }
})

// Methods: aksi pengguna.
function resetFilter() {
  cari.value = ''
  fKategori.value = 'Semua'
  fUpbjj.value = 'Semua'
  fStatus.value = 'Semua'
}

function pindahHalaman(delta) {
  halaman.value = Math.min(totalHalaman.value, Math.max(1, halaman.value + delta))
}

function onUbahQty({ kode, delta }) {
  ubahQty(kode, delta)
}

function simpanStok(payload) {
  tambahStok(payload)
  formTerbuka.value = false
  sukses.value = `Bahan ajar "${payload.judul}" (${payload.kode}) berhasil ditambahkan ke stok.`
  window.clearTimeout(timerSukses)
  timerSukses = window.setTimeout(() => (sukses.value = ''), 6000)
}
</script>

<template>
  <section class="space-y-6">
    <!-- Kepala halaman -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-blue-700">Gudang UPBJJ</p>
        <h2 class="mt-1 text-3xl font-bold text-slate-900">Manajemen Stok Bahan Ajar</h2>
        <p class="mt-1 max-w-2xl text-[15px] text-slate-500">
          Pantau ketersediaan modul di seluruh UPBJJ, cari cepat, dan tambah stok baru —
          status peringatan dihitung otomatis dari qty terhadap stok minimum.
        </p>
      </div>
      <button
        type="button"
        :class="btnPrimary"
        data-testid="btn-open-add-stock-modal"
        @click="formTerbuka = true"
      >
        <app-icon name="plus" :size="16" />
        Tambah Bahan Ajar
      </button>
    </div>

    <!-- Notifikasi sukses -->
    <app-hint v-if="sukses" :text="sukses" testid="stock-success-hint" />

    <!-- Kartu statistik -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <stat-card
        label="Jenis Bahan Ajar"
        :value="statistik.jenis"
        :sub="`${statistik.unit} unit tersimpan di gudang`"
        icon="box"
        tone="blue"
        testid="stat-total-items"
      />
      <stat-card
        label="Nilai Total Stok"
        :value="$filters.rupiah(statistik.nilai)"
        sub="Akumulasi harga satuan × qty seluruh item"
        icon="coins"
        tone="green"
        testid="stat-total-value"
      />
      <stat-card
        label="Di Bawah Stok Minimum"
        :value="statistik.diBawahMin"
        sub="Gabungan status Menipis dan Habis"
        icon="alert"
        tone="rose"
        testid="stat-low-stock-count"
      />
    </div>

    <!-- Filter bar -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="relative flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="search" :size="16" />
          </span>
          <input
            v-model.trim="cari"
            data-testid="stock-search-input"
            :class="inputCls"
            class="pl-9"
            type="text"
            placeholder="Cari kode atau judul bahan ajar…  (Enter = terapkan, Esc = bersihkan)"
            aria-label="Cari bahan ajar"
            @keydown.enter="kilatFilter += 1"
            @keydown.esc="cari = ''"
          />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
          <select v-model="fKategori" data-testid="stock-category-filter" :class="inputCls" aria-label="Filter kategori" class="lg:w-44">
            <option value="Semua">Semua Kategori</option>
            <option v-for="k in gudang.kategoriList" :key="k" :value="k" v-text="k" />
          </select>
          <select v-model="fUpbjj" data-testid="stock-upbjj-filter" :class="inputCls" aria-label="Filter UPBJJ" class="lg:w-44">
            <option value="Semua">Semua UPBJJ</option>
            <option v-for="u in gudang.upbjjList" :key="u" :value="u" v-text="'UPBJJ ' + u" />
          </select>
          <select v-model="fStatus" data-testid="stock-status-filter" :class="inputCls" aria-label="Filter status" class="lg:w-40">
            <option value="Semua">Semua Status</option>
            <option value="Aman">Aman</option>
            <option value="Menipis">Menipis</option>
            <option value="Habis">Habis</option>
          </select>
        </div>

        <button
          type="button"
          :class="btnGhost"
          data-testid="stock-reset-filter-btn"
          class="shrink-0"
          @click="resetFilter"
        >
          <app-icon name="refresh" :size="15" />
          Reset
        </button>
      </div>

      <!-- v-show: hitungan hanya muncul saat filter mempersempit hasil -->
      <p
        :key="kilatFilter"
        v-show="stokTersaring.length !== gudang.stok.length"
        data-testid="stock-result-count"
        class="anim-kilat mt-3 text-[13px] font-medium text-slate-500"
      >
        Menampilkan {{ stokTersaring.length }} dari {{ gudang.stok.length }} bahan ajar
        <span v-if="fStatus !== 'Semua'"> dengan status {{ fStatus.toLowerCase() }}</span>
        <span v-if="cari"> untuk pencarian "{{ cari }}"</span>
      </p>
    </div>

    <!-- Tabel stok -->
    <StockTable :items="stokHalamanIni" :mulai-nomor="mulaiNomor" @ubah-qty="onUbahQty" @reset-filter="resetFilter" />

    <!-- Paginasi (v-show) -->
    <div
      v-show="totalHalaman > 1"
      data-testid="stock-pagination"
      class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs"
    >
      <p class="text-[13px] font-medium text-slate-500">
        Halaman {{ halaman }} dari {{ totalHalaman }}
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          :class="btnGhost"
          data-testid="pagination-prev"
          :disabled="halaman <= 1"
          @click="pindahHalaman(-1)"
        >
          <app-icon name="chevronLeft" :size="15" />
          Sebelumnya
        </button>
        <button
          type="button"
          :class="btnGhost"
          data-testid="pagination-next"
          :disabled="halaman >= totalHalaman"
          @click="pindahHalaman(1)"
        >
          Berikutnya
          <app-icon name="chevronRight" :size="15" />
        </button>
      </div>
    </div>

    <StockFormModal v-model:terbuka="formTerbuka" @simpan="simpanStok" />
  </section>
</template>
