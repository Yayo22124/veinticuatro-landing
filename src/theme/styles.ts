import type { SxProps, Theme } from "@mui/material/styles";

export const BRAND_OVERLINE_SX: SxProps<Theme> = {
  letterSpacing: "0.24em",
  display: "block",
  textTransform: "uppercase",
};

export const OUTLINED_ICON_BUTTON_SX: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
};

export const SOCIAL_ICON_BUTTON_SX: SxProps<Theme> = {
  color: "text.secondary",
  border: "1px solid",
  borderColor: "divider",
  transition: "color 160ms ease, border-color 160ms ease",
  "&:hover": {
    color: "text.primary",
    borderColor: "text.primary",
  },
};

export const LANGUAGE_SWITCHER_SX: SxProps<Theme> = {
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
};

export const TOP_RIGHT_CONTROL_SX: SxProps<Theme> = {
  position: "absolute",
  top: 24,
  right: 24,
};
