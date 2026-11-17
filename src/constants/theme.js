// Colour palettes and shared sizes for Kemet Explorer.
// The palette borrows from ancient Egyptian materials: lapis lazuli (primary),
// gold (accent) and papyrus/sand (backgrounds). A dark palette mirrors it.

export const PALETTES = {
  light: {
    mode: 'light',
    primary: '#1D4E89', // lapis lazuli
    primaryDark: '#143A68',
    accent: '#C99A1E', // gold
    accentSoft: '#F6E7BC',
    background: '#FBF6EC', // papyrus
    card: '#FFFFFF',
    cardAlt: '#F3EBDA',
    text: '#1F2933',
    textMuted: '#5F6B7A',
    border: '#E4D9C3',
    danger: '#B42318',
    dangerSoft: '#FDECEA',
    success: '#1E7B4F',
    successSoft: '#E3F4EA',
    tabInactive: '#8A94A3',
    shadow: 'rgba(31, 41, 51, 0.12)',
  },
  dark: {
    mode: 'dark',
    primary: '#6FA3E0',
    primaryDark: '#4F86C6',
    accent: '#E3B341',
    accentSoft: '#3A3220',
    background: '#121417',
    card: '#1C2026',
    cardAlt: '#252A31',
    text: '#EEF1F4',
    textMuted: '#A3ADBA',
    border: '#2F3640',
    danger: '#F97066',
    dangerSoft: '#3A1D1B',
    success: '#4CC38A',
    successSoft: '#1B3328',
    tabInactive: '#6B7584',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};

export const RADIUS = { sm: 8, md: 12, lg: 18, pill: 999 };

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const FONT_SCALE = { small: 0.92, medium: 1, large: 1.12 };

export const APP_NAME = 'Kemet Explorer';
