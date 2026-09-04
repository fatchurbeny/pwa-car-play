# Development Checklist — Car Auto Play

Status terakhir: 4 September 2026

Legenda: `[x]` selesai · `[ ]` belum dikerjakan · `[-]` diblokir/menunggu keputusan atau akses

## Metode Pengujian

1. **UI dan unit test di Mac:** jalankan `npm run dev`. URL `http://localhost:5173` cukup untuk mengembangkan UI, routing, dan logika yang tidak membutuhkan GPS atau PWA iPhone.
2. **Fitur iPhone saat development:** jalankan Vite melalui Wi-Fi lokal dengan HTTPS (`mkcert`), buka alamat IP Mac dari iPhone, lalu percayai sertifikat lokal di iPhone. Jalur ini diperlukan untuk Geolocation dan pengujian PWA/audio sebelum deployment.
3. **Validasi akhir:** gunakan preview deployment Vercel melalui HTTPS untuk Add to Home Screen, mode standalone, GPS, dan pengujian di mobil. Preview Vercel tidak menggantikan uji jaringan lokal, tetapi tidak memerlukan sertifikat lokal pada iPhone.

## Fase 0 — Foundation / Shell

- [x] Inisialisasi React 18, TypeScript, Vite, Tailwind, ESLint
- [x] Routing untuk Maps, Musik, dan Radio
- [x] App shell dark mode dengan navigasi utama
- [x] PWA manifest dan service worker dasar
- [x] Uji install via Add to Home Screen di iPhone
- [x] Verifikasi mode fullscreen tanpa UI Safari di iPhone
- [x] Tambahkan status bar: jam dan status konektivitas
- [x] Validasi navigasi halaman pada iPhone landscape

## Fase 1 — Radio (Suara Surabaya)

- [x] Tetapkan URL stream Suara Surabaya yang aktif
- [x] Buat halaman dan player HTML5 Audio
- [x] Tambahkan Play/Pause dengan gesture user eksplisit
- [x] Tambahkan loading, error, dan reconnect stream
- [x] Integrasikan Media Session API
- [x] Uji audio saat layar terkunci dan PWA di-background pada iPhone

## Fase 2 — Maps / Navigation

### Setup dan data layer

- [-] Pilih provider tile final: MapTiler atau Stadia Maps
- [x] Daftar dan simpan API key provider tile
- [x] Daftar dan simpan API key OpenRouteService
- [x] Setup HTTPS development lokal dengan mkcert
- [x] Uji akses HTTPS dari iPhone melalui Wi-Fi yang sama
- [x] Tambahkan MapLibre GL JS
- [ ] Buat service ORS dengan error handling dan pembatasan request

### Peta, posisi, dan izin

- [x] Render peta dark dan center ke posisi awal user
- [x] Implementasi `watchPosition` untuk GPS real-time
- [ ] Tampilkan marker kendaraan dan rotasi heading
- [ ] Tampilkan status izin lokasi: pending, granted, denied

### Pencarian, rute, cuaca

- [ ] Buat pencarian tujuan dan daftar hasil
- [ ] Panggil ORS Directions dan gambar rute
- [ ] Tampilkan estimasi jarak dan waktu
- [ ] Tangani jaringan lemah serta batas kuota ORS
- [ ] Tambahkan widget Open-Meteo dan refresh berkala
- [ ] Tambahkan zoom, recenter, loading/error state, dan atribusi lisensi

### Deployment dan uji lapangan

- [x] Hubungkan proyek ke Vercel
- [ ] Konfigurasi environment variables Vercel
- [ ] Uji preview deployment dan Geolocation pada iPhone
- [ ] Uji langsung di mobil: akurasi GPS, delay, sinyal, battery drain
- [ ] Pantau kuota ORS dan tile provider

## Fase 3 — Spotify

- [-] Buat Spotify Developer app, OAuth redirect URI, dan siapkan akun Premium
- [ ] Integrasikan OAuth dan Web Playback SDK
- [ ] Tambahkan alur "Aktifkan Player" untuk iOS
- [ ] Tambahkan play, pause, skip, dan pencarian dasar
- [ ] Tambahkan fallback deep-link ke aplikasi Spotify
- [ ] Uji autoplay restriction dan kontrol volume iOS

## Fase 4 — YouTube Music

- [-] Buat YouTube Data API key
- [ ] Integrasikan YouTube Data API untuk pencarian/metadata
- [ ] Integrasikan YouTube IFrame Player API
- [ ] Buat UI Now Playing
- [ ] Tambahkan fallback deep-link ke YouTube Music
- [ ] Uji playback dan pembatasan embed di iOS

## Fase 5 — Integrasi dan Polish

- [ ] Atur audio focus saat berpindah Radio, Spotify, dan YouTube Music
- [ ] Satukan kontrol Media Session untuk setiap sumber audio
- [ ] Tambahkan Sentry untuk error tracking
- [ ] Uji regresi PWA, koneksi lemah, dan perubahan orientasi
- [ ] Uji perjalanan nyata tanpa bug penghambat
