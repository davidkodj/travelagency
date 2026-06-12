"use client";
import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Clock, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Animated route paths — the signature element */
function RouteMap() {
  const prefersReduced = useReducedMotion();
  const paths = [
    "M80,320 C180,280 260,160 380,140 C480,124 540,180 640,160",
    "M100,400 C200,360 300,240 420,220 C520,204 580,260 680,240",
    "M60,260 C140,220 220,120 320,100 C400,84 460,140 560,120 C640,104 700,80 760,60",
    "M140,460 C240,420 360,300 480,280 C580,264 640,320 740,300",
  ];
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-25 dark:opacity-20"
      viewBox="0 0 800 500"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="#C4A35A"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          initial={{ strokeDashoffset: 1000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2.5, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}
      {[
        [380, 140],
        [640, 160],
        [320, 100],
        [560, 120],
        [480, 280],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="3"
          fill="#C4A35A"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 + i * 0.2, duration: 0.4 }}
        />
      ))}
    </svg>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroSection() {
  const t = useTranslations("hero");
  const locale = useLocale();

  const stats = [
    { icon: Globe, num: "48", label: t("stat_countries") },
    { icon: Star, num: "4.9", label: t("stat_rating") },
    { icon: Shield, num: "98%", label: t("stat_visa") },
    { icon: Clock, num: "48h", label: "Réponse garantie" },
  ];

  return (
    // 1. Changement du bg-abyss fixe par la couleur adaptative du thème
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-background text-foreground pt-16">
      {/* Animated route map signature */}
      <div className="absolute inset-0 overflow-hidden">
        <RouteMap />
      </div>

      {/* Radial gradient bloom */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(196,163,90,0.08) 0%, transparent 70%)",
          }}
        />
        {/* 2. Le fondu bas utilise maintenant var(--abyss) au lieu du noir fixe */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: "linear-gradient(to top, var(--abyss), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 container max-w-5xl px-6 mx-auto text-center py-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 mb-10"
          >
            {/* Un fond subtil adapté au mode clair et sombre via bg-copper/5 et border-copper/20 */}
            <span className="text-copper text-xs tracking-[0.2em] uppercase font-semibold border border-copper/20 bg-copper/5 dark:bg-copper/10 px-4 py-2 rounded-full">
              {t("badge")}
            </span>
          </motion.div>

          {/* H1 */}
          {/* 3. text-ivory remplacé par text-foreground pour suivre la police claire ou sombre */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-extrabold text-5xl sm:text-6xl lg:text-[5.5rem] text-foreground leading-[1.02] tracking-tight mb-6"
          >
            {t("title")}
            <br />
            <span className="gradient-text">{t("titleAccent")}</span>
          </motion.h1>

          {/* Subtitle */}
          {/* 4. text-ivory-muted remplacé par la classe globale text-muted-foreground */}
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12 font-light"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
          >
            <Link href={`/${locale}/auth/register`}>
              <Button
                variant="copper"
                size="xl"
                className="gap-2 group w-full sm:w-auto"
              >
                {t("cta_primary")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={`/${locale}/voyages`}>
              <Button
                variant="outline"
                size="xl"
                className="gap-2 w-full sm:w-auto"
              >
                {t("cta_secondary")}
              </Button>
            </Link>
          </motion.div>

          {/* Stats Section */}
          {/* 5. Refonte de la grille : utilisation de bordures et de fonds réactifs */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto"
          >
            {stats.map(({ icon: Icon, num, label }, i) => (
              <motion.div
                key={i}
                // Utilisation de bg-surface (qui est dynamique), bordure adaptative et effet glassmorphism discret
                className="bg-surface/40 dark:bg-surface/60 backdrop-blur-md border border-subtle/60 rounded-xl p-4 text-center hover:border-copper/40 transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon className="w-4 h-4 text-copper mx-auto mb-2" />

                {/* Nombre principal réactif */}
                <div className="font-display font-bold text-2xl text-foreground mb-0.5">
                  {num}
                </div>

                {/* Libellé atténué réactif */}
                <div className="text-muted-foreground text-xs leading-tight">
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-copper/60 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
