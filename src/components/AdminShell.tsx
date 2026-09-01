import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { AdminLocaleToggle } from '@/components/AdminLocaleToggle';
import { AdminLogoutButton } from '@/components/AdminLogoutButton';

export function AdminShell({
  locale,
  dict,
  csrfToken,
  username,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  csrfToken: string;
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page-gray">
      <header className="border-b border-black/5 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-lg font-bold">{dict.common.appName}</p>
            <p className="text-xs text-mint">{dict.common.tagline}</p>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/admin/dashboard" className="text-sm font-medium hover:underline">
              {dict.admin.navDashboard}
            </Link>
            <Link href="/admin/responses" className="text-sm font-medium hover:underline">
              {dict.admin.navResponses}
            </Link>
            <span className="text-sm text-mint">{username}</span>
            <AdminLocaleToggle locale={locale} label={dict.common.languageToggle} />
            <AdminLogoutButton dict={dict} csrfToken={csrfToken} />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
