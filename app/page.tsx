"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Plus, Package, Sparkles, RefreshCw } from "lucide-react";
import Groq from "groq-sdk";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Form Input
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");

  // State untuk AI Recommendation
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Fetch Data Produk
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
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

  // Handle Tambah Produk Baru
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !costPrice) return alert("Mohon isi field yang wajib!");

    setLoading(true);
    const { error } = await supabase.from("products").insert([
      {
        name,
        category: category || "Umum",
        price: Number(price),
        cost_price: Number(costPrice),
        stock: Number(stock) || 0,
      },
    ]);

    if (error) {
      alert("Gagal menambah produk: " + error.message);
      setLoading(false);
    } else {
      setName("");
      setCategory("");
      setPrice("");
      setCostPrice("");
      setStock("");
      fetchProducts();
    }
  };

  // Handle Panggilan AI Copilot
  // Handle Panggilan AI Copilot (Langsung via Groq SDK di Client)
  const handleGetAiInsight = async () => {
    if (products.length === 0) {
      alert("Tambahkan minimal 1 produk terlebih dahulu!");
      return;
    }

    setAiLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

      if (!apiKey) {
        alert("API Key Groq tidak ditemukan! Pastikan ada NEXT_PUBLIC_GROQ_API_KEY di .env.local");
        setAiLoading(false);
        return;
      }

      // Inisialisasi Groq client ( dangerouslyAllowBrowser wajib dipakai kalau di page.jsx )
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = `
Kamu adalah Konsultan Bisnis UMKM. Berikan 3-4 saran strategi bisnis singkat berbasis data produk berikut:
${JSON.stringify(products, null, 2)}

Fokus pada:
1. Margin keuntungan (Laba per unit).
2. Ide paket promo bundling produk.
3. Tips meningkatkan omzet & stok.

Gunakan bahasa Indonesia yang ramah dan format poin-poin yang mudah dibaca.
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      const reply =
        completion.choices[0]?.message?.content ||
        "Gagal mendapatkan hasil dari AI.";

      setAiRecommendation(reply);
    } catch (err) {
      console.error("Groq Error:", err);
      alert("Gagal menghubungi AI Assistant.");
    } finally {
      setAiLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6  ">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">SmartUMKM Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Kelola data inventaris & dapatkan analisis strategi bisnis berbasis AI.
          </p>
        </div>

        <button
          onClick={handleGetAiInsight}
          disabled={aiLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40"
        >
          {aiLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 fill-neutral-950" />
          )}
          {aiLoading ? "Menganalisis Data..." : "Analisis Bisnis dengan AI"}
        </button>
      </div>

      {/* KARTU HASIL AI INSIGHT */}
      {aiRecommendation && (
        <div className="bg-gradient-to-br from-neutral-900 to-emerald-950/30 border border-emerald-500/30 p-6 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
            <Sparkles className="w-5 h-5" /> Rekomendasi Konsultan AI:
          </div>
          <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
            {aiRecommendation}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM INPUT PRODUK */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> Tambah Produk Baru
          </h2>

          <form onSubmit={handleAddProduct} className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400">Nama Produk *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kopi Susu Aren"
                className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400">Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Minuman / Makanan"
                className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="15000"
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400">Modal / HPP (Rp) *</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="8000"
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400">Stok Awal</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-emerald-500 text-neutral-950 font-semibold rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </form>
        </div>

        {/* TABEL LIST PRODUK */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Daftar Inventaris Produk
          </h2>

          {loading && products.length === 0 ? (
            <p className="text-sm text-neutral-500">Memuat data...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Belum ada produk. Tambahkan produk pertamamu!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 text-xs text-neutral-500 uppercase">
                  <tr>
                    <th className="py-3 px-2">Nama</th>
                    <th className="py-3 px-2">Kategori</th>
                    <th className="py-3 px-2">Harga Jual</th>
                    <th className="py-3 px-2">Laba/Unit</th>
                    <th className="py-3 px-2">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-neutral-100">{item.name}</td>
                      <td className="py-3 px-2 text-neutral-400">{item.category}</td>
                      <td className="py-3 px-2">Rp {item.price.toLocaleString("id-ID")}</td>
                      <td className="py-3 px-2 text-emerald-400">
                        Rp {(item.price - item.cost_price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-2">{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}