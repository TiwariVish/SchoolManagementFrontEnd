import { CssBaseline, ThemeProvider, useMediaQuery, type PaletteMode } from '@mui/material';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { buildTheme } from './theme';

const STORAGE_KEY = 'iskool.colorMode';

const ColorModeContext = createContext<{ mode: PaletteMode; toggle: () => void }>({ mode: 'light', toggle: () => undefined });

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [stored, setStored] = useState<PaletteMode | null>(() => localStorage.getItem(STORAGE_KEY) as PaletteMode | null);
  const mode: PaletteMode = stored ?? (prefersDark ? 'dark' : 'light');

  const value = useMemo(
    () => ({
      mode,
      toggle: () => {
        const next = mode === 'light' ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, next);
        setStored(next);
      },
    }),
    [mode],
  );
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
