import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Header } from '@/components/Header';

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  return (
    <>
      <Header locale={locale} dict={dict} />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="brand-card text-center">
          <h1 className="text-2xl font-bold text-navy">{dict.confirmation.title}</h1>
          <p className="mt-3 text-gray-dark">{dict.confirmation.body}</p>
          <p className="field-help mt-4">{dict.confirmation.note}</p>
          <Link href={`/${locale}`} className="btn-secondary mt-6 inline-block">
            {dict.confirmation.homeLink}
          </Link>
        </div>
      </main>
    </>
  );
}
