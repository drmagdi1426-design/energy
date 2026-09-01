import { LocaleToggle } from '@/components/LocaleToggle';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Masthead. Uses public/brand/tharwah-logo.svg — a hand-recreated
 * approximation of the Tharwah Academy mark (see the comment in that file),
 * not the authentic vector asset. Swap the file at that path once the real
 * one is available; nothing else needs to change. Light backgrounds only —
 * request the reversed/light mark separately for a dark hero section.
 */
export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no next/image optimization needed */}
          <img src="/brand/tharwah-logo.svg" alt="Tharwah Academy" className="h-10 w-auto shrink-0" />
          <div className="border-s border-gray-mid/20 ps-3">
            <p className="text-sm font-bold text-navy">{dict.common.appName}</p>
            <p className="text-xs font-medium text-academy-blue">{dict.common.tagline}</p>
          </div>
        </div>
        <LocaleToggle locale={locale} label={dict.common.languageToggle} />
      </div>
    </header>
  );
}
