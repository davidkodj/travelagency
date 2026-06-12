import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

const STATUS_MAP: Record<
  DossierStatut,
  { label: string; icon: any; cls: string }
> = {
  en_attente: { label: "En attente", icon: Clock, cls: "badge-en_attente" },
  en_etude: { label: "En étude", icon: FileText, cls: "badge-en_etude" },
  confirme: { label: "Confirmé", icon: CheckCircle2, cls: "badge-confirme" },
  paye: { label: "Payé", icon: CreditCard, cls: "badge-paye" },
  termine: { label: "Terminé", icon: Archive, cls: "badge-termine" },
  annule: { label: "Annulé", icon: XCircle, cls: "badge-annule" },
};
const TYPE_LABELS: Record<string, string> = {
  voyage_organise: "Voyage organisé",
  sur_mesure: "Sur mesure",
  visa: "Visa & démarches",
};

// 1. Mise à jour de l'interface : params peut être une Promise ou résolu
interface Props {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function DashboardPage({ params }: Props) {
  // 2. Correction de l'erreur : On attend la résolution de params avant d'extraire la locale
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

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

  const stats = [
    { label: "Total", value: dossiers?.length ?? 0 },
    {
      label: "En attente",
      value: dossiers?.filter((d) => d.statut === "en_attente").length ?? 0,
    },
    {
      label: "Confirmés",
      value:
        dossiers?.filter((d) => ["confirme", "paye"].includes(d.statut))
          .length ?? 0,
    },
  ];

  return (
    // bg-abyss -> bg-background | text-foreground
    <div className="min-h-screen bg-background text-foreground pt-16 transition-colors">
      <div className="container max-w-4xl px-6 mx-auto py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Espace client
            </p>
            {/* text-ivory -> text-foreground */}
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              Bonjour, {profile?.full_name?.split(" ")[0] ?? "Voyageur"}
            </h1>
          </div>
          <Link href={`/${locale}/dashboard/nouveau-dossier`}>
            <Button
              variant="copper"
              className="gap-2 w-full sm:w-auto shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nouveau dossier
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((s, i) => (
            // bg-raised -> bg-surface | border-subtle
            <div
              key={i}
              className="bg-surface border border-subtle/80 rounded-xl p-4 text-center hover:border-copper/30 transition-all shadow-sm"
            >
              <div className="font-display font-extrabold text-3xl gradient-text mb-1">
                {s.value}
              </div>
              {/* text-ivory-muted -> text-muted-foreground */}
              <div className="text-xs text-muted-foreground font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Dossiers list */}
        {/* bg-raised -> bg-surface */}
        <Card className="bg-surface border-subtle/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-foreground font-display font-bold">
              Mes dossiers
            </CardTitle>
          </CardHeader>
          <Separator className="bg-subtle/60" />
          <CardContent className="pt-0">
            {!dossiers || dossiers.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-copper/5 dark:bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-copper/70" />
                </div>
                {/* text-ivory -> text-foreground */}
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Aucun dossier
                </h3>
                {/* text-ivory-muted -> text-muted-foreground */}
                <p className="text-muted-foreground text-sm mb-6 max-w-xs font-light">
                  Soumettez votre première demande de voyage ou d'accompagnement
                  visa.
                </p>
                <Link href={`/${locale}/dashboard/nouveau-dossier`}>
                  <Button variant="copper" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Créer un dossier
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-subtle/60">
                {(dossiers as any[]).map((d) => {
                  const s = STATUS_MAP[d.statut as DossierStatut];
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
                          {/* text-ivory -> text-foreground */}
                          <p className="font-semibold text-foreground text-sm truncate">
                            {d.voyages?.titre ?? TYPE_LABELS[d.type] ?? d.type}
                          </p>
                          {/* text-ivory-muted -> text-muted-foreground */}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-light">
                            {d.message_client ?? "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1.5 font-medium">
                            {new Date(d.created_at).toLocaleDateString(
                              "fr-FR",
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
