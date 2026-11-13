# CB3 — Perbaikan Tes Regresi

## Refleksi

Pada CB3 ini saya menutup SSRF di fitur unggah gambar profil. Akar masalahnya bukan sekadar payload loopback tertentu, melainkan server menerima URL pilihan pengguna dan membuat request tanpa membatasi tujuan. Karena itu, saya menambahkan validasi URL sebelum `fetch`, membatasi protokol dan hostname, menolak kredensial serta port khusus, dan menghentikan redirect. Tes regresi memakai server loopback lokal sebagai saksi: sebelum patch server menerima request internal, sedangkan sesudah patch daftar request tetap kosong. Ini memberi bukti langsung atas sifat keamanan yang diperbaiki.

Saya juga menjalankan PoC pada dua container baru. Image rentan menyelesaikan challenge dengan exit code 0, sementara image perbaikan membiarkan challenge belum selesai dan menghasilkan exit code 1. Pemeriksaan API, server, lint, dan Semgrep mendukung hasil tersebut. Selama pengerjaan saya menemukan bahwa port host 3000 sudah dipakai aplikasi lain, jadi PoC kini menerima target host dan dapat dijalankan lewat port 3001. Batas pengujian tetap perlu dipahami: regresi menutup loopback dan PoC challenge, tetapi belum menguji DNS rebinding. Perubahan ini dibantu ChatGPT Codex; saya perlu memahami dan mampu mengulang tes serta menjelaskan alasan allowlist dan penolakan redirect saat viva.

## Tautan

- Pull request: menunggu URL repo pribadi. Fork dari repo kelas dinonaktifkan oleh GitHub.
- Screencast/asciinema: belum direkam.
- Analisis: [02-analysis.md](../../project/deep-dive/02-analysis.md)
- Perbaikan dan bukti: [03-fix.md](../../project/deep-dive/03-fix.md)
