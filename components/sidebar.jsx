"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Rocket, 
  Package, 
  CreditCard, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  Settings 
} from "lucide-react";


const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  // { name: "Ide Usaha", path: "/ideas", icon: Rocket },
  { name: "Manajemen Produk", path: "/products", icon: Package },
  { name: "Transaksi Keuangan", path: "/finance", icon: CreditCard },
  { name: "Analisis Prediksi AI", path: "/analytics", icon: TrendingUp },
  // { name: "Strategi Promo AI", path: "/insights", icon: Sparkles },
  // { name: "Laporan Bisnis", path: "/reports", icon: FileText },
  // { name: "Pengaturan", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); 
  const pathname = usePathname();

  return (
    <>
      {/* 1. HEADER MOBILE + TOMBOL HAMBURGER (Hanya muncul di HP) */}
      <header className="md:hidden flex items-center justify-between bg-neutral-900 border-b border-neutral-800 p-4 sticky top-0 z-40">
        <h1 className="text-lg font-bold text-emerald-400">SmartUMKM</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-200 text-2xl focus:outline-none p-1"
        >
          {isOpen ? "✕" : "☰"} {/* Berubah ikon X saat terbuka */}
        </button>
      </header>

      {/* 2. OVERLAY GELAP (Di HP: Layar belakang jadi agak gelap saat menu terbuka) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}

      {/* 3. SIDEBAR UTAMA (Desktop: Selalu Tampak | Mobile: Slide-In) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-neutral-900 border-r border-neutral-800 p-6 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo / Header Sidebar */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">SmartUMKM</h1>
            <p className="text-xs text-neutral-400">Platform AI Bisnis</p>
          </div>
          {/* Tombol Tutup Khusus Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Daftar 8 Menu (Di-render memakai .map) */}
        <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)} // Otomatis tutup menu saat diklik di HP
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500 text-neutral-950 font-bold"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}