<script setup>
// Modal tambah bahan ajar: validasi sederhana, watcher qty vs stok minimum,
// pratinjau harga lewat $filters.rupiah, dan penanganan keyboard (Esc menutup).
import { computed, nextTick, reactive, ref, watch, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'
import { gudang } from '@/stores/gudang'
import { labelCls, inputCls, inputSalahCls, btnPrimary, btnGhost } from '@/utils/styles'

const props = defineProps({
  terbuka: { type: Boolean, default: false },
})
const emit = defineEmits(['update:terbuka', 'simpan'])

const elKode = ref(null)
const dicoba = ref(false)
const peringatan = ref('')

const form = reactive({
  kode: '',
  judul: '',
  kategori: '',
  upbjj: '',
  lokasiRak: '',
  harga: '',
  qty: '',
  safety: '',
  catatanHTML: '',
})

// WATCHER (2): memantau qty & stok minimum — peringatan langsung muncul
// ketika stok awal lebih kecil dari ambang minimum.
watch([() => form.qty, () => form.safety], ([q, s]) => {
  const qty = Number(q)
  const min = Number(s)
  const aktif = q !== '' && s !== '' && Number.isFinite(qty) && Number.isFinite(min) && qty >= 0 && qty < min
  peringatan.value = aktif
    ? `Stok awal (${qty}) lebih kecil dari stok minimum (${min}) — item akan langsung berstatus "Menipis".`
    : ''
})

// WATCHER (3): kode bahan selalu dinormalisasi ke huruf kapital.
watch(
  () => form.kode,
  (v) => {
    const up = v.toUpperCase()
    if (v !== up) form.kode = up
  }
)

const errors = computed(() => {
  if (!dicoba.value) return {}
  const e = {}
  const kode = form.kode.trim()
  if (!kode) e.kode = 'Kode wajib diisi.'
  else if (!/^[A-Z]{4}\d{4}$/.test(kode)) e.kode = 'Format kode: 4 huruf + 4 angka (cth. EKMA4116).'
  else if (gudang.stok.some((s) => s.kode === kode)) e.kode = 'Kode sudah terdaftar di gudang.'
  if (!form.judul.trim()) e.judul = 'Judul wajib diisi.'
  if (!form.kategori) e.kategori = 'Pilih kategori bahan ajar.'
  if (!form.upbjj) e.upbjj = 'Pilih UPBJJ penyimpan.'
  if (!form.lokasiRak.trim()) e.lokasiRak = 'Lokasi rak wajib diisi (cth. R2-B1).'
  const harga = Number(form.harga)
  if (form.harga === '' || !Number.isFinite(harga) || harga <= 0) e.harga = 'Harga harus angka > 0.'
  const qty = Number(form.qty)
  if (form.qty === '' || !Number.isFinite(qty) || qty < 0) e.qty = 'Jumlah stok tidak boleh negatif.'
  const min = Number(form.safety)
  if (form.safety === '' || !Number.isFinite(min) || min < 0) e.safety = 'Stok minimum tidak boleh negatif.'
  return e
})

const adaError = computed(() => Object.keys(errors.value).length > 0)

function tutup() {
  emit('update:terbuka', false)
}

function kosongkan() {
  Object.assign(form, {
    kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '',
    harga: '', qty: '', safety: '', catatanHTML: '',
  })
  dicoba.value = false
  peringatan.value = ''
}

function kirim() {
  dicoba.value = true
  if (adaError.value) return
  const payload = {
    kode: form.kode.trim(),
    judul: form.judul.trim(),
    kategori: form.kategori,
    upbjj: form.upbjj,
    lokasiRak: form.lokasiRak.trim(),
    harga: Number(form.harga),
    qty: Number(form.qty),
    safety: Number(form.safety),
    catatanHTML: form.catatanHTML.trim(),
  }
  kosongkan()
  tutup()
  // Props turun, event naik: parent (StokPage) yang menyimpan ke store.
  emit('simpan', payload)
}

// Event keyboard: Esc menutup modal.
function onKey(e) {
  if (e.key === 'Escape') tutup()
}
watch(
  () => props.terbuka,
  async (v) => {
    if (v) {
      document.addEventListener('keydown', onKey)
      await nextTick()
      elKode.value?.focus()
    } else {
      document.removeEventListener('keydown', onKey)
    }
  }
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="terbuka"
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
        data-testid="add-stock-overlay"
        @click="tutup"
      />
    </Transition>
    <Transition name="zoom">
      <div
        v-if="terbuka"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="Tambah bahan ajar"
      >
        <form
          data-testid="form-add-stock"
          class="anim-rise my-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          novalidate
          @submit.prevent="kirim"
        >
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-blue-700">Manajemen Stok</p>
              <h2 class="mt-0.5 text-xl font-bold text-slate-900">Tambah Bahan Ajar</h2>
              <p class="mt-1 text-[13px] text-slate-500">
                Lengkapi data berikut. Tekan <kbd>Esc</kbd> untuk membatalkan.
              </p>
            </div>
            <button
              type="button"
              data-testid="add-stock-close"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              aria-label="Tutup form"
              @click="tutup"
            >
              <app-icon name="x" :size="16" />
            </button>
          </div>

          <div class="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div>
              <label :class="labelCls" for="f-kode">Kode Bahan</label>
              <input
                id="f-kode"
                ref="elKode"
                v-model.trim="form.kode"
                data-testid="input-stock-kode"
                :class="[inputCls, errors.kode && inputSalahCls]"
                class="font-mono"
                type="text"
                placeholder="cth. EKMA4311"
                autocomplete="off"
              />
              <p v-if="errors.kode" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.kode" />
            </div>

            <div>
              <label :class="labelCls" for="f-judul">Judul Bahan Ajar</label>
              <input
                id="f-judul"
                v-model.trim="form.judul"
                data-testid="input-stock-judul"
                :class="[inputCls, errors.judul && inputSalahCls]"
                type="text"
                placeholder="cth. Manajemen Strategik"
              />
              <p v-if="errors.judul" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.judul" />
            </div>

            <div>
              <label :class="labelCls" for="f-kategori">Kategori</label>
              <select id="f-kategori" v-model="form.kategori" data-testid="select-stock-kategori" :class="inputCls">
                <option value="" disabled>Pilih kategori…</option>
                <option v-for="k in gudang.kategoriList" :key="k" :value="k" v-text="k" />
              </select>
              <p v-if="errors.kategori" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.kategori" />
            </div>

            <div>
              <label :class="labelCls" for="f-upbjj">UPBJJ</label>
              <select id="f-upbjj" v-model="form.upbjj" data-testid="select-stock-upbjj" :class="inputCls">
                <option value="" disabled>Pilih UPBJJ…</option>
                <option v-for="u in gudang.upbjjList" :key="u" :value="u" v-text="'UPBJJ ' + u" />
              </select>
              <p v-if="errors.upbjj" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.upbjj" />
            </div>

            <div>
              <label :class="labelCls" for="f-rak">Lokasi Rak</label>
              <input
                id="f-rak"
                v-model.trim="form.lokasiRak"
                data-testid="input-stock-rak"
                :class="[inputCls, errors.lokasiRak && inputSalahCls]"
                class="font-mono"
                type="text"
                placeholder="cth. R2-B1"
              />
              <p v-if="errors.lokasiRak" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.lokasiRak" />
            </div>

            <div>
              <label :class="labelCls" for="f-harga">Harga Satuan (Rp)</label>
              <input
                id="f-harga"
                v-model.number="form.harga"
                data-testid="input-stock-harga"
                :class="[inputCls, errors.harga && inputSalahCls]"
                type="number"
                min="0"
                placeholder="65000"
              />
              <p class="mt-1 text-xs text-slate-500">
                Pratinjau: <span class="font-semibold text-slate-700">{{ $filters.rupiah(form.harga) }}</span>
              </p>
              <p v-if="errors.harga" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.harga" />
            </div>

            <div>
              <label :class="labelCls" for="f-qty">Jumlah Stok (Qty)</label>
              <input
                id="f-qty"
                v-model.number="form.qty"
                data-testid="input-stock-jumlah"
                :class="[inputCls, errors.qty && inputSalahCls]"
                type="number"
                min="0"
                placeholder="cth. 25"
              />
              <p v-if="errors.qty" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.qty" />
            </div>

            <div>
              <label :class="labelCls" for="f-safety">Stok Minimum</label>
              <input
                id="f-safety"
                v-model.number="form.safety"
                data-testid="input-stock-min-safety"
                :class="[inputCls, errors.safety && inputSalahCls]"
                type="number"
                min="0"
                placeholder="cth. 10"
              />
              <p v-if="errors.safety" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.safety" />
            </div>

            <div class="sm:col-span-2">
              <label :class="labelCls" for="f-catatan">Catatan (boleh HTML sederhana)</label>
              <textarea
                id="f-catatan"
                v-model.trim="form.catatanHTML"
                data-testid="textarea-stock-notes-html"
                :class="inputCls"
                rows="2"
                placeholder="cth. &lt;em&gt;Edisi 2025, cetak ulang&lt;/em&gt;"
              />
            </div>

            <app-hint
              v-if="peringatan"
              tone="kuning"
              testid="stock-form-low-warning"
              :text="peringatan"
              class="sm:col-span-2"
            />
            <app-hint
              v-else-if="dicoba && adaError"
              tone="kuning"
              testid="stock-form-error-summary"
              text="Periksa kembali isian yang ditandai merah, lalu simpan kembali."
              class="sm:col-span-2"
            />
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" :class="btnGhost" data-testid="btn-cancel-add-stock" @click="tutup">
              Batal
            </button>
            <button type="submit" :class="btnPrimary" data-testid="btn-submit-add-stock">
              <app-icon name="check" :size="16" />
              Simpan Bahan Ajar
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>
