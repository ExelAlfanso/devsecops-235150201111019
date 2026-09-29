# LK05 — DAST OWASP ZAP pada Juice Shop

- Nama/NIM: Exel Boy Alfanso (235150201111019)
- Watermark: `ds-235150201111019`
- Target: OWASP Juice Shop di `http://host.docker.internal:3000`
- Lingkungan: Windows PowerShell, Docker Desktop, `zaproxy/zap-bare` (ZAP 2.17.0)
- Ruang lingkup: container Juice Shop lokal milik lab ini

## Cara menjalankan

Jalankan dari root repository di PowerShell. `docker compose up -d` menyalakan Juice Shop pada port 3000. Uji akses dari container ZAP; hasil yang diharapkan `200`. Berkas [plan.yaml](plan.yaml) berisi konteks target, spider maksimal dua menit, `passiveScan-wait`, serta job laporan HTML dan JSON dengan judul ber-watermark.

Isi `plan.yaml`:

```yaml
env:
  contexts:
    - name: juice
      urls: ["http://host.docker.internal:3000"]
  parameters:
    failOnError: false
    progressToStdout: true
jobs:
  - type: spider
    parameters:
      url: "http://host.docker.internal:3000"
      maxDuration: 2
  - type: passiveScan-wait
  - type: report
    parameters:
      template: traditional-html
      reportDir: /zap/wrk
      reportFile: zap-baseline
      reportTitle: "DAST Baseline Juice Shop - ds-235150201111019"
  - type: report
    parameters:
      template: traditional-json
      reportDir: /zap/wrk
      reportFile: zap-baseline
```

```powershell
docker compose up -d
docker run --rm zaproxy/zap-bare bash -c "curl -s -o /dev/null -w '%{http_code}' http://host.docker.internal:3000"
$labPath = (Resolve-Path .\labs\LK05-dast).Path
docker run --rm -v "${labPath}:/zap/wrk:rw" zaproxy/zap-bare zap.sh -cmd -autorun /zap/wrk/plan.yaml
```

Uji akses menghasilkan `200`. Spider menemukan **101 URL** dan Automation Framework melaporkan `Automation plan succeeded!`. Hasilnya: [laporan HTML](zap-baseline.html) dan [laporan JSON](zap-baseline.json). Tangkapan terminal ada di [bukti akses](bukti/1.png), [bukti scan](bukti/2.png), dan [bukti ringkasan](bukti/image.png). Laporan HTML mencantumkan `DAST Baseline Juice Shop - ds-235150201111019`.

## Ringkasan baseline

Target laporan: `http://host.docker.internal:3000`. ZAP menghasilkan **4 jenis alert** dengan **20 instance**. `count` adalah jumlah instance yang dilaporkan per jenis alert, bukan jumlah jenis kerentanan.

| Risiko | Jenis alert | Instance |
| --- | ---: | ---: |
| High | 0 | 0 |
| Medium | 2 | 10 |
| Low | 1 | 5 |
| Informational | 1 | 5 |
| **Total** | **4** | **20** |

## Triage dan pemetaan OWASP Top 10:2021

| ID | Alert | Risiko | Instance | CWE | OWASP 2021 | Nyata/noise | Bukti dan keputusan |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| ZAP-01 | Content Security Policy (CSP) Header Not Set | Medium | 5 | 693 | A05 Security Misconfiguration | Nyata | Respons halaman utama dan `/ftp` tidak memiliki header `Content-Security-Policy`. CSP perlu ditetapkan untuk membatasi sumber skrip dan mengurangi dampak XSS; ketiadaannya sendiri belum membuktikan XSS. |
| ZAP-02 | Cross-Domain Misconfiguration | Medium | 5 | 264 | A05 Security Misconfiguration | Nyata, dampak perlu verifikasi | ZAP melihat `Access-Control-Allow-Origin: *` pada aset, termasuk `/polyfills.js`; respons halaman utama juga memakai nilai itu. Kebijakan origin terlalu luas. Perlu periksa endpoint berisi data sensitif dan header kredensial sebelum menyimpulkan kebocoran data. |
| ZAP-03 | Timestamp Disclosure - Unix | Low | 5 | 497 | A05 Security Misconfiguration (tentatif) | Noise berisiko rendah | ZAP menemukan angka mirip Unix timestamp di `/styles.css`. Perlu memastikan nilainya benar waktu internal yang sensitif; belum ada bukti dampak eksploitasi. |
| ZAP-04 | Modern Web Application | Informational | 5 | — | Tidak ada kategori kerentanan | Informasi, bukan kerentanan | ZAP mengenali pola aplikasi web modern pada respons. Alert ini hanya membantu memahami permukaan serangan. |

Pemetaan OWASP di atas adalah penilaian konteks, bukan keluaran otomatis ZAP. Untuk ZAP-03, A05 dipakai secara tentatif karena yang tampak adalah paparan metadata; klasifikasi perlu ditinjau bila timestamp ternyata berasal dari mekanisme lain. Nilai CWE `-1` pada ZAP-04 berarti ZAP tidak memberi CWE yang relevan.

## Perbandingan dengan active scan opsional

[plan-active.yaml](plan-active.yaml) menjalankan spider maksimal tiga menit, menunggu passive scan, kemudian menjalankan `activeScan` dengan batas total 20 menit. Perintahnya:

```powershell
$labPath = (Resolve-Path .\labs\LK05-dast).Path
docker run --rm -v "${labPath}:/zap/wrk:rw" zaproxy/zap-bare zap.sh -cmd -autorun /zap/wrk/plan-active.yaml
```

Spider kembali menemukan **101 URL**. Job active scan selesai dalam **2 menit 9 detik** dan menghasilkan [laporan active HTML](zap-active.html) ber-watermark. Laporan active memuat **5 jenis alert**: dua Medium, satu Low, dan dua Informational. Empat jenis pertama sama dengan baseline. Tambahan satu jenis adalah **User Agent Fuzzer** (Informational), yaitu perubahan respons saat ZAP mengirim variasi header `User-Agent`; laporan tidak memberi CWE atau bukti kerentanan untuk alert ini.

Tidak ada alert High, SQL injection, atau XSS pada laporan active ini. Itu hanya hasil untuk URL yang dijangkau spider dan aturan yang berjalan pada scan ini. Tidak ada login, alur aplikasi khusus, atau AJAX spider yang dikonfigurasi, sehingga hasil ini tidak membuktikan bahwa bagian lain aplikasi bebas dari injeksi/XSS.

## Kandidat verifikasi pada LK06

1. **ZAP-02:** bandingkan respons endpoint akun/basket dengan dan tanpa login serta `Origin` berbeda. Periksa apakah data sensitif dapat dibaca lintas origin; header wildcard pada aset publik saja tidak cukup untuk menyatakan kebocoran.
2. **ZAP-01:** cek respons halaman lain dan uji apakah input pada pencarian/komentar dapat menjadi XSS. Tidak adanya CSP hanya memperbesar risiko jika injeksi skrip memang ada.
3. **ZAP-03:** telusuri lokasi angka timestamp dan pastikan apakah itu metadata sensitif atau sekadar isi aset statis.

## Refleksi

Pada LK05 saya menjalankan Juice Shop di Docker lalu memindainya dengan ZAP melalui spider dan passive scan. Container ZAP dapat membuka target dengan status 200, sehingga hasil scan berasal dari aplikasi yang berjalan. Spider menemukan 101 URL, tetapi laporan baseline hanya berisi empat jenis alert. Saya belajar bahwa banyaknya URL tidak sama dengan banyaknya kerentanan. Spider hanya memperluas halaman yang diamati, sedangkan passive scan menilai request dan response yang lewat tanpa mengirim payload serangan.

Karena itu baseline tidak menemukan SQL injection atau XSS, walaupun Juice Shop memang dibuat rentan. SQL injection perlu input yang memengaruhi query database dan pemeriksaan perubahan respons. XSS perlu pengujian apakah input dapat dieksekusi sebagai skrip. Pemindaian pasif tidak melakukan langkah tersebut. Temuannya lebih banyak terkait konfigurasi, seperti tidak adanya CSP dan header CORS yang terlalu luas. Keduanya nyata pada respons, tetapi saya tidak boleh menyamakan header yang lemah dengan eksploitasi yang sudah terbukti. Sebagai contoh, CORS wildcard pada aset publik tidak otomatis membocorkan data akun.

Alert timestamp saya nilai berisiko rendah sampai ada bukti bahwa nilainya membocorkan informasi penting. Alert Modern Web Application hanya bersifat informasi. Saya juga membedakan empat jenis alert dari dua puluh instance agar angka laporan tidak dibaca berlebihan. Hasil ini memberi daftar pemeriksaan untuk LK06: verifikasi CORS pada endpoint sensitif, uji XSS secara terkontrol, dan telusuri asal timestamp. Dengan begitu triage membantu menentukan langkah berikutnya berdasarkan bukti, bukan hanya warna severity pada laporan.

---

Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM `ds-235150201111019`
