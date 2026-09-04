# PRD — Modul Maps/Navigation
**Project:** Car Auto Play (Web PWA)
**Modul:** Maps / GPS Navigation
**Status:** Draft — siap masuk development
**Terakhir diupdate:** berdasarkan diskusi brainstorm project

---

## 1. Ringkasan

Modul peta & navigasi real-time yang berjalan selagi kendaraan bergerak — pengganti fungsi Google Maps di referensi desain awal (search destination, posisi live, weather inline, kontrol zoom). Bagian dari roadmap v1 Car Auto Play, dikerjakan setelah Fase 0 (Foundation/Shell) dan sejajar dengan modul Radio sebagai dua modul awal yang paling stabil untuk divalidasi duluan.

**Konteks penggunaan:** PWA diakses via iPhone Safari, dipasang di dashboard mobil sebagai pengganti CarPlay bawaan (mobil tidak mendukung Apple CarPlay). Landscape-only.

---

## 2. Target User & Platform

- **Target user:** Pengguna head-unit Android aftermarket & tablet/HP DIY di dashboard (skala luas), tapi implementasi awal difokuskan ke iPhone/Safari sesuai kebutuhan personal saat ini
- **Orientasi:** Landscape only
- **Runtime:** Web PWA (bukan native), instalasi via "Add to Home Screen"
- **Login:** Tidak perlu akun terpusat untuk modul ini (Geolocation & routing tidak butuh autentikasi user)

---

## 3. Scope

### In Scope (v1)
- Render peta dengan style dark, center otomatis ke posisi user
- Update posisi & arah kendaraan real-time (marker berotasi sesuai heading)
- Search destination (input + hasil list, tanpa autocomplete kompleks)
- Rute dasar dari posisi sekarang ke tujuan (garis rute + estimasi jarak/waktu)
- Widget cuaca inline (suhu + kondisi, auto-update berkala)
- Kontrol zoom in/out & recenter ke posisi user
- Permission-state UI untuk Geolocation (granted/denied/pending)
- Atribusi data sesuai syarat lisensi (OSM/ORS/MapTiler)

### Out of Scope (v1 → masuk v1.1/v2)
- Turn-by-turn voice guidance
- Offline map caching penuh
- Multi-stop routing
- Voice search (Web Speech API) — ditunda karena kompleksitas testing di iOS Safari

---

## 4. Tech Stack (Final)

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Map rendering | **MapLibre GL JS** | Open-source, ringan, mendukung dark style kustom, kompatibel dengan berbagai tile provider |
| Tile source | **MapTiler** (Free tier: 100rb request/bulan, non-commercial) — alternatif: **Stadia Maps** (2.500 view/hari) | Proper ToS untuk app pihak ketiga, bukan sekadar "demo/best-effort" seperti raw OSM tile server |
| Routing | **OpenRouteService (ORS)** — Free tier: 2.000 directions request/hari, 40/menit, tanpa kartu kredit | Berbasis OSM, ToS jelas untuk app pihak ketiga, kuota jauh cukup untuk pemakaian harian 1 kendaraan |
| Weather | **Open-Meteo** | Gratis, tanpa API key |
| Positioning | Browser **Geolocation API** (`watchPosition`) | Wajib HTTPS (termasuk saat dev via `mkcert`) |
| State management | **Zustand** | Selaras dengan keputusan stack project secara keseluruhan |
| Deployment | **Vercel** | Auto HTTPS, zero-config Vite, preview deployment per branch — cocok untuk iterasi cepat & testing langsung di iPhone |

> **Catatan migrasi:** Kalau nanti project ini komersil & traffic naik signifikan, upgrade ke tier berbayar ORS/MapTiler cukup ganti API key & limit — tidak perlu migrasi arsitektur dari awal. Self-hosting (misal via Oracle Cloud Free Tier) bisa jadi opsi lanjutan kalau butuh kontrol penuh, tapi tidak diperlukan di fase ini.

---

## 5. Task Breakdown

### 5.1 Setup & Data Layer
- [ ] Setup MapLibre GL JS di `src/modules/maps/`
- [ ] Daftar & konfigurasi API key MapTiler (atau Stadia Maps sebagai alternatif)
- [ ] Daftar & konfigurasi API key OpenRouteService
- [ ] Setup `mkcert` untuk HTTPS di localhost (wajib untuk Geolocation API saat development)
- [ ] Simpan semua API key di environment variables (`.env`, dan Vercel Environment Variables untuk production)
- [ ] Service layer untuk ORS: wrapper request + basic error handling (respect rate limit 40/menit)

### 5.2 Core Map & Positioning
- [ ] Render peta dasar dengan style dark custom
- [ ] Center otomatis ke posisi user saat pertama load
- [ ] Implementasi `watchPosition` untuk update real-time
- [ ] Marker kendaraan dengan rotasi sesuai `heading`
- [ ] Permission state UI (granted / denied / pending) — konsisten dengan pattern "No Access" dari referensi desain awal

### 5.3 Search & Routing
- [ ] Search box destination (input + hasil list dari geocoding)
- [ ] Panggil ORS Directions API, render garis rute di peta
- [ ] Tampilkan estimasi jarak & waktu tempuh
- [ ] Handle error/limit response dari ORS dengan graceful fallback UI

### 5.4 Weather Widget
- [ ] Fetch Open-Meteo berdasarkan posisi user
- [ ] Tampilkan suhu + ikon kondisi cuaca, auto-refresh berkala

### 5.5 Controls & Polish
- [ ] Tombol zoom +/-, recenter
- [ ] Transisi pan/zoom halus (tidak patah-patah)
- [ ] Atribusi wajib tampil di UI (OSM/ORS/MapTiler sesuai ketentuan masing-masing free tier)
- [ ] Loading & error state untuk semua fetch (network lemah, limit tercapai, dsb)

### 5.6 Deployment
- [ ] Connect repo ke Vercel
- [ ] Setup environment variables di Vercel dashboard
- [ ] Verifikasi HTTPS otomatis & Geolocation berfungsi di production
- [ ] Test preview deployment langsung di iPhone (install ke home screen)

### 5.7 Real-world Testing
- [ ] Test langsung di mobil (bukan simulator) — validasi akurasi posisi, delay update, battery drain
- [ ] Cek behavior Geolocation saat PWA di-background sebentar (switch app lalu balik)
- [ ] Pantau penggunaan kuota ORS/MapTiler selama pemakaian normal harian — pastikan tidak mendekati limit free tier

---

## 6. Acceptance Criteria

- User bisa search tujuan, dapat rute, posisi bergerak real-time mengikuti kendaraan sungguhan
- Weather widget tampil akurat sesuai lokasi
- Tidak ada crash/freeze saat sinyal GPS lemah/hilang sementara
- Tidak ada error/blokir dari ORS atau MapTiler dalam pemakaian normal harian
- Atribusi data tampil sesuai syarat lisensi masing-masing provider
- PWA berjalan mulus dari Vercel deployment, terinstall di iPhone via Add to Home Screen

---

## 7. Known Risks & Open Questions

| Risiko/Pertanyaan | Catatan |
|---|---|
| Kuota gratis ORS/MapTiler terlampaui | Kecil kemungkinan untuk 1 kendaraan pemakaian personal, tapi perlu dipantau saat testing awal |
| Geolocation background behavior di iOS Safari | Perlu divalidasi langsung — apakah update posisi tetap jalan saat PWA di-background sebentar |
| Pilihan final MapTiler vs Stadia Maps untuk tile | Belum dikunci 100% — bisa dicoba dua-duanya saat development, pilih yang kualitas/limit lebih cocok |
| Kapan waktu tepat migrasi ke self-hosted (kalau nanti komersil) | Belum perlu diputuskan sekarang, revisit setelah ada data pemakaian nyata |

---

## 8. Environment Variables (Draft)

```
VITE_MAPTILER_API_KEY=
VITE_ORS_API_KEY=
# Opsional jika pakai Stadia Maps sebagai alternatif tile
VITE_STADIA_API_KEY=
```

---

## 9. Referensi Keputusan Sebelumnya (untuk alignment)

- Struktur folder: modul ini masuk ke `src/modules/maps/` (selaras dengan `01-project-architecture.md`)
- State management global pakai Zustand (selaras dengan keputusan stack keseluruhan project)
- Constraint teknis umum project (autoplay, HTTPS, dsb) mengacu ke dokumen constraint teknis project secara keseluruhan — modul ini fokus ke bagian yang relevan dengan Maps/GPS saja
