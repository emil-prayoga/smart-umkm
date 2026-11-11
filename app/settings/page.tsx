import SettingsForm from "@/components/SettingsForm";
import { requirePageUser } from "@/lib/supabase/require-user";

export default async function SettingsPage() {
  await requirePageUser("/settings");
  return (
    <main className=" bg-neutral-950 text-neutral-100  min-h-screen">
      <div className="min-h-screen mx-auto space-y-8 p-8">
        <div className="border-b border-neutral-800">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center gap-2.5">
            Pengaturan Profil Usaha
          </h1>
          <p className="text-neutral-400 text-sm mb-6 mt-1">
            Kelola informasi dasar UMKM kamu untuk personalisasi analisis AI.
          </p>
        </div>

        {/* Panggil komponen Client Form di sini */}
        <SettingsForm />
      </div>
    </main>
  );
}
