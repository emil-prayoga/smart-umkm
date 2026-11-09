import AuthForm from "@/components/AuthForm";
import { safeInternalPath } from "@/lib/supabase/require-user";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="login" nextPath={safeInternalPath(params.next)} initialError={params.error} />;
}
