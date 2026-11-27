"use client";

import { createTheme } from "@mui/material/styles";

export const studioTheme = createTheme({
  palette: {
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
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
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
        body: {
          backgroundColor: "#121212",
          color: "#F5F5F5",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1E1E1E",
          border: "1px solid rgba(255, 255, 255, 0.08)",
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
