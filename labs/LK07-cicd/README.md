# LK07 — Pipeline CI GitHub Actions

- Nama/NIM: Exel Boy Alfanso (235150201111019)
- Watermark: `ds-235150201111019`
- Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Ringkasan

Workflow `CI` berjalan saat Pull Request mengubah berkas selain dokumen, atau saat dipanggil manual dari tab Actions. Perubahan Markdown serta folder `labs/`, `project/`, dan `docs/` dikecualikan. `concurrency` membatalkan run lama pada ref yang sama. Job `build-test` memakai runner Windows self-hosted dengan batas 15 menit.

1. **Ambil kode:** `actions/checkout` menyiapkan isi PR pada runner.
2. **Build image:** bila `app/Dockerfile` ada, Docker membangun `app:ci`; bila belum ada, Docker mengambil image publik OWASP Juice Shop. Nama image diteruskan ke step berikutnya.
3. **Smoke test:** Docker menjalankan image di port host lokal yang dipilih otomatis. PowerShell mencoba HTTP sampai 30 kali. Respons yang berhasil menghasilkan `App up`; kegagalan menampilkan log container dan menggagalkan job. Container dihentikan setelah pengujian.

## Bukti run

[Run CI hijau 16 Oktober 2026](https://github.com/Devsecops-Filkom-2026/devsecops-235150201111019/actions/runs/38927379798) adalah bukti historis dari workflow sebelum perbaikan LK07 ini. Run tersebut berasal dari `push` ke `main`, sehingga belum membuktikan trigger PR, runner Windows, dan smoke test pada versi ini. Build fallback dan smoke test workflow yang diperbarui sudah diuji lokal di Windows PowerShell dan menghasilkan `App up`. Tangkapan layar run hijau serta tautan run PR **versi ini** perlu ditambahkan setelah perubahan di-push lewat branch dan PR. Saat pemeriksaan GitHub, runner `EXELPC` masih offline.

## Refleksi

CI membantu saya menemukan kegagalan build dan aplikasi yang tidak bisa dijalankan saat perubahan masih berada di Pull Request. Tanpa pemeriksaan otomatis, saya mungkin baru melihat masalah itu setelah kode bergabung ke `main` atau saat demonstrasi. Smoke test menambah bukti yang lebih kuat daripada hasil build saja: container harus benar-benar menerima permintaan HTTP. Status check pada PR membuat hasilnya terlihat oleh peninjau, dan branch protection dapat memakai check `build-test` sebagai syarat merge.

Dalam pendekatan shift-left, masalah dicari sedekat mungkin dengan saat perubahan dibuat. Pipeline ini menyediakan tempat yang konsisten untuk pemeriksaan keamanan pada tahap berikutnya. Pada CB2, workflow `security.yml` dapat menjalankan pemindaian secret, dependensi dengan Trivy, dan kode dengan Semgrep. Temuan penting dari Trivy dapat menggagalkan check sebelum perubahan masuk ke `main`. Pada LK08, workflow `dast.yml` dapat menjalankan aplikasi sementara dan memindainya dengan ZAP. CI build dan smoke test perlu berjalan lebih dulu agar hasil DAST tidak dikacaukan oleh aplikasi yang gagal menyala. Pemisahan job juga memudahkan saya membaca apakah kegagalan berasal dari aplikasi, dependensi, kode, atau respons aplikasi saat dipindai. Karena runner berada di laptop saya, saya harus menyalakan Docker dan runner sebelum mengharapkan hasil PR muncul. Saya juga perlu membaca log dan memperbaiki penyebab kegagalan, bukan hanya mengulang run sampai hijau.

---

Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM ds-235150201111019
