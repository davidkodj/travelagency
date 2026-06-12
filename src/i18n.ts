import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. On attend la promesse (qui peut être string | undefined)
  const locale = await requestLocale;

  // 2. Sécurité : Si pas de locale ou langue non supportée, on lève une erreur 404
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    // 3. On force le type (as Locale) pour garantir à TypeScript que ce n'est pas undefined
    locale: locale as Locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
