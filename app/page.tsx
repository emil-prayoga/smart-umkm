"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Package, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AnalyticsCard from "@/components/AnalyticsCard"; // Import komponen grafik

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

  // Fetch Data Produk dari Supabase
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

  // Kalkulasi statistik
  const totalJenisProduk = products.length;
  const totalModal = products.reduce((acc, item) => acc + item.cost_price * item.stock, 0);
  const totalEstimasiLaba = products.reduce((acc, item) => {
    const labaPerUnit = item.price - item.cost_price;
    return acc + labaPerUnit * item.stock;
  }, 0);

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
              Dashboard
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Ringkasan performa inventaris dan estimasi potensi keuntungan usaha Anda.
            </p>
          </div>
        </motion.div>

        {/* RINGKASAN STATISTIK */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Kartu 1: Total Produk */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2  transition-colors">
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
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2  transition-colors">
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
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2 sm:col-span-2 lg:col-span-1  transition-colors">
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

        {/* SECTION GRAFIK / DIAGRAM (Dipanggil dari komponen terpisah) */}
        <AnalyticsCard products={products} loading={loading} />

      </motion.div>
    </main>
  );
}