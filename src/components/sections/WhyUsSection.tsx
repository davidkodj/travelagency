"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Lock, MessageSquare, Zap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const featureIcons = [Lock, MessageSquare, Zap];

const reviews = [
  {
    stars: 5,
    text: '"Mon visa Schengen obtenu en 10 jours. Itinéraire parfait, je recommande à 100%."',
    author: "Aminata K.",
    city: "Dakar, Sénégal",
  },
  {
    stars: 5,
    text: '"Voyage en famille à Paris, tout était parfait. Suivi WhatsApp très réactif."',
    author: "Freitz M.",
    city: "Bruxelles, Belgique",
  },
];

export default function WhyUsSection() {
  const t = useTranslations("why");
  const features = t.raw("features") as Array<{ title: string; desc: string }>;

  return (
    <section id="why" className="py-28 bg-surface relative overflow-hidden">
      {/* Subtle diagonal lines */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C4A35A 0, #C4A35A 1px, transparent 0, transparent 50%)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container max-w-6xl px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t("label")}
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-ivory leading-tight mb-5">
              {t("title")}{" "}
              <span className="gradient-text">{t("titleAccent")}</span>
            </h2>
            <p className="text-ivory-muted text-lg leading-relaxed mb-12">
              {t("subtitle")}
            </p>

            <div className="flex flex-col gap-8">
              {features.map((f, i) => {
                const Icon = featureIcons[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex gap-5 items-start group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center flex-shrink-0 group-hover:bg-copper/15 group-hover:border-copper/35 transition-colors">
                      <Icon className="w-5 h-5 text-copper" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ivory mb-1.5">
                        {f.title}
                      </h4>
                      <p className="text-sm text-ivory-muted leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right — Reviews */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Rating badge */}
            <div className="flex items-center gap-5 bg-copper/5 border border-copper/20 rounded-2xl p-6">
              <div className="font-display font-black text-6xl gradient-text leading-none">
                4.9
              </div>
              <Separator orientation="vertical" className="h-14 bg-subtle" />
              <div>
                <div className="flex gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-copper text-copper" />
                  ))}
                </div>
                <p className="text-ivory-muted text-sm leading-relaxed">
                  {t("ratingLabel")}
                </p>
              </div>
            </div>

            {reviews.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15 }}
                whileHover={{ y: -3 }}
                className="bg-raised border border-subtle rounded-2xl p-6 hover:border-copper/25 transition-colors"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(r.stars)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-3.5 h-3.5 fill-copper text-copper"
                    />
                  ))}
                </div>
                <p className="text-sm text-ivory/80 leading-[1.75] italic mb-4">
                  {r.text}
                </p>
                <p className="text-xs text-ivory-muted font-medium">
                  {r.author}{" "}
                  <span className="text-ivory-muted/50">— {r.city}</span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
