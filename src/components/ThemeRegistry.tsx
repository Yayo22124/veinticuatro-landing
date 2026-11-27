"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createStudioTheme,
  DEFAULT_THEME_MODE,
  type ThemeMode,
} from "@/theme/theme";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (nextMode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

interface ThemeRegistryProps {
  initialMode?: ThemeMode;
  children: ReactNode;
}

export function ThemeRegistry({
  initialMode = DEFAULT_THEME_MODE,
  children,
}: ThemeRegistryProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const theme = useMemo(() => createStudioTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, toggleMode],
  );

  return (
    <AppRouterCacheProvider>
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeRegistry");
  }

  return context;
}
