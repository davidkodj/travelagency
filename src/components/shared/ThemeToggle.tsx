"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  solid?: boolean; // true = fond visible (navbar scrollée), false = transparent
}

export default function ThemeToggle({ className, solid = true }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Récupère le thème initial au montage du composant
  useEffect(() => {
    const localTheme = localStorage.getItem("voyageelite-theme") as
      | "light"
      | "dark";
    if (localTheme) {
      setTheme(localTheme);
    } else {
      // Par défaut 'dark' comme dans ton script de layout
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";

    // 1. Mettre à jour l'état local
    setTheme(nextTheme);

    // 2. Sauvegarder dans le localStorage
    localStorage.setItem("voyageelite-theme", nextTheme);

    // 3. Modifier la classe sur la balise <html>
    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
        solid
          ? "text-ivory-muted hover:text-ivory hover:bg-raised/60"
          : "text-white/60 hover:text-white hover:bg-white/10",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
