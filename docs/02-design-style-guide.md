# Design Style Guide — Car Auto Play (Web Version)

> **Update log:** Ditambahkan catatan penyesuaian untuk target device iPhone (fokus awal v1), sebelumnya asumsi desain berbasis head-unit besar generik.

## 0. Catatan Target Device (Update)

Desain awal mengasumsikan head-unit besar (referensi ~2560×1200, layar 10–13"). Untuk v1, device utama adalah **iPhone dipasang di dashboard**, dengan implikasi:

- **Jarak pandang kemungkinan lebih dekat** (~30–50cm, tergantung posisi mount) dibanding asumsi awal 50–80cm untuk head-unit besar. Prinsip "glanceable" & touch target besar tetap dipertahankan sebagai baseline aman, tapi font size bisa sedikit lebih fleksibel — tetap gunakan skala di bawah ini sebagai standar minimum, jangan diperkecil.
- **Rasio layar iPhone landscape** (~19.5:9) relatif dekat dengan referensi asli (~19:9-ish) — layout grid dasar di bagian 4 tetap berlaku, tidak perlu redesign besar.
- **Ukuran fisik layar lebih kecil** dari head-unit 10-13" — pastikan testing dilakukan di device asli (iPhone), bukan cuma preview di browser desktop dengan ukuran window disamakan, karena densitas piksel & jarak sentuh terasa beda.
- Prinsip **landscape-only, dark-mode only** (lihat bagian 8) tetap berlaku dan makin relevan karena iPhone dipakai sebagai pengganti CarPlay.

---

## 1. Prinsip Desain

Aplikasi ini digunakan **saat mengemudi** — prinsip utama bukan "indah dulu", tapi **aman & cepat dibaca**:

1. **Glanceable** — informasi penting harus tertangkap dalam <2 detik pandangan sekilas
2. **Target sentuh besar** — minimum 48×48px, idealnya 56×56px untuk aksi utama
3. **Kontras tinggi** — hindari abu-abu tipis di atas latar gelap
4. **Minim langkah** — maksimal 2 tap untuk aksi umum (play radio, cari tujuan)
5. **Konsisten** — pola navigasi sama di semua modul, tidak ada kejutan

---

## 2. Warna (Color Tokens)

### Palet dasar (dark theme, tema utama)
```css
--color-bg-primary: #0a0f0a;        /* latar utama, hampir hitam dengan tint hijau */
--color-bg-panel: #1a2419cc;        /* panel konten, semi-transparan hijau gelap */
--color-bg-sidebar: #0d120d;        /* sidebar kiri, lebih gelap dari panel */
--color-accent-primary: #34c759;    /* hijau terang — tombol aktif, nav terpilih */
--color-accent-blue: #4285f4;       /* biru — indikator peta/arah */
--color-accent-red: #ff3b30;        /* merah — YouTube Music, live indicator, alert */
--color-text-primary: #ffffff;      /* teks utama */
--color-text-secondary: #a0a8a0;    /* teks sekunder, min. kontras 4.5:1 */
--color-text-tertiary: #6b756b;     /* label kurang penting, gunakan hemat */
--color-border-subtle: #ffffff1a;   /* pemisah antar item list */
```

### Warna kontekstual per modul (brand third-party, jangan diubah)
```css
--color-spotify: #1DB954;
--color-youtube-music: #FF0000;
--color-radio: #F59E0B;   /* oranye/kuning */
```
> Catatan: `--color-podcast` dihapus dari palet aktif v1 karena modul Podcast di-defer ke luar scope (lihat `01-project-architecture.md`). Token bisa disimpan untuk referensi masa depan tapi tidak dipakai di komponen v1.

### Status
```css
--color-success: #34c759;
--color-warning: #ff9f0a;
--color-danger: #ff3b30;
--color-live: #ff3b30;    /* dot "LIVE" merah dengan pulse animation opsional — dipakai di modul Radio */
```

**Aturan kontras:** semua teks di atas `--color-bg-panel` harus lolos WCAG AA (4.5:1 untuk teks normal, 3:1 untuk teks besar/ikon).

---

## 3. Tipografi

```css
--font-family-base: -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif;
--font-family-mono: "SF Mono", monospace; /* untuk jam di status bar */

--font-size-xs: 14px;    /* label sekunder */
--font-size-sm: 16px;    /* body teks, subjudul */
--font-size-base: 18px;  /* body utama */
--font-size-lg: 22px;    /* judul kartu/list item */
--font-size-xl: 28px;    /* judul halaman */
--font-size-2xl: 36px;   /* jam status bar, angka besar */

--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
```

**Catatan:** `-apple-system`/`SF Pro Display` jadi pilihan font pertama yang sangat relevan sekarang karena target utama adalah iOS Safari — font ini native di WebKit, load instan tanpa perlu web font tambahan.

---

## 4. Spacing & Grid

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;

--radius-sm: 12px;
--radius-md: 20px;
--radius-lg: 28px;
--radius-full: 999px;
```

**Layout grid dasar (landscape):**
- Sidebar kiri: fixed width ~110–120px
- Panel utama: fleksibel, flex-grow
- Dock kanan (opsional): fixed width ~200px

> Untuk viewport iPhone landscape yang lebih sempit dari head-unit besar, pastikan komponen di dalam Panel Utama tetap punya breakpoint minimum agar tidak terlalu padat — test di lebar viewport iPhone terkecil yang jadi target (misal iPhone SE landscape) sebagai lower bound.

---

## 5. Komponen Kunci

### Sidebar Kiri (Left Nav)
- Ikon bulat untuk modul v1: **Navigasi, Musik, Radio** (Phone/Grid dihapus dari v1 sesuai scope baru — bisa jadi placeholder disabled atau dihapus sepenuhnya dari UI)
- Ikon aktif: latar hijau solid (`--color-accent-primary`), ikon lain: latar abu transparan
- Status bar di atas: jam (bold, besar), WiFi icon (Battery icon di-skip karena Battery Status API deprecated — lihat Constraint Teknis di project architecture)

### Panel Utama (Main Panel)
- Background: `--color-bg-panel` dengan `backdrop-filter: blur()` — didukung baik oleh Safari/WebKit
- Border-radius besar (`--radius-lg`)
- Padding internal: `--space-8`

### List Item (radio/lagu)
- Height minimum 72px per item
- Chevron `>` di kanan untuk item yang bisa di-drill-down
- Divider tipis (`--color-border-subtle`) antar item

### MiniPlayer (persist widget)
- Selalu terlihat saat audio aktif
- Kontrol minimum: play/pause, next, volume icon (untuk Spotify di iOS, pertimbangkan arahkan ke hardware volume button — lihat catatan Constraint Teknis)
- Album art thumbnail 56×56px

### Now Playing (full view)
- Album art besar di kiri
- Kontrol besar: prev/play/next (tombol play ~80px, hijau solid)
- Progress bar draggable, dengan timestamp kiri-kanan
- **Untuk Spotify:** tambahkan tombol "Aktifkan Player" eksplisit sesuai temuan quirk iOS (playback tidak auto-resume setelah transfer)

### Empty State
- Ikon outline besar
- Judul jelas ("No Favorites", "No Route Found")
- Deskripsi 1 baris + CTA button jika ada aksi
- Dipakai juga untuk kondisi rate-limit/error dari ORS atau MapTiler (misal "Peta sementara tidak tersedia")

### Status/Permission Banner
- Tombol CTA besar, warna hijau solid dengan teks hitam (kontras maksimal)
- Dipakai untuk permission Geolocation (granted/denied/pending)

---

## 6. Motion & Transisi

- Durasi transisi halaman: **150–200ms**, easing `ease-out`
- Hindari animasi dekoratif berlebihan (parallax, bounce) — fokus ke fungsi
- Loading state: skeleton screen sederhana, bukan spinner besar
- Album art dapat punya subtle scale/fade saat transisi lagu (opsional, non-blocking)

---

## 7. Ikonografi

- Icon set outline/line-style konsisten (Lucide Icons, Phosphor Icons)
- Ukuran standar: 24px (inline), 32px (nav), 40px+ (aksi utama)
- Ikon aktif/terpilih: filled version + warna accent; ikon tidak aktif: outline + abu-abu

---

## 8. Dark Mode Only (v1)

Tidak perlu light mode di tahap awal — konteks penggunaan (dalam kendaraan, sering malam hari) membuat dark theme jadi default wajar dan mengurangi kompleksitas development.

---

## 9. Aksesibilitas Tambahan

- Semua elemen interaktif harus punya `aria-label` yang jelas
- Focus ring terlihat jelas untuk navigasi non-touch (relevan jika nanti diperluas ke head-unit dengan rotary controller)
- Jangan gunakan warna sebagai satu-satunya penanda status (misal: tambahkan ikon/teks selain warna merah untuk "LIVE")
