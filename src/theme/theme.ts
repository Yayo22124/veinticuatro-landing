"use client";

import { createTheme, type PaletteOptions, type Theme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export const DEFAULT_THEME_MODE: ThemeMode = "light";

const PALETTES: Record<ThemeMode, PaletteOptions> = {
  light: {
    mode: "light",
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#121212",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#525252",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#121212",
      secondary: "#525252",
    },
    divider: "rgba(18, 18, 18, 0.08)",
  },
  dark: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    primary: {
      main: "#F5F5F5",
      contrastText: "#121212",
    },
    secondary: {
      main: "#A3A3A3",
      contrastText: "#121212",
    },
    text: {
      primary: "#F5F5F5",
      secondary: "#A3A3A3",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
};

export function createStudioTheme(mode: ThemeMode = DEFAULT_THEME_MODE): Theme {
  const palette = PALETTES[mode];
  const backgroundDefault =
    mode === "light" ? "#FAFAFA" : "#121212";
  const backgroundPaper =
    mode === "light" ? "#FFFFFF" : "#1E1E1E";
  const textPrimary =
    mode === "light" ? "#121212" : "#F5F5F5";
  const borderColor =
    mode === "light"
      ? "rgba(18, 18, 18, 0.08)"
      : "rgba(255, 255, 255, 0.08)";

  return createTheme({
    palette,
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily:
        "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      h1: {
        fontWeight: 500,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontWeight: 500,
        letterSpacing: "-0.015em",
      },
      h3: {
        fontWeight: 500,
        letterSpacing: "-0.01em",
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
        letterSpacing: "0.01em",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: "smooth",
            "@media (prefers-reduced-motion: reduce)": {
              scrollBehavior: "auto",
            },
          },
          body: {
            backgroundColor: backgroundDefault,
            color: textPrimary,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: backgroundPaper,
            border: `1px solid ${borderColor}`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  });
}
