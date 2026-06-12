import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// Routes nécessitant une authentification
const protectedRoutes = ["/dashboard", "/admin"];
// Routes réservées exclusivement aux administrateurs
const adminRoutes = ["/admin"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Détection et extraction de la locale
  const locale =
    locales.find((l) => pathname.startsWith(`/${l}`)) ?? defaultLocale;

  // 2. Nettoyage du préfixe de langue pour tester la route
  const pathnameWithoutLocale =
    locales.reduce(
      (acc, l) => acc.replace(new RegExp(`^/${l}`), ""),
      pathname,
    ) || "/"; // Évite d'avoir une chaîne vide pour la racine

  const isProtected = protectedRoutes.some((r) =>
    pathnameWithoutLocale.startsWith(r),
  );
  const isAdmin = adminRoutes.some((r) => pathnameWithoutLocale.startsWith(r));

  // --- ÉTAPE A : INITIALISATION DE NEXT-INTL EN PREMIER ---
  // On laisse next-intl générer la réponse de base (gestion de la langue, redirection si locale manquante)
  let response = intlMiddleware(request);

  // --- ÉTAPE B : INSTANCIATION DE SUPABASE SUR LA RÉPONSE DE NEXT-INTL ---
  // Cela permet à Supabase d'écrire directement ses cookies de session modifiés dans l'en-tête de next-intl
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // --- ÉTAPE C : COMPTE RENTDU DE L'UTILISATEUR (Indispensable pour rafraîchir le token) ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- ÉTAPE D : CONTRÔLE DES ACCÈS AUX ROUTES ---
  if (isProtected) {
    // Si pas de session -> Redirection vers la page login correspondante à la locale
    if (!user) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/login`, request.url),
      );
    }

    // Si route admin -> Vérification du profil en base de données
    if (isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["admin", "super_admin"].includes(profile.role)) {
        return NextResponse.redirect(
          new URL(`/${locale}/dashboard`, request.url),
        );
      }
    }
  }

  // Retourne la réponse enrichie des cookies Supabase et gérée par next-intl
  return response;
}

export const config = {
  // Le matcher exclut les assets statiques et les routes d'API globales internes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
