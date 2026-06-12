import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VoyagesManager from "./VoyagesManager";

// 1. Déclarer params comme une Promise
interface Props {
  params: Promise<{ locale: string }>;
}

// 2. Retirer la destructuration synchrone
export default async function AdminVoyagesPage({ params }: Props) {
  // 3. Attendre la résolution de la promesse pour extraire le locale
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

  const { data: voyages } = await supabase
    .from("voyages")
    .select("*")
    .order("created_at", { ascending: false });

  return <VoyagesManager locale={locale} initialVoyages={voyages ?? []} />;
}
