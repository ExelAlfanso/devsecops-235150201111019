# Kebijakan Security Gate

## Ambang dan cakupan

| Pemeriksaan | Kebijakan | Alasan |
| --- | --- | --- |
| Tes regresi CB3 | Semua `test/api/*.regression.test.ts` harus lulus. | Membuktikan perbaikan tetap bekerja dan kerentanan tidak kembali. |
| Semgrep custom CB2 | Nol temuan dari rule SSRF; `--error` membuat satu temuan saja menggagalkan job. | Gate hanya memeriksa pola kerentanan yang menjadi tanggung jawab perbaikan ini. `data/static/codefixes/` dan `test/` dikecualikan karena berisi contoh challenge dan tes, bukan jalur aplikasi aktif. |
| Gitleaks | Nol secret pada commit dalam rentang `v-vuln..HEAD`. | Secret lama dari baseline Juice Shop tidak membuat setiap run selalu merah; secret baru tetap memblokir. |
| Semgrep OWASP Top 10 | Laporan saja, tidak memblokir merge. | Pemindaian seluruh aplikasi warisan menghasilkan banyak temuan di luar lingkup tugas. |
| Trivy SCA | Laporan HIGH/CRITICAL saja, tidak memblokir merge. | Dependency Juice Shop memiliki temuan lama yang perlu ditriase terpisah, bukan dianggap sebagai regresi dari perbaikan ini. |

Semgrep OWASP pada baseline menghasilkan 43 temuan (13 ERROR), Trivy menghasilkan 36 temuan HIGH/CRITICAL setelah lockfile tersedia, dan Gitleaks menemukan 69 nilai pada seluruh `app/`. Karena itu laporan OWASP dan SCA diunggah sebagai artifact satu hari dan tidak menjadi gate. Gate menilai tes, rule custom, serta secret baru setelah tag baseline.

## False positive

Jangan mematikan pemeriksaan untuk menghilangkan false positive. Untuk Semgrep, gunakan `# nosemgrep: <rule-id>` disertai alasan yang menjelaskan konteks dan lokasi. Untuk Gitleaks, tambahkan fingerprint ke `.gitleaksignore` hanya dengan komentar alasan yang sama jelasnya. Tinjau pengecualian saat kode terkait berubah. Saat ini tidak ada pengecualian Gitleaks yang ditambahkan oleh kebijakan ini.

## Aturan merge

Semua perubahan ke `main` harus melalui Pull Request; tidak ada push langsung. PR hanya boleh di-merge setelah job `regression-test`, `sast-custom`, dan `secret-scan` hijau. Job laporan OWASP dan SCA membantu triase dan refleksi, tetapi tidak memblokir merge. Branch protection tidak tersedia untuk repo privat kelas ini, jadi aturan tersebut diperiksa dari riwayat repo dan status PR.
