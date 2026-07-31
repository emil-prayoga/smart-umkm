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
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    // md:flex-row -> Di layar PC/Laptop sejajar ke samping
    // flex-col -> Di layar HP/Portrait menumpuk dari atas ke bawah
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-950 overflow-x-hidden">
      
      {/* Pembungkus Sidebar agar di layar HP ukurannya pas (w-full) & tidak makan tempat berlebih */}
      <aside className="w-full md:w-auto shrink-0">
        <Sidebar />
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 w-full overflow-y-auto pt-16 md:pt-0 md:pl-64">
        {children}
      </main>

    </div>
  );
}