"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useIntl } from "react-intl";
import { useLocale } from "@/components/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const intl = useIntl();
  const { locale, setLocale, isPending } = useLocale();

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: Locale | null) => {
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
      aria-label={intl.formatMessage({ id: "language.label" })}
      sx={{
        "& .MuiToggleButton-root": {
          px: 1.25,
          py: 0.35,
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          color: "text.secondary",
          borderColor: "divider",
          "&.Mui-selected": {
            color: "text.primary",
            backgroundColor: "action.selected",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          },
        },
      }}
    >
      {SUPPORTED_LOCALES.map((item) => (
        <ToggleButton key={item} value={item}>
          {intl.formatMessage({ id: `language.${item}` })}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
