# Analisis Deep Dive ? Exel Boy Alfanso (235150201111019)

## Ringkasan

Challenge: SSRF (`ssrfChallenge`) ? OWASP Top 10:2021 A10 ? CWE-918 ? CVSS 4.3 (Sedang). A10 dan CWE-918 sesuai dengan [pemetaan OWASP](https://top10.owasp.org/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/).

## Source ? Sink

| Langkah | File:baris | Yang terjadi |
| --- | --- | --- |
| Form | `app/views/userProfile.pug:57` | Form profil mengirim URL gambar ke `/profile/image/url`. |
| Route | `app/server.ts:335`, `:339` | Body form diproses dan POST diteruskan ke handler URL gambar. |
| Source | `app/routes/profileImageUrlUpload.ts:18-19` | `req.body.imageUrl` disalin ke `url`, tanpa pemeriksaan tujuan. |
| Penanda challenge | `app/routes/profileImageUrlUpload.ts:20` | Teks yang cocok dengan jalur challenge menetapkan flag global; ini tidak memvalidasi host atau keberhasilan request. |
| Pemeriksaan sesi | `app/routes/profileImageUrlUpload.ts:21-22` | Token cookie harus cocok dengan pengguna yang login agar `fetch` dijalankan. |
| Sink | `app/routes/profileImageUrlUpload.ts:24` | Server memanggil `fetch(url)` dengan URL dari pengguna, termasuk alamat loopback. |
| Efek | `app/server.ts:239`; `app/routes/verify.ts:99-109` | Handler server-side memeriksa kunci dan flag lalu menandai challenge selesai. |

Kode memperlakukan URL gambar sebagai tujuan request yang dapat dipercaya. Pemeriksaan login membatasi siapa yang dapat mencapai `fetch`, tetapi tidak membatasi alamat yang dapat dikunjungi server. Payload `http://localhost:3000/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3&wm=ds-235150201111019` mengarahkan request dari server kembali ke Juice Shop. `localhost` pada URL tersebut merujuk ke lingkungan proses server, termasuk ketika server berada dalam container. Respons 204 dari endpoint challenge tidak memiliki body; handler gambar dapat masuk ke blok `catch` setelah efek challenge terjadi (`profileImageUrlUpload.ts:25-37`).

Status `solved` saja bukan bukti sempurna bahwa `fetch` berhasil: flag dipasang sebelum autentikasi dan tanpa memeriksa tujuan, sedangkan request terpisah ke endpoint verifikasi juga dapat memakai flag tersebut. Selain itu, state challenge dapat tersisa dari percobaan sebelumnya. Untuk bukti yang kuat gunakan instance baru dan amati request ke endpoint internal di log atau dengan instrumentasi, selain memeriksa perubahan status.

## Skor CVSS

Vektor: **CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N ? 4.3 (Sedang)**. Ini menilai efek yang ditunjukkan pada challenge Juice Shop sendiri, bukan dampak maksimum terhadap layanan internal lain. Rumus dan definisi metrik mengikuti [spesifikasi FIRST CVSS v3.1](https://www.first.org/cvss/v3-1/specification-document) dan dapat dicek melalui [kalkulator FIRST](https://www.first.org/cvss/calculator/3.1#CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N).

- **AV:N:** request eksploit dikirim lewat HTTP melalui jaringan.
- **AC:L:** pada instance dengan konfigurasi tersebut, URL loopback dan kunci dapat dikirim tanpa kondisi balapan atau persiapan khusus.
- **PR:L:** jalur `fetch` memerlukan sesi pengguna yang sudah login; flag challenge saja dapat ditetapkan sebelum cek sesi, tetapi itu tidak membuktikan SSRF.
- **UI:N:** tidak ada tindakan korban lain yang dibutuhkan setelah penyerang mengirim request.
- **S:U:** dalam demonstrasi ini handler yang rentan dan status challenge berada dalam aplikasi Juice Shop yang sama.
- **C:N:** demonstrasi ini tidak menunjukkan pembacaan informasi rahasia.
- **I:L:** request mengubah status satu challenge, efek integritas yang terbatas.
- **A:N:** demonstrasi tidak menunjukkan gangguan ketersediaan.

## Varian & bypass

Alamat `http://127.0.0.1:3000/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3&wm=ds-235150201111019` merupakan varian loopback yang menuju tujuan sama bila server mendengarkan IPv4 loopback; varian ini belum diuji di lingkungan saat ini. Redirect HTTP ke alamat internal juga patut diuji pada tahap perbaikan karena pemeriksaan URL awal saja tidak cukup bila redirect diikuti. Perilaku ini bergantung pada lingkungan dan tidak diklaim sudah berhasil diuji.

## Deteksi

- Rule: [`semgrep/ssrf.yml`](semgrep/ssrf.yml) melacak field body ke argumen URL `fetch` dalam satu fungsi; fixture [`semgrep/ssrf.ts`](semgrep/ssrf.ts) memuat contoh positif dan negatif. Rule ini tidak membuktikan keterjangkauan tujuan dan belum melacak aliran lintas fungsi.
- PoC: [`poc.ps1`](poc.ps1) memakai kredensial uji yang tercantum dalam skrip, mengirim payload ber-watermark, dan memeriksa status awal serta akhir. Kode keluar 0 berarti perubahan ke solved teramati, 1 berarti belum solved, dan 2 berarti prasyarat atau pemeriksaan gagal. Jalankan pada instance lokal yang status SSRF-nya belum solved; skrip menolak status awal yang sudah solved. Efeknya juga mengubah gambar profil akun uji.
- Hasil Semgrep pada folder `app` yang tersedia: **1 temuan**, pada `routes/profileImageUrlUpload.ts:24`; lihat [output](bukti/semgrep-ssrf.txt) dan [tangkapan layar](bukti/semgrep-ssrf.png). Tag `v-vuln` menyimpan `app` sebagai gitlink ke commit `f189f521266f42c6bd05884468292000cee852ed` di repository Juice Shop. Dengan repository sementara sebagai pembanding, `git diff` terhadap commit itu tidak menemukan perbedaan pada file yang dilacak, dan tidak ditemukan file tambahan yang tidak diabaikan. Jadi source yang dipindai sesuai dengan commit tersebut. Namun `app` tetap tercatat sebagai gitlink tanpa `.gitmodules`, sehingga checkout baru repository ini tidak otomatis mengambil source aplikasi. Bukti [keluaran PoC](bukti/solved.png) menunjukkan autentikasi, pengiriman payload, dan status challenge solved; seperti dijelaskan di atas, status solved tidak membuktikan sendiri bahwa request internal berhasil.

---

Dikerjakan oleh Exel Boy Alfanso (235150201111019) ? WM ds-235150201111019
