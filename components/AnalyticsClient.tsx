"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  PackageCheck,
  Flame,
  TrendingDown,
} from "lucide-react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

interface AnalyticClientProps {
  initialProducts: Product[];
}

export default function AnalyticClient({ initialProducts }: AnalyticClientProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Kalkulasi Metrik
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalPotentialProfit = products.reduce(
    (acc, p) => acc + (p.price - p.cost_price) * p.stock,
    0
  );

  const topProfitProducts = [...products]
    .sort((a, b) => b.price - b.cost_price - (a.price - a.cost_price))
    .slice(0, 3);

  const lowMarginProducts = [...products]
    .sort((a, b) => a.price - a.cost_price - (b.price - b.cost_price))
    .slice(0, 3);

  // Panggil Route Handler API Groq
  const handleGetAiInsight = async () => {
    if (products.length === 0) {
      alert("Belum ada data produk di database untuk dianalisis!");
      return;
    }

    setAiLoading(true);
    try {
      const summaryData = {
        total_jenis_produk: totalProducts,
        produk_stok_kritis: lowStockProducts.map((p) => ({
          nama: p.name,
          sisa_stok: p.stock,
        })),
        daftar_produk: products.map((p) => ({
          nama: p.name,
          kategori: p.category,
          harga_jual: p.price,
          hpp: p.cost_price,
          laba_per_unit: p.price - p.cost_price,
          stok: p.stock,
        })),
      };

      const res = await fetch("/api/groq/analytic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryData }),
      });

      // Cek apakah response berupa JSON sebelum parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server mengembalikan respons non-JSON (Status: ${res.status}). Pastikan file 'app/api/groq-analytic/route.ts' sudah ada dan server sudah di-restart.`
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses data.");
      }

      setAiRecommendation(data.result);
    } catch (err) {
      console.error("AI Insight Error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Gagal menghubungi AI Assistant."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="bg-neutral-950 text-neutral-100 p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="min-h-screen mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400">
              Analisis & Prediksi AI
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Proyeksi performa produk, waktu penjualan terbaik, dan analisis tren pasar berbasis AI.
            </p>
          </div>

          <button
            onClick={handleGetAiInsight}
            disabled={aiLoading}
            className="w-fit flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            {aiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 fill-neutral-950" />
            )}
            {aiLoading ? "Menganalisis Tren..." : "Jalankan Prediksi AI"}
          </button>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Total Jenis Produk
              </span>
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-neutral-100">{totalProducts} Item</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Stok Kritis (≤ 5)
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{lowStockProducts.length} Produk</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Nilai Total Inventaris
              </span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-neutral-100">
              Rp {totalValue.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Potensi Laba Kotor
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              Rp {totalPotentialProfit.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* HASIL AI INSIGHT */}
        {aiRecommendation && (
          <div className="bg-linear-to-br from-neutral-900 via-neutral-900 to-emerald-950/40 border border-emerald-500/40 p-6 rounded-2xl space-y-4 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg border-b border-neutral-800 pb-3">
              <Sparkles className="w-5 h-5" /> Hasil Prediksi & Analisis Pasar AI
            </div>
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
              {aiRecommendation}
            </div>
          </div>
        )}

        {/* TOP SELLER VS MARGIN TIPIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2 text-emerald-400">
              <Flame className="w-5 h-5" /> Produk Margin Laba Tertinggi
            </h3>
            <div className="space-y-3">
              {topProfitProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{p.name}</p>
                    <p className="text-xs text-neutral-500">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">
                      +Rp {(p.price - p.cost_price).toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-neutral-400">Margin / Unit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2 text-amber-400">
              <TrendingDown className="w-5 h-5" /> Produk Margin Tipis
            </h3>
            <div className="space-y-3">
              {lowMarginProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{p.name}</p>
                    <p className="text-xs text-neutral-500">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-400">
                      +Rp {(p.price - p.cost_price).toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-neutral-400">Margin / Unit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABEL STOK KRITIS */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-100">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Peringatan Stok Kritis (Restock Urgent)
          </h2>

          {lowStockProducts.length === 0 ? (
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