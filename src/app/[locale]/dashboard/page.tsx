import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
  Archive,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DossierStatut } from "@/types";

// Fonctions de dictionnaire prenant le traducteur `t` en paramètre
const getStatusMap = (
  t: any,
): Record<DossierStatut, { label: string; icon: any; cls: string }> => ({
  en_attente: {
    label: t("status.pending"),
    icon: Clock,
    cls: "badge-en_attente",
  },
  en_etude: {
    label: t("status.studying"),
    icon: FileText,
    cls: "badge-en_etude",
  },
  confirme: {
    label: t("status.confirmed"),
    icon: CheckCircle2,
    cls: "badge-confirme",
  },
  paye: { label: t("status.paid"), icon: CreditCard, cls: "badge-paye" },
  termine: {
    label: t("status.completed"),
    icon: Archive,
    cls: "badge-termine",
  },
  annule: { label: t("status.cancelled"), icon: XCircle, cls: "badge-annule" },
});

const getTypeLabels = (t: any): Record<string, string> => ({
  voyage_organise: t("types.package"),
  sur_mesure: t("types.custom"),
  visa: t("types.visa"),
});

interface Props {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function DashboardPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Initialisation des traductions côté serveur
  const t = await getTranslations("dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: dossiers } = await supabase
    .from("dossiers")
    .select("*, voyages(titre,destination)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const statusMap = getStatusMap(t);
  const typeLabels = getTypeLabels(t);

  const stats = [
    { label: t("stats.total"), value: dossiers?.length ?? 0 },
    {
      label: t("stats.pending"),
      value: dossiers?.filter((d) => d.statut === "en_attente").length ?? 0,
    },
    {
      label: t("stats.confirmed"),
      value:
        dossiers?.filter((d) => ["confirme", "paye"].includes(d.statut))
          .length ?? 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 transition-colors">
      <div className="container max-w-4xl px-6 mx-auto py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-2">
              {t("header.badge")}
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {t("header.welcome", {
                name:
                  profile?.full_name?.split(" ")[0] ??
                  t("header.fallback_name"),
              })}
            </h1>
          </div>
          <Link href={`/${locale}/dashboard/nouveau-dossier`}>
            <Button
              variant="copper"
              className="gap-2 w-full sm:w-auto shadow-sm"
            >
              <Plus className="w-4 h-4" /> {t("header.new_dossier_btn")}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-surface border border-subtle/80 rounded-xl p-4 text-center hover:border-copper/30 transition-all shadow-sm"
            >
              <div className="font-display font-extrabold text-3xl gradient-text mb-1">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Dossiers list */}
        <Card className="bg-surface border-subtle/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-foreground font-display font-bold">
              {t("list.title")}
            </CardTitle>
          </CardHeader>
          <Separator className="bg-subtle/60" />
          <CardContent className="pt-0">
            {!dossiers || dossiers.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-copper/5 dark:bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-copper/70" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {t("list.empty_title")}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs font-light">
                  {t("list.empty_desc")}
                </p>
                <Link href={`/${locale}/dashboard/nouveau-dossier`}>
                  <Button variant="copper" className="gap-2">
                    <Plus className="w-4 h-4" /> {t("list.create_btn")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-subtle/60">
                {(dossiers as any[]).map((d) => {
                  const s = statusMap[d.statut as DossierStatut] || {
                    label: d.statut,
                    icon: FileText,
                    cls: "",
                  };
                  const Icon = s.icon;
                  return (
                    <div
                      key={d.id}
                      className="flex items-start justify-between gap-4 py-5 hover:bg-background/50 px-2 -mx-2 rounded-xl transition-all"
                    >
                      <div className="flex gap-3 items-start min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-copper/5 dark:bg-copper/10 border border-copper/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-copper" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {d.voyages?.titre ?? typeLabels[d.type] ?? d.type}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-light">
                            {d.message_client ?? "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1.5 font-medium">
                            {new Date(d.created_at).toLocaleDateString(
                              locale === "fr" ? "fr-FR" : "en-US",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 backdrop-blur-sm shadow-sm ${s.cls}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
