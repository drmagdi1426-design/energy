'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';

/**
 * Swaps the leading /en or /ar path segment while preserving the rest of
 * the URL, so switching language never loses the respondent's place.
 */
export function LocaleToggle({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const target: Locale = locale === 'en' ? 'ar' : 'en';
  const rest = pathname.split('/').slice(2).join('/');
  const href = `/${target}${rest ? `/${rest}` : ''}`;

  return (
    <Link
      href={href}
      lang={target}
      className="text-sm font-medium text-academy-blue underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}
