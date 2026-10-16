# Writeup CTF UTS — OWASP Juice Shop

> Exel Boy Alfanso · NIM 235150201111019 · watermark `ds-235150201111019`
> Instance pribadi: `http://10.34.100.121:3029` (akses melalui eduVPN)

Writeup ini disusun dari screenshot pada `exam/uts/bukti/`, artefak lokal, metadata/source Juice Shop, catatan langkah, dan flag yang dikirim penulis. Langkah yang hanya berasal dari catatan umum dibedakan dari hasil yang terlihat pada screenshot. Bukti ditujukan untuk repo UTS pribadi dengan akses private. Flag yang belum diberikan atau belum jelas pasangannya tidak ditebak.

Pemetaan OWASP/CWE menggunakan [laporan VA](../../project/vulnerability-assessment.md), metadata challenge, dan source Juice Shop lokal. *Leaked API Key* tidak dipilih. Bagian 1–11 berasal dari daftar awal; bagian 12–19 ditambahkan dari daftar flag yang dikirim kemudian. Bagian 20–21 kini memiliki screenshot hasil percobaan UTS; referensi langkah umum dibedakan dari hal yang terlihat pada screenshot. Tautan bukti yang ada mengarah ke nama file nyata.

**Cek syarat kategori:** `project/IDENTITY.md` menetapkan Primary **A10 SSRF** dan Secondary **A02** menurut OWASP Top 10:2021. Screenshot menunjukkan **SSRF** dan **Weird Crypto** solved, sehingga ada satu challenge A10 dan satu A02 yang terdokumentasi. Syarat dua challenge A10 masih belum terpenuhi. Angka **7.550 poin** adalah maksimum teoretis dari 19 challenge awal bila semuanya solved dan writeup valid, belum termasuk SSRF dan Weird Crypto; target nilai penuh komponen poin adalah 8.000. Flag tanpa langkah dan bukti yang cukup belum dihitung sebagai poin sah.

## 1. Bjoern's Favorite Pet — ⭐⭐⭐

- **Kategori OWASP / CWE:** A07 Identification and Authentication Failures / CWE-640.
- **Langkah:** Buka `/#/forgot-password`, isi email `bjoern@owasp.org`, jawab pertanyaan nama hewan peliharaan, lalu isi dan konfirmasi sandi baru. Catatan yang diberikan menyebut jawaban **Zaya** diperoleh dari materi publik; screenshot hanya memperlihatkan jawaban dalam bentuk tersamarkan. Setelah menekan **Change**, aplikasi menampilkan pesan sandi berhasil diganti dan toast *Bjoern's Favorite Pet* solved.
- **Payload/input:** Email `bjoern@owasp.org`; jawaban `Zaya`; sandi baru tidak dicatat di laporan.
- **Flag:** `919eb6672491bc92b5cd6445971a117ad67e0dd7`
- **Akar masalah & perbaikan kode:** Pertanyaan berbasis fakta pribadi yang pernah dipublikasikan tidak cukup membuktikan kepemilikan akun. Mekanisme reset harus memakai token acak sekali pakai dengan masa berlaku pendek dan batas percobaan, bukan mencocokkan jawaban publik. Source lokal menunjukkan pengecekan jawaban di `routes/resetPassword.ts`.
- **Bukti:** [form sebelum submit](bukti/bjoern-1.png), [pesan reset dan toast solved](bukti/bjoern-2.png).

## 2. GDPR Data Erasure — ⭐⭐⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-89 untuk bypass login; A04 Insecure Design / CWE-672 untuk akun yang disebut telah dihapus. Aspek penghapusan data belum dibuktikan langsung oleh screenshot.
- **Langkah:** Pada `/#/login`, masukkan email Chris dengan penutup string dan komentar SQL, gunakan sandi bebas, lalu kirim. Screenshot input menunjukkan payload dan screenshot berikutnya menampilkan toast *GDPR Data Erasure* solved. Ini membuktikan login sebagai akun yang dituju menurut challenge, tetapi tidak memperlihatkan isi database atau proses erasure sebelumnya.
- **Payload/input:** Email `chris.pike@juice-sh.op'--`; password `anything`. Alternatif payload dalam catatan lampiran tidak dipakai sebagai klaim hasil uji.
- **Flag:** `6c058d95f55e4500661d9e5e24e50c487cae00fd`
- **Akar masalah & perbaikan kode:** `routes/login.ts` menyisipkan email langsung ke string SQL sehingga komentar memotong pemeriksaan password dan `deletedAt IS NULL`. Parameterisasi query dan tolak login untuk akun yang dihapus; proses erasure juga harus memenuhi kebutuhan penghapusan data pribadi, bukan sekadar penandaan status.
- **Bukti:** [payload pada form login](bukti/gdpr-data-erasure-1.png), [toast solved](bukti/gdpr-data-erasure-2.png).

## 3. Web3 Sandbox — ⭐

- **Kategori OWASP / CWE:** Kategori challenge: Broken Access Control; A01/CWE-862 masih tentatif karena screenshot belum membuktikan operasi terlarang pada backend.
- **Langkah:** Catatan lampiran menyebut pencarian string `web3-sandbox` pada bundle/route frontend lalu membuka `/#/web3-sandbox`. Source lokal memang mendaftarkan route itu di `frontend/src/app/app.routing.ts`. Screenshot menunjukkan editor smart contract dapat dibuka dan toast *Web3 Sandbox* solved.
- **Payload/input:** Navigasi ke `http://10.34.100.121:3029/#/web3-sandbox`; tidak ada payload injeksi.
- **Flag:** `9c2be8fcf58687b8b23cd014333d4171c09ecfd5`
- **Akar masalah & perbaikan kode:** Route tersembunyi di navigasi tetap dapat dibuka lewat URL. Bila sandbox seharusnya terbatas, otorisasi harus dicek pada backend/API; bukti saat ini hanya memastikan halaman terekspos.
- **Bukti:** [sandbox dan toast solved](bukti/web3sandbox.png).

## 4. Privacy Policy — ⭐

- **Kategori OWASP / CWE:** Tidak berlaku; metadata menandainya sebagai praktik baik, bukan eksploitasi.
- **Langkah:** Buka `/#/privacy-security/privacy-policy` dan baca halamannya. Screenshot memperlihatkan isi kebijakan dan toast *Privacy Policy* solved. Ini bukan challenge *Privacy Policy Inspection* yang berbeda.
- **Payload/input:** Tidak ada; hanya navigasi ke halaman.
- **Flag:** `f25b844d7254387625b767410d5d04160aff14f4`
- **Akar masalah & perbaikan kode:** Tidak ada kelemahan teknis yang dibuktikan dan tidak ada perbaikan kode untuk challenge ini.
- **Bukti:** [halaman kebijakan dan toast solved](bukti/privacy-policy.png).

## 5. Outdated Allowlist — ⭐

- **Kategori OWASP / CWE:** Unvalidated Redirects; A01 / CWE-601 sebagai pemetaan sementara.
- **Langkah:** Temukan rujukan alamat donasi lama pada source/bundle frontend, lalu buka endpoint `redirect` Juice Shop dengan alamat tersebut sebagai parameter `to`. Source lokal `frontend/src/app/payment/payment.component.ts` dan `lib/insecurity.ts` masih memuat alamat Bitcoin itu. Bukti menunjukkan halaman alamat Bitcoin dan toast *Outdated Allowlist* solved di aplikasi.
- **Payload/input:** `http://10.34.100.121:3029/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm`.
- **Flag:** `640f4fab0776321041e538db84d5a5adb3e4521d`
- **Akar masalah & perbaikan kode:** Tujuan lama tetap berada dalam `redirectAllowlist` meski tidak lagi dipromosikan. Tinjau dan hapus entri usang; validasi URL tujuan yang sudah diparse, bukan hanya keberadaannya dalam string.
- **Bukti utama:** [halaman alamat Bitcoin setelah redirect](bukti/crypto-1.png). Bukti pendukung: [rujukan URL pada source](bukti/crypto-3.png) dan [toast solved](bukti/crypto-2.png).

## 6. Allowlist Bypass — ⭐⭐⭐⭐

- **Kategori OWASP / CWE:** A01 Broken Access Control / CWE-601.
- **Langkah:** Screenshot memperlihatkan endpoint `/redirect` diberi tujuan `http://kimminich.de` dengan URL allowlist lain diletakkan di parameter `pwned`. Browser lalu membuka laman luar `linktr.ee/bkimminich?...`, sedangkan aplikasi menampilkan toast *Allowlist Bypass* solved. Ini berbeda dari *Outdated Allowlist*: tujuan luarnya tidak harus merupakan entri yang diizinkan.
- **Payload/input:** `http://10.34.100.121:3029/redirect?to=http://kimminich.de?pwned=https://github.com/juice-shop/juice-shop` (sesuai address bar screenshot; periksa kembali sebelum reproduksi).
- **Flag:** `f858dad772a09f98330ce895875a4aa62ca9a065`
- **Akar masalah & perbaikan kode:** `lib/insecurity.ts` mengizinkan redirect ketika string URL **mengandung** salah satu URL allowlist. URL yang dituju sebenarnya dapat berbeda. Parse URL lalu cocokkan skema, host, dan path yang diizinkan secara ketat; tolak tujuan lain.
- **Bukti:** [URL yang dikirim](bukti/allowed-bypass.png), [tujuan luar](bukti/allowed-bypass-2.png), [toast solved](bukti/allowed-bypass-3.png).

## 7. Reset Jim's Password — ⭐⭐⭐

- **Kategori OWASP / CWE:** A07 Identification and Authentication Failures / CWE-640.
- **Langkah:** Pada `/#/forgot-password`, screenshot menampilkan email `jim@juice-sh.op`, jawaban keamanan dan sandi baru dalam bentuk tersamarkan. Setelah perubahan sandi, halaman memberi pesan berhasil dan toast *Reset Jim's Password* solved. Cara penulis menemukan jawaban belum ada dalam bukti.
- **Payload/input:** Email `jim@juice-sh.op`; jawaban yang diterima aplikasi perlu dijelaskan penulis dari catatan percobaan sendiri. Source lokal `routes/resetPassword.ts` memuat nilai pembanding, tetapi screenshot tidak memperlihatkan jawaban yang diketik.
- **Flag:** `660f3ecfc26517614bb5d581c4153f037268ce3d`
- **Akar masalah & perbaikan kode:** Pertanyaan keamanan yang dapat dijawab dari informasi publik tidak cukup untuk pemulihan akun. Gunakan token reset acak sekali pakai, kedaluwarsa, dan batas percobaan.
- **Bukti:** [form terisi](bukti/reset-jim-2.png), [reset berhasil dan toast solved](bukti/reset-jim-1.png).

## 8. Video XSS — ⭐⭐⭐⭐⭐⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-79; jalur penulisan berkas melalui arsip juga perlu ditinjau terpisah.
- **Langkah:** Artefak lokal `videoxss.py` menyiapkan ZIP dengan entri lintas direktori yang menimpa subtitle `owasp_promo.vtt` menggunakan payload skrip. Screenshot menunjukkan ZIP dipilih pada form **Complaint/Invoice**, halaman `/promotion` dibuka, lalu browser menampilkan dialog `xss`. Screenshot yang tersedia **belum** memperlihatkan toast solved.
- **Payload/input:** Subtitle memuat ``</script><script>alert(`xss`)</script>``; ZIP memakai entri `../../frontend/dist/frontend/assets/public/videos/owasp_promo.vtt`. Jangan jalankan arsip di luar instance lab.
- **Flag:** `4259b93e071419d6b9dd26159734ab3e667f7c30` (diberikan dari toast; screenshot saat ini belum menampilkan toast solved).
- **Akar masalah & perbaikan kode:** Ekstraksi arsip harus menolak path yang keluar dari direktori tujuan. Saat teks subtitle dimasukkan ke HTML/JavaScript, lakukan encoding sesuai konteks dan hindari perangkaian string skrip. CSP dapat menambah perlindungan.
- **Bukti:** [halaman video](bukti/videoxss-1.png), [form upload ZIP](bukti/videoxss-2.png), [dialog eksekusi](bukti/videoxss-3.png), [pembuat payload lokal](bukti/videoxss.py). Perlu screenshot toast/scoreboard solved.

## 9. Server-side XSS Protection — ⭐⭐⭐⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-79 (stored XSS).
- **Langkah:** Screenshot `serverside-xss-1.png` menunjukkan input pada form **Customer Feedback**. Setelah komentar ditampilkan di halaman `/#/about`, screenshot lain memperlihatkan dialog `xss` pada origin Juice Shop. Bukti ini mendukung eksekusi skrip tersimpan; toast solved belum terlihat.
- **Payload/input:** Komentar pada screenshot menggabungkan tag `script` pengalih dan `iframe` dengan ``javascript:alert(`xss`)``. Salin string tepat dari percobaan sendiri sebelum submit; screenshot lain menunjukkan percobaan yang ditolak sebagai CAPTCHA tidak valid, jadi jangan jadikan itu bukti sukses.
- **Flag:** `745847a0e39c0302fb7f7b5c027446e31f811748` (diberikan dari toast; screenshot saat ini belum menampilkan toast solved).
- **Akar masalah & perbaikan kode:** Filter input server tidak cukup bila komentar kemudian dimasukkan sebagai HTML yang dapat dieksekusi. Simpan sebagai teks atau sanitasi HTML dengan library terpelihara, lalu encode output sesuai konteks.
- **Bukti:** [input komentar](bukti/serverside-xss-1.png), [dialog pada halaman About](bukti/serverside-xss-2.png). Perlu screenshot toast/scoreboard solved.

## 10. NoSQL Exfiltration — ⭐⭐⭐⭐⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-943.
- **Langkah:** Screenshot membuka `/rest/track-order/` dengan ID yang diubah menjadi ekspresi logika. Respons JSON berstatus `success` dan memuat lebih dari satu order, bukan satu order yang diminta. `routes/trackOrder.ts` memasukkan ID ke operator MongoDB `$where` sebagai string kode. Screenshot belum memperlihatkan toast/scoreboard solved.
- **Payload/input:** ID pesanan `' || true || '` yang di-URL-encode pada path `/rest/track-order/` (periksa ejaan encoding dari address bar sebelum submit).
- **Flag:** `47bfb7f2e145c926dcd03bf3de3b02afa4540e06` (diberikan dari toast; screenshot saat ini belum menampilkan toast solved).
- **Akar masalah & perbaikan kode:** Jangan bangun `$where` dari input pengguna. Query dengan field `orderId` bertipe string dan wajib tambahkan filter kepemilikan akun di server.
- **Bukti:** [URL dan respons banyak pesanan](bukti/nosqlexfiltration.png). Tambahkan screenshot toast/scoreboard bila challenge diklaim solved.

## 11. Login Bjoern — ⭐⭐⭐⭐

- **Kategori OWASP / CWE:** A07 Identification and Authentication Failures / CWE-287. Akar spesifiknya adalah sandi OAuth yang dapat dihitung dari email.
- **Langkah:** Screenshot form login menampilkan email Gmail Bjoern dan sandi yang terlihat jelas. Source lokal `frontend/src/app/oauth/oauth.component.ts` menunjukkan sandi dibentuk dari email yang dibalik lalu di-Base64; cara ini deterministik dan dapat dihitung siapa pun yang mengetahui email. Screenshot berikutnya menampilkan toast *Login Bjoern* solved tanpa mengubah sandi atau memakai SQLi.
- **Payload/input:** Email `bjoern.kimminich@gmail.com`; bentuk sandi `btoa(email.split('').reverse().join(''))`.
- **Flag:** [Salin flag dari toast/scoreboard pribadi; terlihat di screenshot hasil.]
- **Akar masalah & perbaikan kode:** Base64 bukan proteksi kredensial. Jangan buat sandi dari identitas publik; verifikasi token OAuth di server (signature, issuer, audience, dan subject), lalu ikat akun pada identitas provider yang tervalidasi.
- **Bukti:** [form login dan input](bukti/login-bjoern-2.png), [toast solved](bukti/login-bjoern-1.png).

## 12. Score Board — ⭐

- **Kategori OWASP / CWE:** Miscellaneous; menemukan halaman saja belum membuktikan kerentanan.
- **Langkah & input:** Flag menunjukkan solved. Source lokal `frontend/src/app/app.routing.ts` memuat route `score-board`; cara penulis menemukan dan membukanya pada instance UTS belum dicatat. URL untuk direproduksi: `/#/score-board`.
- **Flag:** `4ce8fe578d4b555ce7da728af8dc7d3abbd95868`
- **Akar masalah & perbaikan kode:** Tautan yang disembunyikan bukan kontrol akses. Bila halaman perlu dibatasi, backend harus memeriksa izin; dampak keamanan lain belum dibuktikan.
- **Bukti:** Screenshot URL dan toast/scoreboard solved belum tersedia di `exam/uts/bukti/`.

## 13. DOM XSS — ⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-79.
- **Langkah & input:** Flag menunjukkan solved dengan payload ``<iframe src="javascript:alert(`xss`)">`` menurut deskripsi challenge. [PoC LK06 lokal](../../labs/LK06-exploit/README.md) menunjukkan teknik yang sama, tetapi belum ada screenshot khusus instance UTS untuk flag ini.
- **Flag:** `8e13edb95667107cd5a06ca28245ded3c7fee98e`
- **Akar masalah & perbaikan kode:** Input pencarian dapat diinterpretasi sebagai HTML/JavaScript dalam DOM. Gunakan `textContent` atau encoding output sesuai konteks; CSP menjadi lapisan tambahan.
- **Bukti:** [XSS pada lab lokal](../../labs/LK06-exploit/bukti/xss-dom.png); screenshot UTS berisi input, dialog, dan toast solved belum tersedia.

## 14. Bonus Payload — ⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-79, variasi DOM XSS.
- **Langkah & input:** Flag menunjukkan solved. Deskripsi challenge meminta iframe SoundCloud berikut dimasukkan melalui jalur DOM XSS; urutan percobaan dan hasil render UTS belum terdokumentasi.

  ```html
  <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/771984076&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>
  ```

- **Flag:** `5bee5c71e6462b044e2110ca9a915e7f11810161`
- **Akar masalah & perbaikan kode:** Input pengguna diperlakukan sebagai markup. Render sebagai teks atau sanitasi HTML secara ketat jika embed memang diizinkan.
- **Bukti:** Screenshot input, embed hasil, dan toast solved belum tersedia di `exam/uts/bukti/`.

## 15. Confidential Document — ⭐

- **Kategori OWASP / CWE:** Sensitive Data Exposure; A01/CWE-552 sementara sampai rute dan izin akses diperiksa.
- **Langkah & input:** Pesan penulis menyatakan dokumen rahasia berhasil diakses. Metadata challenge menyarankan menelusuri tautan unduh file; URL dan langkah yang benar-benar dipakai belum diberikan.
- **Flag:** [Cocokkan satu dari dua flag tanpa pasangan yang jelas di bawah melalui scoreboard.]
- **Akar masalah & perbaikan kode:** Simpan dokumen sensitif di luar direktori publik dan layani melalui endpoint dengan pemeriksaan izin.
- **Bukti:** Screenshot URL dokumen dan toast solved belum tersedia di `exam/uts/bukti/`.

## 16. Error Handling — ⭐

- **Kategori OWASP / CWE:** A05 Security Misconfiguration / CWE-209 sementara; isi respons error belum terlihat.
- **Langkah & input:** Pesan penulis menyatakan solved. Metadata menyarankan input buruk atau perubahan URL untuk memicu error; request yang dipakai belum dicatat.
- **Flag:** [Cocokkan satu dari dua flag tanpa pasangan yang jelas di bawah melalui scoreboard.]
- **Akar masalah & perbaikan kode:** Tangani exception secara konsisten dan tampilkan pesan generik pada klien; simpan detail diagnostik di log server.
- **Bukti:** Screenshot request, respons error, dan toast solved belum tersedia di `exam/uts/bukti/`.

**Dua flag belum terpasang:** `3a1d4894ecdf0825567be2ae74c8158bc7444009` dan `24e046fe0e6cb3cb64e12d581467cab506f27315` muncul sesudah dua judul di atas tanpa penanda pasangan. Jangan menebak urutannya.

## 17. Password Strength — ⭐⭐

- **Kategori OWASP / CWE:** A07 Identification and Authentication Failures / CWE-521.
- **Langkah & input:** Flag yang sama dikirim tiga kali dan dicatat sekali. Metadata meminta login admin tanpa SQLi; source lokal `routes/login.ts` menunjukkan sandi lemah `admin123` untuk akun admin. Konfirmasi bahwa itu input yang benar-benar dipakai.
- **Flag:** `8afd6a9fc98bf3719b4de90f72b7b1880e89d281`
- **Akar masalah & perbaikan kode:** Hapus sandi bawaan/lemah, wajibkan kredensial unik, dan batasi percobaan login.
- **Bukti:** Screenshot form dan toast solved belum tersedia di `exam/uts/bukti/`.

## 18. Login Bender — ⭐⭐⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-89.
- **Langkah & input:** Flag menunjukkan login Bender solved. Source lokal `routes/login.ts` menggabungkan email ke query SQL; payload dan urutan percobaan pribadi belum diberikan, sehingga tidak ditebak di sini.
- **Flag:** `272b4ae40457903c471770755ac74d4d45956144`
- **Akar masalah & perbaikan kode:** Gunakan query terparameterisasi pada login dan batasi hak akun database.
- **Bukti:** Screenshot form, payload, dan toast solved belum tersedia di `exam/uts/bukti/`.

## 19. Login Admin — ⭐⭐

- **Kategori OWASP / CWE:** A03 Injection / CWE-89.
- **Langkah & input:** Flag menunjukkan login administrator berhasil. [PoC LK06 pada lab lokal](../../labs/LK06-exploit/README.md) mendemonstrasikan injeksi pada field email login dengan `' OR 1=1 --` dan sandi bebas. Belum ada screenshot yang menunjukkan payload persis yang dipakai pada instance UTS.
- **Flag:** `aba30c792d9ab54003bd40e36dc45877fe715c7d`
- **Akar masalah & perbaikan kode:** `routes/login.ts` merangkai email langsung ke query SQL. Gunakan parameterisasi query; validasi input tidak menggantikan parameterisasi.
- **Bukti:** [PoC LK06 lokal](../../labs/LK06-exploit/bukti/sqli-login.png); screenshot payload dan toast solved pada instance UTS belum tersedia di `exam/uts/bukti/`.

## 20. SSRF — ⭐⭐⭐⭐⭐⭐ (Primary A10)

- **Kategori OWASP / CWE:** Metadata Juice Shop mengelompokkannya sebagai Broken Access Control; jenis kerentanannya SSRF, dipetakan ke A10:2021 / CWE-918 untuk UTS.
- **Langkah:** Setelah login, buka halaman profil dan isi **Image URL** dengan URL ke endpoint `/solve/challenges/server-side` pada instance Juice Shop. Screenshot input memperlihatkan awalan `http://10.34.100.121:3029/solve/challenges/server-side?`; setelah fitur **Link Image** dipakai, screenshot scoreboard menampilkan toast *SSRF* solved. [Source resmi](https://github.com/juice-shop/juice-shop/blob/master/routes/verify.ts) memeriksa key pada endpoint itu serta apakah request dilakukan melalui bug SSRF.
- **Payload/input:** Awalan URL pada screenshot: `http://10.34.100.121:3029/solve/challenges/server-side?`. Nilai query terpotong oleh lebar kolom; catatan referensi sebelumnya menyebut `key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3`, tetapi nilai lengkap yang dikirim pada instance UTS perlu dicocokkan dari riwayat request.
- **Flag:** [Terlihat pada toast di screenshot `ssrf-2.png`; salin string persis dari scoreboard sebelum submit.]
- **Akar masalah & perbaikan kode:** [Handler foto profil](https://github.com/juice-shop/juice-shop/blob/master/routes/profileImageUrlUpload.ts) mengambil URL dari `imageUrl` dan memanggil `fetch(url)` tanpa membatasi tujuan. Validasi skema, host, hasil DNS/IP, dan redirect; blokir loopback serta jaringan internal, lalu batasi akses keluar server.
- **Bukti:** [Input Image URL](bukti/ssrf-1.png), [toast SSRF solved pada scoreboard](bukti/ssrf-2.png). Rujukan tantangan: [panduan resmi Juice Shop](https://pwning.owasp-juice.shop/companion-guide/latest/part2/broken-access-control.html).

## 21. Weird Crypto — ⭐⭐ (Secondary A02)

- **Kategori OWASP / CWE:** Cryptographic Issues pada metadata Juice Shop; A02:2021 Cryptographic Failures / CWE-327 sebagai pemetaan umum. Bila klaim spesifiknya MD5 untuk penyimpanan sandi terbukti, CWE-916 lebih tepat.
- **Langkah:** Pada **Customer Feedback**, isi komentar tentang MD5 untuk penyimpanan sandi, pilih rating, jawab CAPTCHA, lalu kirim. Screenshot yang sama memperlihatkan komentar yang dimasukkan dan toast *Weird Crypto* solved. [Panduan resmi](https://pwning.owasp-juice.shop/companion-guide/latest/part2/cryptographic-issues.html) menyebut ada beberapa jawaban yang diterima.
- **Payload/input:** `The application uses MD5 for password hashing, which is cryptographically insecure.` [Pemeriksa challenge resmi](https://github.com/juice-shop/juice-shop/blob/master/routes/verify.ts) menerima komentar yang memuat `md5`.
- **Flag:** [Terlihat pada toast di screenshot `weirdcrypto.png`; salin string persis dari scoreboard sebelum submit.]
- **Akar masalah & perbaikan kode:** MD5 cepat dan tidak cocok untuk menyimpan sandi. Jika temuan ini terkonfirmasi, gunakan hash sandi yang memang dirancang untuk tujuan tersebut, misalnya Argon2id, dengan salt dan parameter biaya yang sesuai.
- **Bukti:** [Komentar MD5 dan toast Weird Crypto solved](bukti/weirdcrypto.png).

## Checklist sebelum submit

- [ ] Pasangkan dua flag Confidential Document dan Error Handling lewat scoreboard; isi flag Login Bjoern yang belum diberikan sebagai teks.
- [ ] Lengkapi cara menemukan jawaban Reset Jim dari catatan percobaan sendiri.
- [ ] Tambahkan toast/scoreboard solved untuk Video XSS, Server-side XSS Protection, dan NoSQL Exfiltration bila ingin menghitung poinnya.
- [ ] Tambahkan langkah pribadi dan screenshot UTS untuk challenge 12–19 sebelum menghitung poinnya sebagai writeup valid.
- [ ] Salin flag SSRF dan Weird Crypto dari scoreboard; cocokkan nilai query SSRF yang terpotong pada screenshot dan pastikan watermark `ds-235150201111019` terlihat pada bukti pengumpulan.
- [ ] Periksa ulang langkah yang berasal dari catatan lampiran terhadap percobaan sendiri dan pastikan dapat direproduksi saat viva.
- [x] Semua tautan bukti pada dokumen ini menunjuk ke file yang ada.
- [ ] Artefak dikumpulkan lewat PR sesuai [instruksi UTS](../../project/uts.md).
