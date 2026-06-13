"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // 1. Importation du composant Image de Next.js
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react"; // On peut enlever 'Plane' si on ne s'en sert plus
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../shared/ThemeToggle";

interface Props {
  locale: Locale;
}

export default function Navbar({ locale }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState("client");
  const supabase = createClient();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (p) setUserRole(p.role);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (p) setUserRole(p.role);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const switchLocale = (l: string) => {
    const segs = pathname.split("/");
    segs[1] = l;
    router.push(segs.join("/"));
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    setMobileOpen(false);
  };

  const solid = !isHome || scrolled;

  const navLinks = [
    { href: `/${locale}#services`, label: t("services") },
    { href: `/${locale}#destinations`, label: t("destinations") },
    { href: `/${locale}/voyages`, label: "Catalogue" },
    { href: `/${locale}/contact`, label: "Contact" },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        solid
          ? "bg-abyss/90 backdrop-blur-xl border-b border-subtle"
          : "bg-transparent border-b border-transparent",
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* 2. Intégration du composant Image */}
              <Image
                src="/images/logo.png" // Remplace par le chemin réel de ton logo (.svg, .png)
                alt="VoyageElite Logo"
                width={32} // Équivalent à w-8
                height={32} // Équivalent à h-8
                priority // Charge le logo en priorité absolue (LCP)
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-display font-bold text-lg text-ivory tracking-tight">
              Voyage<span className="gradient-text">Elite</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-ivory-muted hover:text-ivory transition-colors rounded-lg hover:bg-raised/60 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Lang */}
            <div className="flex items-center gap-0.5 bg-surface/60 border border-subtle rounded-lg p-1">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-md font-bold tracking-widest uppercase transition-all",
                    locale === l
                      ? "bg-copper-gradient text-abyss"
                      : "text-ivory-muted hover:text-ivory",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <ThemeToggle solid={solid} />

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/${locale}/${["admin", "super_admin"].includes(userRole) ? "admin" : "dashboard"}`}
                >
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {t("account")}
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory-muted hover:text-ivory hover:bg-raised/60 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="ghost" size="sm">
                    {t("login")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button variant="copper" size="sm">
                    {t("account")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-ivory-dim hover:text-ivory hover:bg-raised/60 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden border-t border-subtle bg-abyss/95 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-ivory-muted hover:text-ivory hover:bg-raised/60 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-3 mt-1 border-t border-subtle">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      locale === l
                        ? "bg-copper-gradient text-abyss"
                        : "bg-surface border border-subtle text-ivory-muted",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <ThemeToggle
                solid
                className="border border-subtle rounded-lg flex-shrink-0"
              />

              {user ? (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/${locale}/${["admin", "super_admin"].includes(userRole) ? "admin" : "dashboard"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <User className="w-4 h-4" />
                      {t("account")}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-ivory-muted"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="copper" className="w-full">
                      {t("account")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
