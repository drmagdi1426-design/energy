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
      {/* Light background — the colored Tharwah logo is only used on light
          backgrounds per brand guidance; request the reversed mark separately
          if a dark admin header is ever wanted. */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
            <img src="/brand/tharwah-logo.svg" alt="Tharwah Academy" className="h-9 w-auto shrink-0" />
            <div className="border-s border-gray-mid/20 ps-3">
              <p className="text-sm font-bold text-navy">{dict.common.appName}</p>
              <p className="text-xs font-medium text-academy-blue">{dict.common.tagline}</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-5">
            <Link href="/admin/dashboard" className="text-sm font-medium text-navy hover:underline">
              {dict.admin.navDashboard}
            </Link>
            <Link href="/admin/responses" className="text-sm font-medium text-navy hover:underline">
              {dict.admin.navResponses}
            </Link>
            <span className="text-sm text-gray-mid">{username}</span>
            <AdminLocaleToggle locale={locale} label={dict.common.languageToggle} />
            <AdminLogoutButton dict={dict} csrfToken={csrfToken} />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
