# DiaScan — Prototipe Web

Prototipe interaktif dari gagasan esai *DiaScan: Deteksi Dini Luka Kaki Diabetik Berbasis YOLO*.
Satu website responsif: tampilan desktop memakai sidebar, dan pada lebar layar **≤ 768 px** otomatis
berpindah ke tampilan mobile (bilah atas + navigasi bawah).

## Cara menjalankan

Tanpa instalasi apa pun:

- **Paling mudah:** klik dua kali `index.html` untuk membukanya di browser.
- **Lewat server lokal** (dibutuhkan agar tombol *Kamera* bisa mengakses webcam):

  ```bash
  python -m http.server 5173
  ```

  lalu buka `http://localhost:5173`.

Untuk online, unggah seluruh folder ini ke GitHub Pages, Netlify, atau Vercel (hosting statis).

## Isi

| Peran | Halaman |
|---|---|
| **Pasien** | Beranda, Pindai Luka (rana / Galeri / Kamera), Hasil Deteksi, Riwayat & grafik penyembuhan, Edukasi, Profil |
| **Nakes** | Dasbor, Antrean Triase, Data Pasien, Rujukan, Model AI |

Kedua peran memakai data yang sama, jadi alur lengkapnya bisa dicoba:
**pindai → kirim ke Puskesmas → (ganti peran ke Nakes) validasi / koreksi / rujuk → pasien menerima catatan.**

## Pemantauan penyembuhan 4 minggu

Fokus DiaScan bukan hanya mendeteksi luka, tetapi **memprediksi luka yang tidak akan sembuh sebelum terlambat**
dan menyarankan rujukan. Ada dua jalur:

**Jalur tren (mingguan)**, dihitung oleh `healTrack()` di `assets/data.js`:

| Minggu | Yang terjadi |
|---|---|
| 0 | Luas dari foto awal dicatat. Target: luas turun 50% di minggu ke-4 (garis lurus). |
| 1–3 | Pindai seminggu sekali di hari yang sama. Status **Waspada** bila luka lebih besar dari foto awal, atau mulai minggu ke-2 penurunannya kurang dari separuh target. Pasien disarankan kontrol tanpa menunggu minggu ke-4. |
| 4 | **Titik keputusan.** Turun < 50% → **Disarankan rujuk**; turun ≥ 50% → **Patokan tercapai**. |

Patokan 50% dalam 4 minggu berasal dari Sheehan dkk. (*Diabetes Care*, 2003) dan pedoman IWGDF.
Ambang Waspada di minggu ke-1–3 adalah aturan tim, belum baku, dan perlu divalidasi klinis.
Semua angka ada di konstanta `HEAL` agar mudah diubah.

**Jalur darurat (kapan saja)**: tombol *Ada keluhan?* berisi checklist tanda bahaya (bau, nanah, kemerahan
meluas, bengkak/panas, demam, kulit menghitam), lalu foto. Foto ini **tidak dihitung dalam tren**.
Bila ada gejala yang dicentang, atau AI menemukan tanda infeksi atau nekrosis, sistem menyarankan rujukan segera.

Di sisi nakes, antrean diurutkan menurut laporan darurat dan status tren. Dasbor punya panel *Pemantauan
Penyembuhan 4 Minggu*, dan formulir rujukan terisi otomatis dengan alasannya.

> **Akurasi luas luka adalah titik paling rawan.** Tanpa stiker kalibrasi, galat pengukuran bisa lebih besar
> daripada perubahan luka seminggu. Untuk versi sungguhan, stiker kalibrasi sebaiknya wajib, dan foto harus
> diambil dari kaki, lokasi, jarak, dan sudut yang sama.

## Catatan penting (mode demo)

- **Belum ada model YOLO terlatih.** Foto contoh memakai kotak deteksi yang sudah ditentukan;
  foto unggahan dianalisis dengan pencarian area kemerahan sederhana (`analyzeImage` di `assets/app.js`).
- Semua nama pasien, angka, dan hasil deteksi adalah **data contoh**. Tombol rana menghasilkan luka yang mengecil 12% dari pindai mingguan sebelumnya; di mode laporan keluhan, foto contoh menampilkan kemerahan.
- Data disimpan di `localStorage` browser masing-masing; tombol **Atur ulang data** mengembalikan data contoh.
- Bukan alat diagnosis medis.

## Menghubungkan model YOLO sungguhan (pengembangan lanjutan)

1. Latih YOLO (mis. Ultralytics YOLO11n) pada dataset luka kaki, lalu ekspor ke ONNX:
   `yolo export model=best.pt format=onnx imgsz=640`.
2. Muat model di browser dengan ONNX Runtime Web, atau jalankan di server (API).
3. Ganti isi fungsi `analyzeImage()` agar mengembalikan daftar
   `{ cls, conf, box: [x, y, w, h] }` (koordinat ternormalisasi 0–1). Bagian lain aplikasi tidak perlu diubah.

## Struktur

```
index.html          halaman utama
assets/style.css    tampilan (tema terang & gelap, responsif)
assets/data.js      ikon, ilustrasi kaki, aturan triase, data contoh
assets/app.js       logika aplikasi (peran pasien & nakes)
```
