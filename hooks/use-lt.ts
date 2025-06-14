"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocaleStore } from '@/store/locale-store';
import { Locale, i18n } from '@/lib/i18n/i18n-config';

// Import the utility functions
import { loadLocaleData } from '@/lib/utils-internal';

/**
 * Hook version of lt for React components
 */
export function useLt() {
  const { currentLocale } = useLocaleStore();
  const pathname = usePathname();

  // Get route locale
  const routeLocale = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    return i18n.locales.includes(firstSegment as Locale) ? (firstSegment as Locale) : i18n.defaultLocale;
  }, [pathname]);

  // Use route locale as primary, store locale as fallback
  const activeLocale = routeLocale || currentLocale;

  // localeData is now a flat object: Record<string, string>
  const [localeData, setLocaleData] = React.useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    loadLocaleData(activeLocale).then(data => {
      if (mounted) {
        setLocaleData(data);
        setIsLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [activeLocale]);

  // No need for getNestedValue, just use localeData[key]
  const lt = React.useCallback((key: string, fallback?: string) => {
    if (!localeData) {
      return fallback || key;
    }
    const value = localeData[key];
    return value !== undefined ? value : (fallback || key);
  }, [localeData]);

  return {
    lt,
    locale: activeLocale,
    isLoading,
    localeData
  };
}
