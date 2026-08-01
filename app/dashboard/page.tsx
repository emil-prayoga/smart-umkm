import DashboardContent from "@/components/DashboardContent";

export default function DashboardPage() {
  return (
    <main className="bg-neutral-950 text-neutral-100 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardContent />
      </div>
    </main>
  );
}