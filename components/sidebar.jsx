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
  Settings,
  Store,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Manajemen Produk", path: "/products", icon: Package },
  { name: "Transaksi Keuangan", path: "/finance", icon: CreditCard },
  { name: "Analisis Prediksi AI", path: "/analytics", icon: TrendingUp },
  { name: "Strategi Promo AI", path: "/insights", icon: Sparkles },
  { name: "Ide Usaha", path: "/ideas", icon: Rocket },
  { name: "Pengaturan", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="md:hidden flex items-center justify-between h-16 w-full bg-[#174A3A] border-b border-white/15 px-4 fixed top-0 left-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-[#FCFBF7] font-bold" aria-label="Smart UMKM AI, kembali ke beranda">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-[#E9A923] text-[#174A3A]"><Store size={17} /></span>
          <span>Smart UMKM <span className="text-[#E9A923]">AI</span></span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="grid place-items-center w-10 h-10 rounded-md text-[#FCFBF7] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9A923]"
          aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {isOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-[#14251D]/55 z-40"
        />
      )}

      <aside
        className={`fixed top-0 left-0 flex h-screen w-64 flex-col border-r border-white/10 bg-[#174A3A] p-5 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <span className="grid place-items-center w-10 h-10 rounded-xl rounded-bl-sm bg-[#E9A923] text-[#174A3A]"><Store size={19} /></span>
            <span>
              <span className="block text-[15px] font-bold tracking-tight text-[#FCFBF7]">Smart UMKM <span className="text-[#E9A923]">AI</span></span>
              <span className="mt-0.5 block text-[10px] text-[#D3DFD5]">Teman tumbuh usaha</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid place-items-center w-8 h-8 rounded-md text-[#D3DFD5] hover:bg-white/10 md:hidden"
            aria-label="Tutup navigasi"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 px-3 text-[9px] font-semibold tracking-[.12em] text-[#B7C9B9]">RUANG USAHA</p>
        <nav aria-label="Navigasi aplikasi" className="flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9A923] ${
                  isActive
                    ? "bg-[#E9A923] text-[#242A26]"
                    : "text-[#E2E9E2] hover:bg-white/10 hover:text-white"
                }`}
              >
                <IconComponent className="h-[17px] w-[17px]" strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-white/15 pt-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-[12px] font-semibold text-[#FCFBF7] transition-colors hover:bg-white/10 hover:text-[#F2C75C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9A923]"
          >
            <LogOut className="h-[17px] w-[17px]" strokeWidth={1.8} />
            <span>Keluar Demo</span>
          </Link>
          <p className="px-3 pt-3 text-[9px] text-[#B7C9B9]">Smart UMKM AI · Demo usaha</p>
        </div>
      </aside>
    </>
  );
}
