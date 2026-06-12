/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        // Variables Shadcn standard (dynamiques)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        copper: {
          DEFAULT: "var(--copper)", // Devient dynamique
          light: "var(--copper-light)", // Devient dynamique
          dim: "var(--copper-dim)", // Devient dynamique
          50: "#FDF8EC",
          100: "#F7ECCC",
          200: "#EDD899",
          300: "#E0C166",
          400: "#D4B040",
          500: "#C4A35A",
          600: "#A8883C",
          700: "#8B6D2A",
          800: "#6E521A",
          900: "#50380C",
        },

        /* --- LA CORRECTION CRUCIALE ICI --- */
        /* On lie les classes utilitaires directement à tes variables CSS fluides */
        abyss: "var(--abyss)",
        surface: "var(--surface)",
        raised: "var(--surface-raised)",
        subtle: "var(--border-subtle)",
        ivory: {
          DEFAULT: "var(--ivory)",
          dim: "var(--muted-foreground)", // Suit la couleur atténuée du thème
          muted: "var(--muted-foreground)",
        },
      },
      fontFamily: {
        // On aligne les polices sur celles injectées par ton layout (Syne et Outfit)
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "copper-gradient":
          "linear-gradient(135deg, var(--copper-light) 0%, var(--copper) 50%, #6E5210 100%)",
        "abyss-gradient":
          "linear-gradient(180deg, var(--abyss) 0%, var(--surface) 100%)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        draw: {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 20px rgba(196,163,90,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(196,163,90,0.25)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "infinite-scroll": "scroll 30s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        "slide-right": "slide-right 0.5s cubic-bezier(0.16,1,0.3,1) both",
        draw: "draw 2s ease forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
