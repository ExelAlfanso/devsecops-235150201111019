# Proposal Deep Dive — Exel Boy Alfanso (235150201111019)

| Item | Isi |
| --- | --- |
| Challenge | SSRF (`ssrfChallenge`) |
| Kategori Juice Shop | Broken Access Control |
| OWASP Top 10:2021 | A10 — Primary; A02 — Secondary |
| Tingkat | ★6 |
| Danger Zone | Tidak |
| Tautan konfirmasi | Belum tersedia — tambahkan tautan komentar konfirmasi di Issue kelas |

## Catatan awal

Challenge SSRF menguji apakah URL gambar profil diproses oleh server. Dugaan awal saya, server mengambil URL yang dikendalikan pengguna sehingga request dapat diarahkan ke resource internal, termasuk endpoint Juice Shop sendiri. Alur input, validasi tujuan, dan dampaknya akan saya telusuri lebih lanjut di CB2.

## Reproduksi eksploit

1. Jalankan OWASP Juice Shop v20.3.0 secara lokal dan masuk menggunakan akun uji.
2. Di halaman profil, kirim URL gambar berikut melalui kolom **Image URL**:
   `http://localhost:3000/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3&wm=ds-235150201111019`
3. Verifikasi status dengan `http://localhost:3000/api/Challenges/?key=ssrfChallenge`; hasil yang diharapkan memuat `"solved":true`.

Bukti yang tersedia: `bukti/solved.png` (status API `solved:true`) dan `bukti/ssrfpayload.png` (halaman profil). Screenshot payload saat ini tidak memperlihatkan URL secara utuh, jadi belum cukup untuk memverifikasi watermark. Perlu simpan screenshot baru yang menampilkan payload ber-watermark dan waktu, serta request/response mentah di `bukti/ssrf-request.txt`.

## Dugaan lokasi kode

- `app/routes/profileImageUrlUpload.ts:16` — `profileImageUrlUpload()` membaca `req.body.imageUrl` dan menggunakannya pada `fetch(url)`; ini dugaan awal source dan sink SSRF.
- `app/server.ts:339` — mendaftarkan handler tersebut untuk `POST /profile/image/url`.
- `app/routes/verify.ts:99` — memeriksa kondisi dan status challenge; bagian ini menangani penilaian, bukan kandidat utama kerentanan.

## Rencana deep dive (CB2)

- Telusuri aliran URL dari form profil sampai `fetch(url)`, periksa apakah tujuan request dibatasi, lalu tentukan mitigasi yang mencegah akses ke resource internal tanpa merusak fungsi gambar profil.
- Petakan akar masalah ke CWE dan CVSS, buat aturan Semgrep, dan siapkan PoC serta tes regresi.

---

Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM `ds-235150201111019`
