import AuthForm from "@/components/AuthForm";
import { safeInternalPath } from "@/lib/supabase/require-user";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="register" nextPath={safeInternalPath(params.next)} initialError={params.error} />;
}
