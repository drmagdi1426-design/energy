import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n/config';

/**
 * The admin dashboard is not path-localized (it lives at /admin/*, outside
 * the /[locale] segment) since it's an internal tool, not respondent-facing.
 * Language is instead a plain, non-sensitive preference cookie so it stays
 * consistent across the shared layout and every page underneath it.
 */
const ADMIN_LOCALE_COOKIE = 'tharwah_admin_locale';

export async function getAdminLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(ADMIN_LOCALE_COOKIE)?.value === 'ar' ? 'ar' : 'en';
}

export { ADMIN_LOCALE_COOKIE };
