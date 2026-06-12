import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google"; // 1. On importe tes polices d'origine
import "@/styles/globals.css";

// 2. On configure Plus Jakarta Sans
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// 3. On configure Inter
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    template: "%s | VoyageElite",
    default: "VoyageElite — Agence de voyage Europe & Monde",
  },
  description:
    "Voyages organisés, tourisme sur mesure et accompagnement visa depuis l'Afrique de l'Ouest.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('voyageelite-theme') || 'dark';
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      {/* 4. On injecte les variables correspondantes à ton tailwind.config.js */}
      <body
        className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
