import { supabase } from "@/src/lib/supabaseClient";
import FinanceClient, { TransactionRecord } from "@/components/FinanceClient";

// Force dynamic rendering agar data selalu fresh dari server
export const revalidate = 0;

export default async function FinancePage() {
  // Fetch data langsung di server
  const { data, error } = await supabase
    .from("cash_flows")
    .select("*")
    .order("created_at", { ascending: false });

  const initialRecords: TransactionRecord[] = error ? [] : data || [];

  return <FinanceClient initialRecords={initialRecords} />;
}