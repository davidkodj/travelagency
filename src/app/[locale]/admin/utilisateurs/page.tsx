import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsersManager from "./UsersManager";

// 1. Mettre à jour l'interface pour définir params comme une Promise
interface Props {
  params: Promise<{ locale: string }>;
}

// 2. Retirer la destructuration de { locale } de la signature
export default async function AdminUsersPage({ params }: Props) {
  // 3. Attendre la résolution de la promesse params
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <UsersManager
      locale={locale}
      initialUsers={profiles ?? []}
      currentUserId={user.id}
      currentRole={profile.role}
    />
  );
}
