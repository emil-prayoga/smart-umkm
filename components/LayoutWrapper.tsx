"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Sembunyikan Sidebar HANYA di halaman onboarding ("/")
  const isOnboarding = pathname === "/";

  if (isOnboarding) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    // md:flex-row -> Di layar PC/Laptop sejajar ke samping
    // flex-col -> Di layar HP/Portrait menumpuk dari atas ke bawah
    <div className="app-shell flex min-h-screen flex-col overflow-x-hidden md:flex-row">
      
      {/* Pembungkus Sidebar agar di layar HP ukurannya pas (w-full) & tidak makan tempat berlebih */}
      <div className="w-full shrink-0 md:w-auto">
        <Sidebar />
      </div>

      {/* Konten Utama */}
      <div className="flex-1 w-full overflow-y-auto pt-16 md:pt-0 md:pl-64">
        {children}
      </div>

    </div>
  );
}
