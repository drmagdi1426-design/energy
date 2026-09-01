import type { Metadata } from 'next';
import { getAdminLocale } from '@/lib/admin-locale';
import { dirForLocale } from '@/lib/i18n/config';
import '../globals.css';

// Root layout for the entire /admin/* tree (login + protected pages). This
// is a *separate* root from src/app/[locale]/layout.tsx — the admin app is
// not respondent-facing and is not path-localized (see lib/admin-locale.ts).
export const metadata: Metadata = {
  title: 'Tharwah Team Energy Matrix — Admin',
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  const dir = dirForLocale(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-page-gray text-navy antialiased">{children}</body>
    </html>
  );
}
