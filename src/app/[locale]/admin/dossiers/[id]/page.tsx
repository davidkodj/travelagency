import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DossierDetail from "./DossierDetail";

// 1. Mise à jour de l'interface : params est une Promise
interface Props {
  params: Promise<{ locale: string; id: string }>;
}

// 2. Plus de destructuration synchrone dans la signature
export default async function DossierDetailPage({ params }: Props) {
  // 3. Résolution asynchrone obligatoire des paramètres
  const { locale, id } = await params;

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

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect(`/${locale}/dashboard`);
  }

  const { data: dossier } = await supabase
    .from("dossiers")
    .select("*, profiles(*), voyages(*)")
    .eq("id", id)
    .single();

  if (!dossier) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("dossier_id", id);

  const { data: historique } = await supabase
    .from("statut_historique")
    .select("*")
    .eq("dossier_id", id)
    .order("created_at", { ascending: false });

  return (
    <DossierDetail
      dossier={dossier}
      documents={documents ?? []}
      historique={historique ?? []}
      locale={locale}
      adminId={user.id}
    />
  );
}
