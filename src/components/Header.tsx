import { LocaleToggle } from '@/components/LocaleToggle';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Masthead. NOTE: this renders a text wordmark, not the Tharwah Academy
 * logo file — the actual colored logo asset (transparent background, 1.793
 * aspect ratio) was not supplied to this build. Drop it at
 * public/brand/tharwah-logo.svg and swap the wordmark block below for an
 * <img src="/brand/tharwah-logo.svg" alt="Tharwah Academy" /> once available
 * (light backgrounds only — request the reversed mark separately for a dark
 * hero section). Flagged in README "Decisions Log".
 */
export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <p className="text-lg font-bold text-navy">{dict.common.appName}</p>
          <p className="text-xs font-medium text-academy-blue">{dict.common.tagline}</p>
        </div>
        <LocaleToggle locale={locale} label={dict.common.languageToggle} />
      </div>
    </header>
  );
}
