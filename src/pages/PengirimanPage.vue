<script setup>
// Halaman Pengiriman: formulir DO tervalidasi (kiri) + ringkasan langsung
// (kanan). Watcher (4) memantau paket & jumlah untuk info estimasi biaya.
// DO yang dibuat langsung terdaftar di registry pelacakan (store bersama).
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { gudang, buatDO, cariPaket, nomorDoBerikutnya, judulBahan } from '@/stores/gudang'
import { rupiah } from '@/utils/filters'
import { labelCls, inputCls, inputSalahCls, btnPrimary, btnGhost } from '@/utils/styles'

const router = useRouter()
const dicoba = ref(false)
const doTerakhir = ref('')
const infoPaket = ref('')

function hariIni() {
  const t = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

const form = reactive({
  nim: '',
  nama: '',
  paketKode: '',
  jumlah: 1,
  upbjjTujuan: '',
  ekspedisi: 'REG',
  tanggalKirim: hariIni(),
})

// WATCHER (4): setiap paket/jumlah berubah, ringkasan estimasi diperbarui.
watch([() => form.paketKode, () => form.jumlah], ([kode, jml]) => {
  const p = cariPaket(kode)
  if (!p) {
    infoPaket.value = ''
    return
  }
  const n = Number(jml)
  if (!Number.isFinite(n) || n < 1) {
    infoPaket.value = 'Jumlah paket belum valid — isi angka 1 sampai 99.'
    return
  }
  infoPaket.value = `Paket "${p.nama}" berisi ${p.isi.length} judul bahan ajar. Estimasi biaya: ${rupiah(p.harga)} × ${n} = ${rupiah(p.harga * n)}.`
})

const nomorBerikutnya = computed(() => nomorDoBerikutnya())
const paketDipilih = computed(() => cariPaket(form.paketKode))
const total = computed(() => (paketDipilih.value ? paketDipilih.value.harga * form.jumlah : 0))

const errors = computed(() => {
  if (!dicoba.value) return {}
  const e = {}
  const nim = form.nim.trim()
  if (!nim) e.nim = 'NIM wajib diisi.'
  else if (!/^\d{8,12}$/.test(nim)) e.nim = 'NIM harus 8–12 digit angka.'
  if (form.nama.trim().length < 3) e.nama = 'Nama minimal 3 karakter.'
  if (!form.paketKode) e.paketKode = 'Pilih paket bahan ajar.'
  if (!form.upbjjTujuan) e.upbjjTujuan = 'Pilih UPBJJ tujuan.'
  if (!form.tanggalKirim) e.tanggalKirim = 'Tanggal kirim wajib diisi.'
  else if (form.tanggalKirim < hariIni()) e.tanggalKirim = 'Tanggal kirim tidak boleh di masa lalu.'
  const n = Number(form.jumlah)
  if (!Number.isFinite(n) || n < 1 || n > 99) e.jumlah = 'Jumlah harus 1–99.'
  return e
})

const adaError = computed(() => Object.keys(errors.value).length > 0)

function namaLayanan(kode) {
  const l = gudang.layananList.find((x) => x.kode === kode)
  return l ? l.nama : kode
}

function kirim() {
  dicoba.value = true
  if (adaError.value) return
  doTerakhir.value = buatDO({
    nim: form.nim.trim(),
    nama: form.nama.trim(),
    paketKode: form.paketKode,
    jumlah: Number(form.jumlah),
    upbjjTujuan: form.upbjjTujuan,
    ekspedisi: form.ekspedisi,
    tanggalKirim: form.tanggalKirim,
  })
  dicoba.value = false
  form.nim = ''
  form.nama = ''
  form.paketKode = ''
  form.jumlah = 1
  form.upbjjTujuan = ''
  form.tanggalKirim = hariIni()
}

function lacakDo(nomor) {
  router.push({ path: '/pelacakan', query: { do: nomor } })
}

function buatLagi() {
  doTerakhir.value = ''
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-blue-700">Dokumen Pengiriman</p>
      <h2 class="mt-1 text-3xl font-bold text-slate-900">Buat Delivery Order (DO)</h2>
      <p class="mt-1 max-w-2xl text-[15px] text-slate-500">
        Isi data pengiriman bahan ajar untuk mahasiswa. Ringkasan di kanan dihitung
        langsung (computed) dan nomor DO dibuat otomatis.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <!-- Formulir -->
      <form
        data-testid="form-pengiriman-do"
        class="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 lg:col-span-7"
        novalidate
        @submit.prevent="kirim"
      >
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label :class="labelCls" for="d-nim">NIM Mahasiswa</label>
            <input
              id="d-nim"
              v-model.trim="form.nim"
              data-testid="input-do-nim"
              :class="[inputCls, errors.nim && inputSalahCls]"
              class="font-mono"
              type="text"
              inputmode="numeric"
              placeholder="cth. 123456789"
              autocomplete="off"
            />
            <p v-if="errors.nim" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.nim" />
          </div>
          <div>
            <label :class="labelCls" for="d-nama">Nama Mahasiswa</label>
            <input
              id="d-nama"
              v-model.trim="form.nama"
              data-testid="input-do-nama"
              :class="[inputCls, errors.nama && inputSalahCls]"
              type="text"
              placeholder="cth. Rina Wulandari"
            />
            <p v-if="errors.nama" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.nama" />
          </div>

          <div>
            <label :class="labelCls" for="d-paket">Paket Bahan Ajar</label>
            <select id="d-paket" v-model="form.paketKode" data-testid="select-do-paket" :class="inputCls">
              <option value="" disabled>Pilih paket…</option>
              <option v-for="p in gudang.paketList" :key="p.kode" :value="p.kode" v-text="`${p.nama} — ${$filters.rupiah(p.harga)}`" />
            </select>
            <p v-if="errors.paketKode" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.paketKode" />
          </div>
          <div>
            <label :class="labelCls" for="d-jumlah">Jumlah Paket</label>
            <input
              id="d-jumlah"
              v-model.number="form.jumlah"
              data-testid="input-do-jumlah"
              :class="[inputCls, errors.jumlah && inputSalahCls]"
              type="number"
              min="1"
              max="99"
            />
            <p v-if="errors.jumlah" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.jumlah" />
          </div>

          <div>
            <label :class="labelCls" for="d-tujuan">UPBJJ Tujuan</label>
            <select id="d-tujuan" v-model="form.upbjjTujuan" data-testid="select-do-upbjj" :class="inputCls">
              <option value="" disabled>Pilih UPBJJ tujuan…</option>
              <option v-for="u in gudang.upbjjList" :key="u" :value="u" v-text="'UPBJJ ' + u" />
            </select>
            <p v-if="errors.upbjjTujuan" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.upbjjTujuan" />
          </div>
          <div>
            <label :class="labelCls" for="d-ekspedisi">Jasa Ekspedisi</label>
            <select id="d-ekspedisi" v-model="form.ekspedisi" data-testid="select-do-ekspedisi" :class="inputCls">
              <option v-for="l in gudang.layananList" :key="l.kode" :value="l.kode" v-text="l.nama" />
            </select>
          </div>

          <div>
            <label :class="labelCls" for="d-tanggal">Tanggal Kirim</label>
            <input
              id="d-tanggal"
              v-model="form.tanggalKirim"
              data-testid="input-do-tanggal"
              :class="[inputCls, errors.tanggalKirim && inputSalahCls]"
              type="date"
              :min="hariIni()"
            />
            <p v-if="errors.tanggalKirim" class="mt-1 text-xs font-medium text-rose-600" v-text="errors.tanggalKirim" />
          </div>
          <div class="flex items-end">
            <p class="text-[13px] text-slate-500">
              Tekan <kbd>Enter</kbd> di dalam form atau klik tombol untuk membuat DO.
            </p>
          </div>
        </div>

        <app-hint v-if="infoPaket" :text="infoPaket" testid="do-package-info" />
        <app-hint
          v-else-if="dicoba && adaError"
          tone="kuning"
          testid="do-form-error-summary"
          text="Periksa kembali isian yang ditandai merah sebelum membuat DO."
        />

        <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="submit" :class="btnPrimary" data-testid="btn-submit-do">
            <app-icon name="send" :size="16" />
            Buat Delivery Order
          </button>
        </div>
      </form>

      <!-- Ringkasan langsung / bukti DO -->
      <div class="space-y-6 lg:col-span-5">
        <!-- v-if: kartu sukses setelah DO dibuat -->
        <div
          v-if="doTerakhir"
          data-testid="do-success-card"
          class="anim-rise rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-xs"
        >
          <div class="flex items-center gap-3">
            <span class="anim-pop flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <app-icon name="check" :size="20" />
            </span>
            <div>
              <p class="text-sm font-bold text-emerald-900">DO Berhasil Dibuat</p>
              <p class="font-mono text-lg font-semibold tracking-tight text-emerald-800" data-testid="do-created-number" v-text="doTerakhir" />
            </div>
          </div>
          <p class="mt-3 text-[13px] leading-relaxed text-emerald-900/80">
            Dokumen tercatat di registry pelacakan dengan status
            <strong>Menunggu Diproses</strong>. Lacak perjalanannya di halaman Pelacakan.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" :class="btnPrimary" data-testid="btn-track-new-do" @click="lacakDo(doTerakhir)">
              <app-icon name="route" :size="15" />
              Lacak DO Ini
            </button>
            <button type="button" :class="btnGhost" data-testid="btn-new-do-again" @click="buatLagi">
              <app-icon name="plus" :size="15" />
              Buat DO Lagi
            </button>
          </div>
        </div>

        <!-- Ringkasan langsung (computed, v-bind) -->
        <div
          data-testid="live-summary-card"
          class="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 shadow-xs sm:p-8 lg:sticky lg:top-36"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-blue-700">Ringkasan DO</p>
            <span
              data-testid="live-generated-dono"
              class="rounded-lg bg-blue-800 px-2.5 py-1 font-mono text-xs font-semibold text-white"
              v-text="nomorBerikutnya"
            />
          </div>

          <dl class="mt-4 space-y-2.5 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Penerima</dt>
              <dd class="font-semibold text-slate-800" v-text="form.nama || '—'" />
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">NIM</dt>
              <dd class="font-mono text-slate-700" v-text="form.nim || '—'" />
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Tujuan</dt>
              <dd class="font-semibold text-slate-800" v-text="form.upbjjTujuan ? 'UPBJJ ' + form.upbjjTujuan : '—'" />
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Ekspedisi</dt>
              <dd class="text-slate-700" v-text="namaLayanan(form.ekspedisi)" />
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Tanggal Kirim</dt>
              <dd class="text-slate-700" v-text="$filters.tanggal(form.tanggalKirim)" />
            </div>
          </dl>

          <div v-if="paketDipilih" class="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-[13px] font-semibold text-slate-800" v-text="paketDipilih.nama" />
            <ul class="mt-2 space-y-1.5">
              <li v-for="kode in paketDipilih.isi" :key="kode" class="flex items-center gap-2 text-[13px] text-slate-600">
                <app-icon name="check" :size="13" class="text-emerald-600" />
                <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-blue-900" v-text="kode" />
                <span v-text="judulBahan(kode)" />
              </li>
            </ul>
          </div>
          <p v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-[13px] text-slate-400">
            Pilih paket untuk melihat isinya di sini.
          </p>

          <div class="mt-4 flex items-baseline justify-between border-t border-blue-100 pt-4">
            <p class="text-[13px] font-semibold uppercase tracking-wider text-slate-500">
              Total Biaya
            </p>
            <p data-testid="live-summary-cost" class="text-xl font-bold tabular-nums text-blue-900">
              {{ $filters.rupiah(total) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- DO terdaftar — iterasi objek tracking berbasis kunci nomor DO (name-based v-for) -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Order Terdaftar</p>
      <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="(data, noDO, idx) in gudang.tracking"
          :key="noDO"
          type="button"
          data-testid="recent-do-row"
          class="anim-maju flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-xs transition-all hover:border-blue-300 hover:shadow-md active:scale-[.99]"
          :style="{ animationDelay: idx * 50 + 'ms' }"
          :aria-label="'Lacak ' + noDO"
          @click="lacakDo(noDO)"
        >
          <span class="min-w-0">
            <span class="block font-mono text-xs font-semibold text-blue-900" v-text="noDO" />
            <span class="block truncate text-[13px] text-slate-600">
              {{ data.nama }} • {{ data.paket }}
            </span>
          </span>
          <status-badge :status="data.status" :testid="'recent-do-status-' + noDO.toLowerCase()" />
        </button>
      </div>
    </div>
  </section>
</template>
