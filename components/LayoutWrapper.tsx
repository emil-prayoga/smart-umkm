"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import RouteMotion from "@/components/RouteMotion";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Sembunyikan Sidebar HANYA di halaman onboarding ("/")
  const isOnboarding = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDemo = pathname === "/demo" || pathname.startsWith("/demo/");

  if (isOnboarding) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isAuthPage) {
    return <RouteMotion routeKey={pathname}>{children}</RouteMotion>;
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
      <div className="flex-1 w-full overflow-y-auto pt-16  md:pt-0 md:pl-64">
        <RouteMotion routeKey={pathname}>
          {isDemo && (
            <div className="flex min-h-10 items-center justify-center gap-2 border-b border-[#E9A923]/30 bg-[#E9A923]/10 px-4 py-2 text-center text-xs font-semibold text-[#F2C75C]">
              <span className="rounded-full bg-[#E9A923] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#242A26]">Demo</span>
              Anda melihat data contoh dalam mode hanya baca.
            </div>
          )}
          {children}
        </RouteMotion>
      </div>

    </div>
  );
}
