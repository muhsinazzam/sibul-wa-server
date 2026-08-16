# 🚀 PANDUAN MENJALANKAN SERVER SIBUL WHATSAPP GATEWAY (100% GRATIS & DI LAPTOP SENDIRI)

Server ini **100% Gratis**, tidak memerlukan kartu kredit, tidak menyewa VPS, dan langsung berjalan di laptop kamu!

---

## 📌 CARA PAKAI (HANYA 3 LANGKAH):

### Langkah 1: Jalankan Server di Laptop
1. Buka folder: `d:\sibul (2)\sibul\app\openwa-server\`
2. Klik ganda (Double-Click) file: **`start-server.bat`**
3. Jendela hitam terminal akan terbuka dan menampilkan **QR Code WhatsApp**.

---

### Langkah 2: Hubungkan WhatsApp Bot
1. Buka aplikasi WhatsApp di HP kamu (bisa nomor kamu atau nomor kedua).
2. Buka **Perangkat Tertaut (Linked Devices)** $\to$ **Tautkan Perangkat**.
3. Arahkan kamera HP ke QR Code yang muncul di terminal (atau buka di browser: `http://localhost:2785`).
4. Terminal akan memunculkan tulisan:
   ```
   🎉 WHATSAPP BERHASIL TERHUBUNG & SIAP DIGUNAKAN!
   ```

---

### Langkah 3: Uji Coba dari HP Android
1. Pastikan HP dan Laptop kamu tersambung ke **Wi-Fi yang sama**.
2. Buka aplikasi **Sibul** di HP kamu $\to$ Masuk ke menu **Pengaturan**.
3. Masukkan nomor WhatsApp kontak darurat (orang tua/wali) $\to$ Klik **Simpan Kontak Darurat**.
4. Tekan tombol **"KIRIM PESAN TES KE WHATSAPP"**.
5. WhatsApp kontak darurat akan langsung menerima pesan tes otomatis dari Sibul! 🛡️

---

## 🌐 Ingin Server Bisa Diakses dari Luar Rumah (Tanpa Satu Wi-Fi)?
Cukup klik ganda file: **`start-online-tunnel.bat`**
Kamu akan mendapatkan link online gratis (misal: `https://xxxx.loca.lt`), lalu masukkan link tersebut ke `SERVER_URL_PUSAT` di `OpenWAService.kt`.
