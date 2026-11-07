import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import LayoutWrapper from "@/components/LayoutWrapper";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Smart UMKM AI — Teman Tumbuh Usaha Indonesia",
  description: "Kelola produk, pahami angka usaha, dan temukan langkah berikutnya bersama Smart UMKM AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("light", geist.variable)}>
      <body className="text-neutral-100 antialiased font-sans">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
