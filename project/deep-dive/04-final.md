# Laporan Posture Keamanan Akhir — SSRF

**Pemilik:** Exel Boy Alfanso · **NIM:** 235150201111019

**Challenge:** `ssrfChallenge` · **OWASP:** A10:2021 · **CWE:** CWE-918
**Watermark:** `ds-235150201111019` · **Status laporan:** bukti lokal tersedia; pemindaian image final dan verifikasi pipeline masih menunggu.

## Ringkasan

Route unggah gambar profil sebelumnya mengambil URL yang diberikan pengguna tanpa membatasi tujuan. Perbaikan membatasi request ke HTTPS pada hostname tepat `cataas.com`, menolak port khusus dan userinfo, serta tidak mengikuti redirect. Retest lokal pada container hardened menunjukkan payload loopback ditolak, challenge SSRF tidak solved, dan event `exploit_attempt` dicatat.

Hasil ini membuktikan bahwa payload loopback yang diuji tertahan. Hasil tersebut belum membuktikan semua varian SSRF tertutup: DNS rebinding belum diuji. Hasil ZAP dan Trivy untuk image CB4 serta run pipeline end-to-end juga belum tersedia, sehingga posture rilis belum dapat dinyatakan final.

## Bukti before → after

| Pemeriksaan | Sebelum perbaikan | Sesudah perbaikan | Bukti / catatan |
|---|---|---|---|
| PoC SSRF | Image `juice-ds-235150201111019:vuln` menyelesaikan `ssrfChallenge`; PoC exit `0`. | Pada `app:final`, PoC mengirim payload, lalu melaporkan `SSRF challenge is not solved` (exit `1`). | [03-fix.md](03-fix.md), [PoC](poc.ps1), serta retest lokal 2026-11-17. |
| Request ke loopback | Mock endpoint internal menerima request pada tes regresi rentan. | Tes regresi terdokumentasi hijau; mock loopback tidak menerima request. | [03-fix.md](03-fix.md): `1e8a131` merah, `47d7dec` hijau. Tes ulang dari lingkungan Codex tidak selesai karena koneksi localhost diblokir (`EACCES`); hasil ini bukan pass. |
| Semgrep SSRF | 1 temuan pada `profileImageUrlUpload.ts`. | 0 temuan setelah validasi tujuan dimodelkan sebagai sanitizer. | [Output Semgrep](bukti/semgrep-ssrf.txt) dan [03-fix.md](03-fix.md). |
| CVSS untuk payload yang diuji | 4.3 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N`. | 0.0 untuk jalur loopback yang diuji dan diblokir. | [Risk register](../risk-register.csv). Skor sesudah ini tidak menghapus risiko varian yang belum diuji. |
| Deteksi runtime | Belum ada event deteksi yang ditunjukkan pada bukti sebelum perbaikan. | Event `exploit_attempt` muncul saat payload dikirim; route menolak URL dan memakai fallback gambar. | Log lokal 2026-11-17 di bawah. |
| ZAP / Trivy image | — | Belum ada artifact CB4 yang tersedia untuk laporan ini. | Artifact lama di `labs/` berasal dari latihan sebelumnya dan tidak dipakai sebagai hasil scan `app:ci` final. |

### Log retest

```text
warn: {"ts":"2026-11-17T08:25:37.977Z","event":"exploit_attempt","rule":"ssrfChallenge","ip":"::ffff:172.22.0.1","wm":"ds-235150201111019"}
warn: Error retrieving user profile image: Profile image URL must use HTTPS and an allowed host; using image link directly
[-] SSRF challenge is not solved.
```

Alamat `172.22.0.1` adalah alamat yang terlihat oleh container dari jaringan Docker lokal. Login PoC juga memicu log penyelesaian `weakPasswordChallenge` dan `loginAdminChallenge`; itu bukan keberhasilan SSRF.

## Kontrol yang diterapkan

- **Pencegahan SSRF:** URL di-parse sebelum fetch. Hanya HTTPS ke `cataas.com` yang diterima; port non-default dan userinfo ditolak. `redirect: 'error'` mencegah fetch mengikuti redirect ke tujuan lain. Implementasi ada di [`profileImageUrlUpload.ts`](../../app/routes/profileImageUrlUpload.ts).
- **Tes dan SAST:** tes regresi menolak request loopback; rule Semgrep khusus mencari aliran input body menuju URL `fetch`. Rincian dan batas tes ada di [analisis](02-analysis.md) dan [perbaikan](03-fix.md).
- **Hardening runtime:** [Compose hardened](../../docker-compose.hardened.yml) memakai filesystem read-only, `/tmp` tmpfs, volume untuk direktori yang perlu ditulis, `no-new-privileges`, penghapusan semua capability, batas memori 512 MB, dan batas 200 proses. Log yang dikirim menunjukkan container berjalan dan melayani port 3000.
- **SBOM:** [`sbom.cdx.json`](../sbom.cdx.json) dibuat oleh Syft 1.56.0 dari image `app:ci`; format CycloneDX 1.7 dan berisi 2.743 komponen. SBOM adalah inventaris komponen, bukan hasil penilaian CVE.
- **Secret hygiene:** `.env` diabaikan Git dan tidak tercatat sebagai file tracked. Riwayat Git, rotasi secret lama, dan hasil gate secret-scan untuk branch final belum diverifikasi dalam laporan ini.

## Status scan dan pipeline

- **ZAP baseline:** konfigurasi workflow tersedia, tetapi artifact laporan CB4 belum ditemukan. Setelah job dijalankan, catat 2–3 alert yang relevan, tingkatnya, serta keputusan untuk tiap temuan.
- **Trivy image:** artifact `project/trivy-image.json` belum tersedia. Jalankan scan pada image `app:ci`, lalu bandingkan temuan paket OS dan paket Node sebelum mengisi risk register.
- **GitHub Actions:** hasil run final belum tersedia. [`dast.yml`](../../.github/workflows/dast.yml) sekarang memanggil `poc.ps1`, membedakan exit `0` (masih rentan), `1` (tertutup), dan `2` (prasyarat gagal), serta memperbaiki teardown. Workflow belum dijalankan end-to-end; catatan [03-fix.md](03-fix.md) menyebut runner `EXELPC` offline saat verifikasi sebelumnya.

## Risiko tersisa dan keputusan

| Risiko | Status | Keputusan |
|---|---|---|
| DNS rebinding terhadap hostname yang diizinkan | Belum diuji; allowlist tidak melakukan DNS pinning. | Diterima sementara untuk demo lokal. Uji DNS rebinding dan pertimbangkan pembatasan egress sebelum menyatakan mitigasi menyeluruh. |
| Temuan ZAP / Trivy pada image final | Belum dinilai karena artifact CB4 belum ada. | Belum diputuskan. Tambahkan temuan yang tidak diperbaiki ke [risk register](../risk-register.csv) dengan alasan `accepted` atau kontrol `mitigated`. |
| Gate DAST end-to-end | Workflow diperbarui, tetapi belum terverifikasi karena runner offline pada percobaan sebelumnya. | Jangan klaim gate hijau sebelum run sukses pada image final. |
| Cypress SSRF | Belum dijalankan menurut [03-fix.md](03-fix.md). | Jalankan bila dibutuhkan sebagai bukti tambahan sebelum tag `v-final`. |

## Kesimpulan

Perbaikan menutup payload SSRF loopback yang didemonstrasikan dan menghasilkan log deteksi saat payload yang sama dicoba ulang. Bukti lokal untuk PoC, regresi, Semgrep, hardening, dan SBOM tersedia. Laporan ini masih perlu diperbarui dengan artifact ZAP dan Trivy final, keputusan atas temuan scan, serta hasil pipeline DAST yang sudah diperbaiki sebelum repo diberi tag `v-final`.
