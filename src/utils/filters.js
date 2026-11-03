// ============================================================
// Formatter teks — dipasang sebagai app.config.globalProperties.$filters
// di main.js. Di Vue 3, sintaks pipa "filter" Vue 2 dihapus; pola resmi
// penggantinya adalah metode/globalProperties (indikator 7).
// ============================================================

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/** 65000 -> "Rp 65.000" */
export function rupiah(nilai) {
  const n = Number(nilai)
  if (nilai === null || nilai === undefined || nilai === '' || Number.isNaN(n)) return '—'
  return 'Rp ' + n.toLocaleString('id-ID')
}

/** "2025-08-25" -> "25 Agustus 2025"; juga menerima "YYYY-MM-DD HH:mm:ss" */
export function tanggal(nilai) {
  if (!nilai) return '—'
  const bagian = String(nilai).trim().split(/\s+/)
  const [y, m, d] = bagian[0].split('-').map(Number)
  if (!y || !m || !d) return String(nilai)
  const dasar = `${d} ${BULAN[m - 1]} ${y}`
  return bagian.length > 1 ? `${dasar}, ${bagian[1]}` : dasar
}

/** Alias untuk log perjalanan (timestamp) */
export function tanggalJam(nilai) {
  return tanggal(nilai)
}

/** "ekma4116" -> "EKMA4116" */
export function kapital(nilai) {
  return (nilai ?? '').toString().toUpperCase()
}

/** Menentukan status stok dari qty vs stok minimum (safety) */
export function statusStok(qty, safety) {
  const q = Number(qty)
  const s = Number(safety)
  if (q <= 0) return 'Habis'
  if (q < s) return 'Menipis'
  return 'Aman'
}

const PETA_KELAS = {
  Aman: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Menipis: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  Habis: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  'Menunggu Diproses': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'Dalam Perjalanan': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Selesai: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

const PETA_TITIK = {
  Aman: 'bg-emerald-500',
  Menipis: 'bg-amber-500',
  Habis: 'bg-rose-500',
  'Menunggu Diproses': 'bg-sky-500',
  'Dalam Perjalanan': 'bg-blue-500',
  Selesai: 'bg-emerald-500',
}

/** Kelas warna badge status (dipakai lewat v-bind:class) */
export function kelasStatus(status) {
  return PETA_KELAS[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20'
}

/** Warna titik indikator status */
export function kelasTitik(status) {
  return PETA_TITIK[status] || 'bg-slate-400'
}
