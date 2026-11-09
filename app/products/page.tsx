import ProductContent from "@/components/ProductContent";
import { requirePageUser } from "@/lib/supabase/require-user";

export default async function ProductsPage() {
  await requirePageUser("/products");
  return (
    <main className="bg-neutral-950 text-neutral-100 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <ProductContent />
      </div>
    </main>
  );
}
