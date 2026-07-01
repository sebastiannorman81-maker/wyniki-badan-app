// ============================
// Wyniki Badań — Theme tokens
// ============================

export const theme = {
  // Backgrounds
  bgApp: '#05060b',
  bgSurface: '#0c0d14',
  bgSurfaceHover: '#14151f',
  bgSurfaceActive: '#1c1d2e',
  bgCard: 'rgba(12, 13, 20, 0.6)',

  // Borders
  borderColor: 'rgba(255, 255, 255, 0.06)',
  borderColorHover: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.03)',

  // Typography
  textPrimary: '#eef0f6',
  textSecondary: '#8b8da8',
  textMuted: '#52546e',
  textInverse: '#0d0d13',

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
} as const;

export type Theme = typeof theme;
