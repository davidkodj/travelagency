import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_etude: "En étude",
  confirme: "Confirmé",
  paye: "Payé",
  termine: "Terminé",
  annule: "Annulé",
};
const STATUS_CLASS: Record<string, string> = {
  en_attente: "badge-en_attente",
  en_etude: "badge-en_etude",
  confirme: "badge-confirme",
  paye: "badge-paye",
  termine: "badge-termine",
  annule: "badge-annule",
};

// 1. Mise à jour de l'interface pour englober params dans une Promise
interface Props {
  params: Promise<{ locale: string }>;
}

// 2. On ne destructure plus { locale } ici
export default async function AdminPage({ params }: Props) {
  // 3. On extrait la valeur de manière asynchrone dès le début
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "super_admin"].includes(profile.role))
    redirect(`/${locale}/dashboard`);

  const [
    { count: total },
    { count: pending },
    { count: confirmed },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from("dossiers").select("*", { count: "exact", head: true }),
    supabase
      .from("dossiers")
      .select("*", { count: "exact", head: true })
      .eq("statut", "en_attente"),
    supabase
      .from("dossiers")
      .select("*", { count: "exact", head: true })
      .in("statut", ["confirme", "paye"]),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client"),
  ]);

  const { data: recentDossiers } = await supabase
    .from("dossiers")
    .select("*, profiles(full_name, phone)")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    {
      label: "Total dossiers",
      value: total ?? 0,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "En attente",
      value: pending ?? 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Confirmés",
      value: confirmed ?? 0,
      icon: CheckCircle2,
      color: "text-copper",
      bg: "bg-copper/10 border-copper/20",
    },
    {
      label: "Clients",
      value: usersCount ?? 0,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  const quickNav = [
    {
      href: `/${locale}/admin/dossiers`,
      label: "Tous les dossiers",
      icon: FileText,
    },
    {
      href: `/${locale}/admin/voyages`,
      label: "Gérer les voyages",
      icon: Plus,
    },
    {
      href: `/${locale}/admin/utilisateurs`,
      label: "Utilisateurs",
      icon: Users,
    },
    {
      href: `/${locale}/admin/pages`,
      label: "Pages CGU / Privacy",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-6xl px-6 mx-auto py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Administration
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ivory">
              Bienvenue, {profile.full_name?.split(" ")[0]}
            </h1>
          </div>
          <Link href={`/${locale}/admin/voyages`}>
            <Button variant="copper" className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Nouveau voyage
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-raised border border-subtle rounded-2xl p-5 hover:border-copper/20 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="font-display font-bold text-3xl text-ivory mb-0.5">
                {value}
              </div>
              <div className="text-sm text-ivory-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {quickNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between p-4 bg-raised border border-subtle rounded-xl hover:border-copper/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-copper/10 border border-copper/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-copper" />
                </div>
                <span className="text-sm font-medium text-ivory">{label}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-ivory-muted group-hover:text-copper group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>

        {/* Recent dossiers */}
        <div className="bg-raised border border-subtle rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="font-display font-semibold text-ivory">
              Dossiers récents
            </h2>
            <Link
              href={`/${locale}/admin/dossiers`}
              className="text-xs text-copper hover:text-copper-light transition-colors flex items-center gap-1"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Separator className="bg-subtle" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  {["Client", "Type", "Statut", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold text-ivory-muted uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentDossiers ?? []).map((d: any) => (
                  <tr
                    key={d.id}
                    className="border-b border-subtle/50 hover:bg-surface/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-ivory">
                        {d.profiles?.full_name ?? "—"}
                      </div>
                      <div className="text-xs text-ivory-muted">
                        {d.profiles?.phone ?? ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ivory-muted text-xs capitalize">
                      {d.type?.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASS[d.statut]}`}
                      >
                        {STATUS_LABELS[d.statut]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ivory-muted text-xs whitespace-nowrap">
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/${locale}/admin/dossiers/${d.id}`}
                        className="text-copper hover:text-copper-light text-xs font-medium transition-colors"
                      >
                        Ouvrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!recentDossiers || recentDossiers.length === 0) && (
              <div className="text-center py-16 text-ivory-muted text-sm">
                Aucun dossier pour l'instant.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
