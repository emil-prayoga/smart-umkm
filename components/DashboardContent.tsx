"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, DollarSign, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import AnalyticsCard from "@/components/AnalyticsCard";
import Link from "next/link";
import { DEMO_STORE } from "@/lib/data/demo-fixture";
import { getBusinessProfile, getProducts } from "@/lib/data/workspace-data";
import type { ProductRecord } from "@/lib/data/types";
import DirectionalReveal from "@/components/motion/DirectionalReveal";
import AnimatedCounter from "@/components/motion/AnimatedCounter";

export default function DashboardContent({ isDemo = false }: { isDemo?: boolean }) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState(isDemo ? DEMO_STORE.name : "");

  const fetchProducts = useCallback(async () => {
    try {
      if (isDemo) {
        setStoreName(DEMO_STORE.name);
      } else {
        const profile = await getBusinessProfile("user");
        if (profile?.store_name) setStoreName(profile.store_name);
      }
      setProducts(await getProducts(isDemo ? "demo" : "user"));
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    // This effect synchronizes the dashboard with the selected data source.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts();
  }, [fetchProducts]);

  const routePrefix = isDemo ? "/demo" : "";

  const totalJenisProduk = products.length;
  const totalModal = products.reduce((acc, item) => acc + item.cost_price * item.stock, 0);
  const totalEstimasiLaba = products.reduce((acc, item) => {
    const labaPerUnit = item.price - item.cost_price;
    return acc + labaPerUnit * item.stock;
  }, 0);

  const lowStockProducts = products.filter((item) => item.stock <= 5);

  return (
    <div className="space-y-8  p-8">
      {/* HEADER */}
      <DirectionalReveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6" direction="left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400">
            Dashboard {storeName || "Toko UMKM Saya"}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Ringkasan performa inventaris, stok barang, dan potensi keuntungan usaha.
          </p>
        </div>

        <Link
          href={`${routePrefix}/products`}
          className="w-fit text-center flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-950/40"
        >
          Kelola Inventaris <ArrowRight className="w-4 h-4" />
        </Link>
      </DirectionalReveal>

      {/* NOTIFIKASI STOK MENIPIS */}
      {lowStockProducts.length > 0 && (
        <DirectionalReveal className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" direction="right">
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
                stoknya tersisa &le; 5 item. Segera restock barangmu!
              </p>
            </div>
          </div>

          <Link
            href={`${routePrefix}/products`}
            className="text-xs font-bold text-amber-400 hover:underline shrink-0"
          >
            Cek Produk &rarr;
          </Link>
        </DirectionalReveal>
      )}

      {/* RINGKASAN STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DirectionalReveal className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between" direction="up" delay={0.02}>
          <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Total Jenis Produk
          </p>
          <h3 className="text-2xl font-bold text-neutral-100 mt-1">
            <AnimatedCounter value={totalJenisProduk} loading={loading} suffix=" Item" />
          </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </DirectionalReveal>

        <DirectionalReveal className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between" direction="down" delay={0.05}>
          <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Total Nilai Inventaris (Modal)
          </p>
          <h3 className="text-2xl font-bold text-neutral-100 mt-1">
            <AnimatedCounter value={totalModal} loading={loading} prefix="Rp " />
          </h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </DirectionalReveal>

        <DirectionalReveal className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between sm:col-span-2 lg:col-span-1" direction="up" delay={0.08}>
          <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Estimasi Potensi Laba
          </p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            <AnimatedCounter value={totalEstimasiLaba} loading={loading} prefix="Rp " />
          </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </DirectionalReveal>
      </div>

      {/* SECTION GRAFIK */}
      <AnalyticsCard products={products} loading={loading} />
    </div>
  );
}
