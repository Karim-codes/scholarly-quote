import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShareModal from '@/components/ShareModal';
import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { FontFamily, Typography, arabicQuoteOverride, arabicQuoteSmallOverride } from '@/constants/Typography';
import { getDailyQuote, getQuoteWithRelations, quotes } from '@/data/mockData';
import { useSaveQuote } from '@/hooks/useSaveQuote';
import { useSavedQuotes, useStreak } from '@/store/useAppStore';
import { useLanguage } from '@/store/useLanguageStore';
import { syncDailyQuoteToWidget } from '@/store/widgetSync';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

export default function TodayScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { effectiveQuoteLanguage } = useLanguage();
  const isArabic = effectiveQuoteLanguage === 'ar';
  const dailyQuote = getDailyQuote();
  const { getSavedIds } = useSavedQuotes();
  const { save, isSaved } = useSaveQuote();
  const { currentStreak } = useStreak();
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Push today's quote to the iOS home-screen widget whenever it changes.
  useEffect(() => {
    syncDailyQuoteToWidget(dailyQuote);
  }, [dailyQuote.id, effectiveQuoteLanguage]);

  // Build swipeable quote list: daily quote first, then a few more free quotes
  const swipeableQuotes = useMemo(() => {
    const others = quotes
      .filter((q) => !q.isPremium && q.id !== dailyQuote.id)
      .slice(0, 4)
      .map(getQuoteWithRelations);
    return [dailyQuote, ...others];
  }, [dailyQuote]);

  const currentQuote = swipeableQuotes[activeIndex];
  const saved = isSaved(currentQuote.id);
  const accentColor = currentQuote.scholar?.accentColor || Colors.accent;

  // Saved quotes for the section
  const savedIds = getSavedIds();
  const savedQuotes = savedIds
    .map((id) => quotes.find((q) => q.id === id))
    .filter(Boolean)
    .map((q) => getQuoteWithRelations(q!))
    .slice(0, 3);

  const handleShare = () => setShareVisible(true);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < swipeableQuotes.length) {
      setActiveIndex(index);
    }
  };

  const today = new Date();
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const dateString = today.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const renderQuoteCard = ({ item: quote }: { item: ReturnType<typeof getQuoteWithRelations> }) => {
    const color = quote.scholar?.accentColor || Colors.accent;
    return (
      <TouchableOpacity
        style={[styles.quoteCard, { width: CARD_WIDTH, borderLeftColor: color }]}
        activeOpacity={0.9}
        onPress={() => router.push(`/quote/${quote.id}`)}
      >
        {/* Topic badge */}
        <View style={styles.topicRow}>
          <View style={[styles.topicBadge, { backgroundColor: color + '12' }]}>
            <Text style={[styles.topicText, { color }]}>{quote.topic}</Text>
          </View>
        </View>

        {/* Quote text */}
        <Text style={[styles.quoteText, isArabic && arabicQuoteOverride]}>{isArabic && quote.textAr ? quote.textAr : quote.text}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Attribution */}
        <TouchableOpacity
          onPress={() => router.push(`/scholar/${quote.scholarId}`)}
          activeOpacity={0.7}
        >
          <View style={styles.attribution}>
            <View style={[styles.scholarAvatar, { backgroundColor: color + '18' }]}>
              <Text style={[styles.scholarInitials, { color }]}>
                {quote.scholar?.initials}
              </Text>
            </View>
            <View style={styles.attributionText}>
              <Text style={styles.scholarName}>
                {isArabic && quote.scholar?.nameAr ? quote.scholar.nameAr : quote.scholar?.name}
              </Text>
              <Text style={styles.bookName}>
                {isArabic && quote.book?.titleAr ? quote.book.titleAr : quote.book?.title}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Scholar Quote</Text>
            <Text style={styles.dateText}>{dateString}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} activeOpacity={0.7}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>{t('today.streakLabel')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bismillah */}
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>

        {/* Swipeable Daily Quote Cards */}
        <FlatList
          ref={flatListRef}
          data={swipeableQuotes}
          keyExtractor={(item) => item.id}
          renderItem={renderQuoteCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          contentContainerStyle={{ gap: 0 }}
          style={{ marginHorizontal: -Spacing.lg }}
          contentOffset={{ x: 0, y: 0 }}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
        />

        {/* Page dots */}
        <View style={styles.dotsRow}>
          {swipeableQuotes.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => save(currentQuote.id)}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={saved ? 'bookmark' : 'bookmark-o'}
              size={20}
              color={saved ? Colors.accent : Colors.textSecondary}
            />
            <Text style={[styles.actionLabel, saved && { color: Colors.accent }]}>
              {saved ? t('quote.saved') : t('today.save')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <FontAwesome name="share-square-o" size={20} color={Colors.textSecondary} />
            <Text style={styles.actionLabel}>{t('today.share')}</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Quotes section */}
        {savedQuotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('today.savedQuotes')}</Text>
              {savedIds.length > 3 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/saved')} activeOpacity={0.7}>
                  <Text style={styles.seeAllButton}>{t('today.seeAll')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {savedQuotes.map((quote) => (
              <TouchableOpacity
                key={quote.id}
                style={styles.listCard}
                onPress={() => router.push(`/quote/${quote.id}`)}
                activeOpacity={0.7}
              >
                <Text style={[styles.listQuoteText, isArabic && arabicQuoteSmallOverride]} numberOfLines={2}>
                  "{isArabic && quote.textAr ? quote.textAr : quote.text}"
                </Text>
                <View style={styles.listAttribution}>
                  <View
                    style={[
                      styles.listDot,
                      { backgroundColor: quote.scholar?.accentColor || Colors.accent },
                    ]}
                  />
                  <Text style={styles.listScholar}>
                    {isArabic && quote.scholar?.nameAr ? quote.scholar.nameAr : quote.scholar?.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Wisdom section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('today.recentWisdom')}</Text>
          {quotes
            .filter((q) => !q.isPremium && q.id !== currentQuote.id)
            .slice(0, 3)
            .map((q) => {
              const quote = getQuoteWithRelations(q);
              return (
                <TouchableOpacity
                  key={quote.id}
                  style={styles.listCard}
                  onPress={() => router.push(`/quote/${quote.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.listQuoteText, isArabic && arabicQuoteSmallOverride]} numberOfLines={2}>
                    "{isArabic && quote.textAr ? quote.textAr : quote.text}"
                  </Text>
                  <View style={styles.listAttribution}>
                    <View
                      style={[
                        styles.listDot,
                        { backgroundColor: quote.scholar?.accentColor || Colors.accent },
                      ]}
                    />
                    <Text style={styles.listScholar}>
                      {isArabic && quote.scholar?.nameAr ? quote.scholar.nameAr : quote.scholar?.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        quote={currentQuote}
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  appTitle: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    letterSpacing: 1.5,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accent + '08',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '15',
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
    marginTop: 1,
  },
  bismillah: {
    fontSize: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  quoteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 3,
  },
  topicRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  topicBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  quoteText: {
    ...Typography.quoteDisplay,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scholarAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scholarInitials: {
    fontSize: 15,
    fontWeight: '600',
  },
  attributionText: {
    flex: 1,
  },
  scholarName: {
    ...Typography.scholarName,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  bookName: {
    ...Typography.bookTitle,
    color: Colors.textMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentSubtle,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl + 8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accentMuted,
    marginBottom: Spacing.md,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  listQuoteText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  listAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  listScholar: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
