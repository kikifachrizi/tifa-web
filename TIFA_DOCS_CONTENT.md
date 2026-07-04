# Dokumentasi TIFA

> **Catatan:** Template ini bersifat tentatif dan dapat dimodifikasi sesuai kebutuhan. Silakan tambahkan, kurangi, atau ubah struktur sesuai dengan perkembangan dokumentasi.

---

## 1. Pengenalan TIFA (Introduction what is TIFA)

### Apa itu TIFA?
TIFA memiliki kepanjangan Tel-u Interactive Food Assistant yang merupakan AMR (autonomous mobile robot) untuk pelayanan di ruang lingkup F&B.

### Fitur Utama
- Delivery
- manual mapping
- web monitoring

### Manfaat TIFA
- TIFA merupakan Prototype pertama dari robot pengantar makanan yang dikembangkan oleh mahasiswa TA selama kurang lebih 3 tahun
- meluluskan 3 angkatan mahasiswa TA dan CD
- menjadi wadah internship dan kerja praktik
- mengembangkan ekosistem Tel-u di subbagian teknologinya

---

## 2. Memulai (Getting Started)

### Persyaratan Sistem
*[Sebutkan persyaratan minimum untuk menggunakan TIFA]*

### Instalasi Cepat
*[Berikan langkah-langkah instalasi singkat untuk pengguna baru]*

### Verifikasi Instalasi
*[Jelaskan cara memverifikasi bahwa TIFA telah terinstal dengan benar]*

---

## 3. Arsitektur Sistem (System Architecture)

### Diagram Arsitektur
*[Sertakan diagram atau penjelasan tentang struktur sistem TIFA]*

### Komponen Utama
*[Jelaskan setiap komponen penting dalam sistem]*

### Alur Kerja
*[Uraikan bagaimana komponen-komponen bekerja bersama]*

---

## 4. Fitur (Feature)

### Daftar Fitur
*[Sebutkan semua fitur yang tersedia dalam TIFA]*

### Deskripsi Fitur
*[Jelaskan setiap fitur secara detail]*

### Keunggulan Setiap Fitur
*[Tunjukkan keunggulan dan use case untuk setiap fitur]*

---

## 5. Pengaturan (Setting Up)

### Konfigurasi Dasar
*[Jelaskan pengaturan dasar yang diperlukan sebelum menggunakan TIFA]*

### Pengaturan Lanjutan
*[Sebutkan pengaturan lanjutan yang dapat dikustomisasi]*

### Troubleshooting Pengaturan
*[Berikan solusi untuk masalah umum saat pengaturan]*

---

## 6. Persiapan Hardware (Hardware Preparation)

### Spesifikasi Hardware
*[Jelaskan spesifikasi hardware yang dibutuhkan]*

### Daftar Komponen
- Controller Board
    - Arduino nano
    - BTS7960
    - Raspberry pi 4 8GB

- Sensor 
    - Rotary encoder
    - Rplidar C1
    - esp32 c3 + watt meter DIY

- Power System
    - lithium ion 18650 13S3P (48V 30AH)
    - DC-DC Stepdown 24V 15A
    - DC-DC Stepdown 5V 3A

- GUI
    - Tab Infinix XPAD20

- Others
    - usb hub for raspberry pi
    - emergency button

### Instalasi Hardware
*[Berikan panduan langkah demi langkah untuk memasang hardware]*

### Verifikasi Hardware
*[Jelaskan cara memastikan semua hardware berfungsi dengan baik]*

---

## 7. Persiapan Software (Software Preparation)

### Prasyarat Software
*[Jelaskan software dan library yang harus diinstal terlebih dahulu]*

### Instalasi Dependensi
*[Berikan panduan instalasi semua dependensi yang diperlukan]*

### Konfigurasi Software
*[Jelaskan langkah-langkah konfigurasi software]*

### Verifikasi Software
*[Jelaskan cara memverifikasi bahwa semua software berfungsi dengan baik]*

---

## 8. Cara Penggunaan (How to Use)

- bahas cara nyalain/setup robotnya gmna
- bahas apps nya dulu ada apa aja
- bahas webnya dlu ada apa aja


### 8.1 Mapping

#### Apa itu Mapping?
*[Jelaskan konsep mapping dalam TIFA]*

#### Persiapan Mapping
*[Jelaskan apa yang perlu disiapkan sebelum melakukan mapping]*

#### Langkah-langkah Mapping
*[Berikan panduan langkah demi langkah untuk melakukan mapping]*

#### Tips dan Trik
*[Berikan tips untuk hasil mapping yang optimal]*

---

### 8.2 Teleop (Teleoperation)

#### Apa itu Teleop?
*[Jelaskan apa itu teleoperasi dan fungsinya]*

#### Persiapan Teleop
*[Jelaskan persiapan yang diperlukan sebelum menggunakan teleop]*

#### Kontrol Dasar
*[Jelaskan kontrol-kontrol dasar untuk teleop]*

#### Kontrol Lanjutan
*[Jelaskan kontrol-kontrol lanjutan atau fitur tambahan]*

---

### 8.3 Simpan Map (Save Map)

#### Proses Penyimpanan Map
*[Jelaskan bagaimana cara menyimpan map yang telah dibuat]*

#### Format Penyimpanan
*[Jelaskan format file dan struktur penyimpanan map]*

#### Lokasi Penyimpanan
*[Jelaskan di mana map disimpan dan bagaimana mengaksesnya]*

#### Backup dan Restore
*[Jelaskan cara melakukan backup dan restore map]*

---

### 8.4 Tambah Koordinat Tujuan (Add Goal Coordinate)

#### Memahami Koordinat Tujuan
*[Jelaskan apa itu koordinat tujuan dan mengapa penting]*

#### Cara Menambah Koordinat
*[Berikan panduan langkah demi langkah untuk menambah koordinat tujuan]*

#### Format Koordinat
*[Jelaskan format koordinat yang diterima TIFA]*

#### Pengelolaan Koordinat
*[Jelaskan cara mengedit, menghapus, atau mengorganisir koordinat tujuan]*

---

### 8.5 Penggunaan Map (Use Map)

#### Memuat Map
*[Jelaskan cara memuat map yang telah disimpan sebelumnya]*

#### Navigasi Map
*[Jelaskan fitur-fitur navigasi dalam map]*

#### Visualisasi Map
*[Jelaskan cara melihat dan berinteraksi dengan map di interface]*

---

### 8.6 Navigasi (Navigation)

#### Konsep Navigasi
*[Jelaskan konsep dasar navigasi autonomous]*

#### Algoritma Navigasi
*[Jelaskan algoritma atau metode yang digunakan untuk navigasi]*

#### Pengaturan Navigasi
*[Jelaskan parameter yang dapat dikonfigurasi untuk navigasi]*

#### Monitoring Navigasi
*[Jelaskan cara memantau status navigasi real-time]*

---

### 8.7 Menuju Tujuan (Go to Goal)

#### Persiapan
*[Jelaskan persiapan sebelum melakukan go to goal]*

#### Langkah-langkah Go to Goal
*[Berikan panduan langkah demi langkah untuk mengirim robot ke tujuan]*

#### Pembatalan dan Pause
*[Jelaskan cara membatalkan atau mempause perjalanan]*

#### Hasil dan Verifikasi
*[Jelaskan cara memverifikasi bahwa robot telah mencapai tujuan]*

---

## 9. Penggunaan Hardware (Hardware Usage / Implementation / Application)

### Use Case 1
*[Jelaskan satu use case penggunaan TIFA dengan hardware]*

### Use Case 2
*[Jelaskan use case lainnya]*

### Best Practices
*[Sebutkan praktik terbaik dalam menggunakan hardware dengan TIFA]*

### Troubleshooting Hardware
*[Berikan solusi untuk masalah hardware yang umum terjadi]*

---

## 10. Pertanyaan yang Sering Diajukan (FAQ)

### Q: [Pertanyaan 1]
**A:** *[Jawaban 1]*

### Q: [Pertanyaan 2]
**A:** *[Jawaban 2]*

### Q: [Pertanyaan 3]
**A:** *[Jawaban 3]*

### Q: [Pertanyaan 4]
**A:** *[Jawaban 4]*

### Q: Bagaimana jika saya mengalami masalah?
**A:** *[Jelaskan langkah-langkah troubleshooting umum dan cara menghubungi support]*

---

## Informasi Tambahan

### Glosarium
*[Daftar istilah-istilah teknis yang digunakan dalam dokumentasi ini]*

### Referensi dan Sumber
*[Sebutkan referensi, tutorial, atau sumber daya tambahan yang berguna]*

### Changelog
*[Catat perubahan versi dan update terbaru dari dokumentasi ini]*

### Kontribusi
*[Jelaskan bagaimana pengguna dapat berkontribusi pada dokumentasi ini]*

### Masalah belum terselesaikan (3 juli 2026)
1. ketika tel-con jelek, odom robot berantakan kemana mana dan robot kacau navigasinya
2. ketika dijalankan dan bebarengan dengan gsheet logger , pop up sampainya sempet ngga muncul
3. pop up sampai harus bener2 di klik
4. problem internet bikin robot harus direset supaya koneksi terhubung kembali (Tel-con/Tel-guest)
5. sometimes ws_bridge error "Not connected, cannot send"
6. sudo date -u -s "$(curl -sI https://www.google.com | sed -n 's/^[Dd]ate: //p' | tr -d '\r')" -> ini akan memperbaiki jam google untuk koneksi ke gsheet, tapi merusak odom sehingga robot tidak dapat jalan

---

**Terakhir diperbarui:** *[Tanggal terakhir update]*

**Versi Dokumentasi:** *[Nomor versi]*
