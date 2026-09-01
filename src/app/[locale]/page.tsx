import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fillTemplate } from '@/lib/i18n/format';
import { Header } from '@/components/Header';
import {
  estimatedCompletionMinutes,
  TOTAL_REQUIRED_ITEM_COUNT,
} from '@/lib/constants';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const minutes = estimatedCompletionMinutes();

  return (
    <>
      <Header locale={locale} dict={dict} />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="brand-card">
          <h1 className="text-2xl font-bold text-navy">{dict.landing.title}</h1>
          <p className="mt-3 text-gray-dark">{dict.landing.intro}</p>

          <div className="mt-6 rounded-lg bg-mint px-4 py-3">
            <p className="font-semibold text-navy">{dict.landing.purposeTitle}</p>
            <p className="mt-1 text-sm text-gray-dark">{dict.landing.purpose}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-mid">
            <span className="rounded-full bg-page-gray px-3 py-1 font-medium text-navy">
              {fillTemplate(dict.landing.estimatedTimeLabel, { minutes })}
            </span>
            <span className="rounded-full bg-page-gray px-3 py-1">
              {fillTemplate(dict.landing.itemCountNote, { items: TOTAL_REQUIRED_ITEM_COUNT })}
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/survey`} className="btn-primary text-center">
              {dict.landing.startButton}
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-sm text-gray-mid hover:underline">
            {dict.landing.adminLink}
          </Link>
        </div>
      </main>
    </>
  );
}
