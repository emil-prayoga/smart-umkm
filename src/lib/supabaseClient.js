import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cek di console browser jika environment variable ternyata kosong
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ SUPABASE KEYS MISSING! Cek Environment Variables di Vercel.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');