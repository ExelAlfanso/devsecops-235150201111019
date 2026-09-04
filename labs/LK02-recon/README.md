# LK-02 — Deploy Aplikasi Rentan & Recon Awal

> Menjalankan OWASP Juice Shop dan melakukan reconnaissance awal.

- Nama / NIM : Exel Boy Alfanso (235150201111019)
- Watermark : ds-235150201111019
- Minggu : 2

## Langkah yang dilakukan

1. memastikan konfigurasi Juice Shop sudah tersedia di `docker-compose.yml`
2. menjalankan aplikasi dengan command `docker compose up -d`
3. menjalankan `docker compose ps` untuk memeriksa container
4. membuka `http://localhost:3000` di browser
5. menjalankan `curl.exe -sI http://localhost:3000` untuk melihat header HTTP
6. menyimpan hasil header di `labs/LK02-recon/headers.txt`
7. membuka DevTools dan melihat request pada bagian Network
8. mencatat halaman, endpoint, method, parameter, dan kebutuhan autentikasi
9. menguji endpoint secara pasif tanpa token atau cookie
10. membuat tabel attack surface yang berisi 15 entry point
11. membuat diagram trust boundary menggunakan Mermaid
12. memetakan hasil recon dengan kategori OWASP Top 10

## Hasil & bukti

- aplikasi dapat diakses melalui `http://localhost:3000` dan menghasilkan status `HTTP 200`
- hasil pemeriksaan header: [`headers.txt`](headers.txt)
- tabel 15 entry point dan diagram: [`attack-surface.md`](attack-surface.md)
- konfigurasi aplikasi: [`docker-compose.yml`](../../docker-compose.yml)

Header yang sudah tersedia:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`

Header atau konfigurasi yang perlu diperhatikan:

- `Content-Security-Policy` tidak ditemukan
- `Strict-Transport-Security` tidak ditemukan
- `Referrer-Policy` tidak ditemukan
- `Permissions-Policy` tidak ditemukan
- `Access-Control-Allow-Origin` menggunakan nilai `*`

Pemetaan OWASP:

- A01 Broken Access Control pada endpoint user, basket, order history, dan wallet
- A02 Cryptographic Failures karena aplikasi lab masih diakses melalui HTTP lokal
- A03 Injection pada input login, registrasi, dan pencarian produk
- A05 Security Misconfiguration pada header keamanan dan konfigurasi CORS
- A07 Identification and Authentication Failures pada proses login, registrasi, CAPTCHA, dan sesi
- A10 Server-Side Request Forgery belum ditemukan saat recon pasif dan perlu diuji pada tahap berikutnya

Catatan: hasil di atas masih berupa dugaan area pengujian, bukan kerentanan yang sudah terbukti.

## Refleksi (150–300 kata, kata sendiri)

Pada LK02 saya menjalankan OWASP Juice Shop menggunakan Docker Compose, kemudian melakukan
reconnaissance awal terhadap aplikasi. Saya memulai dengan memastikan aplikasi dapat dibuka melalui
port 3000. Setelah itu saya memeriksa header HTTP menggunakan curl dan melihat request aplikasi melalui
DevTools. Dari proses tersebut saya menemukan beberapa endpoint untuk produk, pencarian, login,
registrasi, pengguna, basket, riwayat pesanan, dan wallet.

Kendala yang saya hadapi adalah jumlah endpoint aplikasi cukup banyak sehingga saya harus memilih
endpoint yang paling berhubungan dengan input pengguna, autentikasi, dan data sensitif. Saya juga harus
membedakan endpoint yang dapat diakses tanpa login dengan endpoint yang menghasilkan status `401`.
Selain itu, saya menemukan endpoint yang menghasilkan status `500` ketika dipanggil tanpa sesi. Hasil
tersebut saya catat sebagai area yang perlu diperiksa lagi, bukan langsung dianggap sebagai
kerentanan.

Dari LK ini saya belajar bahwa reconnaissance digunakan untuk memahami aplikasi sebelum melakukan
pengujian keamanan. Status `200` tidak selalu berarti endpoint aman, sedangkan header yang hilang juga
belum cukup untuk membuktikan kerentanan. Tabel attack surface membantu saya mencatat method, input,
aset, autentikasi, dan dugaan risiko untuk setiap endpoint. Hasil ini dapat digunakan sebagai dasar
untuk menentukan pengujian keamanan pada LK berikutnya.

## Screencast (bila diwajibkan)

- Tautan: <asciinema/loom/drive> — tampilkan watermark/NIM di layar.

---

*Dikerjakan oleh Exel Boy Alfanso (235150201111019) — WM ds-235150201111019*
