import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShareModal from '@/components/ShareModal';
import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { TOPIC_ICONS } from '@/constants/Types';
import { arabicQuoteOverride } from '@/constants/Typography';
import { getQuoteWithRelations, quotes } from '@/data/mockData';
import { useSaveQuote } from '@/hooks/useSaveQuote';
import { useLanguage } from '@/store/useLanguageStore';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { effectiveQuoteLanguage } = useLanguage();
  const isArabic = effectiveQuoteLanguage === 'ar';
  const { save, isSaved } = useSaveQuote();
  const [shareVisible, setShareVisible] = useState(false);

  const rawQuote = quotes.find((q) => q.id === id);
  if (!rawQuote) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Quote not found</Text>
      </SafeAreaView>
    );
  }

  const quote = getQuoteWithRelations(rawQuote);
  const saved = isSaved(quote.id);
  const accentColor = quote.scholar?.accentColor || Colors.accent;

  const handleShare = () => setShareVisible(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={() => save(quote.id)}
            style={styles.topBarButton}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={saved ? 'bookmark' : 'bookmark-o'}
              size={18}
              color={saved ? Colors.accent : Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.topBarButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="share-square-o" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic */}
        <View style={styles.topicRow}>
          <Text style={styles.topicEmoji}>{TOPIC_ICONS[quote.topic]}</Text>
          <View style={[styles.topicBadge, { backgroundColor: accentColor + '15' }]}>
            <Text style={[styles.topicText, { color: accentColor }]}>
              {quote.topic.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Quote */}
        <View style={[styles.quoteSection, { borderLeftColor: accentColor }]}>
          <Text style={styles.openQuote}>"</Text>
          <Text style={[styles.quoteText, isArabic && arabicQuoteOverride]}>{isArabic && quote.textAr ? quote.textAr : quote.text}</Text>
        </View>

        {/* Scholar card */}
        <TouchableOpacity
          style={styles.scholarCard}
          onPress={() => router.push(`/scholar/${quote.scholarId}`)}
          activeOpacity={0.8}
        >
          <View
            style={[styles.scholarAvatar, { backgroundColor: accentColor + '20' }]}
          >
            <Text style={[styles.scholarInitials, { color: accentColor }]}>
              {quote.scholar?.initials}
            </Text>
          </View>
          <View style={styles.scholarInfo}>
            <Text style={[styles.scholarName, { color: accentColor }]}>
              {isArabic && quote.scholar?.nameAr ? quote.scholar.nameAr : quote.scholar?.name}
            </Text>
            <Text style={styles.scholarMeta}>
              {quote.scholar?.era} · {quote.scholar?.school}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Source book */}
        <View style={styles.sourceSection}>
          <Text style={styles.sourceLabel}>{t('quote.source')}</Text>
          <View style={styles.sourceCard}>
            <FontAwesome name="book" size={16} color={accentColor} style={{ marginRight: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bookTitle}>
                {isArabic && quote.book?.titleAr ? quote.book.titleAr : quote.book?.title}
              </Text>
              {!isArabic && quote.book?.titleAr && (
                <Text style={styles.bookTitleAr}>{quote.book.titleAr}</Text>
              )}
              {quote.book?.yearWritten && (
                <Text style={styles.bookYear}>{quote.book.yearWritten}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Verification badge */}
        {quote.isVerified && (
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check-circle" size={14} color={Colors.success} />
            <Text style={styles.verifiedText}>{t('quote.source')} ✓</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        quote={quote}
        isArabic={isArabic}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  topicEmoji: {
    fontSize: 24,
  },
  topicBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  quoteSection: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  openQuote: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.accent + '20',
    lineHeight: 56,
    marginBottom: -16,
  },
  quoteText: {
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  scholarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  scholarAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scholarInitials: {
    fontSize: 16,
    fontWeight: '600',
  },
  scholarInfo: {
    flex: 1,
  },
  scholarName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  scholarMeta: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  sourceSection: {
    marginBottom: Spacing.lg,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  bookTitleAr: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.success,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
