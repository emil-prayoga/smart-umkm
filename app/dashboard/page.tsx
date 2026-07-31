"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Package, DollarSign, TrendingUp, AlertTriangle, Store, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnalyticsCard from "@/components/AnalyticsCard";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");

  // Fetch Data Produk dari Supabase & Ambil Nama Toko dari Settings
  const fetchProducts = async () => {
    try {
      // Ambil nama toko dari localStorage jika ada
      const savedStoreName = localStorage.getItem("smartumkm_store_name");
      if (savedStoreName) setStoreName(savedStoreName);

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
    fetchProducts();
  }, []);

  // Kalkulasi statistik
  const totalJenisProduk = products.length;
  const totalModal = products.reduce((acc, item) => acc + item.cost_price * item.stock, 0);
  const totalEstimasiLaba = products.reduce((acc, item) => {
    const labaPerUnit = item.price - item.cost_price;
    return acc + labaPerUnit * item.stock;
  }, 0);

  // Filter produk dengan stok menipis (misal stok <= 5)
  const lowStockProducts = products.filter((item) => item.stock <= 5);

  return (
    <main className="bg-neutral-950 text-neutral-100 min-h-screen p-4 sm:p-6 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400">
              Dashboard Utama
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Ringkasan performa inventaris, stok barang, dan potensi keuntungan usaha Anda.
            </p>
          </div>

          <Link
            href="/products"
            className="w-fit text-center flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-950/40"
          >
            Kelola Inventaris <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* KOTAK NOTIFIKASI PINTAR (Sesuai Kriteria) */}
        {lowStockProducts.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Peringatan Stok Menipis! ({lowStockProducts.length} Produk)
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Produk seperti{" "}
                  <span className="text-amber-200 font-medium">
                    {lowStockProducts.slice(0, 2).map((p) => p.name).join(", ")}
                  </span>{" "}
                  stoknya tersisa $\le 5$ item. Segera restock barangmu!
                </p>
              </div>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-amber-400 hover:underline shrink-0"
            >
              Cek Produk $\rightarrow$
            </Link>
          </motion.div>
        )}

        {/* RINGKASAN STATISTIK */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Kartu 1: Total Produk */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2 transition-colors">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Total Jenis Produk
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-100">
                {totalJenisProduk} Item
              </span>
              <Package className="w-8 h-8 text-emerald-400/80" />
            </div>
          </div>

          {/* Kartu 2: Total Modal */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2 transition-colors">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Total Nilai Inventaris (Modal)
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-100">
                Rp {totalModal.toLocaleString("id-ID")}
              </span>
              <DollarSign className="w-8 h-8 text-teal-400/80" />
            </div>
          </div>

          {/* Kartu 3: Estimasi Laba */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2 sm:col-span-2 lg:col-span-1 transition-colors">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Estimasi Potensi Laba
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                Rp {totalEstimasiLaba.toLocaleString("id-ID")}
              </span>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </motion.div>

        {/* SECTION GRAFIK / DIAGRAM */}
        <AnalyticsCard products={products} loading={loading} />

      </motion.div>
    </main>
  );
}