"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { MouseEvent } from "react";
import { useIntl } from "react-intl";
import { useLocale } from "@/components/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { LANGUAGE_SWITCHER_SX } from "@/theme/styles";

export function LanguageSwitcher() {
  const intl = useIntl();
  const { locale, setLocale, isPending } = useLocale();
  const ariaLabel = intl.formatMessage({ id: "language.label" });

  const handleChange = (_: MouseEvent<HTMLElement>, value: Locale | null) => {
    if (value) {
      setLocale(value);
    }
  };

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={locale}
      onChange={handleChange}
      disabled={isPending}
      aria-label={ariaLabel}
      sx={LANGUAGE_SWITCHER_SX}
    >
      {SUPPORTED_LOCALES.map((item) => (
        <ToggleButton key={item} value={item}>
          {intl.formatMessage({ id: `language.${item}` })}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
