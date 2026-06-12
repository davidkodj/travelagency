import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import { Toaster } from "@/components/ui/toaster";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // 1. Typer params comme une Promise
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 2. Ne plus destructurer locale directement ici
export default async function LocaleLayout({ children, params }: Props) {
  // 3. Attendre la résolution de la Promise params
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar locale={locale as Locale} />
      <main>{children}</main>
      <WhatsAppFloat />
      <Toaster />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </NextIntlClientProvider>
  );
}
