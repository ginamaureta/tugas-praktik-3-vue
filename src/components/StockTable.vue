<script setup>
// Tabel stok: baris dirender dengan v-for berindeks zero-based (nomor urut =
// offset halaman + index + 1), kode via v-text, catatan via v-html,
// harga lewat filter $filters.rupiah, status lewat <status-badge>.
import AppIcon from './AppIcon.vue'
import { qtyBtnCls } from '@/utils/styles'

defineProps({
  items: { type: Array, required: true }, // baris halaman aktif
  mulaiNomor: { type: Number, default: 0 }, // offset nomor urut antar halaman
})

const emit = defineEmits(['ubah-qty', 'reset-filter'])
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    <div class="overflow-x-auto">
      <table data-testid="stock-data-table" class="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr class="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th class="px-4 py-3 font-semibold">No</th>
            <th class="px-4 py-3 font-semibold">Kode</th>
            <th class="px-4 py-3 font-semibold">Judul Bahan Ajar</th>
            <th class="px-4 py-3 font-semibold">Kategori</th>
            <th class="px-4 py-3 font-semibold">UPBJJ</th>
            <th class="px-4 py-3 font-semibold">Rak</th>
            <th class="px-4 py-3 text-right font-semibold">Harga</th>
            <th class="px-4 py-3 text-center font-semibold">Qty</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Catatan</th>
          </tr>
        </thead>

        <tbody v-if="items.length">
          <tr
            v-for="(item, index) in items"
            :key="item.kode"
            data-testid="stock-table-row"
            class="border-t border-slate-100 transition-colors hover:bg-blue-50/40"
          >
            <td class="px-4 py-3 tabular-nums text-slate-400">{{ mulaiNomor + index + 1 }}</td>
            <td class="px-4 py-3">
              <code
                data-testid="stock-item-code"
                class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-900"
                v-text="item.kode"
              />
            </td>
            <td class="px-4 py-3 font-semibold text-slate-800" data-testid="stock-item-title">
              {{ item.judul }}
            </td>
            <td class="px-4 py-3 text-slate-600">{{ item.kategori }}</td>
            <td class="px-4 py-3 text-slate-600">{{ item.upbjj }}</td>
            <td class="px-4 py-3 font-mono text-xs text-slate-600" v-text="item.lokasiRak" />
            <td class="px-4 py-3 text-right tabular-nums text-slate-700">
              {{ $filters.rupiah(item.harga) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  type="button"
                  :class="qtyBtnCls"
                  data-testid="stock-btn-decrement"
                  :aria-label="'Kurangi stok ' + item.judul"
                  @click="emit('ubah-qty', { kode: item.kode, delta: -1 })"
                >
                  <app-icon name="minus" :size="12" />
                </button>
                <span
                  data-testid="stock-item-qty"
                  class="w-9 text-center font-semibold tabular-nums text-slate-800"
                  v-text="item.qty"
                />
                <button
                  type="button"
                  :class="qtyBtnCls"
                  data-testid="stock-btn-increment"
                  :aria-label="'Tambah stok ' + item.judul"
                  @click="emit('ubah-qty', { kode: item.kode, delta: 1 })"
                >
                  <app-icon name="plus" :size="12" />
                </button>
              </div>
            </td>
            <td class="px-4 py-3">
              <status-badge
                :status="$filters.statusStok(item.qty, item.safety)"
                :pulse="$filters.statusStok(item.qty, item.safety) !== 'Aman'"
                testid="stock-item-status-badge"
              />
            </td>
            <td class="px-4 py-3" data-testid="stock-item-html-notes">
              <!-- v-html: catatan berformat dari dataset (data terpercaya, terbundel) -->
              <div class="catatan-html max-w-[220px]" v-html="item.catatanHTML" />
            </td>
          </tr>
        </tbody>

        <!-- v-else: empty state ketika filter tidak menemukan apa pun -->
        <tbody v-else>
          <tr>
            <td colspan="10" class="px-4 py-14 text-center" data-testid="stock-table-empty-state">
              <div class="mx-auto flex max-w-sm flex-col items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <app-icon name="box" :size="24" />
                </span>
                <p class="text-sm font-semibold text-slate-700">Tidak ada bahan ajar yang cocok</p>
                <p class="text-[13px] text-slate-500">
                  Coba ubah kata kunci pencarian atau reset filter untuk menampilkan seluruh stok.
                </p>
                <button
                  type="button"
                  data-testid="stock-empty-reset-btn"
                  class="mt-1 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-[.98]"
                  @click="emit('reset-filter')"
                >
                  <app-icon name="refresh" :size="15" />
                  Reset Filter
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
