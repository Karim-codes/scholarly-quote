import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { arabicQuoteSmallOverride } from '@/constants/Typography';
import { books, getQuotesByScholar, scholars } from '@/data/mockData';
import { useSaveQuote } from '@/hooks/useSaveQuote';
import { useLanguage } from '@/store/useLanguageStore';

export default function ScholarProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { effectiveQuoteLanguage } = useLanguage();
  const isArabic = effectiveQuoteLanguage === 'ar';
  const { save, isSaved } = useSaveQuote();

  const scholar = scholars.find((s) => s.id === id);
  if (!scholar) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Scholar not found</Text>
      </SafeAreaView>
    );
  }

  const scholarQuotes = getQuotesByScholar(scholar.id);
  const scholarBooks = books.filter((b) => b.scholarId === scholar.id);
  const accentColor = scholar.accentColor;

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
        {scholar.isPremium && (
          <View style={styles.premiumBadge}>
            <FontAwesome name="lock" size={10} color={Colors.accentMuted} />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scholar header */}
        <View style={styles.scholarHeader}>
          <View
            style={[styles.avatarLarge, { backgroundColor: accentColor + '15' }]}
          >
            <Text style={[styles.avatarInitials, { color: accentColor }]}>
              {scholar.initials}
            </Text>
          </View>
          <Text style={[styles.scholarName, { color: accentColor }]}>
            {scholar.name}
          </Text>
          <Text style={styles.scholarNameAr}>{scholar.nameAr}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{scholar.era}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{scholar.school}</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <Text style={styles.bio}>{scholar.bio}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: accentColor }]}>
              {scholarQuotes.length}
            </Text>
            <Text style={styles.statLabel}>{t('scholar.quotes')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: accentColor + '20' }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: accentColor }]}>
              {scholarBooks.length}
            </Text>
            <Text style={styles.statLabel}>{t('scholar.about')}</Text>
          </View>
        </View>

        {/* Books */}
        <Text style={styles.sectionTitle}>WORKS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksRow}
        >
          {scholarBooks.map((book) => (
            <View
              key={book.id}
              style={[styles.bookCard, { borderColor: accentColor + '30' }]}
            >
              <FontAwesome name="book" size={16} color={accentColor} />
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookTitleAr}>{book.titleAr}</Text>
              {book.yearWritten && (
                <Text style={styles.bookYear}>{book.yearWritten}</Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Quotes */}
        <Text style={styles.sectionTitle}>QUOTES</Text>
        {scholarQuotes.map((quote) => {
          const saved = isSaved(quote.id);
          return (
            <TouchableOpacity
              key={quote.id}
              style={styles.quoteCard}
              onPress={() => router.push(`/quote/${quote.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.quoteHeader}>
                <View style={styles.topicPill}>
                  <Text style={styles.topicPillText}>{quote.topic}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => save(quote.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={saved ? 'bookmark' : 'bookmark-o'}
                    size={14}
                    color={saved ? Colors.accent : Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.quoteText, isArabic && arabicQuoteSmallOverride]} numberOfLines={3}>
                "{isArabic && quote.textAr ? quote.textAr : quote.text}"
              </Text>
              <Text style={styles.bookRef}>
                {isArabic && quote.book?.titleAr ? quote.book.titleAr : quote.book?.title}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '0a',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent + '20',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.accentMuted,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  scholarHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
  },
  scholarName: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  scholarNameAr: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  bio: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    marginHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  booksRow: {
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  bookCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    width: 160,
    gap: 6,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  bookTitleAr: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  bookYear: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  quoteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  quoteText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bookRef: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
