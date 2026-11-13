# Perbaikan — SSRF (Exel Boy Alfanso, 235150201111019)

## Akar masalah

`app/routes/profileImageUrlUpload.ts` menerima `imageUrl` dari pengguna yang sudah login, lalu memanggil `fetch(url)` tanpa membatasi tujuan. Karena request dijalankan oleh server, URL loopback dapat mengakses endpoint internal. Middleware juga menandai permintaan ke jalur challenge SSRF; instrumen ini dipertahankan.

## Perbaikan

Route kini mem-parse URL dan hanya menerima HTTPS ke hostname tepat `cataas.com`, tanpa port non-default atau userinfo. Fetch memakai `redirect: 'error'` agar server tidak mengikuti redirect menuju alamat lain. Penolakan tetap memakai alur fallback gambar profil yang sudah ada.

## Bukti before/after

- Tes regresi `app/test/api/ssrf.regression.test.ts`: commit `1e8a131` MERAH karena mock loopback menerima request; sesudah commit `47d7dec`, HIJAU karena tidak ada request internal.
- PoC pada container baru: `juice-ds-235150201111019:vuln` exit `0` dan log mencatat `ssrfChallenge` selesai; `juice-ds-235150201111019:fix` exit `1` dan challenge tetap belum selesai. Host port `3001` dipakai karena port `3000` sedang digunakan aplikasi lain.
- Custom Semgrep rule CB2: satu temuan pada route rentan menjadi nol temuan sesudah validasi tujuan dimodelkan sebagai sanitizer.
- Verifikasi: API `546` lulus / `6` dilewati; server `414` lulus / `5` dilewati; lint lulus. Tes fokus profile image + SSRF: `13` lulus / `1` dilewati.
- `profile-image-upload.test.ts` diubah agar fetch eksternal dimock dan opsi redirect diuji; Cypress SSRF lama dibalik agar memastikan challenge tidak terselesaikan. Cypress tidak dijalankan.
- Commit `b77ab51` menambahkan konfigurasi frontend agar nested install mengatasi konflik peer dependency Angular dan tetap memasang dependency build frontend.

## Batas verifikasi

Allowlist membatasi tujuan ke satu hostname dan menolak redirect, tetapi tidak melakukan pinning alamat DNS. PoC dan regresi menguji akses loopback; DNS rebinding tidak diuji. Tes Cypress dan screencast belum tersedia.

---

Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM `ds-235150201111019`.
