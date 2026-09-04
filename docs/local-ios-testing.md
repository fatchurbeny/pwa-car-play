# Pengujian Lokal di iPhone

## Menjalankan aplikasi

1. Hubungkan Mac dan iPhone ke Wi-Fi yang sama.
2. Jalankan `npm run dev` dari root proyek.
3. Di iPhone, buka `https://fatchurbenys-MacBook-Air.local:5173`.

Vite menggunakan HTTPS dan menerima koneksi jaringan lokal. Jika alamat `.local` tidak dapat ditemukan, gunakan `https://192.168.18.184:5173`. IP ini dapat berubah saat jaringan berubah; buat ulang sertifikat dengan IP baru sebelum memakainya. Pastikan kedua perangkat berada pada jaringan yang sama dan tidak memakai jaringan tamu/VPN yang mengisolasi perangkat.

## Mempercayai sertifikat di iPhone

1. Di Mac, jalankan `mkcert -CAROOT` untuk menemukan folder CA.
2. Kirim file `rootCA.pem` dari folder tersebut ke iPhone melalui AirDrop.
3. Instal profil sertifikat dari Settings di iPhone.
4. Aktifkan kepercayaan penuh melalui **Settings → General → About → Certificate Trust Settings**.

Hanya kirim `rootCA.pem`. Jangan pernah membagikan `rootCA-key.pem` atau `.certs/local-key.pem`.
