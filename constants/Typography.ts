// Scholar Quote Design System — Typography
// System font (SF Pro on iOS, Roboto on Android) for readability
// Cinzel only for the app title branding

import { Platform, TextStyle } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const FontFamily = {
  // Display — only for "SCHOLAR QUOTE" title
  display: 'Cinzel_400Regular',
  displayBold: 'Cinzel_700Bold',

  // System font for everything else
  heading: systemFont!,
  headingSemiBold: systemFont!,
  body: systemFont!,
  bodyItalic: systemFont!,
  bodyMedium: systemFont!,
  bodyBold: systemFont!,
  bodyBoldItalic: systemFont!,
};

type TypographyStyle = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontWeight' | 'fontStyle'>;

// Style override applied to quote text when displayed in Arabic. The default
// quote style uses weight 300 + letter-spacing for elegant Latin display, but
// Arabic glyphs render too thin and cramped at that weight. Bumping weight
// and removing letter-spacing produces a much cleaner Arabic rendering using
// the system Arabic font (.SF Arabic on iOS).
export const arabicQuoteOverride: TextStyle = {
  fontWeight: '500',
  letterSpacing: 0,
};

// Smaller variant for inline quote previews (recent/saved cards).
export const arabicQuoteSmallOverride: TextStyle = {
  fontWeight: '500',
  letterSpacing: 0,
  lineHeight: 26,
};

export const Typography: Record<string, TypographyStyle> = {
  // Display — for the daily quote
  quoteDisplay: {
    fontFamily: FontFamily.body,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 0.2,
  },

  // Large heading
  h1: {
    fontFamily: FontFamily.heading,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },

  // Section heading
  h2: {
    fontFamily: FontFamily.heading,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },

  // Card title
  h3: {
    fontFamily: FontFamily.heading,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },

  // Small label
  label: {
    fontFamily: FontFamily.heading,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // Body text
  body: {
    fontFamily: FontFamily.body,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },

  // Body medium
  bodyMedium: {
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },

  // Small body
  bodySmall: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Scholar name on quote card
  scholarName: {
    fontFamily: FontFamily.heading,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },

  // Source book attribution
  bookTitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: '400',
  },

  // Tab bar label
  tabLabel: {
    fontFamily: FontFamily.heading,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
};
