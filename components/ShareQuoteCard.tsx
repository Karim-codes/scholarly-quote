import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { type Quote } from '@/constants/Types';

interface ShareQuoteCardProps {
  quote: Quote;
  isArabic: boolean;
}

export default function ShareQuoteCard({ quote, isArabic }: ShareQuoteCardProps) {
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
      {/* Soft accent glow for depth */}
      <View style={[styles.glow, { backgroundColor: accentColor }]} />

      {/* Topic label between rules */}
      <View style={styles.topicRow}>
        <View style={[styles.rule, { backgroundColor: accentColor + '40' }]} />
        <Text style={[styles.topicText, { color: accentColor }]}>
          {quote.topic.toUpperCase()}
        </Text>
        <View style={[styles.rule, { backgroundColor: accentColor + '40' }]} />
      </View>

      {/* Decorative quote glyph */}
      <Text style={[styles.glyph, { color: accentColor + '33' }]}>“</Text>

      {/* Quote text */}
      <Text
        style={[
          styles.quoteText,
          isArabic && { fontWeight: '500', letterSpacing: 0, lineHeight: 42 },
        ]}
      >
        {quoteText}
      </Text>

      {/* Ornamental divider */}
      <View style={styles.ornament}>
        <View style={[styles.ornamentLine, { backgroundColor: accentColor + '30' }]} />
        <View style={[styles.ornamentDiamond, { backgroundColor: accentColor }]} />
        <View style={[styles.ornamentLine, { backgroundColor: accentColor + '30' }]} />
      </View>

      {/* Scholar block */}
      <Text style={[styles.scholarName, { color: Colors.textPrimary }]}>
        {scholarName}
      </Text>
      <Text style={styles.bookName}>{bookTitle}</Text>

      {/* Footer wordmark */}
      <View style={styles.footer}>
        <Text style={styles.footerMark}>S C H O L A R   Q U O T E</Text>
      </View>
    </View>
  );
}

const CARD_WIDTH = 400;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0b0b0b',
    borderRadius: 28,
    paddingHorizontal: 40,
    paddingVertical: 52,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.06,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  rule: {
    width: 28,
    height: 1,
  },
  topicText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  glyph: {
    fontSize: 80,
    fontWeight: '700',
    lineHeight: 64,
    height: 56,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 25,
    fontWeight: '300',
    lineHeight: 38,
    color: '#f2f2f2',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 28,
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
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#777777',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    marginTop: 44,
  },
  footerMark: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#4a4a4a',
  },
});
