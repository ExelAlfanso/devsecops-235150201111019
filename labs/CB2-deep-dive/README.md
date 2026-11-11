# CB2 ? Refleksi Deep Dive SSRF

Saya menelusuri challenge SSRF dari form profil sampai handler yang menerima `imageUrl`. Awalnya saya mengira keberadaan status solved sudah cukup untuk membuktikan seluruh alur. Setelah membaca kode, saya menemukan bahwa flag challenge ditetapkan dari kecocokan teks URL sebelum sesi pengguna diperiksa. Flag itu juga tidak memastikan bahwa request ke tujuan benar-benar berhasil. Karena itu, status challenge harus dibaca bersama alur kode dan bukti request server; status lama perlu dihindari saat mengulang PoC.

Titik yang paling penting adalah `fetch(url)`: tujuan berasal dari pengguna dan tidak ada pembatasan host sebelum server melakukan request. Sesi login membatasi akses ke pemanggilan tersebut, tetapi tidak mengubah sifat URL menjadi tepercaya. Pada payload lab, `localhost` dipahami dari sudut pandang proses server. Jika aplikasi berada di container, localhost pada payload berarti container tersebut, bukan otomatis komputer host.

Saya memetakan masalah ke CWE-918 dan OWASP A10:2021. Skor CVSS dibatasi pada dampak yang ditunjukkan terhadap status challenge, sehingga tidak menyimpulkan bahwa data rahasia sudah terbaca. Rule Semgrep yang ada melacak data body menuju argumen URL `fetch`; rule seperti ini membantu menemukan kandidat tetapi perlu ditinjau manusia, khususnya bila aliran berpindah fungsi. PoC juga memeriksa apakah challenge sudah selesai sebelum percobaan untuk mengurangi hasil positif palsu. Semgrep sudah menemukan satu aliran menuju `fetch` pada source di folder app. Perbandingan dengan commit yang ditunjuk tag v-vuln tidak menemukan perbedaan pada file yang dilacak. Keluaran PoC yang menunjukkan challenge solved sudah disimpan sebagai bukti.

- [Analisis dan hasil pengujian](../../project/deep-dive/02-analysis.md)
- [Rule Semgrep](../../project/deep-dive/semgrep/ssrf.yml)
- [PoC PowerShell](../../project/deep-dive/poc.ps1)

Dikerjakan oleh Exel Boy Alfanso (235150201111019) ? WM ds-235150201111019
