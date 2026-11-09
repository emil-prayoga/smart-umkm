import InsightsContent from "@/components/InsightsContent";
import { requirePageUser } from "@/lib/supabase/require-user";

export default async function InsightsPage() {
  await requirePageUser("/insights");
  return (
    <main className="bg-neutral-950 text-neutral-100 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <InsightsContent />
      </div>
    </main>
  );
}
