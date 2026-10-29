# LK08 — Proyek Akhir: Reproduksi SSRF

> Minggu 9 · OWASP Juice Shop v20.3.0

- Nama / NIM : Exel Boy Alfanso (235150201111019)
- Watermark  : `ds-235150201111019`
- Minggu     : 9

## Langkah yang dilakukan

1. Menjalankan Juice Shop lokal di `http://localhost:3000` dan masuk dengan akun uji.
2. Mengirim URL pada kolom **Image URL** di profil yang mengarah ke endpoint server Juice Shop sendiri.
3. Memeriksa `/api/Challenges/?key=ssrfChallenge`; API menunjukkan `"solved":true`.
4. Mencari alur kode dengan PowerShell `Select-String` setelah perintah `grep`/`head` dari panduan tidak berjalan di PowerShell.

## Hasil & bukti

- Proposal: [project/deep-dive/01-proposal.md](../../project/deep-dive/01-proposal.md)
- Tangkapan layar status API: `project/deep-dive/bukti/solved.png` (`solved:true`).
- Tangkapan layar payload: `project/deep-dive/bukti/ssrfpayload.png`; kolom URL terpotong, sehingga watermark belum dapat diverifikasi dari gambar ini.
- Request/response mentah dan tangkapan layar payload lengkap ber-watermark: belum disimpan.
- Pemetaan OWASP: A10 Server-Side Request Forgery (Primary); A02 Cryptographic Failures (Secondary). Kategori challenge di Juice Shop: Broken Access Control.

## Refleksi (150–300 kata)

Pada LK08, saya menjalankan OWASP Juice Shop v20.3.0 secara lokal dan mencoba challenge SSRF lewat kolom **Image URL** di profil. Saya mengarahkan URL gambar ke endpoint pada server Juice Shop sendiri. Pemeriksaan API menunjukkan `solved:true`, jadi percobaan awal berhasil memicu challenge.

Ada dua kendala. Pertama, perintah `grep` dan `head` dari panduan tidak dikenali di PowerShell. Saya menggantinya dengan `Select-String`. Kedua, pencarian marker `vuln-code-snippet` untuk `ssrfChallenge` tidak menemukan hasil. Pencarian langsung terhadap `imageUrl` dan route kemudian menunjukkan bahwa `profileImageUrlUpload()` membaca `req.body.imageUrl` dan menggunakannya di `fetch(url)`. Screenshot payload yang tersedia juga memotong URL, dan notifikasi hijau sudah hilang, jadi bukti visual ber-watermark belum lengkap.

Saya memahami bahwa pada SSRF, server membuat request berdasarkan URL yang dikendalikan pengguna. Jika URL itu menunjuk ke resource internal, request berasal dari server, bukan browser pengguna. Untuk melengkapi LK08, saya perlu mengirim ulang payload dengan watermark `ds-235150201111019`, menyimpan screenshot yang menampilkan URL dan waktu, serta merekam request/response. Di CB2 saya akan menelusuri alur source ke sink dan memeriksa validasi serta mitigasinya sebelum menyimpulkan akar masalah.

## Screencast (bila diwajibkan)

- Tautan: Belum dibuat.

---

*Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM `ds-235150201111019`*
