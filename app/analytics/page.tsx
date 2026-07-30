"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, DollarSign, PackageCheck } from "lucide-react";
import Groq from "groq-sdk";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

export default function Analytic() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // State AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Fetch Data Produk untuk Diberikan ke AI & Ditampilkan di Dashboard
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("stock", { ascending: true }); // Prioritaskan stok paling sedikit dulu

      if (error) console.error("Error fetching products:", error);
      else setProducts(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
  loadProducts();
  }, []);

  // Hitung Kalkulasi Sederhana
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalPotentialProfit = products.reduce((acc, p) => acc + (p.price - p.cost_price) * p.stock, 0);

  // Handle Analisis AI
  const handleGetAiInsight = async () => {
    if (products.length === 0) {
      alert("Belum ada data produk di database untuk dianalisis!");
      return;
    }

    setAiLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

      if (!apiKey) {
        alert("API Key Groq tidak ditemukan! Cek .env.local");
        setAiLoading(false);
        return;
      }

      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      // Rangkum data ringkas agar token hemat & respon AI tajam
      const summaryData = {
        total_jenis_produk: totalProducts,
        produk_stok_kritis: lowStockProducts.map((p) => ({ nama: p.name, sisa_stok: p.stock })),
        daftar_produk: products.map((p) => ({
          nama: p.name,
          kategori: p.category,
          harga_jual: p.price,
          laba_per_unit: p.price - p.cost_price,
          stok: p.stock,
        })),
      };

      const prompt = `
Kamu adalah Konsultan & Data Analyst Bisnis UMKM. 
Berikut adalah ringkasan data inventaris toko saat ini:
${JSON.stringify(summaryData, null, 2)}

Berikan "Analisis & Prediksi Bisnis" yang mencakup:
1. **Prediksi Restock & Stok Kritis**: Peringatan untuk produk yang hampir habis dan estimasi risiko kerugian jika tidak segera diproduksi/direstock.
2. **Analisis Profitabilitas**: Mana produk yang memberi margin laba terbesar dan layak di-push pemasarannya.
3. **Rekomendasi Bundling/Promo**: Usulan paket bundling antar produk untuk menghabiskan stok lambat atau meningkatkan rata-rata nilai transaksi.

Gunakan bahasa Indonesia yang ramah, profesional, dan gunakan format Markdown (bullet points / bold) yang rapi.
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      const reply = completion.choices[0]?.message?.content || "Gagal mendapatkan hasil dari AI.";
      setAiRecommendation(reply);
    } catch (err) {
      console.error("Groq Error:", err);
      alert("Gagal menghubungi AI Assistant.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Analisis Prediksi AI</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Dapatkan estimasi risiko stok, proyeksi keuntungan, dan saran strategi otomatis.
            </p>
          </div>

          <button
            onClick={handleGetAiInsight}
            disabled={aiLoading || loading}
            className="w-40 flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-neutral-950 font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            {aiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 fill-neutral-950" />
            )}
            {aiLoading ? "Menganalisis Data..." : "Jalankan Analisis AI"}
          </button>
        </div>

        {/* METRIC CARDS / OVERVIEW METRIKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Total Produk</span>
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-neutral-100">{totalProducts} <span className="text-xs font-normal text-neutral-400">item</span></p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Stok Kritis (&le; 5)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{lowStockProducts.length} <span className="text-xs font-normal text-neutral-400">produk</span></p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Nilai Total Inventaris</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-neutral-100">
              Rp {totalValue.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Potensi Laba Kotor</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              Rp {totalPotentialProfit.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* KARTU HASIL AI INSIGHT */}
        {aiRecommendation && (
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/40 border border-emerald-500/40 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg border-b border-neutral-800 pb-3">
              <Sparkles className="w-5 h-5" /> Hasil Prediksi & Rekomendasi Strategi AI
            </div>
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
              {aiRecommendation}
            </div>
          </div>
        )}

        {/* TABEL STOK KRITIS (PERINGATAN) */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-100">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Perhatian: Produk Perlu Di-restock
          </h2>

          {loading ? (
            <p className="text-sm text-neutral-500">Memuat data inventaris...</p>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4">Semua produk saat ini memiliki stok aman.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 text-xs text-neutral-500 uppercase">
                  <tr>
                    <th className="py-3 px-2">Nama Produk</th>
                    <th className="py-3 px-2">Kategori</th>
                    <th className="py-3 px-2">Sisa Stok</th>
                    <th className="py-3 px-2">Harga Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {lowStockProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-neutral-100">{item.name}</td>
                      <td className="py-3 px-2 text-neutral-400">{item.category}</td>
                      <td className="py-3 px-2 text-amber-400 font-bold">{item.stock} unit</td>
                      <td className="py-3 px-2">Rp {item.price.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}