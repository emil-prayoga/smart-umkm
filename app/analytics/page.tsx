import { supabase } from "@/src/lib/supabaseClient";
import AnalyticClient, { Product } from "@/components/AnalyticsClient";

export const revalidate = 0; // Memastikan data selalu segar

export default async function AnalyticPage() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("stock", { ascending: true });

  if (error) {
    console.error("Error fetching products server-side:", error);
  }

  const initialProducts: Product[] = data || [];

  return <AnalyticClient initialProducts={initialProducts} />;
}