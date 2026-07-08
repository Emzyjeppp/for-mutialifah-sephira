# Prinsip Desain dan Kode Utama

## SOLID
Pastikan desain class dan modul mudah dikembangkan tanpa merusak bagian lain. Terapkan terutama prinsip **Single Responsibility Principle (SRP)** agar setiap class atau fungsi hanya memiliki satu tanggung jawab yang jelas.

**Manfaat:**
- Mudah dipelihara.
- Mudah diuji (testing).
- Mengurangi dampak perubahan terhadap modul lain.

---

## DRY (Don't Repeat Yourself)
Hindari duplikasi kode dengan membuat fungsi, class, atau modul yang dapat digunakan kembali (*reusable*).

**Manfaat:**
- Mengurangi redundansi.
- Mempermudah pemeliharaan.
- Perubahan hanya dilakukan di satu tempat.

---

## KISS (Keep It Simple, Stupid)
Buat solusi sesederhana mungkin. Hindari implementasi yang terlalu kompleks jika dapat diselesaikan dengan cara yang lebih sederhana.

**Contoh:**
- Jika suatu proses dapat diselesaikan dengan 5 baris kode yang jelas, jangan membuat implementasi 50 baris yang sulit dipahami.

---

## Penamaan Ekspresif
Gunakan nama variabel, fungsi, class, maupun file yang deskriptif dan mudah dipahami sehingga kode menjadi **self-documenting**.

**Contoh yang baik:**

```javascript
const currentDate = new Date();
```

**Kurang baik:**

```javascript
const yyyymmdstr = new Date();
```

---

## Minimalkan Komentar
Usahakan kode dapat menjelaskan dirinya sendiri. Gunakan komentar hanya ketika diperlukan untuk menjelaskan:

- Alasan bisnis (*business rules*)
- Pertimbangan teknis tertentu
- Keputusan desain yang tidak terlihat dari implementasi kode

Hindari komentar yang hanya menjelaskan apa yang sudah jelas dari kode.

---

# Tools Wajib untuk Menjaga Kualitas

Gunakan otomatisasi agar kualitas kode tetap konsisten serta kesalahan dapat terdeteksi sejak awal pengembangan.

## Linter (Penjaga Aturan)

Gunakan linter sesuai bahasa pemrograman yang digunakan:

- **ESLint** → JavaScript / TypeScript
- **Pylint** → Python
- **PHP_CodeSniffer** → PHP

**Fungsi:**
- Mendeteksi *code smells*.
- Menemukan bug potensial.
- Menjaga konsistensi standar penulisan kode.

---

## Formatter (Perapi Otomatis)

Gunakan formatter agar seluruh anggota tim memiliki gaya penulisan kode yang konsisten.

**Rekomendasi:**

- **Prettier** → Multi-bahasa
- **Black** → Python

**Manfaat:**

- Konsistensi indentasi.
- Konsistensi spasi.
- Menghilangkan perdebatan mengenai gaya penulisan kode.

---

## Static Analysis

Lakukan analisis statis menggunakan:

- **SonarQube**
- **SonarLint**

**Tujuan:**

- Mendeteksi kerentanan keamanan.
- Menemukan duplikasi kode.
- Mengukur kompleksitas siklomatik (*Cyclomatic Complexity*).
- Memberikan rekomendasi peningkatan kualitas kode.

---

## Integrasi CI/CD

Pastikan proses validasi kualitas kode dilakukan secara otomatis.

**Gunakan:**

- **Husky** (*pre-commit hooks*)
- Pipeline **CI/CD**

**Tujuan:**

- Mencegah kode yang tidak memenuhi standar *clean code* masuk ke repositori utama.
- Menjalankan linting, formatting, testing, dan static analysis secara otomatis sebelum proses merge atau deployment.
