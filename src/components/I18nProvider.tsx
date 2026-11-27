"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { IntlProvider } from "react-intl";
import { setLocaleCookie } from "@/i18n/actions";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  isPending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface I18nProviderProps {
  initialLocale: Locale;
  children: ReactNode;
}

export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
  const router = useRouter();
  const [locale, setActiveLocale] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return;
      }

      setActiveLocale(nextLocale);

      startTransition(async () => {
        await setLocaleCookie(nextLocale);
        router.refresh();
      });
    },
    [locale, router],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isPending }}>
      <IntlProvider
        locale={locale}
        defaultLocale={DEFAULT_LOCALE}
        messages={getMessages(locale)}
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within an I18nProvider");
  }

  return context;
}
