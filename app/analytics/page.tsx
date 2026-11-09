import AnalyticClient, { type Product } from "@/components/AnalyticsClient";
import { getServerProducts } from "@/lib/data/user-data.server";
import { requirePageUser } from "@/lib/supabase/require-user";

export const revalidate = 0; // Memastikan data selalu segar

export default async function AnalyticPage() {
  await requirePageUser("/analytics");
  let initialProducts: Product[] = [];
  try {
    initialProducts = await getServerProducts();
    initialProducts.sort((a, b) => a.stock - b.stock);
  } catch (error) {
    console.error("Error fetching products server-side:", error);
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-4 text-neutral-100 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <AnalyticClient initialProducts={initialProducts} />
      </div>
    </main>
  );
}
