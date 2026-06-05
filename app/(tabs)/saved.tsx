import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { arabicQuoteSmallOverride } from '@/constants/Typography';
import { getQuoteWithRelations, quotes } from '@/data/mockData';
import { useSavedQuotes } from '@/store/useAppStore';
import { useLanguage } from '@/store/useLanguageStore';

export default function SavedScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { effectiveQuoteLanguage } = useLanguage();
  const isArabic = effectiveQuoteLanguage === 'ar';
  const { getSavedIds, toggleSave, savedCount } = useSavedQuotes();

  const savedIds = getSavedIds();
  const savedQuotes = savedIds
    .map((id) => quotes.find((q) => q.id === id))
    .filter(Boolean)
    .map((q) => getQuoteWithRelations(q!));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('saved.title')}</Text>
        <Text style={styles.subtitle}>{savedCount === 1 ? t('saved.subtitle', { count: 1 }) : t('saved.subtitle_plural', { count: savedCount })}</Text>
      </View>

      {savedQuotes.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="bookmark-o" size={48} color={Colors.accentDim} />
          <Text style={styles.emptyTitle}>{t('saved.emptyTitle')}</Text>
          <Text style={styles.emptyText}>
            {t('saved.emptyDesc')}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              {savedCount === 1 ? t('saved.subtitle', { count: 1 }) : t('saved.subtitle_plural', { count: savedCount })}
            </Text>
          </View>

          <FlatList
            data={savedQuotes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: quote }) => (
              <TouchableOpacity
                style={styles.quoteCard}
                onPress={() => router.push(`/quote/${quote.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.scholarRow}>
                    <View
                      style={[
                        styles.scholarDot,
                        { backgroundColor: quote.scholar?.accentColor || Colors.accent },
                      ]}
                    />
                    <Text style={styles.scholarName}>
                      {isArabic && quote.scholar?.nameAr ? quote.scholar.nameAr : quote.scholar?.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSave(quote.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="bookmark" size={16} color={Colors.accent} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.quoteText, isArabic && arabicQuoteSmallOverride]} numberOfLines={3}>
                  "{isArabic && quote.textAr ? quote.textAr : quote.text}"
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.bookName}>
                    {isArabic && quote.book?.titleAr ? quote.book.titleAr : quote.book?.title}
                  </Text>
                  <View style={styles.topicPill}>
                    <Text style={styles.topicPillText}>{quote.topic}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  countRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  countText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  quoteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scholarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scholarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  scholarName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookName: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  topicPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  topicPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
