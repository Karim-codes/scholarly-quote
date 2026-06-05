// Scholar Quote Design System — Colors
// Dark, clean, spiritual aesthetic

export const Colors = {
  // Core palette
  background: '#0a0a0a',
  backgroundLight: '#111111',
  card: '#161616',
  cardBorder: '#222222',
  surface: '#1c1c1c',

  // Brand — white-forward with subtle warmth
  accent: '#ffffff',
  accentMuted: '#999999',
  accentDim: '#666666',
  accentSubtle: '#333333',

  // Text
  textPrimary: '#f0f0f0',
  textSecondary: '#999999',
  textMuted: '#555555',

  // UI
  border: '#222222',
  borderLight: '#2a2a2a',
  tabBar: '#0c0c0c',
  tabBarBorder: '#1a1a1a',
  inactive: '#444444',

  // Status
  success: '#6b8f5e',
  error: '#a85454',
  warning: '#b89254',

  // Scholar accent colors — softer, muted tones
  scholars: {
    ibnQayyim: '#c4a882',     // Warm sand
    imamShafii: '#7aa88f',     // Emerald
    imamAli: '#b08888',        // Rose
    ghazali: '#7a8fa8',        // Steel blue
    ibnTaymiyyah: '#a88f7a',   // Bronze
    imamMalik: '#8f7aa8',      // Purple
    imamAhmad: '#7aa8a8',      // Teal
    imamNawawi: '#a8a87a',     // Olive
    ibnRajab: '#a87a8f',       // Mauve
    ibnKathir: '#7a8f7a',      // Forest
    abuHanifa: '#8fa87a',      // Sage
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Keep default export for backwards compatibility with template
export default {
  light: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: Colors.accent,
    tabIconDefault: Colors.inactive,
    tabIconSelected: Colors.accent,
  },
  dark: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: Colors.accent,
    tabIconDefault: Colors.inactive,
    tabIconSelected: Colors.accent,
  },
};
