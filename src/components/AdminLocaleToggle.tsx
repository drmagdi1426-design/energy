'use client';

import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';

export function AdminLocaleToggle({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const target: Locale = locale === 'en' ? 'ar' : 'en';

  function handleClick() {
    document.cookie = `tharwah_admin_locale=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      lang={target}
      className="text-sm font-medium text-academy-blue underline-offset-4 hover:underline"
    >
      {label}
    </button>
  );
}
