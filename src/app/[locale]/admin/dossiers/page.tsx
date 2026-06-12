import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

// 1. Mise à jour de l'interface : params ET searchParams encapsulés dans des Promises
interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ statut?: string }>;
}

// 2. Signature propre sans destructuration synchrone
export default async function AdminDossiersPage({
  params,
  searchParams,
}: Props) {
  // 3. Résolution asynchrone des deux promesses dès l'entrée dans le composant
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

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

  let query = supabase
    .from("dossiers")
    .select("*, profiles(full_name, phone)")
    .order("created_at", { ascending: false });

  if (resolvedSearchParams.statut) {
    query = query.eq("statut", resolvedSearchParams.statut);
  }
  const { data: dossiers } = await query;

  const statuts = [
    "",
    "en_attente",
    "en_etude",
    "confirme",
    "paye",
    "termine",
    "annule",
  ];
  const current = resolvedSearchParams.statut ?? "";

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-6xl px-6 mx-auto py-12">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Administration
            </p>
            <h1 className="font-display font-bold text-2xl text-ivory">
              Dossiers{" "}
              <span className="text-ivory-muted font-normal text-lg">
                ({dossiers?.length ?? 0})
              </span>
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {statuts.map((s) => {
            const isActive = current === s;
            return (
              <Link
                key={s}
                href={`/${locale}/admin/dossiers${s ? `?statut=${s}` : ""}`}
              >
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-copper/15 border-copper/40 text-copper"
                      : "bg-raised border-subtle text-ivory-muted hover:border-copper/25 hover:text-ivory"
                  }`}
                >
                  {s ? STATUS_LABELS[s] : "Tous"}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="bg-raised border border-subtle rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  {["Client", "Téléphone", "Type", "Statut", "Date", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-ivory-muted uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(dossiers ?? []).map((d: any) => (
                  <tr
                    key={d.id}
                    className="border-b border-subtle/50 hover:bg-surface/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-ivory">
                      {d.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-ivory-muted text-xs">
                      {d.profiles?.phone ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-ivory-muted text-xs capitalize">
                      {d.type?.replace(/_/g, " ")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASS[d.statut]}`}
                      >
                        {STATUS_LABELS[d.statut]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ivory-muted text-xs whitespace-nowrap">
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/${locale}/admin/dossiers/${d.id}`}
                        className="inline-flex items-center gap-1 text-copper hover:text-copper-light text-xs font-medium transition-colors"
                      >
                        Ouvrir <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!dossiers || dossiers.length === 0) && (
              <div className="text-center py-20 text-ivory-muted text-sm">
                Aucun dossier trouvé.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
