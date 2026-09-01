import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, isLocale, dirForLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import '../globals.css';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.common.appName,
    description: dict.landing.purpose,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dir = dirForLocale(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-page-gray text-navy antialiased">{children}</body>
    </html>
  );
}
