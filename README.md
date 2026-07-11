# 📼 Andai Aku Bisa - Pemutar Kaset Retro & Lirik

Sebuah pemutar musik web bertema kaset retro-modern dengan lirik tersinkronisasi untuk lagu **"Andai Aku Bisa"** (versi cover oleh **Tulus**). 

Aplikasi ini dipersembahkan spesial dengan penuh kasih sayang untuk **Mutia** 💝✨.

---

## ✨ Fitur Utama

1. **Interactive Cassette Deck**: Visualisasi kaset pita bergaya retro-modern menggunakan Pure CSS yang berputar secara dinamis saat lagu diputar, lengkap dengan detail pita hitam yang berangsur pindah dari kiri ke kanan.
2. **Synchronized Lyrics**: Lirik lagu yang bergulir otomatis secara halus dan menyorot baris lagu yang sedang aktif.
3. **Penyelaras Waktu (Sync Adjuster)**: Tombol interaktif untuk menyesuaikan sinkronisasi lirik (`+0.5s` / `-0.5s`) secara *real-time*.
4. **Interactive Seek**: Ketuk baris lirik mana saja untuk langsung melompat (*seek*) ke detik tersebut di dalam lagu.
5. **Multi-Source Audio**: Mendukung pemutaran dari YouTube Stream, Synthesizer piano internal, maupun unggahan file kustom.

---

## 🛠️ Cara Menjalankan Secara Lokal

Jika ingin menjalankan atau mengembangkan proyek ini di komputer lokal Anda:

1. Pastikan Anda memiliki Python terinstal di komputer.
2. Buka terminal/command prompt di direktori proyek ini.
3. Jalankan perintah:
   ```bash
   python server.py
   ```
4. Buka browser dan kunjungi: **`http://localhost:8000`**

*Catatan: Kami menggunakan `server.py` kustom karena server bawaan Python tidak mendukung Range Requests yang dibutuhkan peramban untuk melompat/seek posisi lagu pada file media lokal.*

---

## 🌐 Publikasi ke GitHub Pages

Proyek ini sepenuhnya statis (HTML/CSS/JS) sehingga sangat mudah di-host secara gratis di GitHub Pages:

1. Buka halaman repositori GitHub Anda.
2. Masuk ke menu **Settings** -> **Pages**.
3. Di bawah bagian *Branch*, ubah menjadi **`main`** dan klik **Save**.
4. Situs web Anda akan aktif secara *online* dalam hitungan menit!

---

*Made with 💖 for Mutia.*
