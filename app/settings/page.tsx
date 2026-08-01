import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen md:p-8">
      <div className="min-h-screen mx-auto space-y-8">
        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center gap-2.5">
            Pengaturan Profil Usaha
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Kelola informasi dasar UMKM kamu untuk personalisasi analisis AI.
          </p>
        </div>

        {/* Panggil komponen Client Form di sini */}
        <SettingsForm />
      </div>
    </main>
  );
}