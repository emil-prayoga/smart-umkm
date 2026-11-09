"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Store } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  nextPath?: string;
  initialError?: string;
}

const categories = [
  "Makanan & Minuman",
  "Pakaian & Fashion",
  "Toko Kelontong / Retail",
  "Jasa & Service",
  "IT / Software & Teknologi",
  "Lainnya",
];

function errorMessage(code?: string) {
  if (code === "callback" || code === "session") return "Tautan konfirmasi tidak valid atau sudah kedaluwarsa. Coba login kembali.";
  if (code === "profile") return "Akun aktif, tetapi profil belum tersimpan. Pastikan migration database sudah diterapkan.";
  if (code === "config") return "Konfigurasi Supabase belum lengkap di server.";
  return "";
}

export default function AuthForm({ mode, nextPath = "/dashboard", initialError }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(errorMessage(initialError));
  const [notice, setNotice] = useState("");
  const reducedMotion = useReducedMotion();
  const pointerX = useSpring(useMotionValue(0), { stiffness: 70, damping: 20, mass: 0.7 });
  const pointerY = useSpring(useMotionValue(0), { stiffness: 70, damping: 20, mass: 0.7 });

  function trackAmbientPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointerX.set(x * 10);
    pointerY.set(y * 8);
  }

  function resetAmbientPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  async function bootstrapProfile() {
    const response = await fetch("/api/auth/profile", { method: "POST" });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "Profil usaha belum dapat dibuat.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const supabase = createClient();
      if (isRegister) {
        const callback = new URL("/auth/callback", window.location.origin);
        callback.searchParams.set("next", nextPath);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: callback.toString(),
            data: { store_name: storeName.trim(), category, location: location.trim() },
          },
        });

        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Akun dibuat. Buka tautan konfirmasi yang kami kirim ke email Anda untuk melanjutkan.");
          return;
        }
        await bootstrapProfile();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        await bootstrapProfile();
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Autentikasi belum berhasil.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout" onPointerMove={trackAmbientPointer} onPointerLeave={resetAmbientPointer}>
        <motion.section
          className="auth-story"
          aria-label="Smart UMKM AI"
          initial={reducedMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          transition={{ duration: reducedMotion ? 0 : 0.68, ease: [0.76, 0, 0.24, 1] }}
        >
          <Link href="/" className="auth-brand">
            <span className="auth-brand-mark"><Store size={19} /></span>
            <span>smartumkm<span>.ai</span></span>
          </Link>
          <div className="auth-story-copy">
            <p className="auth-kicker">Ruang usaha Anda</p>
            <h1>{isRegister ? <>Mulai dari<br />usaha yang Anda<br /><em>bangun.</em></> : <>Angka usaha<br />mulai bercerita<br /><em>di sini.</em></>}</h1>
            <p>{isRegister
              ? "Buat akun, rapikan informasi usaha, lalu kelola produk dan arus kas dalam satu ruang."
              : "Masuk kembali untuk melihat produk, transaksi, dan insight yang tersimpan untuk usaha Anda."}</p>
          </div>
        </motion.section> 

        <motion.section
          className="auth-form-side"
          initial={reducedMotion ? false : { clipPath: "inset(0 0 0 100%)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          transition={{ duration: reducedMotion ? 0 : 0.62, delay: reducedMotion ? 0 : 0.12, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="auth-form-wrap">
            <p className="auth-kicker">{isRegister ? "Satu ruang untuk bertumbuh" : "Selamat datang kembali"}</p>
            <h2>{isRegister ? "Daftarkan usaha" : "Masuk ke akun"}</h2>
            <p className="auth-form-intro">{isRegister
              ? "Isi informasi dasar. Anda bisa mengubahnya kapan saja."
              : "Gunakan email dan kata sandi yang terdaftar."}</p>

            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-message auth-success" role="status">{notice}</p>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && <>
                <label><span className="auth-field-label">Nama usaha</span>
                  <input required maxLength={120} autoComplete="organization" value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Contoh: Kedai Rasa" />
                </label>
                <label><span className="auth-field-label">Kategori usaha</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label><span className="auth-field-label">Lokasi <span className="auth-label-note">(opsional)</span></span>
                  <input maxLength={120} autoComplete="address-level2" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Kota atau wilayah" />
                </label>
              </>}
              <label><span className="auth-field-label">Email</span>
                <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" />
              </label>
              <label><span className="auth-field-label">Kata sandi</span>
                <div className="auth-password-field">
                  <input required type={passwordVisible ? "text" : "password"} minLength={8} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "Minimal 8 karakter" : "Masukkan kata sandi"} />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    aria-label={passwordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={passwordVisible}
                    onClick={() => setPasswordVisible((visible) => !visible)}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={passwordVisible ? "visible" : "hidden"}
                        initial={reducedMotion ? false : { opacity: 0, scale: 0.7, rotate: passwordVisible ? -20 : 20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.72, rotate: passwordVisible ? 18 : -18 }}
                        transition={{ duration: reducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="auth-eye-icon"
                      >
                        {passwordVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
              </label>
              <button className="auth-submit" type="submit" disabled={busy}>
                {busy ? <><LoaderCircle size={17} className="auth-spinner" /> Memproses...</> : <>{isRegister ? "Buat akun" : "Masuk"}<ArrowRight size={17} /></>}
              </button>
            </form>

            <p className="auth-switch text-center">
              {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
              <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Login" : "Daftar"}</Link>
            </p>
           
          </div>
        </motion.section>
      </div>
    </main>
  );
}
