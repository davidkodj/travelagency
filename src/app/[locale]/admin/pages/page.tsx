import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PagesManager from "./PagesManager";

// 1. Déclarer params comme une Promise pour Next.js 15+
interface Props {
  params: Promise<{ locale: string }>;
}

// 2. Retirer la destructuration synchrone de la signature
export default async function AdminPagesPage({ params }: Props) {
  // 3. Attendre la résolution de la promesse pour extraire la langue
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "super_admin"].includes(profile.role))
    redirect(`/${locale}/dashboard`);

  const { data: pages } = await supabase
    .from("pages_contenu")
    .select("*")
    .in("slug", ["cgu", "privacy"]);

  const cgu = pages?.find((p) => p.slug === "cgu");
  const privacy = pages?.find((p) => p.slug === "privacy");

  return (
    <PagesManager
      locale={locale}
      initialCgu={cgu?.contenu ?? ""}
      initialPrivacy={privacy?.contenu ?? ""}
    />
  );
}
