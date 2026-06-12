"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, X } from "lucide-react";

const destinations = [
  {
    name: "Paris",
    country: "France",
    accent: "#7bafd4",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Dubaï",
    country: "Émirats",
    accent: "#e8a040",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Istanbul",
    country: "Turquie",
    accent: "#d4607a",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Maldives",
    country: "Océan Indien",
    accent: "#4dbcd4",
    image:
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Rome",
    country: "Italie",
    accent: "#d4883c",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Londres",
    country: "Royaume-Uni",
    accent: "#8090b4",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function DestinationsSection() {
  const t = useTranslations("destinations");
  const locale = useLocale();
  const [activeDest, setActiveDest] = useState<
    (typeof destinations)[number] | null
  >(null);

  const repeatedDestinations = [...destinations, ...destinations];

  return (
    // 1. Fond réactif sur la section entière
    <section
      id="destinations"
      className="py-28 bg-background text-foreground overflow-hidden transition-colors"
    >
      <div className="container max-w-6xl px-6 mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t("label")}
            </p>
            {/* 2. Titre réactif (text-foreground) */}
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-foreground leading-tight">
              {t("title")}{" "}
              <span className="gradient-text">{t("titleAccent")}</span>
            </h2>
          </div>
          {/* 3. Lien "Voir tout" réactif */}
          <Link
            href={`/${locale}/voyages`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-copper transition-colors whitespace-nowrap group"
          >
            {t("viewAll")}{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* ZONE DE DÉFILEMENT INFINI */}
      <div className="relative w-full flex overflow-x-hidden">
        {/* 4. Masques de bordure adaptatifs (utilisent var(--abyss) pour un fondu parfait) */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        {/* Le conteneur animé qui boucle */}
        <div className="flex gap-4 w-max animate-infinite-scroll hover:[animation-play-state:paused] px-2">
          {repeatedDestinations.map((dest, i) => (
            <div
              key={i}
              onClick={() => setActiveDest(dest)}
              // 5. Structure de carte réactive (bg-surface et border-subtle)
              className="relative rounded-2xl overflow-hidden aspect-[3/4] w-[160px] sm:w-[200px] md:w-[220px] cursor-pointer bg-surface border border-subtle hover:border-copper/40 transition-all group flex-shrink-0"
            >
              {/* Image Unsplash */}
              <div className="absolute inset-0 opacity-75 dark:opacity-65 group-hover:opacity-90 dark:group-hover:opacity-85 transition-all duration-500 group-hover:scale-105">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 640px) 160px, 220px"
                  className="object-cover"
                  priority={i < 4}
                />
              </div>

              {/* Gradient de lisibilité textuelle sur l'image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Contenu textuel de la carte */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-copper" />
                  <span className="text-copper text-[9px] font-semibold tracking-wide uppercase">
                    {dest.country}
                  </span>
                </div>
                {/* 6. Le texte sur l'image reste en blanc/ivory fixe pour trancher sur le dégradé sombre */}
                <div className="font-display font-bold text-white text-sm sm:text-base leading-tight">
                  {dest.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POPUP */}
      <AnimatePresence>
        {activeDest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Fond d'arrière-plan de la modale adaptatif */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDest(null)}
              className="absolute inset-0 bg-black/40 dark:bg-black/85 backdrop-blur-md"
            />

            {/* Conteneur principal de la Modale */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              // 7. Utilisation de bg-surface et border-subtle adaptatifs pour la structure
              className="relative w-full max-w-3xl bg-surface border border-subtle rounded-3xl overflow-hidden shadow-2xl z-10 aspect-video md:aspect-[16/10]"
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={activeDest.image}
                  alt={activeDest.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* 8. Superposition de dégradés adaptatifs pour garantir les contrastes de textes */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />
              </div>

              {/* Bouton Fermer */}
              <button
                onClick={() => setActiveDest(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 border border-white/10 text-white hover:text-copper transition-all backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Contenu intérieur de la modale */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-copper" />
                    <span className="text-copper text-xs font-bold tracking-widest uppercase">
                      {activeDest.country}
                    </span>
                  </div>
                  {/* Les textes à l'intérieur de l'image restent blancs fixes pour une lisibilité parfaite */}
                  <h3 className="font-display font-bold text-3xl md:text-5xl text-white">
                    {activeDest.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-2 max-w-md font-light">
                    Explorez des offres exclusives de séjours, circuits et
                    accompagnement sur mesure pour {activeDest.name}.
                  </p>
                </div>

                <Link
                  href={`/${locale}/voyages?search=${activeDest.name.toLowerCase()}`}
                  onClick={() => setActiveDest(null)}
                >
                  <button className="px-6 py-3 bg-copper hover:bg-copper-light text-black font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
                    Voir les offres <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
