import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { i18n } from "@/lib/i18n/i18n-config";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // Check if the pathname is for a static asset/public file
  if (
    [
      '/manifest.json',
      '/favicon.ico',
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/opengraph-image.png',
      '/Doraemon.jpg',
    ].includes(pathname) || 
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|mp3|mp4|webm|ogg|pdf|css|js)$/)
  )
    return

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Handle home page case specifically
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(`/${locale}`, request.url),
      );
    }

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/` and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
