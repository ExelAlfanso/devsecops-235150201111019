# CB1 — UTS: Vulnerability Assessment + CTF (OWASP Juice Shop)

> Minggu 8 · DevSecOps (CIF60038) · Individu · UTS (12,5% nilai akhir)

## Gambaran

UTS terdiri dari **dua bagian**, keduanya dikerjakan atas OWASP Juice Shop dan dikumpulkan ke GitHub:

- **Bagian A — CTF:** mengeksploitasi kerentanan untuk menyelesaikan challenge, mengumpulkan flag di scoreboard.
- **Bagian B — Laporan Vulnerability Assessment (VA):** mengonsolidasi temuan menjadi laporan terstruktur + risk register + rekomendasi mitigasi.

Dikerjakan **mandiri (take-home)** pada **12–16 Oktober 2026**, dari laptop masing-masing, pada instance
sendiri yang terisolasi.

**Nilai UTS (12,5%) = 40% Poin CTF + 30% Writeup CTF + 30% Laporan VA.** Karena solusi Juice Shop
bersifat publik dan flag dapat dibagi, **poin hanya dihitung untuk challenge yang disertai writeup
valid** (lihat Penilaian).

## Akses jaringan — WAJIB eduVPN

Alamat `10.34.100.121` hanya dapat dijangkau dari jaringan kampus. Karena take-home, dari luar kampus
Anda **wajib terhubung dulu ke jaringan UB lewat eduVPN**:

1. Pasang aplikasi **eduVPN** (Windows/macOS/Linux/Android/iOS) dari https://www.eduvpn.org/ atau store resmi.
2. Buka eduVPN → pilih institusi **Universitas Brawijaya** → login dengan akun UB Anda.
3. Setelah status **Connected**, barulah scoreboard dan instance bisa dibuka.

Tanpa eduVPN, `http://10.34.100.121:...` tidak akan terbuka.

---

# Bagian A — CTF

## Login & target

- **Scoreboard & login:** `http://10.34.100.121:8000`
  - username = **GitHub username** Anda
  - password = **NIM** Anda
- **Instance target Anda:** satu port khusus milik Anda (terisolasi) — lihat **Tabel Pembagian Port & Akun**
  di bagian akhir dokumen ini.

## Aturan pengerjaan

Challenge wajib mengikuti kategori OWASP per-NIM Anda (lihat `project/IDENTITY.md`):

| Jumlah | Challenge                                                 |
| ------ | --------------------------------------------------------- |
| ≥ 2    | kategori **Primary**, minimal satu tingkat ⭐⭐⭐ ke atas |
| ≥ 1    | kategori **Secondary**                                    |
| 2      | bebas pilih                                               |

Untuk lulus komponen poin, kumpulkan **poin sah ≥ 4000** (challenge yang Anda selesaikan **dan**
di-writeup) serta penuhi kewajiban kategori per-NIM; nilai penuh pada 8000 (lihat Penilaian).
Alur: eksploitasi di instance Anda → dapat flag → submit di scoreboard → **tulis writeup-nya**.

## Writeup CTF (wajib)

Tuliskan cara Anda menyelesaikan tiap challenge di `exam/uts/challenges.md` pada repo `devsecops-<nim>`:
nama challenge, kategori OWASP, tingkat bintang, langkah singkat + payload, flag, dan screenshot.

---

# Bagian B — Laporan Vulnerability Assessment

Konsolidasikan temuan dari LK03–LK06 (SCA/secret, SAST, DAST, eksploitasi) menjadi satu laporan VA
atas Juice Shop.

### 1) Konsolidasi temuan

Kumpulkan seluruh temuan ke `project/vulnerability-assessment.md`.

### 2) Risk register

Buat `project/risk-register.csv`:

```csv
id,judul,kategori_owasp,cwe,severity,likelihood,impact,bukti,rekomendasi,status
VA-01,SQLi pada login,A03,CWE-89,High,High,High,labs/LK06-exploit/bukti/sqli-login.png,parameterized query,open
VA-02,Stored XSS pada komentar,A03,CWE-79,Medium,Medium,High,...,output encoding+CSP,open
VA-03,Komponen usang lodash,A06,CWE-1104,High,Medium,High,labs/LK03-.../trivy-fs.json,update dependency,open
```

### 3) Peringkat risiko (OWASP Risk Rating)

Untuk tiap temuan: `Risk = Likelihood × Impact`. Jelaskan dasar penilaian (exploitability, dampak
teknis & bisnis). Urutkan dari risiko tertinggi.

### 4) Struktur laporan VA

`project/vulnerability-assessment.md`:

```markdown
# Vulnerability Assessment — Juice Shop

## 1. Ringkasan Eksekutif (temuan utama, tingkat risiko keseluruhan)

## 2. Ruang Lingkup & Metodologi (scope, tools, WSTG)

## 3. Attack Surface (ringkasan LK02)

## 4. Temuan & Bukti (per temuan: deskripsi, OWASP/CWE, severity, bukti, PoC)

## 5. Risk Register (tabel + prioritas)

## 6. Rekomendasi Mitigasi (feasible & terprioritas)

## 7. Lampiran (output scan, tautan)
```

### 5) Peer Security Review

Review repo VA minimal **1 mahasiswa lain** melalui Issue/PR (masukan konstruktif). Catat tautannya.

---

## Pengumpulan (GitHub, bukan Brone)

Semua artefak di-push ke repo `devsecops-<nim>` lewat Pull Request, ber-watermark `ds-<NIM>`:

- `exam/uts/challenges.md` + `exam/uts/bukti/` — writeup CTF (Bagian A)
- `project/vulnerability-assessment.md` + `project/risk-register.csv` — laporan VA (Bagian B)

**Pelaksanaan: 12–16 Oktober 2026.** Batas pengumpulan: **16 Oktober 2026** (akhir hari).

## Penilaian UTS (12,5% nilai akhir)

Nilai UTS = **40% Poin CTF + 30% Writeup CTF + 30% Laporan VA**.

> **Poin hanya dihitung untuk challenge yang disertai writeup valid** — penjelasan dengan kata-kata
> sendiri, payload, dan screenshot ber-watermark `ds-<NIM>` dari instance Anda. Solve di scoreboard
> tanpa writeup orisinal (mis. hasil auto-solver atau berbagi flag) **tidak bernilai**.

### 40% — Poin CTF (berbasis "poin sah")

Poin per challenge: ⭐ 100 · ⭐⭐ 250 · ⭐⭐⭐ 450 · ⭐⭐⭐⭐ 700 · ⭐⭐⭐⭐⭐ 1000 · ⭐⭐⭐⭐⭐⭐ 1350.
"Poin sah" = jumlah poin dari challenge yang ada writeup valid-nya.

- **POIN_MIN (lulus) = 4000** · **POIN_TARGET (nilai 100) = 8000.**

```
poin_sah < 4000 : nilai = (poin_sah / 4000) × 60
poin_sah ≥ 4000 : nilai = 60 + (poin_sah − 4000) / 4000 × 40     (maksimum 100)
```

Contoh: 2000 → 30 · 4000 → 60 · 6000 → 80 · 8000 → 100.

**Syarat kategori per-NIM wajib** (≥ 2 Primary termasuk ⭐⭐⭐+, ≥ 1 Secondary); bila tidak, nilai poin
**dibatasi maksimum 60** walau poin tinggi.

### 30% — Writeup CTF (`exam/uts/challenges.md`)

Kualitas penjelasan (kata-kata sendiri), payload, screenshot ber-watermark, **root cause (CWE)**, dan
**cara perbaikan di tingkat kode**. Diperiksa kesamaannya terhadap companion guide dan antar mahasiswa;
salinan verbatim = pelanggaran integritas.

### 30% — Laporan VA (`project/`)

Ketepatan identifikasi & pemetaan OWASP Top 10, kualitas risk rating, kelengkapan bukti reproducible,
dan keterbacaan laporan.

### Catatan integritas

Pola solve mencurigakan (mis. banyak solve beruntun dalam hitungan menit) ditinjau; mahasiswa harus
dapat menjelaskan & mereproduksi. Auto-solver, berbagi flag, dan menyalin walkthrough verbatim =
pelanggaran Kebijakan Integritas Akademik.

## Integritas

- Dilarang berbagi flag/jawaban. Flag hanya bukti bahwa sebuah solve terjadi; **keaslian diuji lewat
  writeup & laporan Anda sendiri** (langkah + payload + bukti), yang diperiksa kesamaannya antar mahasiswa.
- Kerjakan hanya pada instance Anda sendiri. Semua artefak ber-watermark `ds-<NIM>`.
- Pelanggaran mengikuti Kebijakan Integritas Akademik (lihat `KEBIJAKAN.md`).

## Checklist submit

- [ ] CTF: ≥ 5 challenge solved (penuhi kategori Primary/Secondary) + `exam/uts/challenges.md`
- [ ] VA: `project/vulnerability-assessment.md` sesuai struktur + `project/risk-register.csv`
- [ ] Peer Security Review (tautan)
- [ ] Semua artefak ber-watermark `ds-<NIM>`, di-push lewat PR

## Tabel Pembagian Port & Akun

Login scoreboard pakai **akun (GitHub) + password NIM**. Kerjakan CTF pada **Instance URL** Anda (via eduVPN).

| No  | NIM             | Akun (GitHub)       | Port | Instance URL              |
| --- | --------------- | ------------------- | ---- | ------------------------- |
| 1   | 245150207111003 | frqXoXo             | 3001 | http://10.34.100.121:3001 |
| 2   | 245150207111046 | fahrypratama17      | 3002 | http://10.34.100.121:3002 |
| 3   | 245150200111028 | Ditt-A              | 3003 | http://10.34.100.121:3003 |
| 4   | 245150201111009 | putriauliaaa        | 3004 | http://10.34.100.121:3004 |
| 5   | 245150200111005 | ZanAJA              | 3005 | http://10.34.100.121:3005 |
| 6   | 245150200111015 | nara-yama           | 3006 | http://10.34.100.121:3006 |
| 7   | 245150200111014 | Rwrzy77             | 3007 | http://10.34.100.121:3007 |
| 8   | 245150200111020 | Aslamnh             | 3008 | http://10.34.100.121:3008 |
| 9   | 245150201111016 | hafizhfajrii        | 3009 | http://10.34.100.121:3009 |
| 10  | 245150200111069 | asmaasyaa           | 3010 | http://10.34.100.121:3010 |
| 11  | 245150200111024 | CrimsonsTempest     | 3011 | http://10.34.100.121:3011 |
| 12  | 245150207111038 | Geisarrr            | 3012 | http://10.34.100.121:3012 |
| 13  | 235150201111034 | ZulfikarWim         | 3013 | http://10.34.100.121:3013 |
| 14  | 235150200111058 | yosiarel            | 3014 | http://10.34.100.121:3014 |
| 15  | 235150207111072 | ikhsagarbhacita     | 3015 | http://10.34.100.121:3015 |
| 16  | 245150207111044 | gathan16            | 3016 | http://10.34.100.121:3016 |
| 17  | 245150207111073 | RusdiansyahAlief19  | 3017 | http://10.34.100.121:3017 |
| 18  | 245150201111039 | AqeelaSahla         | 3018 | http://10.34.100.121:3018 |
| 19  | 245150201111048 | dvsalmah            | 3019 | http://10.34.100.121:3019 |
| 20  | 245150207111088 | dzharafahh          | 3020 | http://10.34.100.121:3020 |
| 21  | 235150201111076 | silvanarayunda96    | 3021 | http://10.34.100.121:3021 |
| 22  | 245150207111004 | taqiiy              | 3022 | http://10.34.100.121:3022 |
| 23  | 235150201111040 | IbnuNabel           | 3023 | http://10.34.100.121:3023 |
| 24  | 235150207111038 | damhacker04         | 3024 | http://10.34.100.121:3024 |
| 25  | 235150201111031 | AsyrafRiz           | 3025 | http://10.34.100.121:3025 |
| 26  | 225150207111039 | Javasura            | 3026 | http://10.34.100.121:3026 |
| 27  | 245150201111054 | ammarafaheema       | 3027 | http://10.34.100.121:3027 |
| 28  | 235150200111012 | ghufronbagaskara    | 3028 | http://10.34.100.121:3028 |
| 29  | 235150201111019 | ExelAlfanso         | 3029 | http://10.34.100.121:3029 |
| 30  | 235150201111079 | auliahaq            | 3030 | http://10.34.100.121:3030 |
| 31  | 235150207111004 | Zakianggoro         | 3031 | http://10.34.100.121:3031 |
| 32  | 235150207111025 | FathurGhaniSakha    | 3032 | http://10.34.100.121:3032 |
| 33  | 245150200111001 | dinnayeongx         | 3033 | http://10.34.100.121:3033 |
| 34  | 245150200111022 | DinoBrando          | 3034 | http://10.34.100.121:3034 |
| 35  | 245150200111029 | RozdanHanyv         | 3035 | http://10.34.100.121:3035 |
| 36  | 245150200111030 | FhmiSddq            | 3036 | http://10.34.100.121:3036 |
| 37  | 245150200111044 | AWSUB               | 3037 | http://10.34.100.121:3037 |
| 38  | 245150200111063 | ligarta             | 3038 | http://10.34.100.121:3038 |
| 39  | 245150200111070 | sapimasukgot        | 3039 | http://10.34.100.121:3039 |
| 40  | 245150200111071 | ghazthiskc19        | 3040 | http://10.34.100.121:3040 |
| 41  | 245150200111074 | octaviaenn          | 3041 | http://10.34.100.121:3041 |
| 42  | 245150201111002 | mqqff               | 3042 | http://10.34.100.121:3042 |
| 43  | 245150201111024 | ihyaulumuddin14     | 3043 | http://10.34.100.121:3043 |
| 44  | 245150201111027 | ValentinusMarvel    | 3044 | http://10.34.100.121:3044 |
| 45  | 245150201111031 | Ablebil             | 3045 | http://10.34.100.121:3045 |
| 46  | 245150201111041 | AhmadSyafiNurroyyan | 3046 | http://10.34.100.121:3046 |
| 47  | 245150201111047 | EdgarJason          | 3047 | http://10.34.100.121:3047 |
| 48  | 245150201111051 | lipkusuma           | 3048 | http://10.34.100.121:3048 |
| 49  | 245150201111053 | farlliant           | 3049 | http://10.34.100.121:3049 |
| 50  | 245150207111002 | candyangeli         | 3050 | http://10.34.100.121:3050 |
| 51  | 245150207111028 | savraneh            | 3051 | http://10.34.100.121:3051 |
| 52  | 245150207111033 | clydeew             | 3052 | http://10.34.100.121:3052 |
| 53  | 245150207111042 | BunchFlyder7        | 3053 | http://10.34.100.121:3053 |
| 54  | 245150207111043 | ArmJour             | 3054 | http://10.34.100.121:3054 |
| 55  | 245150207111047 | SyafaHadyan         | 3055 | http://10.34.100.121:3055 |
| 56  | 245150207111074 | tauwus              | 3056 | http://10.34.100.121:3056 |
| 57  | 245150207111075 | Sleeplast           | 3057 | http://10.34.100.121:3057 |
| 58  | 245150207111080 | Ainerken            | 3058 | http://10.34.100.121:3058 |
| 59  | 245150207111085 | GrandDaily          | 3059 | http://10.34.100.121:3059 |
| 60  | 245150207111089 | willgregorry        | 3060 | http://10.34.100.121:3060 |
| 61  | 245150207111095 | zuhdiarif           | 3061 | http://10.34.100.121:3061 |
| 62  | 245150200111008 | NafisNaufal         | 3062 | http://10.34.100.121:3062 |
| 63  | 235150200111018 | Nukotani1488        | 3063 | http://10.34.100.121:3063 |
