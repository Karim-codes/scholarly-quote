import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import type { Quote, Scholar } from '@/constants/Types';
import { TOPICS, TOPIC_ICONS, Topic } from '@/constants/Types';
import { arabicQuoteSmallOverride } from '@/constants/Typography';
import { getAllQuotes, getAllScholars, getQuotesByScholarAsync, getQuotesByTopicAsync } from '@/data/database';
import { useLanguage } from '@/store/useLanguageStore';

type FilterMode = 'scholars' | 'topics';

export default function BrowseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { effectiveQuoteLanguage } = useLanguage();
  const isArabic = effectiveQuoteLanguage === 'ar';
  const [filterMode, setFilterMode] = useState<FilterMode>('scholars');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedScholar, setSelectedScholar] = useState<string | null>(null);

  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    Promise.all([getAllScholars(), getAllQuotes()]).then(([s, q]) => {
      setScholars(s);
      setAllQuotes(q);
      setFilteredQuotes(q);
    });
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      getQuotesByTopicAsync(selectedTopic).then(setFilteredQuotes);
    } else if (selectedScholar) {
      getQuotesByScholarAsync(selectedScholar).then(setFilteredQuotes);
    } else {
      setFilteredQuotes(allQuotes);
    }
  }, [selectedTopic, selectedScholar, allQuotes]);

  const clearFilters = () => {
    setSelectedTopic(null);
    setSelectedScholar(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Sticky filter section — sits above the scrollable list */}
      <View style={styles.filterSection}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('browse.title')}</Text>
        <Text style={styles.subtitle}>{t('browse.subtitle')}</Text>
      </View>

      {/* Filter mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, filterMode === 'scholars' && styles.toggleActive]}
          onPress={() => { setFilterMode('scholars'); clearFilters(); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, filterMode === 'scholars' && styles.toggleTextActive]}>
            {t('browse.scholars')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, filterMode === 'topics' && styles.toggleActive]}
          onPress={() => { setFilterMode('topics'); clearFilters(); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, filterMode === 'topics' && styles.toggleTextActive]}>
            {t('browse.topics')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      {filterMode === 'scholars' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          <View style={styles.chipRow}>
            <Pressable
              style={[styles.chip, !selectedScholar && styles.chipActive]}
              onPress={clearFilters}
            >
              <Text style={[styles.chipText, !selectedScholar && styles.chipTextActive]}>{t('browse.all')}</Text>
            </Pressable>
            {scholars.map((scholar) => (
              <Pressable
                key={scholar.id}
                style={[
                  styles.chip,
                  selectedScholar === scholar.id && styles.chipActive,
                  selectedScholar === scholar.id && { borderColor: scholar.accentColor },
                ]}
                onPress={() => setSelectedScholar(selectedScholar === scholar.id ? null : scholar.id)}
              >
                <View style={[styles.chipDot, { backgroundColor: scholar.accentColor }]} />
                <Text style={[styles.chipText, selectedScholar === scholar.id && { color: scholar.accentColor }]}>
                  {scholar.shortName}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          <View style={styles.chipRow}>
            <Pressable
              style={[styles.chip, !selectedTopic && styles.chipActive]}
              onPress={clearFilters}
            >
              <Text style={[styles.chipText, !selectedTopic && styles.chipTextActive]}>{t('browse.all')}</Text>
            </Pressable>
            {TOPICS.map((topic) => (
              <Pressable
                key={topic}
                style={[styles.chip, selectedTopic === topic && styles.chipActive]}
                onPress={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
              >
                <Text style={styles.chipEmoji}>{TOPIC_ICONS[topic]}</Text>
                <Text style={[styles.chipText, selectedTopic === topic && styles.chipTextActive]}>
                  {topic}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {filteredQuotes.length === 1 ? t('browse.quoteCount', { count: 1 }) : t('browse.quoteCount_plural', { count: filteredQuotes.length })}
        </Text>
        {(selectedTopic || selectedScholar) && (
          <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
            <Text style={styles.clearButton}>{t('browse.clearFilter')}</Text>
          </TouchableOpacity>
        )}
      </View>
      </View>

      {/* Quotes list */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: quote }) => (
          <TouchableOpacity
            style={styles.quoteCard}
            onPress={() => router.push(`/quote/${quote.id}`)}
            activeOpacity={0.8}
          >
            <Text style={[styles.quoteText, isArabic && arabicQuoteSmallOverride]} numberOfLines={3}>
              "{isArabic && quote.textAr ? quote.textAr : quote.text}"
            </Text>
            <View style={styles.cardFooter}>
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
              <View style={styles.metaRow}>
                <Text style={styles.bookName}>
                  {isArabic && quote.book?.titleAr ? quote.book.titleAr : quote.book?.title}
                </Text>
                <View style={styles.topicPill}>
                  <Text style={styles.topicPillText}>{quote.topic}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterSection: {
    backgroundColor: Colors.background,
    zIndex: 1,
    paddingBottom: Spacing.xs,
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
    color: Colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  toggleActive: {
    backgroundColor: Colors.accent + '12',
    borderColor: Colors.accent + '25',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.accent,
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg + 8,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 42,
  },
  chipActive: {
    borderColor: Colors.accent + '70',
    backgroundColor: Colors.accent + '14',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 41,
    marginRight: 8,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipTextActive: {
    color: Colors.accent,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.accent,
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.accentMuted,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    gap: 6,
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
