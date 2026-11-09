import { notFound } from "next/navigation";
import AnalyticsClient from "@/components/AnalyticsClient";
import DashboardContent from "@/components/DashboardContent";
import FinanceClient from "@/components/FinanceClient";
import IdeUsahaContent from "@/components/IdeasContent";
import InsightsContent from "@/components/InsightsContent";
import ProductContent from "@/components/ProductContent";
import SettingsForm from "@/components/SettingsForm";
import { DEMO_STORE, getDemoProducts, getDemoTransactions } from "@/lib/data/demo-fixture";

const demoModules = ["dashboard", "products", "finance", "analytics", "insights", "ideas", "settings"];

export default async function DemoModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!demoModules.includes(module)) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 p-4 text-neutral-100 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {module === "dashboard" && <DashboardContent isDemo />}
        {module === "products" && <ProductContent isDemo />}
        {module === "finance" && <FinanceClient initialRecords={getDemoTransactions()} isDemo />}
        {module === "analytics" && <AnalyticsClient initialProducts={getDemoProducts()} isDemo />}
        {module === "insights" && <InsightsContent isDemo />}
        {module === "ideas" && <IdeUsahaContent isDemo />}
        {module === "settings" && (
          <section className="mx-auto space-y-8">
            <div className="border-b border-neutral-800 pb-6">
              <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-emerald-400">Pengaturan Profil Usaha</h1>
              <p className="mt-1 text-sm text-neutral-400">Profil contoh untuk melihat personalisasi ruang usaha.</p>
            </div>
            <SettingsForm isDemo />
          </section>
        )}
        <p className="mt-6 text-center text-xs text-neutral-500">Mode Demo · {DEMO_STORE.name} · Semua data pada halaman ini adalah contoh.</p>
      </div>
    </main>
  );
}
