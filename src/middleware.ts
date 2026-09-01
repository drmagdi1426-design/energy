import { NextRequest, NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { CSRF_COOKIE_NAME } from '@/lib/csrf-cookie-name';

// Locale routing (redirects a bare / or /some-path to /en or /ar) AND CSRF
// token issuance. Both live here because Next.js only allows *setting*
// cookies from middleware or a Route Handler/Server Action — never while
// rendering a Server Component — so this is the one place a fresh CSRF
// cookie can be attached to the response for a normal page GET.
export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt).*)'],
};

function detectLocale(req: NextRequest): string {
  const header = req.headers.get('accept-language') ?? '';
  const preferred = header.split(',')[0]?.split('-')[0]?.toLowerCase();
  return (LOCALES as readonly string[]).includes(preferred ?? '') ? preferred! : DEFAULT_LOCALE;
}

/** Edge-runtime-safe random token (Web Crypto, not Node's `crypto` module). */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api/');
  // Static files served from /public (e.g. /brand/tharwah-logo.svg,
  // /robots.txt) have a file extension in their last segment — never
  // locale-redirect those.
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname);

  let response: NextResponse;

  if (isApi || isStaticAsset) {
    response = NextResponse.next();
  } else {
    const segments = pathname.split('/').filter(Boolean);
    const first = segments[0];
    const isAdmin = first === 'admin';
    const hasLocalePrefix = first !== undefined && (LOCALES as readonly string[]).includes(first);

    if (isAdmin || hasLocalePrefix) {
      response = NextResponse.next();
    } else {
      const locale = detectLocale(req);
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
      response = NextResponse.redirect(url);
    }
  }

  if (!req.cookies.get(CSRF_COOKIE_NAME)) {
    response.cookies.set(CSRF_COOKIE_NAME, generateToken(), {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.FORCE_SECURE_COOKIES !== 'false',
      path: '/',
      maxAge: 60 * 60 * 4,
    });
  }

  return response;
}
