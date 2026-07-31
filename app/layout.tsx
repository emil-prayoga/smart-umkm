import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import LayoutWrapper from "@/components/LayoutWrapper";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "SmartUMKM - Platform Bisnis Berbasis AI",
  description: "Asisten & Konsultan Bisnis Pintar untuk UMKM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("dark", geist.variable)}>
      <body className="bg-neutral-950 text-neutral-100 antialiased font-sans">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}