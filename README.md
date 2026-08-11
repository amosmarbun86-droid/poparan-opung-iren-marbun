# Silsilah Keluarga

Aplikasi web pohon silsilah keluarga (family tree) — bisa punya banyak silsilah sekaligus (multi-tree), sistem undangan lewat token, dan login dengan akun.

## Fitur

- Login / daftar akun dengan token undangan
- Buat, buka, dan hapus silsilah (khusus pemilik)
- Undang anggota lain lewat token sekali pakai
- Tambah, edit, hapus anggota keluarga (nama, tanggal lahir/meninggal, ayah/ibu/pasangan, foto)
- Visualisasi pohon silsilah interaktif (D3.js)
- Pencarian anggota real-time
- Ekspor pohon silsilah ke PNG / PDF
- Mode terang & gelap
- Realtime sync lewat Firebase Firestore

## Teknologi

- HTML, CSS, JavaScript (ES Modules)
- Firebase Authentication & Firestore
- D3.js untuk render pohon
- html2canvas & jsPDF untuk ekspor

## Deploy

Project ini di-hosting statis via GitHub Pages, langsung terhubung ke backend Firebase (lihat `firebase.js`).
