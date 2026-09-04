# Project Architecture — Car Auto Play (Web Version)

> **Update log:** Direvisi berdasarkan diskusi brainstorm lanjutan — perubahan utama: target platform diperjelas (iPhone/Safari PWA sebagai fokus awal), stack Maps difinalkan, scope v1 dipersempit, deployment dikunci ke Vercel.

## 1. Ringkasan Proyek

Aplikasi web yang mereplikasi pengalaman antarmuka "Car Auto Play" (mirip CarPlay) — dibuat karena mobil pribadi tidak mendukung Apple CarPlay bawaan. Terdiri dari modul Navigasi/Maps, Musik (Spotify, YouTube Music), dan Radio untuk v1.

**Target platform:**
- **Fokus awal:** iPhone (Safari/WebKit) via PWA — install lewat "Add to Home Screen", landscape-only, dipasang di dashboard sebagai pengganti CarPlay
- **Target jangka panjang:** perluasan ke head-unit Android aftermarket & tablet/HP DIY di dashboard — arsitektur harus tetap fleksibel terhadap resolusi & rasio layar berbeda meski development awal spesifik ke iPhone
- **Login:** Tidak ada sistem akun terpusat. App berfungsi sebagai *shell/launcher* — autentikasi terjadi per-service (Spotify punya login sendiri, YouTube Music via YouTube Data API, dst)

---

## 2. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | React 18 + TypeScript (Vite) | Cepat, ekosistem luas, cocok untuk PWA |
| Routing | React Router v6 | Transisi antar modul (Maps/Music/Radio) |
| State management | Zustand | Ringan, cocok untuk state global (now playing, koneksi, lokasi) |
| Styling | Tailwind CSS + CSS Variables (theming) | Cepat iterasi, mudah bikin dark theme konsisten |
| **Maps rendering** | **MapLibre GL JS** *(final, bukan Mapbox)* | Open-source, ringan, dark style kustom |
| **Map tiles** | **MapTiler** (Free tier: 100rb request/bulan, non-commercial) — alternatif: **Stadia Maps** (2.500 view/hari) | Proper ToS untuk app pihak ketiga, bukan raw OSM tile server yang cuma "best effort" |
| **Routing/Directions** | **OpenRouteService (ORS)** — Free tier: 2.000 request/hari, tanpa kartu kredit | Berbasis OSM, ToS jelas, jauh lebih reliable dari OSRM demo server publik |
| Audio | Web Audio API + Media Session API | Kontrol playback native-like (lock screen, tombol hardware) |
| **Musik — Spotify** | Web Playback SDK (resmi disupport iOS Safari, dengan quirks tertentu) | Lihat detail di bagian Constraint Teknis |
| **Musik — YouTube Music** | YouTube IFrame Player API + YouTube Data API (search/metadata) | Tidak ada SDK resmi "YouTube Music" — dibangun manual di atas API video YouTube biasa |
| PWA | Vite PWA Plugin (Workbox) | Offline caching, installable |
| State persistence | IndexedDB (via `idb`) | Cache favorit radio, riwayat rute |
| **Deployment** | **Vercel** *(final)* | Auto HTTPS (wajib untuk Geolocation API), zero-config Vite, preview deployment per branch untuk testing langsung di iPhone |
| Testing | Vitest + React Testing Library | Unit & komponen |
| Lint/Format | ESLint + Prettier | Konsistensi kode |

> **Catatan arsitektur deployment:** Vercel hanya cocok untuk frontend/serverless. Kalau nanti butuh self-hosting (misal OSRM sendiri di masa depan), itu perlu host terpisah (Fly.io/Railway/VPS) — bukan pengganti Vercel, melainkan tambahan.

---

## 3. Struktur Folder (usulan)

```
src/
├── app/
│   ├── AppShell.tsx          # Layout 3 zona: LeftNav, MainPanel, RightDock
│   ├── router.tsx
│   └── providers/            # Context: Audio, Location, Connectivity
├── modules/
│   ├── maps/
│   ├── music/
│   │   ├── spotify/
│   │   ├── youtube-music/
│   │   └── player/           # MiniPlayer & NowPlaying (shared)
│   ├── radio/
│   └── launcher/              # App grid (jika masih relevan di v1)
├── components/                # Komponen UI reusable (Button, Card, StatusBar)
├── hooks/                      # useGeolocation, useMediaSession, useNetworkStatus
├── stores/                     # Zustand stores
├── services/                   # API clients (ORS, MapTiler, Spotify SDK, YouTube API)
├── styles/                     # tokens.css, globals.css
└── types/
```

> **Catatan:** folder `podcast/` dan `phone/` dihapus dari struktur v1 — kedua modul ini di-*defer* ke luar scope v1 (lihat bagian Modul & Prioritas).

---

## 4. Modul & Prioritas Pengembangan (v1)

Scope v1 dipersempit ke **3 modul inti**: Navigation, Music (Spotify + YouTube Music), Radio. Podcast & Phone/Contacts di-*defer* ke v1.1/v2.

### Fase 0 — Foundation / Shell
- [ ] AppShell (LeftNav, MainPanel), routing antar modul dengan transisi halus
- [ ] Setup PWA (manifest, service worker basic, Add to Home Screen flow di iOS)
- [ ] Status bar: jam real-time, indikator WiFi/koneksi (Battery API deprecated di banyak browser — siapkan fallback tanpa indikator baterai akurat)

**Exit criteria:** PWA installable di iPhone, fullscreen tanpa Safari UI, navigasi antar halaman placeholder mulus.

### Fase 1 — Radio (Suara Surabaya)
- [ ] Player `<audio>` HTML5 + Media Session API
- [ ] Reconnect otomatis saat stream putus, loading/error state
- [ ] Validasi behavior background audio di iOS Safari

**Exit criteria:** Radio jalan stabil, tahan gangguan sinyal, kontrol dasar berfungsi.

### Fase 2 — Maps/Navigation
- [ ] MapLibre GL JS + MapTiler (tile) + ORS (routing)
- [ ] Geolocation real-time + marker arah kendaraan
- [ ] Search destination, rute dasar, weather widget (Open-Meteo)

**Exit criteria:** Lihat detail lengkap di `PRD-Modul-Maps-Navigation.md`.

### Fase 3 — Spotify
- [ ] OAuth + Web Playback SDK, dengan handling eksplisit untuk quirks iOS (lihat Constraint Teknis)
- [ ] Fallback deep-link (`spotify://`) kalau SDK gagal

**Exit criteria:** Login, search, play/pause/skip berfungsi meski dengan keterbatasan iOS yang diketahui.

### Fase 4 — YouTube Music
- [ ] YouTube Data API (search/metadata) + IFrame Player API (playback engine)
- [ ] UI custom "Now Playing" di atas API video biasa
- [ ] Fallback deep-link ke app YouTube Music native

**Exit criteria:** Search & play dasar berfungsi (fitur playlist/library belum selengkap Spotify).

### Fase 5 — Integrasi & Polish
- [ ] Audio focus/transition antar modul (Spotify ↔ YouTube Music ↔ Radio)
- [ ] Test real-world di mobil (bukan simulator)

**Exit criteria:** Dipakai untuk perjalanan nyata tanpa app-breaking bug.

### Out of Scope v1 (masuk v1.1/v2)
- Podcast (Podcast Index API / Listen Notes API — dievaluasi ulang nanti)
- Phone/Contacts (Google People API — dievaluasi ulang nanti)
- Turn-by-turn voice guidance, offline map caching penuh, voice search

---

## 5. Integrasi API Eksternal (Update)

| Kebutuhan | Layanan | Catatan |
|---|---|---|
| Radio | Radio Browser API (gratis) | Tidak butuh API key |
| Map tiles | **MapTiler** (utama) / Stadia Maps (alternatif) | Free tier non-commercial, proper ToS |
| Routing | **OpenRouteService** | 2.000 request/hari, 40/menit — jauh cukup untuk 1 kendaraan harian |
| Musik streaming — Spotify | Spotify Web Playback SDK | Wajib Spotify Premium; ada quirks khusus iOS (volume control, autoplay) |
| Musik streaming — YouTube Music | YouTube Data API + IFrame Player API | Tidak ada SDK resmi "YouTube Music"; dibangun manual |
| Cuaca | Open-Meteo | Gratis tanpa API key |
| ~~Kontak~~ | ~~Google People API~~ | **Di-defer**, di luar scope v1 |
| ~~Podcast~~ | ~~Podcast Index API / Listen Notes~~ | **Di-defer**, di luar scope v1 |

---

## 6. Constraint Teknis Penting (Update)

- **Platform utama: iOS Safari/WebKit** — semua asumsi teknis harus divalidasi khusus di WebKit, jangan asumsikan behavior sama dengan Chrome
- **Autoplay audio** dibatasi browser (butuh gesture user pertama) — desain UI harus selalu ada tap eksplisit, tidak boleh ada auto-play saat buka halaman
- **Kontrol hardware mobil** (tombol volume/skip) hanya bisa disadap lewat **Media Session API** — pastikan semua modul audio pakai API ini secara konsisten
- **Geolocation** wajib HTTPS — otomatis terpenuhi di Vercel production; untuk dev lokal pakai `mkcert`
- **Spotify Web Playback SDK di iOS:** playback tidak otomatis lanjut setelah transfer device (butuh interaksi user eksplisit); `setVolume` dilaporkan tidak reliable di browser iOS — arahkan user pakai hardware volume button, bukan slider custom
- **YouTube Music tidak punya SDK publik resmi** — pendekatan: YouTube IFrame Player API (`youtube.com/embed`) sebagai playback engine + YouTube Data API untuk search/metadata, UI "Now Playing" dibangun manual
- **Tile/routing server publik "demo" (OSRM/raw OSM tile) TIDAK dipakai** — sudah diganti ke ORS + MapTiler karena punya ToS proper untuk app pihak ketiga, bukan sekadar best-effort tanpa jaminan
- **Battery Status API** sudah deprecated/dibatasi di banyak browser modern — siapkan fallback UI tanpa indikator baterai akurat

---

## 7. Deployment (Final)

- **Hosting frontend:** Vercel — auto HTTPS, zero-config Vite, preview deployment per branch/PR (berguna untuk test langsung di iPhone tiap ada perubahan)
- **Environment variables:** disimpan di Vercel dashboard (API key MapTiler, ORS, Spotify, YouTube Data API) — tidak pernah di-commit ke repo
- **Self-hosting:** tidak diperlukan di v1 karena semua service pihak ketiga (ORS, MapTiler) sudah proper hosted API dengan free tier. Revisit hanya jika nanti komersial & butuh kontrol penuh/skala besar
- **Monitoring:** Sentry untuk error tracking (penting karena dipakai saat mengemudi — bug harus cepat terdeteksi)
