import { Platform } from 'react-native';

// ============================
// Wyniki Badań — Theme tokens
// ============================

export const darkColors = {
  bgApp: '#05060b',
  bgSurface: '#0c0d14',
  bgSurfaceHover: '#14151f',
  bgSurfaceActive: '#1c1d2e',
  bgCard: 'rgba(12, 13, 20, 0.6)',
  borderColor: 'rgba(255, 255, 255, 0.06)',
  borderColorHover: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.03)',
  textPrimary: '#eef0f6',
  textSecondary: '#8b8da8',
  textMuted: '#52546e',
  textInverse: '#0d0d13',
};

export const lightColors = {
  bgApp: '#f4f5f8',
  bgSurface: '#ffffff',
  bgSurfaceHover: '#ebeef5',
  bgSurfaceActive: '#e4e7ed',
  bgCard: 'rgba(255, 255, 255, 0.9)',
  borderColor: 'rgba(0, 0, 0, 0.08)',
  borderColorHover: 'rgba(0, 0, 0, 0.15)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  textPrimary: '#1c1d2e',
  textSecondary: '#60627a',
  textMuted: '#909399',
  textInverse: '#ffffff',
};

export const theme = {
  // Backgrounds (use CSS variables on web for instant reactive theme switching)
  bgApp: Platform.OS === 'web' ? 'var(--bg-app)' : darkColors.bgApp,
  bgSurface: Platform.OS === 'web' ? 'var(--bg-surface)' : darkColors.bgSurface,
  bgSurfaceHover: Platform.OS === 'web' ? 'var(--bg-surface-hover)' : darkColors.bgSurfaceHover,
  bgSurfaceActive: Platform.OS === 'web' ? 'var(--bg-surface-active)' : darkColors.bgSurfaceActive,
  bgCard: Platform.OS === 'web' ? 'var(--bg-card)' : darkColors.bgCard,

  // Borders
  borderColor: Platform.OS === 'web' ? 'var(--border-color)' : darkColors.borderColor,
  borderColorHover: Platform.OS === 'web' ? 'var(--border-color-hover)' : darkColors.borderColorHover,
  borderSubtle: Platform.OS === 'web' ? 'var(--border-subtle)' : darkColors.borderSubtle,

  // Typography
  textPrimary: Platform.OS === 'web' ? 'var(--text-primary)' : darkColors.textPrimary,
  textSecondary: Platform.OS === 'web' ? 'var(--text-secondary)' : darkColors.textSecondary,
  textMuted: Platform.OS === 'web' ? 'var(--text-muted)' : darkColors.textMuted,
  textInverse: Platform.OS === 'web' ? 'var(--text-inverse)' : darkColors.textInverse,

  // Accents
  accentPrimary: '#7c6cf0',
  accentPrimaryHover: '#6b5cd9',
  accentSecondary: '#22d3c5',
  accentSecondaryHover: '#1abfb3',

  // Feedback
  colorSuccess: '#00c48c',
  colorWarning: '#ffb74d',
  colorDanger: '#ff5c6c',

  // Radius
  radiusXs: 6,
  radiusSm: 10,
  radiusMd: 14,
  radiusLg: 20,
  radiusXl: 28,
  radiusRound: 9999,

  // Spacing
  spaceXs: 4,
  spaceSm: 8,
  spaceMd: 16,
  spaceLg: 24,
  spaceXl: 32,
  spaceXxl: 48,

  // Shadows
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  // Chart colors (for multi-parameter comparison)
  chartColors: ['#7c6cf0', '#00b894', '#ffb74d', '#fd79a8', '#0984e3'],

  // Status colors
  statusNormal: { bg: 'rgba(85,239,196,0.1)', text: '#55efc4', label: 'W normie' },
  statusLow: { bg: 'rgba(116,185,255,0.1)', text: '#74b9ff', label: 'Poniżej normy' },
  statusHigh: { bg: 'rgba(255,118,117,0.1)', text: '#ff7675', label: 'Powyżej normy' },
  statusUnknown: { bg: 'rgba(255,255,255,0.05)', text: '#8b8da8', label: 'Brak normy' },
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontMode = 'standard' | 'handwriting';

export function applyTheme(mode: ThemeMode, systemTheme: 'light' | 'dark') {
  if (Platform.OS !== 'web') return;
  
  const resolved = mode === 'system' ? systemTheme : mode;
  const colors = resolved === 'light' ? lightColors : darkColors;
  
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssKey, value);
  });

  const styleId = 'liquid-glass-theme-style';
  let styleEl = document.getElementById(styleId);
  if (styleEl) {
    styleEl.textContent = `
      body, #root {
        background-color: ${resolved === 'light' ? '#f4f5f8' : '#05060b'} !important;
        background-image: none !important;
      }
    `;
  }
}

export function getHandwritingFontFamily(fontMode: FontMode = 'handwriting') {
  if (fontMode === 'handwriting') {
    return Platform.OS === 'web' ? "'Kalam', 'Caveat', cursive, sans-serif" : 'Kalam_700Bold';
  }
  return Platform.OS === 'web' ? "'Inter', sans-serif" : undefined;
}

export function getHandwrittenTextStyle(fontMode: FontMode = 'standard', isBold: boolean = false) {
  if (fontMode === 'handwriting') {
    return {
      fontFamily: Platform.OS === 'web' ? "'Kalam', 'Caveat', cursive, sans-serif" : (isBold ? 'Kalam_700Bold' : 'Kalam_400Regular'),
      ...(Platform.OS === 'android' ? { fontWeight: 'normal' as const } : {}),
    };
  }
  return {};
}

export function applyFont(fontMode: FontMode) {
  if (Platform.OS !== 'web') return;
  
  const linkId = 'google-fonts-handwriting';
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;600;800&family=Kalam:wght@400;700&display=swap';
    document.head.appendChild(link);
  }

  const styleId = 'app-font-override';
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  if (fontMode === 'handwriting') {
    style.textContent = `
      * {
        font-family: 'Kalam', 'Caveat', cursive, sans-serif !important;
      }
      input, textarea, select, button {
        font-family: 'Kalam', 'Caveat', cursive, sans-serif !important;
      }
    `;
  } else {
    style.textContent = `
      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      }
      input, textarea, select, button {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      }
    `;
  }
}
