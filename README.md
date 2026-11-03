# Sistem Bahan Ajar & Pengiriman — Tugas Praktik 3

Aplikasi web **Vue 3** untuk mengelola stok bahan ajar UPBJJ, membuat dokumen pengiriman (Delivery Order/DO), dan melacak perjalanan pengiriman. Seluruh data demo diambil dari `src/data/dataBahanAjar.json` (dataset resmi soal) dan terbundel di sisi klien — **tanpa ketergantungan backend**.

## Cara Menjalankan

1. Unduh ZIP di atas dan ekstrak.
2. Buka folder tugas-praktik-3-vue di VS Code.
3. Jalankan npm install jika dependensi belum terpasang.
4. Jalankan npm run dev.
5. Buka alamat lokal yang muncul di terminal.

## Struktur Proyek

frontend/
├── index.html          # entry HTML (lang="id")
├── package.json        # vue 3, vue-router 5, tailwind v4, vite 8
├── vite.config.ts      # plugin vue + tailwind; alias vue full-build
└── src/
    ├── main.js         # createApp, $filters, registrasi komponen global
    ├── App.vue         # shell: header, router-view (transisi), footer
    ├── router/
    │   └── index.js    # /stok, /pengiriman, /pelacakan (hash history)
    ├── data/
    │   └── dataBahanAjar.json  # dataset resmi soal
    ├── stores/
    │   └── gudang.js   # store reaktif bersama + aksi (tambahStok, buatDO, ...)
    ├── utils/
    │   ├── filters.js  # $filters: rupiah, tanggal, kapital, statusStok, ...
    │   └── styles.js   # kelas Tailwind bersama (form & tombol)
    ├── components/
    │   ├── AppHeader.vue
    │   ├── StatCard.vue
    │   ├── StatusBadge.vue
    │   ├── AppHint.vue
    │   ├── AppIcon.vue
    │   ├── StockTable.vue
    │   ├── StockFormModal.vue
    │   └── TrackingTimeline.vue
    └── pages/
        ├── StockPage.vue
        ├── PengirimanPage.vue
        └── PelacakanPage.vue
