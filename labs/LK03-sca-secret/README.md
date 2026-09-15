# LK-03 — SCA & Secret Scanning

> Pada LK03 saya melakukan scan dependency dan secret pada OWASP Juice Shop menggunakan Trivy dan Gitleaks.

- Nama / NIM : Exel Boy Alfanso (235150201111019)
- Watermark : ds-235150201111019
- Minggu : 3
- Target : OWASP Juice Shop
- OWASP Primary : A10 — Server-Side Request Forgery (SSRF)
- OWASP Secondary : A02 — Cryptographic Failures

## Langkah yang dilakukan

1. membuat folder `labs/LK03-sca-secret`
2. clone source OWASP Juice Shop ke folder `ds-235150201111019-target`
3. menjalankan Trivy filesystem untuk memeriksa dependency pada source
4. menyimpan hasil Trivy filesystem dalam format JSON dan tabel
5. menjalankan Trivy image pada image `bkimminich/juice-shop`
6. menyimpan hasil Trivy image dalam format JSON dan tabel
7. menjalankan Gitleaks pada histori Git dengan opsi `--redact`
8. menjalankan Gitleaks pada worktree dengan opsi `--no-git` dan `--redact`
9. membandingkan hasil filesystem dengan image serta history dengan worktree
10. memilih temuan utama, menentukan prioritas, dan memetakan temuan ke OWASP Top 10

## Hasil & bukti

- [Hasil Trivy filesystem JSON](trivy-fs.json)
- [Hasil Trivy filesystem tabel](trivy-fs.txt)
- [Hasil Trivy image JSON](trivy-image.json)
- [Hasil Trivy image tabel](trivy-image.txt)
- [Hasil Gitleaks history](gitleaks-history.json)
- [Hasil Gitleaks worktree](gitleaks-worktree.json)
- [Berkas package.json.bak](package.json.bak)

## Cara menjalankan

Menjalankan Trivy filesystem dari root repository:

```powershell
docker run --rm `
  -v "${PWD}/ds-235150201111019-target:/src" `
  -v "${PWD}/labs/LK03-sca-secret:/out" `
  -v trivy-cache:/root/.cache/ `
  aquasec/trivy fs --scanners vuln --severity "HIGH,CRITICAL" `
  --format json -o /out/trivy-fs.json /src

docker run --rm `
  -v "${PWD}/ds-235150201111019-target:/src" `
  -v "${PWD}/labs/LK03-sca-secret:/out" `
  -v trivy-cache:/root/.cache/ `
  aquasec/trivy fs --scanners vuln --severity "HIGH,CRITICAL" `
  --format table -o /out/trivy-fs.txt /src
```

Menjalankan Trivy image:

```powershell
docker run --rm `
  -v "${PWD}/labs/LK03-sca-secret:/out" `
  -v trivy-cache:/root/.cache/ `
  aquasec/trivy image --severity "HIGH,CRITICAL" `
  --format json -o /out/trivy-image.json bkimminich/juice-shop

docker run --rm `
  -v "${PWD}/labs/LK03-sca-secret:/out" `
  -v trivy-cache:/root/.cache/ `
  aquasec/trivy image --severity "HIGH,CRITICAL" `
  --format table -o /out/trivy-image.txt bkimminich/juice-shop
```

Menjalankan Gitleaks pada history dan worktree:

```powershell
docker run --rm `
  -v "${PWD}/ds-235150201111019-target:/repo" `
  -v "${PWD}/labs/LK03-sca-secret:/out" `
  zricethezav/gitleaks:latest detect --source=/repo `
  --report-format json --report-path=/out/gitleaks-history.json --redact

docker run --rm `
  -v "${PWD}/ds-235150201111019-target:/repo" `
  -v "${PWD}/labs/LK03-sca-secret:/out" `
  zricethezav/gitleaks:latest detect --source=/repo --no-git `
  --report-format json --report-path=/out/gitleaks-worktree.json --redact
```

## Bagian G — Triage dan prioritas

Saya menentukan prioritas berdasarkan severity, skor CVSS, versi perbaikan, dampak, dan kemungkinan
komponen digunakan oleh aplikasi. Tanda `—` berarti hasil scan tidak memberikan skor atau versi
perbaikan.

| ID | Temuan | Tipe | Severity / CVSS | Versi terpasang | Versi perbaikan | OWASP | Prioritas | Rekomendasi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCA-01 | CVE-2015-9235 pada `jsonwebtoken` dapat melewati verifikasi token | Dependency | Critical / 9,8 | 0.1.0 | 4.2.2 | A07/A06 | Tinggi | Update minimal ke 4.2.2 dan tes kembali proses validasi token. |
| SCA-02 | CVE-2023-46233 pada `crypto-js` membuat PBKDF2 terlalu lemah | Dependency | Critical / 9,1 | 3.3.0 | 4.2.0 | A02/A06 | Tinggi | Update ke 4.2.0 dan perbarui hash atau key yang dibuat dengan konfigurasi lama jika digunakan. |
| SCA-03 | CVE-2019-10744 pada `lodash` menyebabkan prototype pollution | Dependency | Critical / 9,1 | 2.4.2 | 4.17.12 | A03/A06 | Tinggi | Update minimal ke 4.17.12 dan jangan memasukkan input pengguna langsung ke `defaultsDeep`. |
| SCA-04 | GHSA-5mrr-rgp6-x4gr pada `marsdb` menyebabkan command injection | Dependency | Critical / — | 0.6.11 | — | A03/A06 | Tinggi | Ganti package dan batasi input yang masuk ke query. |
| SCA-05 | CVE-2026-53486 pada `decompress` dapat membaca atau menulis file melalui arsip berbahaya | Dependency | Critical / 9,1 | 4.2.1 | — | A01/A06 | Tinggi | Jangan menerima arsip yang tidak dipercaya dan ganti package saat patch tersedia. |
| SCA-06 | CVE-2026-59873 pada `tar` dapat menyebabkan DoS melalui gzip bomb | Dependency | Critical / 7,5 | 6.2.1 | 7.5.19 | A06 | Sedang | Update ke 7.5.19 dan batasi ukuran serta waktu ekstraksi. |
| SCA-07 | CVE-2020-15084 pada `express-jwt` dapat melewati authorization | Dependency | High / 9,1 | 0.1.3 | 6.0.0 | A07/A06 | Tinggi | Update ke 6.0.0 atau package lain yang masih didukung. |
| SCA-08 | CVE-2021-23337 pada `lodash` menyebabkan command injection melalui template | Dependency | High / 7,2 | 2.4.2 | 4.17.21 | A03/A06 | Tinggi | Update ke 4.17.21 dan jangan membuat template dari input pengguna. |
| SCA-09 | CVE-2022-24785 pada `moment` menyebabkan path traversal | Dependency | High / 7,5 | 2.0.0 | 2.29.2 | A01/A06 | Sedang | Update ke 2.29.2 atau ganti dengan library yang masih dirawat. |
| IMG-01 | CVE-2026-14456 pada `libssl3t64` menyebabkan DoS pada QUIC server | OS package | High / 7,5 | 3.5.6-1~deb13u2 | 3.5.7-1~deb13u2 | A06 | Sedang | Build ulang menggunakan base image Debian terbaru. |
| SEC-01 | Private key ditemukan pada worktree, termasuk di `lib/insecurity.ts` | Secret | High / — | — | — | A02/A05 | Tinggi | Pastikan key hanya untuk testing. Jika pernah dipakai, segera rotasi dan simpan di secret store. |
| SEC-02 | Gitleaks menemukan 1.276 kemunculan secret pada history | Secret | High / — | — | — | A02/A05 | Tinggi | Periksa secret yang masih aktif, lakukan rotasi, lalu bersihkan history jika diperlukan. |
| A10-01 | `profileImageUrlUpload.ts` menjalankan `fetch(req.body.imageUrl)` tanpa membatasi host | Source/SSRF | High | — | — | A10 | Tinggi | Izinkan hanya HTTPS dan host tertentu serta blokir IP privat, loopback, dan link-local. |
| A10-02 | Respons dari URL pengguna disimpan tanpa batas ukuran dan timeout | Source/SSRF | High | — | — | A10 | Tinggi | Tambahkan timeout, batas ukuran, validasi tipe file, dan pembatasan koneksi keluar. |

Beberapa hasil Gitleaks berada di folder `test/` dan mungkin hanya data untuk pengujian. Meskipun
begitu, private key pada source tetap harus diperiksa dan dianggap berisiko sampai dipastikan tidak
pernah dipakai pada sistem yang sebenarnya.

## Bagian H — Laporan

### Ringkasan hasil

Trivy filesystem tidak menemukan vulnerability dan file JSON yang dihasilkan tidak mempunyai bagian
`Results`. Trivy image menemukan 53 vulnerability, yaitu 8 Critical dan 45 High. Sebanyak 52 temuan
berasal dari package Node.js dan satu temuan berasal dari package OS Debian, yaitu `libssl3t64`.
Trivy image juga menemukan empat private key dengan severity High.

Gitleaks menemukan 1.276 kemunculan secret pada history Git dan 69 pada worktree saat ini. Jumlah ini
adalah jumlah hasil yang dibaca scanner, bukan jumlah secret aktif yang unik. Secret yang sama dapat
muncul berkali-kali pada commit yang berbeda. Semua nilai secret pada laporan sudah disamarkan dengan
opsi `--redact`.

Tiga risiko yang paling penting menurut saya adalah:

1. SSRF pada fitur upload foto dari URL
2. bypass autentikasi pada `jsonwebtoken` dan `express-jwt`
3. private key yang tersimpan di source serta penggunaan `crypto-js` versi lama

| Sumber scan | Critical | High | Total |
| --- | ---: | ---: | ---: |
| Trivy filesystem vulnerability | 0 | 0 | 0 |
| Trivy image vulnerability | 8 | 45 | 53 |
| Trivy image secret | 0 | 4 | 4 |
| Gitleaks history | — | — | 1.276 |
| Gitleaks worktree | — | — | 69 |

### Perbandingan filesystem dan image

Scan filesystem menghasilkan 0 temuan, sedangkan scan image menghasilkan 53 temuan. Hasil 0 pada
filesystem belum membuktikan source aman. File JSON filesystem tidak memiliki bagian `Results`, jadi
kemungkinan Trivy tidak menemukan lockfile atau dependency tree yang dapat dibaca. Image memberikan
hasil lebih banyak karena berisi package Node.js dan package OS yang sudah terpasang dengan versi
yang jelas. Scan filesystem sebaiknya dijalankan ulang setelah memastikan lockfile tersedia.

### Perbandingan Gitleaks history dan worktree

| Mode | Generic API key | JWT | Private key | Total | File unik |
| --- | ---: | ---: | ---: | ---: | ---: |
| History | 973 | 276 | 27 | 1.276 | 41 |
| Worktree | 54 | 12 | 3 | 69 | 24 |
| Selisih | 919 | 264 | 24 | 1.207 | — |

Hasil history sekitar 18,5 kali lebih banyak daripada worktree. Hal ini terjadi karena Gitleaks
memeriksa commit lama dan secret yang sama dapat muncul pada banyak commit. Dari hasil ini saya
memahami bahwa menghapus secret dari file terbaru tidak menghapusnya dari history Git. Secret harus
dirotasi atau dicabut terlebih dahulu, kemudian history dapat dibersihkan jika diperlukan.

### Analisis OWASP Primary — A10 SSRF

Saya menemukan dua masalah pada `routes/profileImageUrlUpload.ts`. Pertama, nilai `imageUrl` dari
request pengguna langsung digunakan pada `fetch(url)`. Pengguna yang sudah login dapat memasukkan
alamat loopback, IP privat, atau alamat layanan internal sehingga server melakukan request ke alamat
tersebut. Pemeriksaan ekstensi file tidak mencegah SSRF karena request sudah dilakukan lebih dahulu.

Kedua, respons dari URL tersebut langsung disimpan ke file tanpa timeout dan batas ukuran yang jelas.
URL berbahaya dapat menahan koneksi atau mengirim file yang sangat besar. Perbaikannya adalah
membatasi protokol ke HTTPS, menggunakan daftar host yang diizinkan, memblokir IP internal,
memeriksa ulang redirect, memberi timeout, dan membatasi koneksi keluar dari container.

### Analisis OWASP Secondary — A02 Cryptographic Failures

Temuan CVE-2023-46233 menunjukkan bahwa `crypto-js` 3.3.0 menggunakan PBKDF2 yang lebih lemah dari
yang seharusnya. Gitleaks juga menemukan private key pada worktree dan lebih banyak material sensitif
pada history. Jika key tersebut pernah dipakai, key harus segera dirotasi karena menghapus file atau
commit tidak membuat key lama menjadi tidak berlaku. Secret sebaiknya disimpan dalam environment
variable atau secret manager dan hasil scan harus tetap menggunakan opsi `--redact`.

## Refleksi (150–300 kata, kata sendiri)

Pada LK03 saya melakukan scan dependency menggunakan Trivy dan scan secret menggunakan Gitleaks.
Saya menjalankan Trivy pada dua target, yaitu source filesystem dan image OWASP Juice Shop. Hasilnya
berbeda cukup jauh. Scan filesystem tidak menemukan vulnerability, sedangkan scan image menemukan 53
vulnerability dengan severity High dan Critical. Dari bagian ini saya memahami bahwa hasil nol dari
scanner belum tentu berarti aplikasi aman. Scanner bisa saja tidak menemukan lockfile atau daftar
dependency yang dapat dibaca. Image memberikan hasil lebih lengkap karena package aplikasi dan
package sistem operasi sudah terpasang di dalamnya.

Saya juga membandingkan hasil Gitleaks pada history Git dan worktree. History menghasilkan 1.276
temuan, sedangkan worktree hanya menghasilkan 69 temuan. Awalnya jumlah tersebut terlihat seperti
banyak secret yang berbeda, tetapi setelah diperiksa beberapa nilai muncul berulang pada banyak
commit dan sebagian berada di file pengujian. Walaupun begitu, secret yang pernah dipakai tetap harus
dirotasi karena menghapusnya dari commit terbaru tidak menghapus data pada commit lama.

Pada bagian pemetaan OWASP A10 saya memeriksa aliran `imageUrl` sampai ke fungsi `fetch()`. Saya
belajar bahwa SCA hanya mencari vulnerability pada dependency dan tidak selalu menemukan kelemahan
pada alur program seperti SSRF. Dari LK ini saya belajar untuk tidak hanya melihat severity, tetapi
juga memeriksa kegunaan package, jalur yang dapat diakses pengguna, versi perbaikan, dan dampak dari
setiap temuan sebelum menentukan prioritas.

---

_Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM ds-235150201111019_
