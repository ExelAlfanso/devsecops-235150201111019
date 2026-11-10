# LK09 — Pipeline Security Gate

- Nama/NIM: Exel Boy Alfanso (235150201111019)
- Watermark: `ds-235150201111019`
- Branch kerja: `fix/ssrf`
- Workflow: [`.github/workflows/security.yml`](../../.github/workflows/security.yml)
- Kebijakan: [project/security-gate-policy.md](../../project/security-gate-policy.md)

## Bukti run

- **MERAH (`ci/test-vuln`):** belum tersedia; branch dan run perlu dibuat setelah workflow dipush.
- **HIJAU (`fix/ssrf`):** belum tersedia; branch ini belum memiliki tes regresi dan perbaikan CB3.
- **Artifact Semgrep/Trivy:** belum tersedia; ambil dari tab Actions setelah job laporan berjalan.

## Temuan untuk ditinjau

Catatan ini berasal dari laporan LK03/LK04 yang sudah tersimpan, bukan artifact run LK09. Cocokkan hasilnya dengan artifact baru sebelum submit:

1. **SCA — `crypto-js` 3.3.0, CVE-2023-46233 (Critical, A02):** laporan Trivy LK03 mengaitkan versi lama dengan konfigurasi PBKDF2 yang lemah.
2. **SAST — `routes/login.ts` dan `routes/search.ts` (A03):** laporan Semgrep LK04 menandai input pengguna yang dirangkai ke query SQL. Ini di luar perbaikan SSRF, tetapi menunjukkan mengapa hasil OWASP luas dijadikan laporan, bukan gate.
3. **SSRF — `profileImageUrlUpload.ts` (A10):** aliran `imageUrl` ke `fetch()` adalah pola yang ditargetkan rule custom CB2. Laporan Semgrep LK04 sebelumnya tidak menemukan A10; hasil kosong pada ruleset umum bukan bukti bahwa alur ini aman.

## Refleksi (draft, 150–300 kata)

Pada LK09 saya membatasi gate pada hal yang berubah karena perbaikan SSRF. Tes regresi harus membuktikan bahwa request yang sebelumnya mencapai resource internal sekarang ditolak, sedangkan rule Semgrep custom mendeteksi pola `req.body` yang mengalir ke `fetch()`. Gitleaks hanya memeriksa commit setelah `v-vuln`, jadi secret contoh yang sudah ada pada baseline tidak membuat setiap perubahan selalu gagal. Saya memisahkan Semgrep OWASP dan Trivy ke job laporan karena Juice Shop memang sengaja berisi kerentanan lain. Dengan pemisahan ini, status hijau berarti perbaikan yang sedang dikerjakan lolos pemeriksaan yang relevan; status itu tidak menyatakan seluruh aplikasi aman.

Laporan sebelumnya menunjukkan alasan untuk tetap membaca hasil nonblocking. Trivy LK03 menandai `crypto-js` 3.3.0 terkait CVE-2023-46233 dan risiko PBKDF2, sedangkan Semgrep LK04 menandai query SQL pada route login dan pencarian. Keduanya perlu ditriase sebagai utang aplikasi, tetapi tidak berkaitan langsung dengan perbaikan SSRF ini. Semgrep OWASP sebelumnya juga tidak menandai SSRF, walaupun source code memperlihatkan URL pengguna masuk ke `fetch()`. Karena itu saya memakai rule custom sebagai gate untuk temuan yang ditugaskan dan membaca artifact OWASP/SCA untuk menentukan pekerjaan lanjutan. Setelah run tersedia, saya akan mengganti tautan bukti dan mencocokkan temuan ini dengan artifact LK09.

> **Status prasyarat:** workspace saat ini belum berisi `app/test/api/*.regression.test.ts` atau perbaikan CB3. Jalankan kedua job gate setelah tes dan perbaikan CB3 ditambahkan; tautan run dan artifact di atas belum dapat diisi dari lokal.
