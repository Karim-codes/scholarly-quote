import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { TOPIC_ICONS, type Quote } from '@/constants/Types';

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
      {/* Decorative top accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Topic */}
      <View style={styles.topicRow}>
        <Text style={styles.topicEmoji}>
          {TOPIC_ICONS[quote.topic]}
        </Text>
        <View style={[styles.topicBadge, { backgroundColor: accentColor + '18' }]}>
          <Text style={[styles.topicText, { color: accentColor }]}>
            {quote.topic.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Quote */}
      <View style={[styles.quoteSection, { borderLeftColor: accentColor }]}>
        <Text style={styles.openQuote}>&ldquo;</Text>
        <Text
          style={[
            styles.quoteText,
            isArabic && { fontWeight: '500', letterSpacing: 0, textAlign: 'right' },
          ]}
        >
          {quoteText}
        </Text>
      </View>

      {/* Attribution */}
      <View style={styles.attributionRow}>
        <View style={[styles.scholarAvatar, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.scholarInitials, { color: accentColor }]}>
            {quote.scholar?.initials}
          </Text>
        </View>
        <View style={styles.attributionText}>
          <Text style={[styles.scholarName, { color: accentColor }]}>
            {scholarName}
          </Text>
          <Text style={styles.bookName}>{bookTitle}</Text>
        </View>
      </View>

      {/* Footer with app branding */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.appName}>Scholar Quote</Text>
      </View>
    </View>
  );
}

const CARD_WIDTH = 360;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0e0e0e',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingTop: 0,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  topicEmoji: {
    fontSize: 20,
  },
  topicBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  topicText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  quoteSection: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
    marginBottom: Spacing.lg,
  },
  openQuote: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff18',
    lineHeight: 48,
    marginBottom: -12,
  },
  quoteText: {
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 34,
    color: '#f0f0f0',
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scholarAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scholarInitials: {
    fontSize: 14,
    fontWeight: '600',
  },
  attributionText: {
    flex: 1,
  },
  scholarName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
  },
  footerLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#222222',
    alignSelf: 'stretch',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#555555',
    textTransform: 'uppercase',
  },
});
