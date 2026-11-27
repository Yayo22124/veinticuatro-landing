import "server-only";
import { cookies } from "next/headers";
import { createIntl, createIntlCache, type IntlShape } from "react-intl/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  resolveLocale,
  type Locale,
} from "./config";
import { getMessages } from "./get-messages";

const intlCache = createIntlCache();

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return resolveLocale(storedLocale);
}

export async function getServerIntl(locale?: Locale): Promise<IntlShape> {
  const activeLocale = locale ?? (await getRequestLocale());

  return createIntl(
    {
      locale: activeLocale,
      defaultLocale: DEFAULT_LOCALE,
      messages: getMessages(activeLocale),
    },
    intlCache,
  );
}
