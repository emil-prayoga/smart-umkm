import IdeasContent from "@/components/IdeasContent";
import { requirePageUser } from "@/lib/supabase/require-user";

export default async function IdeasPage() {
  await requirePageUser("/ideas");
  return (
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen md:p-8">
      <div className="max-w-7xl mx-auto">
        <IdeasContent />
      </div>
    </main>
  );
}
