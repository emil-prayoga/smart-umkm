"use client";

import { useState } from "react";
import {
  Sparkles,
  Zap,
  TrendingUp,
  PackageCheck,
  Lightbulb,
  Loader2,
  RefreshCw,
  Play,
} from "lucide-react";
import { supabase } from "@/src/lib/supabaseClient";
import Groq from "groq-sdk";

export interface AIRecommendation {
  bundling: {
    title: string;
    description: string;
    suggestedPrice: string;
  };
  promo: {
    title: string;
    strategy: string;
    targetDays: string;
  };
  pricing: {
    title: string;
    advice: string;
  };
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false); // Flag penanda apakah user sudah tekan tombol
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  // Fungsi yang HANYA berjalan saat tombol diklik
  const handleGenerateInsights = async () => {
    setLoading(true);
    setHasAnalyzed(true);

    try {
      // 1. Fetch produk dari Supabase
      const { data: products, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }

      const productList = products || [];
      setProductsCount(productList.length);

      if (productList.length === 0) {
        setRecommendation(null);
        setLoading(false);
        return;
      }

      // 2. Panggil API Groq
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        alert("API Key Groq tidak ditemukan di .env.local!");
        setLoading(false);
        return;
      }

      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const summaryData = productList.map((p) => ({
        nama: p.name,
        kategori: p.category,
        harga_jual: p.price,
        modal_hpp: p.cost_price,
        stok: p.stock,
      }));

      const prompt = `
Kamu adalah Konsultan Bisnis UMKM. Berdasarkan data produk berikut:
${JSON.stringify(summaryData, null, 2)}

Berikan rekomendasi strategi bisnis nyata dalam format JSON murni TANPA MARKDOWN BACKTICKS (tanpa \`\`\`json).
Format JSON HARUS persis seperti berikut:
{
  "bundling": {
    "title": "Nama Paket Bundling (contoh dari nama produk asli)",
    "description": "Alasan singkat kenapa 2 produk ini cocok dibundling",
    "suggestedPrice": "Rp xx.xxx"
  },
  "promo": {
    "title": "Nama Strategi Promo",
    "strategy": "Penjelasan eksekusi promo untuk mendongkrak penjualan",
    "targetDays": "Hari/Jam yang cocok untuk promo"
  },
  "pricing": {
    "title": "Evaluasi Margin / Harga Optimal",
    "advice": "Saran penyesuaian harga atau penghematan HPP berdasarkan produk yang ada"
  }
}
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      const replyText = completion.choices[0]?.message?.content || "";
      const cleanJson = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData: AIRecommendation = JSON.parse(cleanJson);

      setRecommendation(parsedData);
    } catch (err) {
      console.error("Error generating insights:", err);
      alert("Gagal memproses rekomendasi AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center gap-2.5">
              Strategi & Rekomendasi AI
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Konsultan bisnis pribadi AI yang menganalisis data produk & keuanganmu untuk memberikan aksi nyata.
            </p>
          </div>

          <button
            onClick={handleGenerateInsights}
            disabled={loading}
            className="w-fit flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold px-5 py-2.5 rounded-xl transition-all text-sm hover:opacity-90 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-950/40"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
            ) : (
              <Play className="w-4 h-4 fill-neutral-950 text-neutral-950" />
            )}
            {loading ? "Menganalisis..." : hasAnalyzed ? "Analisis Ulang" : "Mulai Analisis AI"}
          </button>
        </div>

        {/* TAMPILAN AWAL (SEBELUM USER TEKAN TOMBOL) */}
        {!hasAnalyzed && !loading && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-4  mx-auto">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-100">Konsultan AI Siap Bekerja</h3>
              <p className="text-sm text-neutral-400   leading-relaxed ">
                Klik tombol <strong>"Mulai Analisis AI"</strong> di atas untuk memproses data katalog produk milikmu dan membuatkan paket bundling, strategi promo, serta penyesuaian harga.
              </p>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-200">
                Konsultan AI Sedang Merancang Strategi...
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Membaca katalog produk, HPP, dan struktur harga dari database milikmu.
              </p>
            </div>
          </div>
        )}

        {/* JIKA SUDAH DIANALISIS TAPI PRODUK KOSONG */}
        {hasAnalyzed && !loading && productsCount === 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
            <Lightbulb className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-semibold text-neutral-200">Belum Ada Data Produk</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              AI membutuhkan data produk di menu <strong>Manajemen Produk (/products)</strong> agar bisa merancang paket bundling dan promo secara presisi.
            </p>
          </div>
        )}

        {/* JIKA SUDAH DIANALISIS DAN BERHASIL DAPAAT HASIL */}
        {hasAnalyzed && !loading && productsCount! > 0 && recommendation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: BUNDLING */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <PackageCheck className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                    Saran Bundling
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-100">
                  {recommendation.bundling?.title || "Paket Hemat"}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {recommendation.bundling?.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <p className="text-xs text-neutral-500">Rekomendasi Harga Paket:</p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {recommendation.bundling?.suggestedPrice}
                </p>
              </div>
            </div>

            {/* CARD 2: PROMO */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                    Strategi Promo
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-100">
                  {recommendation.promo?.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {recommendation.promo?.strategy}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <p className="text-xs text-neutral-500">Target Waktu Efektif:</p>
                <p className="text-sm font-semibold text-blue-400">
                  {recommendation.promo?.targetDays}
                </p>
              </div>
            </div>

            {/* CARD 3: PRICING */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                    Pricing & Margin
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-100">
                  {recommendation.pricing?.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {recommendation.pricing?.advice}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <p className="text-xs text-neutral-500">Status Margin:</p>
                <p className="text-sm font-semibold text-amber-400">
                  Rekomendasi AI
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}