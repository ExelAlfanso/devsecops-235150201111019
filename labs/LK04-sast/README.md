# LK-04 — Basic Scan #2: SAST dengan Semgrep

> Menjalankan SAST menggunakan Semgrep untuk mencari masalah keamanan pada source code OWASP Juice Shop.

- Nama / NIM : Exel Boy Alfanso (235150201111019)
- Watermark : ds-235150201111019
- Minggu : 4
- Target : OWASP Juice Shop

## Langkah yang dilakukan

1. Memastikan folder target `ds-235150201111019-target` sudah tersedia dan folder `labs\LK04-sast` tidak ikut terhapus.
2. Menjalankan Semgrep dengan ruleset `p/owasp-top-ten` dan `p/javascript` untuk membuat hasil format SARIF.
3. Menjalankan scan yang sama untuk membuat hasil format JSON.
4. Menjalankan script ringkasan untuk menghitung jumlah temuan berdasarkan severity, aturan, dan kategori OWASP.
5. Membaca lokasi serta potongan kode dari setiap hasil scan, kemudian menentukan apakah temuan tersebut TP atau FP.
6. Memilih lima temuan yang paling perlu diperbaiki dan membandingkan hasil SAST dengan SCA pada LK03.

## Hasil & bukti

Saya menjalankan scan SAST pada source code OWASP Juice Shop menggunakan Semgrep dengan ruleset `p/owasp-top-ten` dan `p/javascript`. Hasil scan menghasilkan 43 temuan. Dari jumlah tersebut, 33 temuan saya nilai sebagai **true positive (TP)** dan 10 temuan saya nilai sebagai **false positive (FP)**. Temuan FP berada pada folder `data/static/codefixes`; folder ini berisi contoh kode untuk challenge Juice Shop dan bukan route aplikasi yang aktif.

| Severity | Jumlah |
| --- | ---: |
| ERROR | 13 |
| WARNING | 28 |
| MEDIUM | 2 |
| **Total** | **43** |

Pemetaan berikut dinormalisasi ke OWASP Top 10:2021. Label lama Semgrep seperti `A01:2017 - Injection` dipetakan ke **A03:2021 - Injection**, sedangkan `A06:2017 - Security Misconfiguration` dipetakan ke **A05:2021 - Security Misconfiguration**.

| OWASP Top 10:2021 | Jumlah | TP | FP |
| --- | ---: | ---: | ---: |
| A01 Broken Access Control | 6 | 3 | 3 |
| A02 Cryptographic Failures | 5 | 2 | 3 |
| A03 Injection | 13 | 9 | 4 |
| A04 Insecure Design | 4 | 4 | 0 |
| A05 Security Misconfiguration | 5 | 5 | 0 |
| A07 Identification and Authentication Failures | 1 | 1 | 0 |
| A08 Software and Data Integrity Failures | 9 | 9 | 0 |
| **Total** | **43** | **33** | **10** |

### Command yang digunakan

Perintah berikut dijalankan dari root repository menggunakan Windows PowerShell.

```powershell
docker run --rm -v "${PWD}\ds-235150201111019-target:/ds-235150201111019-target" -v "${PWD}\labs\LK04-sast:/out" semgrep/semgrep semgrep scan --config p/owasp-top-ten --config p/javascript --sarif -o /out/semgrep.sarif /ds-235150201111019-target

docker run --rm -v "${PWD}\ds-235150201111019-target:/ds-235150201111019-target" -v "${PWD}\labs\LK04-sast:/out" semgrep/semgrep semgrep scan --config p/owasp-top-ten --config p/javascript --json -o /out/semgrep.json /ds-235150201111019-target
```

File hasil scan: [semgrep.sarif](semgrep.sarif) dan [semgrep.json](semgrep.json).

## Tabel Triage

| ID | Aturan | Lokasi | Severity | OWASP 2021 | TP/FP | Alasan |
| --- | --- | --- | --- | --- | --- | --- |
| SAST-01 | `github-actions-mutable-action-tag` | `.github/workflows/ci.yml:188` | WARNING | A08 | TP | Action GitHub memakai tag mutable; perubahan tag upstream dapat mengubah kode yang dijalankan CI. |
| SAST-02 | `gha-curl-pipe-shell` | `.github/workflows/ci.yml:359` | ERROR | A03 | TP | Output `curl` dipipe ke shell sehingga konten yang berubah/terkompromi dapat dieksekusi. |
| SAST-03 | `github-actions-mutable-action-tag` | `.github/workflows/codeql-analysis.yml:23` | WARNING | A08 | TP | Referensi action tidak dipin ke commit SHA. |
| SAST-04 | `github-actions-mutable-action-tag` | `.github/workflows/codeql-analysis.yml:34` | WARNING | A08 | TP | Referensi action tidak dipin ke commit SHA. |
| SAST-05 | `github-actions-mutable-action-tag` | `.github/workflows/codeql-analysis.yml:36` | WARNING | A08 | TP | Referensi action tidak dipin ke commit SHA. |
| SAST-06 | `github-actions-mutable-action-tag` | `.github/workflows/image_actions.yml:30` | WARNING | A08 | TP | Referensi action tidak dipin ke commit SHA. |
| SAST-07 | `github-actions-mutable-action-tag` | `.github/workflows/image_actions.yml:33` | WARNING | A08 | TP | Referensi action tidak dipin ke commit SHA. |
| SAST-08 | `github-actions-mutable-action-tag` | `.github/workflows/image_actions.yml:42` | WARNING | A08 | TP | Referensi action tidak dipin ke commit SHA. |
| SAST-09 | `run-shell-injection` | `.github/workflows/update-challenges-ebook.yml:22` | ERROR | A03 | TP | Nilai dari konteks workflow digunakan pada perintah shell; perlu validasi/quoting yang aman. |
| SAST-10 | `run-shell-injection` | `.github/workflows/update-challenges-www-legacy.yml:27` | ERROR | A03 | TP | Nilai dari konteks workflow digunakan pada perintah shell. |
| SAST-11 | `run-shell-injection` | `.github/workflows/update-challenges-www-legacy.yml:36` | ERROR | A03 | TP | Nilai dari konteks workflow digunakan pada perintah shell. |
| SAST-12 | `run-shell-injection` | `.github/workflows/update-challenges-www.yml:27` | ERROR | A03 | TP | Nilai dari konteks workflow digunakan pada perintah shell. |
| SAST-13 | `run-shell-injection` | `.github/workflows/update-challenges-www.yml:36` | ERROR | A03 | TP | Nilai dari konteks workflow digunakan pada perintah shell. |
| SAST-14 | `npm-missing-minimum-release-age` | `.npmrc:1` | MEDIUM | A08 | TP | Tidak ada minimum release age; paket npm yang baru terbit langsung dapat dipilih sebelum sempat terdeteksi berbahaya. |
| SAST-15 | `express-sequelize-injection` | `data/static/codefixes/dbSchemaChallenge_1.ts:5` | ERROR | A03 | FP | Berkas contoh kode rentan untuk challenge, bukan handler aplikasi yang dijalankan. |
| SAST-16 | `express-sequelize-injection` | `data/static/codefixes/dbSchemaChallenge_3.ts:11` | ERROR | A03 | FP | Berkas contoh/perbaikan challenge, bukan jalur request aktif. |
| SAST-17 | `aws-subnet-has-public-ip-address` | `data/static/codefixes/iacLeakedKeyChallenge_1.tf:17` | WARNING | A01 | FP | Konfigurasi Terraform hanya contoh challenge statis dan tidak dipakai untuk deployment. |
| SAST-18 | `insecure-load-balancer-tls-version` | `data/static/codefixes/iacLeakedKeyChallenge_1.tf:159` | WARNING | A02 | FP | Konfigurasi TLS berada pada berkas contoh challenge, bukan infrastruktur aktif. |
| SAST-19 | `aws-subnet-has-public-ip-address` | `data/static/codefixes/iacLeakedKeyChallenge_2.tf:17` | WARNING | A01 | FP | Konfigurasi Terraform hanya contoh challenge statis. |
| SAST-20 | `insecure-load-balancer-tls-version` | `data/static/codefixes/iacLeakedKeyChallenge_2.tf:159` | WARNING | A02 | FP | Konfigurasi TLS berada pada berkas contoh challenge. |
| SAST-21 | `aws-subnet-has-public-ip-address` | `data/static/codefixes/iacLeakedKeyChallenge_3_correct.tf:17` | WARNING | A01 | FP | Berkas contoh challenge, bukan konfigurasi deployment aplikasi. |
| SAST-22 | `insecure-load-balancer-tls-version` | `data/static/codefixes/iacLeakedKeyChallenge_3_correct.tf:159` | WARNING | A02 | FP | Berkas contoh challenge, bukan konfigurasi deployment aplikasi. |
| SAST-23 | `express-sequelize-injection` | `data/static/codefixes/unionSqlInjectionChallenge_1.ts:6` | ERROR | A03 | FP | Berkas contoh kode rentan untuk challenge, tidak dieksekusi sebagai route. |
| SAST-24 | `express-sequelize-injection` | `data/static/codefixes/unionSqlInjectionChallenge_3.ts:10` | ERROR | A03 | FP | Berkas contoh/perbaikan challenge, tidak menjadi handler aktif. |
| SAST-25 | `npm-missing-minimum-release-age` | `frontend/.npmrc:1` | MEDIUM | A08 | TP | Risiko dependency supply chain juga berlaku pada dependensi frontend. |
| SAST-26 | `aws-subnet-has-public-ip-address` | `infrastructure/terraform/networking.tf:18` | WARNING | A01 | TP | Subnet publik memberi IP publik saat instance diluncurkan; perlu dibatasi sesuai kebutuhan. |
| SAST-27 | `insecure-load-balancer-tls-version` | `infrastructure/terraform/networking.tf:160` | WARNING | A02 | TP | Konfigurasi listener/load balancer perlu memastikan TLS modern dan kebijakan kriptografi yang kuat. |
| SAST-28 | `hardcoded-jwt-secret` | `lib/insecurity.ts:54` | WARNING | A07 | TP | Private key JWT tertanam di source code; kebocoran repo memungkinkan pemalsuan token. |
| SAST-29 | `express-res-sendfile` | `routes/fileServer.ts:32` | WARNING | A04 | TP | Nama file berasal dari parameter route dan dipakai untuk mengirim berkas; validasi harus memastikan path tetap di direktori yang diizinkan. |
| SAST-30 | `express-res-sendfile` | `routes/keyServer.ts:14` | WARNING | A04 | TP | Endpoint mengirim file berdasarkan parameter pengguna dari direktori sensitif `encryptionkeys`. |
| SAST-31 | `express-res-sendfile` | `routes/logfileServer.ts:14` | WARNING | A04 | TP | Endpoint mengirim file log berdasarkan parameter route; dapat mengekspos data sensitif. |
| SAST-32 | `express-sequelize-injection` | `routes/login.ts:34` | ERROR | A03 | TP | `req.body.email` dirangkai langsung ke query SQL login. |
| SAST-33 | `express-res-sendfile` | `routes/quarantineServer.ts:14` | WARNING | A04 | TP | Endpoint mengirim berkas quarantine berdasarkan parameter tanpa verifikasi otorisasi yang memadai. |
| SAST-34 | `express-open-redirect` | `routes/redirect.ts:18` | WARNING | A01 | TP | `res.redirect()` memakai URL dari query; allowlist memakai `includes`, sehingga dapat dibypass dengan URL penyerang. |
| SAST-35 | `express-sequelize-injection` | `routes/search.ts:23` | ERROR | A03 | TP | Parameter pencarian `req.query.q` disisipkan langsung ke query SQL. |
| SAST-36 | `code-string-concat` | `routes/userProfile.ts:65` | ERROR | A03 | TP | `eval()` mengeksekusi string yang diturunkan dari username ketika challenge aktif. |
| SAST-37 | `express-check-directory-listing` | `server.ts:268` | WARNING | A05 | TP | Directory listing untuk `/infrastructure` dapat mengekspos konfigurasi deployment. |
| SAST-38 | `express-check-directory-listing` | `server.ts:288` | WARNING | A05 | TP | Directory listing untuk `/ftp` mengekspos daftar berkas publik. |
| SAST-39 | `express-check-directory-listing` | `server.ts:292` | WARNING | A05 | TP | Directory listing untuk `/.well-known` mengekspos isi direktori. |
| SAST-40 | `express-check-directory-listing` | `server.ts:296` | WARNING | A05 | TP | Directory listing untuk `/encryptionkeys` berisiko mengekspos material kunci. |
| SAST-41 | `express-check-directory-listing` | `server.ts:300` | WARNING | A05 | TP | Directory listing untuk `/support/logs` berisiko mengekspos log aplikasi. |
| SAST-42 | `aws-subnet-has-public-ip-address` | `terraform/networking.tf:18` | WARNING | A01 | TP | Konfigurasi Terraform aktif mendefinisikan subnet publik dengan IP publik otomatis. |
| SAST-43 | `insecure-load-balancer-tls-version` | `terraform/networking.tf:160` | WARNING | A02 | TP | Konfigurasi TLS pada Terraform aktif perlu diperbarui ke standar TLS modern. |

## Pembahasan 5 temuan prioritas

1. **SAST-32 — SQL injection pada login (A03, ERROR).** Input email langsung masuk ke query autentikasi. Dampaknya dapat berupa bypass login dan akses akun.
2. **SAST-35 — SQL injection pada pencarian (A03, ERROR).** Parameter `q` langsung dirangkai ke query, sehingga berpotensi membaca data di luar data produk.
3. **SAST-28 — private key JWT tertanam (A07, WARNING).** Kunci yang bocor membuat token dapat dipalsukan. Kunci harus dipindahkan ke secret manager/environment variable dan dirotasi.
4. **SAST-36 — `eval()` dari username (A03, ERROR).** Eksekusi string dari input pengguna dapat menjadi eksekusi kode. Fitur ini harus dihapus atau diganti dengan pemrosesan data tanpa evaluasi kode.
5. **SAST-40 — directory listing `encryptionkeys` (A05, WARNING).** Eksposur daftar/berkas kunci dapat membantu penyerang memperoleh material kriptografi. Nonaktifkan directory listing dan batasi akses rute.

## OWASP Primary dan Secondary

**OWASP Primary — A10: Server-Side Request Forgery (SSRF).** Tidak ada temuan A10 pada hasil scan. Hal ini bukan berarti aplikasi pasti bebas dari SSRF, karena Semgrep hanya mendeteksi pola yang ada pada ruleset. Saya tetap perlu memeriksa secara manual jika ada fitur aplikasi yang menerima URL dari pengguna.

**OWASP Secondary — A02: Cryptographic Failures.** Ada lima temuan terkait TLS. Tiga temuan adalah FP karena berada di `data/static/codefixes`. Dua temuan TP ada pada `infrastructure/terraform/networking.tf:160` dan `terraform/networking.tf:160`. Konfigurasi TLS perlu memakai standar modern, dan private key tidak boleh disimpan di repository. SAST-28 juga menunjukkan private key JWT masih ditulis langsung di source code walaupun label Semgrep-nya adalah A07.

## Perbandingan SAST dan SCA (LK03)

SAST memeriksa source code dan konfigurasi proyek. Karena itu, SAST dapat menemukan SQL injection, `eval()`, open redirect, directory listing, private key yang ditulis langsung, serta konfigurasi Terraform dan CI yang tidak aman. Temuan seperti ini tidak dapat diketahui hanya dari versi dependency.

Sebaliknya, SCA pada LK03 memeriksa paket pihak ketiga dan versinya, lalu mencocokkannya dengan data CVE. SCA bisa menemukan library yang rentan, tetapi tidak bisa mengetahui bahwa `req.body.email` dirangkai langsung ke query SQL. Jadi, SCA dan SAST perlu dipakai bersama: SCA memeriksa dependency, sedangkan SAST memeriksa kode dan konfigurasi yang dibuat developer.

## Aturan Semgrep sendiri (opsional)

Saya membuat aturan [aturan-saya.yaml](aturan-saya.yaml) dengan ID `hindari-eval`. Aturan ini mencari pemanggilan langsung `eval(...)` pada JavaScript dan TypeScript. Severity aturan adalah `ERROR` (blocking) dengan pemetaan OWASP A03:2021 (Injection) dan CWE-95. Pemakaian `eval()` berbahaya karena string dapat berubah menjadi kode yang dieksekusi.

```powershell
docker run --rm -v "${PWD}\ds-235150201111019-target:/ds-235150201111019-target" -v "${PWD}\labs\LK04-sast:/out" semgrep/semgrep semgrep scan --config /out/aturan-saya.yaml /ds-235150201111019-target
```

Hasil scan menjalankan satu aturan pada 519 file dan menghasilkan **2 temuan blocking**. Kedua file yang melebihi 1 MB dan 156 file yang sesuai pola `.semgrepignore` dilewati; scan hanya mencakup file yang dilacak Git.

| Aturan | Lokasi | Bukti | Severity | Penilaian |
| --- | --- | --- | --- | --- |
| `hindari-eval` | `routes/captcha.ts:22` | `eval(expression).toString()` | ERROR (blocking) | TP — ekspresi dievaluasi menjadi kode. |
| `hindari-eval` | `routes/userProfile.ts:65` | `username = eval(code)` | ERROR (blocking) | TP — kode yang terkait username dieksekusi. |

Kedua temuan berada pada route aplikasi sehingga perlu diprioritaskan. `eval()` harus dihapus atau diganti dengan pemrosesan data yang tidak mengevaluasi string sebagai kode.

## Refleksi

Pada LK04 saya menjalankan Semgrep untuk memeriksa source code OWASP Juice Shop. Pertama, saya membuat hasil scan dalam format SARIF dan JSON. Setelah itu saya membaca hasil JSON untuk melihat aturan, lokasi file, severity, dan kategori OWASP dari setiap temuan. Hasil scan menunjukkan bahwa Semgrep tidak hanya memeriksa file TypeScript, tetapi juga workflow GitHub Actions dan file Terraform.

Saya belajar bahwa hasil dari tools keamanan tidak boleh langsung dianggap semuanya benar. Contohnya, SQL injection pada `routes/login.ts` dan `routes/search.ts` adalah masalah nyata karena input dari pengguna dirangkai langsung ke query SQL. Namun, beberapa temuan yang sama ada di `data/static/codefixes`. Saya menandai temuan pada folder tersebut sebagai FP karena file itu dipakai sebagai contoh challenge dan bukan route aplikasi yang aktif.

Saya juga memahami perbedaan SAST dan SCA. SAST mencari masalah dari cara code dan konfigurasi ditulis, misalnya SQL injection, `eval()`, directory listing, dan private key yang ditulis langsung. SCA pada LK03 lebih fokus pada dependency dan CVE dari package yang digunakan. Menurut saya, temuan yang paling penting pada LK ini adalah SQL injection di login karena dapat dipakai untuk melewati proses autentikasi. Dari LK04 saya belajar untuk melihat severity, sumber input, dampak, dan konteks file sebelum menentukan prioritas perbaikan.

---

Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM `ds-235150201111019`
