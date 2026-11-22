import type { PaletteMode } from '@mui/material';
import { alpha, createTheme, type ThemeOptions } from '@mui/material/styles';

const FONT = '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const brand = {
  main: '#4f46e5',
  light: '#818cf8',
  dark: '#3730a3',
  contrastText: '#ffffff',
};

export function buildTheme(mode: PaletteMode) {
  const light = mode === 'light';
  const divider = light ? '#e7e9f0' : alpha('#94a3b8', 0.16);

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: brand,
      secondary: { main: '#8b5cf6' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#0ea5e9' },
      divider,
      background: light ? { default: '#f6f7fb', paper: '#ffffff' } : { default: '#0b1020', paper: '#111833' },
      text: light
        ? { primary: '#0f172a', secondary: '#64748b' }
        : { primary: '#e2e8f0', secondary: '#94a3b8' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT,
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontWeight: 750, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.65rem' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em', fontSize: '1.25rem' },
      h6: { fontWeight: 650, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { WebkitFontSmoothing: 'antialiased' },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            background: light ? '#cbd5e1' : '#334155',
            borderRadius: 8,
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16 },
          sizeLarge: { paddingBlock: 11, fontSize: '0.95rem' },
          containedPrimary: {
            backgroundImage: `linear-gradient(135deg, ${brand.main}, #6d5df6)`,
            '&:hover': { backgroundImage: `linear-gradient(135deg, ${brand.dark}, ${brand.main})` },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            borderRadius: 16,
            borderColor: divider,
            boxShadow: light ? '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)' : 'none',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { padding: '18px 20px 0' },
          title: { fontWeight: 650, fontSize: '1rem' },
          subheader: { fontSize: '0.825rem', marginTop: 2 },
        },
      },
      MuiCardContent: { styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } } },
      MuiTextField: { defaultProps: { fullWidth: true } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: light ? '#fff' : alpha('#0b1020', 0.4),
            '& .MuiOutlinedInput-notchedOutline': { borderColor: light ? '#dfe3eb' : alpha('#94a3b8', 0.24) },
          },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { fontSize: '0.9rem' } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: divider, paddingBlock: 12 },
          head: {
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: light ? '#64748b' : '#94a3b8',
            backgroundColor: light ? '#f8fafc' : alpha('#0b1020', 0.5),
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { '&.MuiTableRow-hover:hover': { backgroundColor: light ? '#f8f9ff' : alpha(brand.light, 0.06) } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
          sizeSmall: { height: 24, fontSize: '0.75rem' },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 18, backgroundImage: 'none' } },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, fontSize: '1.15rem', padding: '20px 24px 8px' } } },
      MuiDialogActions: { styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } } },
      MuiTooltip: {
        styleOverrides: { tooltip: { fontSize: '0.75rem', fontWeight: 500, borderRadius: 8, padding: '6px 10px' } },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiSkeleton: { defaultProps: { animation: 'wave' } },
    },
  };

  return createTheme(options);
}
