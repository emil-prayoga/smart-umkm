import Sidebar from "@/components/sidebar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="bg-neutral-950 text-neutral-100 min-h-screen m-0 p-0 antialiased">
        {/* Container Utama: Pakai min-h-screen agar Sidebar ditarik penuh sampai bawah */}
        <div className="flex flex-col md:flex-row min-h-screen w-full">
          {/* Sidebar */}
          <Sidebar />

          {/* Area Konten Utama */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-neutral-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}