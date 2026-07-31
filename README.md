# 🚀 SmartUMKM — Platform AI Pengelola & Strategi Bisnis UMKM

**SmartUMKM** adalah platform manajemen bisnis serba-ada yang dirancang khusus untuk membantu pelaku usaha mikro, kecil, dan menengah (UMKM) serta calon pengusaha pemula di Indonesia. Menggabungkan pencatatan inventaris & transaksi harian dengan kecerdasan buatan (**Groq SDK / Llama 3.3 70B**), SmartUMKM mampu memberikan prediksi tren, saran bundling, hingga ide bisnis secara otomatis.

---

## 🌟 Fitur Utama

Sesuai dengan alur kebutuhan UMKM dari skala nol hingga berkembang, SmartUMKM memiliki 8 modul utama:

1. **🏠 Onboarding & Pilihan Alur**  
   Pengalaman awal dinamis yang memisahkan alur untuk *Pemula (Belum Punya Usaha)* dan *Pemilik Usaha*.

2. **🚀 Ide Usaha Berbasis AI (`/ideas`)**  
   Generator ide bisnis otomatis berdasarkan modal awal, minat/kategori (F&B, IT/Software, Fashion, dll.), dan lokasi usaha lengkap dengan estimasi modal & analisis kompetitor.

3. **📊 Dashboard Utama (`/dashboard`)**  
   Pusat kendali ringkasan performa bisnis: Total Pemasukan, Pengeluaran, Laba/Rugi, Total Stok, grafik tren penjualan, dan Notifikasi Pintar.

4. **📦 Manajemen Produk & Stok (`/products`)**  
   Kelola inventaris barang (CRUD), kategori produk, kalkulasi otomatis margin/laba per unit (Harga Jual vs HPP), serta indikator visual status stok (*Aman*, *Menipis*, *Habis*).

5. **💳 Transaksi & Keuangan (`/finance`)**  
   Pencatatan arus kas operasional harian (Pemasukan & Pengeluaran) beserta Laporan Otomatis *Cashflow* dan Laba Rugi.

6. **📈 Analisis & Prediksi AI (`/analytics`)**  
   Big Data & AI Analytics untuk memprediksi potensi *Top Seller vs Slow Moving*, analisis waktu penjualan terbaik (*Peak Hours/Days*), dan prediksi tren pasar musiman.

7. **💡 Strategi & Rekomendasi AI (`/insights`)**  
   Konsultan AI pribadi yang memberikan saran tindakan nyata: ide paket bundling produk, strategi promo/diskon, dan kalkulasi penentuan harga optimal.

8. **⚙️ Pengaturan Toko (`/settings`)**  
   Konfigurasi profil usaha (Nama Toko, Kategori, Lokasi) dan pengaturan integrasi API Key AI.

---

## 🛠️ Tech Stack & Arsitektur

* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL & Authentication)
* **AI Engine:** [Groq SDK](https://groq.com/) (`llama-3.3-70b-versatile`)
* **Deployment:** [Vercel](https://vercel.com/)

---

## ⚡ Panduan Instalasi Lokal (Getting Started)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda:

### 1. Clone Repository
```bash
git clone [https://github.com/username-kamu/smart-umkm.git](https://github.com/username-kamu/smart-umkm.git)
cd smart-umkm
```
### 2. Install Dependencies
```Bash
npm install
```
# atau
```
yarn install
```
# atau
```
pnpm install
```
### 3. Konfigurasi Environment Variables (.env.local)
Buat file .env.local di root direktori proyek dan tambahkan API Keys berikut:
Cuplikan kode
# Supabase Configuration
```NEXT_PUBLIC_SUPABASE_URL=[https://your-supabase-project-url.supabase.co](https://your-supabase-project-url.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
# Groq AI Configuration
```
NEXT_PUBLIC_GROQ_API_KEY=your-groq-api-key
```
### 4. Jalankan Development Server
```
npm run dev
```
Buka http://localhost:3000 di browser Anda untuk melihat hasilnya.

### 📝 Lisensi
Proyek ini dibuat untuk tujuan portofolio dan edukasi. Dikembangkan oleh Emil Prayoga Albani.
