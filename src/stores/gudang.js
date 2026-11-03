// ============================================================
// Store reaktif bersama (single source of truth di sisi klien).
// Data diambil dari dataset resmi soal (src/data/dataBahanAjar.json)
// sehingga aplikasi berjalan penuh tanpa backend.
// ============================================================
import { reactive } from 'vue'
import dataset from '@/data/dataBahanAjar.json'

/** Mengubah array-of-single-key-object (dataset.tracking) menjadi satu objek
 *  berkunci nomor DO — juga otomatis menduplikasi entri ganda. */
function petaTracking(datalist) {
  const peta = {}
  for (const entri of datalist) {
    for (const [noDO, data] of Object.entries(entri)) {
      peta[noDO] = { ...data, jumlah: 1, perjalanan: data.perjalanan.map((p) => ({ ...p })) }
    }
  }
  return peta
}

function formatWaktu(tgl) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${tgl.getFullYear()}-${pad(tgl.getMonth() + 1)}-${pad(tgl.getDate())} ` +
    `${pad(tgl.getHours())}:${pad(tgl.getMinutes())}:${pad(tgl.getSeconds())}`
  )
}

// Dua DO demo tambahan agar ketiga variasi status terlihat
// (Menunggu Diproses / Dalam Perjalanan / Selesai).
const trackingAwal = petaTracking(dataset.tracking)
trackingAwal['DO2025-0002'] = {
  nim: '098765432',
  nama: 'Budi Santoso',
  status: 'Selesai',
  ekspedisi: 'REG',
  tanggalKirim: '2025-08-20',
  paket: 'PAKET-UT-002',
  jumlah: 1,
  total: 140000,
  perjalanan: [
    { waktu: '2025-08-20 09:05:11', keterangan: 'Penerimaan di Loket: SALEMBA' },
    { waktu: '2025-08-21 08:40:02', keterangan: 'Dalam perjalanan ke UPBJJ Makassar' },
    { waktu: '2025-08-22 14:12:45', keterangan: 'Diterima oleh mahasiswa (Budi Santoso)' },
  ],
}
trackingAwal['DO2025-0003'] = {
  nim: '112233445',
  nama: 'Andi Pratama',
  status: 'Menunggu Diproses',
  ekspedisi: 'EXP',
  tanggalKirim: '2025-08-27',
  paket: 'PAKET-UT-001',
  jumlah: 2,
  total: 240000,
  upbjjTujuan: 'Denpasar',
  perjalanan: [
    { waktu: '2025-08-27 08:15:00', keterangan: 'Dokumen DO dibuat di gudang UPBJJ Jakarta' },
  ],
}

export const gudang = reactive({
  stok: dataset.stok.map((s) => ({ ...s })),
  upbjjList: [...dataset.upbjjList],
  kategoriList: [...dataset.kategoriList],
  layananList: dataset.pengirimanList.map((l) => ({ ...l })),
  paketList: dataset.paket.map((p) => ({ ...p, isi: [...p.isi] })),
  tracking: trackingAwal,
  urutDoBerikutnya: 4,
})

export function cariPaket(kode) {
  return gudang.paketList.find((p) => p.kode === kode)
}

/** Kode bahan (cth. EKMA4116) -> judul bahan ajar */
export function judulBahan(kode) {
  const s = gudang.stok.find((x) => x.kode === kode)
  return s ? s.judul : 'Bahan ajar diluar paket'
}

export function nomorDoBerikutnya() {
  return `DO2025-${String(gudang.urutDoBerikutnya).padStart(4, '0')}`
}

export function tambahStok(item) {
  gudang.stok.unshift({ ...item })
}

export function ubahQty(kode, delta) {
  const s = gudang.stok.find((x) => x.kode === kode)
  if (!s) return
  s.qty = Math.max(0, s.qty + delta)
}

/** Membuat DO baru: mendaftar ke registry tracking & mengembalikan nomornya. */
export function buatDO(form) {
  const nomor = nomorDoBerikutnya()
  gudang.urutDoBerikutnya += 1
  const paket = cariPaket(form.paketKode)
  gudang.tracking[nomor] = {
    nim: form.nim,
    nama: form.nama,
    status: 'Menunggu Diproses',
    ekspedisi: form.ekspedisi,
    tanggalKirim: form.tanggalKirim,
    paket: form.paketKode,
    jumlah: form.jumlah,
    total: paket.harga * form.jumlah,
    upbjjTujuan: form.upbjjTujuan,
    perjalanan: [
      { waktu: formatWaktu(new Date()), keterangan: `Dokumen ${nomor} dibuat di gudang UPBJJ Jakarta` },
    ],
  }
  return nomor
}
