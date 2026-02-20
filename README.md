# HOSTING - Website Layanan Hosting Modern

Website lengkap untuk bisnis hosting dengan fitur modern, integrasi payment gateway, dan admin panel dengan keamanan tingkat tinggi.

## Fitur Utama

### 1. Frontend Website
- **Desain Modern**: Dark mode dengan glassmorphism effect
- **Responsive**: Mobile-friendly
- **Quick Buy**: Beli cepat tanpa ribet
- **Product Catalog**: VPS, Panel Pterodactyl, Jasa IT (30+ produk)
- **Shopping Cart**: Keranjang belanja dengan manajemen stok
- **Testimonials**: Sistem testimoni pelanggan
- **Live Chat**: AI Chatbot dengan OpenAI
- **FAQ Section**: Pertanyaan umum

### 2. Payment Integration (Pakasir)
- **QRIS Payment**: Pembayaran via QRIS
- **Virtual Account**: BCA, BNI, Mandiri, dll
- **Auto Stock Reduction**: Stok berkurang otomatis setelah pembayaran
- **Promo Code**: Sistem kode promo (contoh: BESAR20)

### 3. Admin Panel (Keamanan Tinggi)
- **Keamanan**:
  - SHA256 password hashing
  - Session timeout (1 jam)
  - Login attempt limiter (5x gagal = lockout 15 menit)
  - IP fingerprint tracking
  - Auto logout
- **Dashboard**: Statistik penjualan real-time
- **Product Management**: Tambah, edit, hapus produk
- **Stock Management**: Kelola stok dengan restock
- **Order Management**: Lihat dan kelola pesanan
- **Testimonial Management**: Moderasi testimoni
- **Customer Management**: Data pelanggan
- **Settings**: Konfigurasi Pakasir, OpenAI, Pterodactyl (PTLA & PTLC)

### 4. Produk Lengkap (30+)

#### VPS Cloud (7 produk)
- VPS BASIC 1GB - Rp 15.000
- VPS BASIC 2GB - Rp 25.000
- VPS STANDARD 2GB - Rp 30.000
- VPS STANDARD 4GB (Best Seller) - Rp 35.000
- VPS HIGH 8GB - Rp 45.000
- VPS PRO 16GB - Rp 70.000
- VPS ENTERPRISE 32GB - Rp 120.000

#### Panel Pterodactyl (15 produk)
- Panel 1GB-10GB HEMAT (Rp 1.000 - Rp 10.000)
- Panel UNLIMITED - Rp 15.000
- RESELLER PANEL - Rp 25.000
- ADMIN PANEL - Rp 35.000
- OWNER PANEL - Rp 50.000
- PARTNER PANEL - Rp 75.000

#### Jasa & Addons (8 produk)
- Jasa Install Panel - Rp 15.000
- Bash Autoscript - Rp 20.000
- Jasa Rename Script - Rp 25.000
- Fix Error Script - Rp 10.000
- Jasa Buat Website - Rp 75.000
- Jasa Buat Bot WA - Rp 50.000
- Jasa Optimasi VPS - Rp 20.000
- Jasa Backup & Restore - Rp 15.000

## Struktur Folder

```
hosting/
├── index.html              # Halaman utama
├── admin.html              # Admin panel
├── payment-success.html    # Halaman sukses pembayaran
├── terms.html              # Syarat & ketentuan
├── privacy.html            # Kebijakan privasi
├── styles.css              # Styles utama
├── admin-styles.css        # Styles admin
├── scripts.js              # JavaScript utama
├── admin.js                # JavaScript admin
├── api/
│   └── openai.js           # API endpoint OpenAI
├── assets/
│   └── alfa.jpg            # Logo
└── README.md               # Dokumentasi
```

## Cara Install

### 1. Local Development
```bash
cd hosting
python -m http.server 8000
```

### 2. Deploy ke Vercel
```bash
npm i -g vercel
vercel
```

### 3. Konfigurasi

#### Konfigurasi Pakasir
1. Daftar di https://app.pakasir.com
2. Buat project baru
3. Catat **Slug** dan **API Key**
4. Login ke Admin Panel > Pengaturan > Pakasir

#### Konfigurasi OpenAI
1. Daftar di https://platform.openai.com
2. Buat API Key baru
3. Login ke Admin Panel > Pengaturan > OpenAI

#### Konfigurasi Pterodactyl
1. Masuk ke Panel Admin Pterodactyl
2. Buat Application API Key (PTLA)
3. Buat Client API Key (PTLC)
4. Login ke Admin Panel > Pengaturan > Pterodactyl
5. Masukkan URL Panel, PTLA, dan PTLC


## Keamanan Admin Panel

1. **Password Hashing**: SHA256
2. **Session Timeout**: 1 jam (dapat diubah)
3. **Login Attempts**: Maksimal 5x, lockout 15 menit
4. **IP Tracking**: Client fingerprint
5. **Auto Logout**: Timer visible di sidebar

## Fitur Stok

### Jenis Produk
1. **VPS & Panel**: Memiliki stok terbatas
2. **Jasa/Addons**: Stok unlimited (999)

### Manajemen Stok
- Stok berkurang otomatis saat checkout
- Notifikasi stok menipis (≤ 5)
- Tombol restock di admin panel
- Produk habis tidak bisa dibeli

## Integrasi Payment Gateway

### Pakasir URL Integration
```
https://app.pakasir.com/pay/{slug}/{amount}?order_id={order_id}
```

## Support

- WhatsApp: +62 822-2676-9163
- Email: sanzbot938@gmail.com

## Lisensi

© 2026 HOSTING. All rights reserved.

## Changelog

### v3.0.0 (2026-02-19)
- Rombak total UI lebih modern
- Glassmorphism design
- Quick buy feature
- 30+ produk lengkap
- Keamanan admin ditingkatkan
- PTLA & PTLC dipisah
- Promo code system
- Customer management
- FAQ section

### v2.0.0 (2026-02-19)
- Redesign UI modern
- Integrasi Pakasir
- OpenAI chatbot
- Admin panel dashboard
- Rate limiting

### v1.0.0 (2025)
- Initial release
- Basic product catalog
- Manual payment
e
- Basic product catalog
- Manual payment (QRIS)
- Simple admin panel
