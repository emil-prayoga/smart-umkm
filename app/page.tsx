import Link from "next/link";
import TrustMarquee from "@/components/TrustMarquee";
import DataGrowthStory from "@/components/DataGrowthStory";
import {
  DashboardScrollFrame,
  FeatureStoryList,
  HeroHeadline,
  HeroScrollVisual,
  ScrollColorHeading,
  StepStoryList,
} from "@/components/LandingMotion";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Lightbulb,
  Menu,
  MessageSquareText,
  MousePointer2,
  Package,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="landing">
        <header className="landing-header">
        <Link href="/" className="brand" aria-label="Smart UMKM AI, beranda">
          <span className="brand-mark"><Store size={19} strokeWidth={2.3} /></span>
          <span>smartumkm<span className="brand-ai">.ai</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <a href="#beranda">Beranda</a>
          <a href="#manfaat">Manfaat</a>
          <a href="#fitur">Fitur</a>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#produk">Produk</a>
        </nav>
        <div className="header-actions">
          <Link className="login-link" href="/login">Login</Link>
          <Link className="signup-link" href="/register">Daftar</Link>
        </div>
        <details className="mobile-nav">
          <summary aria-label="Buka navigasi"><Menu size={23} /></summary>
          <nav aria-label="Navigasi mobile"><a href="#manfaat">Manfaat</a><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#produk">Produk</a><Link className="login-link" href="/login">Login</Link><Link className="mobile-signup-link" href="/register">Daftar</Link></nav>
        </details>
      </header>

      <main>
        <section className="hero landing-wrap" id="beranda">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Teman tumbuh untuk usaha Indonesia</p>
            <HeroHeadline />
            <p className="hero-description">Urus bisnis sehari-hari dengan lebih ringan. Smart UMKM AI membantu Anda membaca angka, mengelola produk, dan menemukan langkah usaha berikutnya.</p>
            <div className="hero-actions">
              <Link className="button button-gold" href="/demo">Jelajahi demo <ArrowRight size={17} /></Link>
              <a className="text-link how-link" href="#cara-kerja">Kenali cara kerjanya <ArrowDownRight size={16} /></a>
            </div>
            <div className="hero-proof"><span className="proof-stamp"><Check size={14} /></span><span>Dibuat untuk ritme usaha yang nyata</span></div>
          </div>

          <HeroScrollVisual>
            <div className="art-note"><Sparkles size={15} /> Dari catatan jadi keputusan</div>
            <div className="dashboard-window">
              <div className="mock-topbar"><div className="mock-brand"><span className="mock-logo"><Store size={13} /></span> ruangusaha</div><span className="mock-date">Ringkasan usaha <span>⌄</span></span><span className="mock-avatar">R</span></div>
              <div className="mock-content">
                <div className="mock-welcome"><div><span className="mock-kicker">SENIN, 12 MEI 2025</span><h2>Selamat pagi, Rani.</h2><p>Ini yang bergerak di usahamu hari ini.</p></div><div className="mock-weather">☀️ <span>Cerah untuk bertumbuh</span></div></div>
                <div className="mock-stats">
                  <div className="mock-stat"><span>Penjualan hari ini</span><strong>Rp 1.840.000</strong><small className="stat-up">↗ 12,8% <i>dari kemarin</i></small></div>
                  <div className="mock-stat"><span>Pesanan masuk</span><strong>28 <small>pesanan</small></strong><small>6 menunggu diproses</small></div>
                  <div className="mock-stat"><span>Produk aktif</span><strong>46 <small>produk</small></strong><small>4 stok mulai menipis</small></div>
                </div>
                <div className="mock-lower">
                  <div className="mock-chart"><div className="mock-chart-heading"><div><span>Penjualan mingguan</span><b>Rp 8,6 jt</b></div><span className="chart-pill">7 hari</span></div><div className="chart-area"><div className="chart-grid"><i /><i /><i /></div><svg viewBox="0 0 420 112" preserveAspectRatio="none" aria-label="Grafik penjualan meningkat"><path d="M0 89 C35 80 42 91 73 66 S115 73 145 56 S185 66 218 43 S255 56 288 34 S330 44 355 22 S390 31 420 9" fill="none" stroke="#174A3A" strokeWidth="3" /><path d="M0 89 C35 80 42 91 73 66 S115 73 145 56 S185 66 218 43 S255 56 288 34 S330 44 355 22 S390 31 420 9 L420 112 L0 112Z" fill="url(#chartFill)" opacity=".18" /><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#174A3A" /><stop offset="1" stopColor="#174A3A" stopOpacity="0" /></linearGradient></defs></svg></div><div className="chart-days"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div></div>
                  <div className="mock-insight"><span className="insight-icon"><Lightbulb size={15} /></span><span className="mock-kicker">SARAN HARI INI</span><b>Paket bundling bisa bantu gerakkan stok kopi.</b><span className="insight-action">Lihat saran <ArrowRight size={12} /></span></div>
                </div>
              </div>
            </div>
            <div className="art-caption"><span>01 / 04</span><span>Contoh tampilan ruang usahamu</span><span className="caption-rule" /></div>
            <div className="floating-tag"><span className="floating-icon"><BarChart3 size={16} /></span><span><b>Penjualan naik</b><small>Usaha makin terbaca</small></span></div>
          </HeroScrollVisual>
        </section>

        <section className="trust-strip" aria-label="Kategori usaha yang kami dukung">
          <div className="landing-wrap trust-inner">
            <TrustMarquee />
          </div>
        </section>

        <section className="problem-section landing-wrap" id="manfaat">
          <div className="section-index">Agar usaha punya ruang untuk maju</div>
          <div className="problem-grid"><ScrollColorHeading /><div className="problem-copy"><p>Catatan penjualan ada di mana-mana. Stok baru ketahuan habis saat dicari. Ide promosi datang ketika waktu sedang sempit.</p><p>Yang dibutuhkan bukan pekerjaan tambahan. Anda butuh gambaran yang lebih jelas untuk mengambil keputusan.</p><a className="text-link" href="#solusi">Lihat pendekatan kami <ArrowDownRight size={16} /></a></div></div>
          <div className="problem-rail"><div><span className="rail-icon"><Package size={18} /></span><b>Stok sulit dipantau</b><span>Barang ada, tapi catatannya tertinggal.</span></div><div><span className="rail-icon"><CircleDollarSign size={18} /></span><b>Angka terasa terpisah</b><span>Penjualan belum bercerita banyak.</span></div><div><span className="rail-icon"><MessageSquareText size={18} /></span><b>Promosi sering tertunda</b><span>Waktu habis untuk urusan harian.</span></div></div>
        </section>

        <section className="solution-section" id="solusi"><div className="landing-wrap solution-inner"><div className="solution-copy"><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Lebih jelas, satu langkah sekali</p><h2>Kenali usaha Anda.<br />Tentukan langkah <em>selanjutnya.</em></h2><p>Satukan catatan penting dan biarkan AI membantu menemukan pola. Anda tetap memegang keputusan, dengan konteks yang lebih lengkap.</p><Link className="button button-gold" href="/demo">Lihat demo produk <ArrowRight size={17} /></Link></div><div className="solution-art"><DataGrowthStory /></div></div></section>

        <section className="features-section landing-wrap" id="fitur"><div className="features-heading"><div><div className="section-index">Alat yang bekerja bersama</div><h2>Lebih sedikit menebak.<br /><em>Lebih banyak melangkah.</em></h2></div><p>Hal penting untuk menjalankan usaha, dirapikan dalam satu ruang kerja yang mudah dipahami.</p></div><FeatureStoryList /></section>

        <section className="steps-section" id="cara-kerja"><div className="landing-wrap steps-inner"><div className="steps-intro"><div className="section-index section-index-light">Mulai dari yang sudah Anda tahu</div><h2>Tiga langkah.<br /><em>Satu usaha lebih tertata.</em></h2><p>Anda tidak perlu menjadi ahli data untuk mulai memahami bisnis sendiri.</p></div><StepStoryList /></div></section>

        <section className="preview-section landing-wrap" id="produk"><div className="preview-top"><div><div className="section-index">Ruang kendali usahamu</div><h2>Semua bergerak,<br />dalam <em>satu pandangan.</em></h2></div><p>Contoh tampilan dashboard yang merangkum hal penting tanpa membuat Anda tersesat dalam angka.</p></div><DashboardScrollFrame><div className="preview-sidebar"><div className="preview-logo"><span className="mock-logo"><Store size={13} /></span> ruangusaha</div><div className="preview-menu active"><BarChart3 size={15} /> Ringkasan</div><div className="preview-menu"><Package size={15} /> Produk</div><div className="preview-menu"><CircleDollarSign size={15} /> Keuangan</div><div className="preview-menu"><TrendingUp size={15} /> Analisis AI</div><div className="preview-menu"><Lightbulb size={15} /> Ide promosi</div><div className="preview-store"><span>RA</span><div><b>Rani Apriani</b><small>Kedai Rasa</small></div></div></div><div className="preview-main"><div className="preview-toolbar"><div><span className="mock-kicker">RINGKASAN USAHA</span><h3>Usahamu minggu ini</h3></div><span className="preview-period">12 — 18 Mei 2025⌄</span></div><div className="preview-cards"><div><span>Total penjualan</span><b>Rp 8.640.000</b><small>↗ 12,8% dibanding minggu lalu</small></div><div><span>Transaksi</span><b>146</b><small>+18 transaksi minggu ini</small></div><div><span>Rata-rata pesanan</span><b>Rp 59.178</b><small>Nilai per transaksi</small></div></div><div className="preview-bottom"><div className="preview-graph"><div><b>Performa penjualan</b><span>7 hari terakhir</span></div><svg viewBox="0 0 680 142" preserveAspectRatio="none" aria-label="Performa penjualan selama tujuh hari"><path d="M0 120 C45 108 54 115 96 92 S157 107 194 79 S250 89 292 60 S349 80 387 53 S447 67 482 41 S534 58 573 30 S624 40 680 12" fill="none" stroke="#174A3A" strokeWidth="3" /><path d="M0 120 C45 108 54 115 96 92 S157 107 194 79 S250 89 292 60 S349 80 387 53 S447 67 482 41 S534 58 573 30 S624 40 680 12 L680 142 L0 142Z" fill="#174A3A" opacity=".08" /></svg><div className="preview-days"><span>Senin</span><span>Selasa</span><span>Rabu</span><span>Kamis</span><span>Jumat</span><span>Sabtu</span><span>Minggu</span></div></div><div className="preview-ai"><span className="insight-icon"><Sparkles size={15} /></span><span className="mock-kicker">INSIGHT AI</span><b>Minuman dingin paling laris menjelang siang.</b><p>Coba siapkan stok lebih awal untuk jam ramai.</p><span className="insight-action">Buka analisis <ArrowRight size={12} /></span></div></div></div></DashboardScrollFrame><p className="preview-caption"><MousePointer2 size={14} /> Tampilan ilustratif. Data usaha Anda akan tampil setelah mulai menggunakan produk.</p></section>

        <section className="closing-section"><div className="landing-wrap closing-inner"><span className="closing-spark"><Sparkles size={22} /></span><div><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Langkah baik dimulai dari yang jelas</p><h2>Beri usahamu<br />ruang untuk <em>bertumbuh.</em></h2><p>Mulai kenali apa yang terjadi di balik usaha Anda hari ini.</p><Link className="button button-gold" href="/demo">Coba demo Smart UMKM AI <ArrowRight size={17} /></Link></div><div className="closing-mark">SM<br /><span>AI</span></div></div></section>
      </main>

      <footer className="landing-footer" id="navigasi"><div className="landing-wrap footer-top"><Link href="/" className="brand footer-brand"><span className="brand-mark"><Store size={18} /></span><span>smartumkm<span className="brand-ai">.ai</span></span></Link><p>Teman berpikir untuk usaha yang terus bergerak.</p><div className="footer-links"><a href="#manfaat">Manfaat</a><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><Link href="/demo">Coba demo</Link></div></div><div className="landing-wrap footer-bottom"><span>© 2025 Smart UMKM AI</span><span>Dibuat untuk usaha Indonesia <span className="footer-heart">✳</span></span><span><Link href="/login">Login</Link><Link href="/register">Daftar</Link></span></div></footer>
    </div>
  );
}
