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

## Catatan penting (mode demo)

- **Belum ada model YOLO terlatih.** Foto contoh memakai kotak deteksi yang sudah ditentukan;
  foto unggahan dianalisis dengan pencarian area kemerahan sederhana (`analyzeImage` di `assets/app.js`).
- Semua nama pasien, angka, dan hasil deteksi adalah **data contoh**.
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
