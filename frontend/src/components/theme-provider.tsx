"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const AppThemeScope = createContext<(active: boolean) => void>(() => {});

/**
 * System theme by default, with automatic switching between iOS light
 * and iOS true OLED dark mode.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [, setShellActive] = useState(false);

  return (
    <AppThemeScope.Provider value={setShellActive}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </AppThemeScope.Provider>
  );
}

export function useAppTheme(active: boolean) {
  const setShellActive = useContext(AppThemeScope);
  useEffect(() => {
    if (!active) return;
    setShellActive(true);
    return () => setShellActive(false);
  }, [active, setShellActive]);
}
