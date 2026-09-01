import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Header } from '@/components/Header';
import { SurveyWizard } from '@/components/SurveyWizard';
import { getCsrfToken } from '@/lib/csrf';

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const csrfToken = await getCsrfToken();
  const retentionMonths = Number(process.env.DATA_RETENTION_MONTHS ?? 18);

  return (
    <>
      <Header locale={locale} dict={dict} />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <SurveyWizard locale={locale} dict={dict} csrfToken={csrfToken} retentionMonths={retentionMonths} />
      </main>
    </>
  );
}
