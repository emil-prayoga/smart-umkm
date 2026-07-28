"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Package, DollarSign, TrendingUp, BarChart3, PieChart as PieIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

const COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 1. Total Jenis Produk
  const totalJenisProduk = products.length;

  // 2. Hitung Total Modal (HPP x Stok)
  const totalModal = products.reduce((acc, item) => {
    return acc + item.cost_price * item.stock;
  }, 0);

  // 3. Hitung Estimasi Total Keuntungan/Laba ((Harga - Modal) x Stok)
  const totalEstimasiLaba = products.reduce((acc, item) => {
    const labaPerUnit = item.price - item.cost_price;
    return acc + labaPerUnit * item.stock;
  }, 0);

  // Data olahan untuk Grafik Bar
  const chartData = products.map((item) => ({
    name: item.name,
    Modal: item.cost_price * item.stock,
    PotensiLaba: (item.price - item.cost_price) * item.stock,
  }));

  // Data olahan untuk Pie Chart
  const stockPieData = products.map((item) => ({
    name: item.name,
    value: item.stock,
  }));

  return (
    <main className="bg-neutral-950 text-neutral-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* Container utama dibatasi ukurannya di desktop dengan max-w-7xl & mx-auto */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400">
              SmartUMKM Dashboard
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Ringkasan performa inventaris dan estimasi potensi keuntungan usaha Anda.
            </p>
          </div>
        </div>

        {/* RINGKASAN STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Kartu 1: Total Produk */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Total Jenis Produk
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-100">
                {totalJenisProduk} <span className="text-sm font-normal text-neutral-500">Item</span>
              </span>
              <Package className="w-8 h-8 text-emerald-400/80" />
            </div>
          </div>

          {/* Kartu 2: Total Modal */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2">
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
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2 sm:col-span-2 lg:col-span-1">
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
        </div>

        {/* SECTION GRAFIK / DIAGRAM */}
        {loading ? (
          <div className="p-12 text-center text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            Memuat grafik...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 border border-neutral-800 rounded-2xl bg-neutral-900">
            Belum ada data produk untuk ditampilkan di grafik.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRAFIK 1: PERBANDINGAN MODAL VS LABA PER PRODUK (Bar Chart) */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="font-semibold text-neutral-200">
                  Analisis Modal vs Potensi Laba per Produk
                </h2>
              </div>
              
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%" >
                  <BarChart data={chartData} barGap={8} barCategoryGap="20%">
  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
  <XAxis dataKey="name" stroke="#737373" fontSize={12} />
  <YAxis stroke="#737373" fontSize={12} />
  <Tooltip
    cursor={false}
    contentStyle={{
      backgroundColor: "#171717",
      borderColor: "#404040",
      borderRadius: "8px",
      color: "#f5f5f5",
    }}
    formatter={(value) => [`Rp ${Number(value).toLocaleString("id-ID")}`, ""]}
  />
  <Legend />

  {/* Batang 1: Modal */}
  <Bar 
    dataKey="Modal" 
    name="Modal"
    fill="rgba(13, 148, 136, 0.55)" 
    stroke="#0d9488"
    strokeWidth={1}
    radius={[4, 4, 0, 0]} 
    barSize={24}
    activeBar={false}
  />

  {/* Batang 2: Potensi Laba */}
  <Bar 
    dataKey="PotensiLaba" 
    name="Potensi Laba"
    fill="rgba(16, 185, 129, 0.55)" 
    stroke="#10b981"
    strokeWidth={1}
    radius={[4, 4, 0, 0]} 
    barSize={24}
    activeBar={false}
  />
</BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRAFIK 2: PROPORSI STOK (Pie Chart) */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
                <PieIcon className="w-5 h-5 text-emerald-400" />
                <h2 className="font-semibold text-neutral-200">Komposisi Stok</h2>
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart accessibilityLayer={false}>
                    <Pie
                      data={stockPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#171717"
                      strokeWidth={2}
                    >
                      {stockPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`${COLORS[index % COLORS.length]}99`} 
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={1}
                          className="outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#404040",
                        borderRadius: "8px",
                        color: "#f5f5f5",
                      }}
                      formatter={(value) => [`${value} Unit`, "Stok"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}