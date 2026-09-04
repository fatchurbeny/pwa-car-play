# Car Auto Play — Project Context (untuk AI Agent/LLM)

> File ini dibuat khusus supaya AI coding agent (Claude Code, atau LLM lain yang membantu development) punya konteks penuh tanpa perlu membaca ulang seluruh riwayat diskusi. Baca file ini SEBELUM mulai mengerjakan task apapun di repo ini.

---

## 1. Apa Project Ini

Web PWA yang mereplikasi pengalaman antarmuka mirip Apple CarPlay, dibuat karena mobil pribadi pemilik project tidak mendukung CarPlay bawaan. Dipasang di dashboard (mount) menggunakan iPhone sebagai device utama.

**Bukan** aplikasi CarPlay/Android Auto asli — ini implementasi independen berbasis web yang meniru pengalaman serupa.

---

## 2. Status & Scope Saat Ini (PENTING — baca sebelum menyarankan fitur baru)

**Scope v1 (locked):**
1. **Navigation/Maps** — peta, posisi real-time, search destination, rute dasar, weather widget
2. **Music — Spotify** — via Web Playback SDK
3. **Music — YouTube Music** — via YouTube IFrame Player API + YouTube Data API (tidak ada SDK resmi YT Music)
4. **Radio** — Suara Surabaya (stream langsung), kemungkinan ekspansi ke Radio Browser API untuk stasiun lain

**Eksplisit DI LUAR scope v1** (jangan disarankan/dikerjakan kecuali diminta ulang):
- Podcast
- Phone/Contacts
- Turn-by-turn voice guidance
- Offline map caching penuh
- Voice search
- Light mode (dark-mode only untuk v1)
- Multi-stop routing
- Sistem akun/login terpusat (autentikasi hanya per-service pihak ketiga)

Kalau ada permintaan untuk fitur di luar list ini, **tanyakan dulu** apakah ini perluasan scope yang disengaja, jangan asumsikan otomatis masuk v1.

---

## 3. Target Platform & Device

- **Platform utama:** iPhone, Safari/WebKit, sebagai PWA (install via "Add to Home Screen")
- **Orientasi:** Landscape-only (tidak perlu handle portrait)
- **Target jangka panjang (bukan v1):** perluasan ke head-unit Android aftermarket & tablet DIY — jadi hindari hardcode asumsi device iPhone spesifik di level arsitektur inti, tapi UI/testing boleh fokus iPhone dulu
- **Tidak ada dark/light toggle** — dark mode adalah satu-satunya tema di v1

---

## 4. Tech Stack (Locked — jangan sarankan alternatif tanpa alasan kuat)

| Layer | Pilihan | JANGAN pakai |
|---|---|---|
| Framework | React 18 + TypeScript (Vite) | — |
| Routing | React Router v6 | — |
| State | Zustand | Redux (terlalu berat untuk scope ini) |
| Styling | Tailwind CSS + CSS Variables | — |
| Map rendering | **MapLibre GL JS** | Google Maps JS API (lisensi tidak cocok untuk caching), Mapbox GL JS (sudah final ke MapLibre) |
| Map tiles | **MapTiler** (utama) / Stadia Maps (alternatif) | Raw OSM tile server publik (`tile.openstreetmap.org` langsung) — melanggar usage policy untuk pemakaian rutin |
| Routing/Directions | **OpenRouteService (ORS)** | OSRM demo server publik (`router.project-osrm.org`) — cuma "best effort", bisa diblokir kapan saja, rate limit 1 req/detik |
| Musik — Spotify | Web Playback SDK resmi | Iframe embed `open.spotify.com/embed` sebagai primary approach (ada bug CSP & bisa stuck di preview-mode di viewport mobile) |
| Musik — YouTube Music | YouTube IFrame Player API + YouTube Data API | Tidak ada SDK resmi "YouTube Music" — jangan cari SDK yang tidak ada |
| Audio control | Web Audio API + Media Session API | — |
| Weather | Open-Meteo | — (gratis, tanpa API key, jangan ganti ke OpenWeatherMap tanpa alasan) |
| PWA | Vite PWA Plugin (Workbox) | — |
| Persistence lokal | IndexedDB via `idb` | localStorage untuk data besar (favorit, cache rute) |
| Deployment | **Vercel** | — (self-hosting hanya untuk kebutuhan masa depan yang belum terjadi) |
| Testing | Vitest + React Testing Library | — |

---

## 5. Struktur Folder

```
src/
├── app/
│   ├── AppShell.tsx          # Layout: LeftNav, MainPanel
│   ├── router.tsx
│   └── providers/            # Context: Audio, Location, Connectivity
├── modules/
│   ├── maps/
│   ├── music/
│   │   ├── spotify/
│   │   ├── youtube-music/
│   │   └── player/           # MiniPlayer & NowPlaying (shared)
│   └── radio/
├── components/                # Komponen UI reusable
├── hooks/                      # useGeolocation, useMediaSession, useNetworkStatus
├── stores/                     # Zustand stores
├── services/                   # API clients (ORS, MapTiler, Spotify SDK, YouTube API)
├── styles/                     # tokens.css, globals.css
└── types/
```

Modul `podcast/` dan `phone/` **sengaja tidak dibuat** — di luar scope v1.

---

## 6. Keputusan Teknis Penting & Alasannya

Bagian ini penting supaya agent tidak mengusulkan ulang sesuatu yang sudah dipertimbangkan dan ditolak.

- **Kenapa bukan native app dulu?** Web-based dipilih untuk iterasi cepat & validasi ide sebelum investasi ke native (Android/iOS). Native jadi fase lanjutan setelah fitur matang.
- **Kenapa bukan Spotify/YT Music "Car SDK"?** Car SDK itu native-only (Android Automotive), tidak ada versi web. Web Playback SDK dipakai sebagai gantinya, dengan keterbatasan yang sudah diketahui (lihat bagian 7).
- **Kenapa bukan OSRM demo server / raw OSM tile?** Server publik itu didesain "best effort demo", bukan untuk app yang dipakai harian — bisa diblokir tanpa peringatan. ORS & MapTiler dipilih karena punya ToS resmi untuk konsumsi app pihak ketiga dengan kuota jelas (ORS: 2.000 request/hari; MapTiler: 100rb request/bulan).
- **Kenapa Vercel, bukan VPS/self-host dari awal?** Frontend PWA tidak butuh compute berat. Vercel kasih HTTPS otomatis (wajib untuk Geolocation API) tanpa setup manual. Self-hosting baru relevan kalau nanti butuh OSRM/tile server sendiri (belum terjadi).
- **Kenapa dark-mode only?** Konteks pemakaian (dalam mobil, sering malam) membuat dark theme jadi default wajar; mengurangi kompleksitas development di v1.
- **Kenapa tidak ada sistem login terpusat?** App ini shell/launcher yang menampung service pihak ketiga; masing-masing (Spotify, YouTube) sudah punya sistem auth sendiri. Menambah layer auth sendiri di v1 dianggap over-engineering untuk kebutuhan personal saat ini.

---

## 7. Known Constraints & Risiko Teknis (harus dihandle di code, bukan diabaikan)

- **Autoplay audio dibatasi browser** — semua playback wajib dipicu dari user gesture eksplisit (tap), tidak boleh ada `.play()` otomatis saat komponen mount
- **Spotify Web Playback SDK di iOS Safari:**
  - Playback tidak otomatis lanjut setelah transfer device — perlu tombol "Aktifkan Player" eksplisit
  - `setVolume()` dilaporkan tidak reliable di iOS — arahkan user ke hardware volume button, jangan andalkan slider custom untuk kontrol volume real
- **YouTube Music tidak charger officially embeddable** — pendekatan: `youtube.com/embed/{videoId}` sebagai playback engine (video disembunyikan/di-styling), search & metadata terpisah lewat YouTube Data API
- **Geolocation wajib HTTPS** — otomatis terpenuhi di Vercel; untuk dev lokal wajib `mkcert`
- **ORS rate limit:** 40 request/menit, 2.000/hari — implementasikan guard/debounce di search & routing call supaya tidak spam request
- **Background audio di iOS PWA** — belum divalidasi penuh apakah audio tetap jalan saat layar mati/app di-background; ini exit criteria di Fase 1 (Radio), jangan asumsikan otomatis bekerja seperti native app

---

## 8. Dokumen Terkait

- `01-project-architecture.md` — arsitektur lengkap, tech stack, folder structure, roadmap
- `02-design-style-guide.md` — design tokens (warna, tipografi, spacing), komponen kunci
- `PRD-Modul-Maps-Navigation.md` — PRD detail modul Maps (task breakdown, acceptance criteria)

PRD modul lain (Radio, Spotify, YouTube Music) belum dibuat — akan menyusul dengan format serupa.

---

## 9. Cara Kerja dengan Project Ini (untuk AI Agent)

1. **Selalu cek scope di bagian 2** sebelum mengerjakan/menyarankan fitur — kalau di luar list "in scope", konfirmasi dulu ke user.
2. **Jangan re-evaluasi tech stack di bagian 4** kecuali user eksplisit minta pertimbangkan ulang — ini sudah melalui diskusi & riset, bukan pilihan sembarangan.
3. Kalau menemukan constraint baru yang belum tercatat di bagian 7, **tambahkan ke file ini**, jangan biarkan hilang di riwayat chat.
4. File PRD per-modul adalah sumber kebenaran untuk task breakdown detail — file ini (README) adalah ringkasan tingkat tinggi, bukan pengganti PRD modul.
5. Kalau ada konflik antara file ini dengan PRD modul spesifik, **PRD modul lebih spesifik dan lebih baru** — tapi laporkan konfliknya ke user, jangan diam-diam pilih salah satu.
