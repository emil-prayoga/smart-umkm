import FinanceClient from "@/components/FinanceClient";
import { getServerTransactions } from "@/lib/data/user-data.server";
import type { TransactionRecord } from "@/lib/data/types";
import { requirePageUser } from "@/lib/supabase/require-user";

// Force dynamic rendering agar data selalu fresh dari server
export const revalidate = 0;

export default async function FinancePage() {
  await requirePageUser("/finance");
  let initialRecords: TransactionRecord[] = [];
  try {
    initialRecords = await getServerTransactions();
  } catch (error) {
    console.error("Error fetching cash flows server-side:", error);
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-4 text-neutral-100 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <FinanceClient initialRecords={initialRecords} />
      </div>
    </main>
  );
}
