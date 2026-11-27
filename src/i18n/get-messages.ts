import type { Locale } from "./config";
import { enMessages } from "./messages/en";
import { esMessages, type Messages } from "./messages/es";

const MESSAGES_BY_LOCALE: Record<Locale, Messages> = {
  es: esMessages,
  en: enMessages,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES_BY_LOCALE[locale];
}
