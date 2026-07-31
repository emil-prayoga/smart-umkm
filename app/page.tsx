"use client";
import Link from "next/link";
import { Sparkles, Rocket, LayoutDashboard, ArrowRight, Store } from "lucide-react";

export default function OnboardingPage() {
  return (
    <main className="bg-neutral-950 text-neutral-100 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-10 text-center">
        {/* HERO HEADER */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> Platform Pintar UMKM Berbasis AI
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-100">
            Kelola & Kembangkan Bisnis dengan <span className="text-emerald-400">SmartUMKM</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Pilih alur sesuai kondisimu saat ini. Apakah kamu baru ingin mulai belajar bisnis atau sudah memiliki usaha berjalan?
          </p>
        </div>

        {/* PILIHAN ALUR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* PILIHAN 1: PEMULA */}
          <Link
            href="/ideas"
            className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/30 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Rocket className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-100">
                Saya Ingin Memulai Usaha <span className="text-xs text-emerald-400 font-normal px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">Pemula</span>
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Belum punya produk/usaha? Dapatkan ide bisnis kreatif, perkiraan modal, dan analisis kompetitor lokal secara instan dengan panduan AI.
              </p>
            </div>

            <div className="pt-6 border-t border-neutral-800/60 flex items-center justify-between text-emerald-400 text-sm font-bold">
              <span>Cari Ide Usaha AI</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* PILIHAN 2: SUDAH PUNYA USAHA */}
          <Link
            href="/dashboard"
            className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/30 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                <Store className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-100">
                Saya Sudah Punya Usaha <span className="text-xs text-teal-400 font-normal px-2 py-0.5 bg-teal-500/10 rounded-md border border-teal-500/20">Eksis</span>
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Langsung masuk ke pusat kendali: kelola produk, catat arus kas harian, dan dapatkan strategi promo serta rekomendasi harga otomatis.
              </p>
            </div>

            <div className="pt-6 border-t border-neutral-800/60 flex items-center justify-between text-teal-400 text-sm font-bold">
              <span>Buka Dashboard Utama</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}