import { createClient } from "@/lib/supabase/server";
import { Globe, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server"; // 1. On importe la version Serveur de next-intl

interface Props {
  params: Promise<{ locale: string }> | { locale: string };
}

// Génération dynamique des métadonnées traduites
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "catalog",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function VoyagesPage({ params }: Props) {
  // Attendre la résolution des params pour Next.js 14/15
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // 2. On charge les traductions côté Serveur
  const t = await getTranslations({ locale, namespace: "catalog" });

  const supabase = await createClient();
  const { data: voyages } = await supabase
    .from("voyages")
    .select("*")
    .eq("actif", true)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="min-h-screen bg-background text-foreground pt-16 transition-colors">
        {/* Hero header */}
        <div className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
            <div
              className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--copper) 1px,transparent 1px),linear-gradient(90deg,var(--copper) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>
          <div className="container max-w-6xl px-6 mx-auto relative z-10">
            <p className="text-copper text-xs tracking-[0.2em] uppercase font-bold mb-4">
              {t("badge")}
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-foreground mb-5 leading-tight tracking-tight">
              {t("title_start")}{" "}
              <span className="gradient-text">{t("title_accent")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed font-light">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Zone de contenu principale */}
        <div className="container max-w-6xl px-6 mx-auto pb-28">
          {!voyages || voyages.length === 0 ? (
            /* ÉTAT VIDE TRADUIT */
            <div className="flex flex-col items-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-copper/5 dark:bg-copper/10 border border-copper/20 flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-copper/70" />
              </div>
              <h2 className="font-display font-semibold text-xl text-foreground mb-2">
                {t("empty_title")}
              </h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-sm">
                {t("empty_description")}
              </p>
              <Link href={`/${locale}/auth/register`}>
                <Button variant="copper" className="gap-2 shadow-lg">
                  {t("empty_cta")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            /* GRILLE DES CARTES */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {voyages.map((v) => (
                <div
                  key={v.id}
                  className="group flex flex-col justify-between bg-surface border border-subtle/80 rounded-2xl overflow-hidden hover:border-copper/40 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-copper/5"
                >
                  {/* Image Container */}
                  <div className="h-52 bg-muted overflow-hidden relative">
                    {v.image_url ? (
                      <img
                        src={v.image_url}
                        alt={v.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 dark:opacity-75 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-surface to-raised">
                        <Globe className="w-12 h-12 text-copper/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-6 pt-7 relative flex-1 flex flex-col justify-between">
                    {/* Badge Destination */}
                    <div className="absolute -top-4 left-6">
                      <span className="text-[10px] font-bold tracking-widest text-white border border-white/10 bg-copper px-3 py-1.5 rounded-lg shadow-md uppercase">
                        {v.destination}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-xl text-foreground leading-snug mb-2 group-hover:text-copper transition-colors">
                        {v.titre}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-5 font-light">
                        {v.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs mb-6">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-subtle text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-copper/80" />
                          {v.duree_jours} {t("card_days")}
                        </span>
                        {v.places_disponibles > 0 && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-subtle text-muted-foreground">
                            <Users className="w-3.5 h-3.5 text-copper/80" />
                            {v.places_disponibles} {t("card_seats")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer de la carte */}
                    <div className="flex items-center justify-between pt-4 border-t border-subtle/60">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          {t("card_from")}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display font-extrabold text-2xl text-foreground">
                            {v.prix.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-copper">
                            EUR
                          </span>
                        </div>
                      </div>

                      <Link href={`/${locale}/auth/register`}>
                        <Button
                          variant="copper"
                          size="sm"
                          className="gap-1.5 px-4 font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          {t("card_cta")} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
