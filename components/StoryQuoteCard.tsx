import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { type Quote } from '@/constants/Types';

interface StoryQuoteCardProps {
  quote: Quote;
  isArabic: boolean;
}

// 9:16 aspect ratio for Stories / phone wallpapers
const CARD_WIDTH = 390;
const CARD_HEIGHT = Math.round(CARD_WIDTH * (16 / 9));

export default function StoryQuoteCard({ quote, isArabic }: StoryQuoteCardProps) {
  const accentColor = quote.scholar?.accentColor || Colors.accent;
  const quoteText = isArabic && quote.textAr ? quote.textAr : quote.text;
  const scholarName = isArabic && quote.scholar?.nameAr
    ? quote.scholar.nameAr
    : quote.scholar?.name;
  const bookTitle = isArabic && quote.book?.titleAr
    ? quote.book.titleAr
    : quote.book?.title;

  return (
    <View style={styles.card}>
      {/* Soft accent glow */}
      <View style={[styles.glow, { backgroundColor: accentColor }]} />
      <View style={[styles.glowBottom, { backgroundColor: accentColor }]} />

      {/* Top spacer */}
      <View style={styles.topSection}>
        <Text style={[styles.topicText, { color: accentColor }]}>
          {quote.topic.toUpperCase()}
        </Text>
      </View>

      {/* Center quote */}
      <View style={styles.centerSection}>
        <Text style={[styles.glyph, { color: accentColor + '33' }]}>{'\u201c'}</Text>
        <Text
          style={[
            styles.quoteText,
            isArabic && { fontWeight: '500', letterSpacing: 0, lineHeight: 46 },
          ]}
        >
          {quoteText}
        </Text>
      </View>

      {/* Bottom attribution */}
      <View style={styles.bottomSection}>
        {/* Ornamental divider */}
        <View style={styles.ornament}>
          <View style={[styles.ornamentLine, { backgroundColor: accentColor + '30' }]} />
          <View style={[styles.ornamentDiamond, { backgroundColor: accentColor }]} />
          <View style={[styles.ornamentLine, { backgroundColor: accentColor + '30' }]} />
        </View>

        <Text style={styles.scholarName}>{scholarName}</Text>
        <Text style={styles.bookName}>{bookTitle}</Text>

        {/* Footer wordmark */}
        <View style={styles.footer}>
          <Text style={styles.footerMark}>S C H O L A R   Q U O T E</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#0b0b0b',
    borderRadius: 0,
    paddingHorizontal: 44,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -160,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    opacity: 0.06,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.04,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  glyph: {
    fontSize: 90,
    fontWeight: '700',
    lineHeight: 72,
    height: 64,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 27,
    fontWeight: '300',
    lineHeight: 42,
    color: '#f2f2f2',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  ornamentLine: {
    width: 36,
    height: 1,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  scholarName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f2f2f2',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777777',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    marginTop: 52,
  },
  footerMark: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#4a4a4a',
  },
});
