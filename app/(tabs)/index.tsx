import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShareModal from '@/components/ShareModal';
import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import type { Quote } from '@/constants/Types';
import { FontFamily, Typography, arabicQuoteOverride, arabicQuoteSmallOverride } from '@/constants/Typography';
import { getAllQuotes, getDailyQuoteAsync } from '@/data/database';
import { useSaveQuote } from '@/hooks/useSaveQuote';
import { useSavedQuotes } from '@/store/useAppStore';
import { useLanguage } from '@/store/useLanguageStore';
import { syncDailyQuoteToWidget } from '@/store/widgetSync';

export default function TodayScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { effectiveQuoteLanguage } = useLanguage();
  const isArabic = effectiveQuoteLanguage === 'ar';
  const { getSavedIds } = useSavedQuotes();
  const { save, isSaved } = useSaveQuote();
  const [shareVisible, setShareVisible] = useState(false);

  // ── Async data from SQLite ─────────────────────────────────
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [daily, all] = await Promise.all([getDailyQuoteAsync(), getAllQuotes()]);
      if (!cancelled) {
        setDailyQuote(daily);
        setCurrentQuote(daily);
        setAllQuotes(all);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Push the true daily quote to the iOS home-screen widget.
  useEffect(() => {
    if (dailyQuote) syncDailyQuoteToWidget(dailyQuote);
  }, [dailyQuote?.id, effectiveQuoteLanguage]);

  const saved = currentQuote ? isSaved(currentQuote.id) : false;
  const accentColor = currentQuote?.scholar?.accentColor || Colors.accent;

  // ── Double-tap to save ─────────────────────────────────────
  const lastTap = useRef(0);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const handleDoubleTap = useCallback(() => {
    if (!currentQuote) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double-tap detected
      if (!isSaved(currentQuote.id)) {
        save(currentQuote.id);
      }
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

      // Animate heart overlay
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(heartOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
    lastTap.current = now;
  }, [currentQuote?.id, isSaved, save, heartScale, heartOpacity]);

  // ── Card flip for commentary ───────────────────────────────
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleCardFlip = useCallback(() => {
    const toValue = flipped ? 0 : 1;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    Animated.spring(flipAnim, { toValue, friction: 8, tension: 60, useNativeDriver: true }).start();
    setFlipped(!flipped);
  }, [flipped, flipAnim]);

  // Front rotates 0 → 90°, back rotates -90° → 0°
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '90deg', '90deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-90deg', '-90deg', '0deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const cardSlide = useRef(new Animated.Value(0)).current;
  const cardLift = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTilt = useRef(new Animated.Value(0)).current;
  const isSwapping = useRef(false);
  const cardRotation = cardTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  const commentaryText = isArabic && currentQuote?.commentaryAr
    ? currentQuote.commentaryAr
    : currentQuote?.commentary;

  // Saved quotes for the section
  const savedIds = getSavedIds();
  const savedQuotes = savedIds
    .map((id) => allQuotes.find((q) => q.id === id))
    .filter((q): q is Quote => q != null)
    .slice(0, 3);

  const handleShare = () => setShareVisible(true);

  const handleQuoteSwap = useCallback((direction: 1 | -1 = 1) => {
    if (!currentQuote || allQuotes.length < 2 || isSwapping.current) return;

    const currentIndex = allQuotes.findIndex((quote) => quote.id === currentQuote.id);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + allQuotes.length) % allQuotes.length;
    const exitDirection = direction === 1 ? -1 : 1;

    isSwapping.current = true;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: exitDirection * 130, duration: 170, useNativeDriver: true }),
      Animated.timing(cardLift, { toValue: -10, duration: 170, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.96, duration: 170, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardTilt, { toValue: exitDirection, duration: 170, useNativeDriver: true }),
    ]).start(() => {
      setFlipped(false);
      flipAnim.setValue(0);
      setCurrentQuote(allQuotes[nextIndex]);

      cardSlide.setValue(-exitDirection * 90);
      cardLift.setValue(-6);
      cardScale.setValue(0.97);
      cardOpacity.setValue(0.35);
      cardTilt.setValue(-exitDirection * 0.7);

      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.spring(cardLift, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.spring(cardTilt, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        isSwapping.current = false;
      });
    });
  }, [allQuotes, cardLift, cardOpacity, cardScale, cardSlide, cardTilt, currentQuote, flipAnim]);

  const quoteSwipeGesture = useMemo(
    () => Gesture.Pan()
      .activeOffsetX([-18, 18])
      .failOffsetY([-24, 24])
      .onEnd((event) => {
        const isLeftSwipe = event.translationX < -35 || event.velocityX < -450;
        const isRightSwipe = event.translationX > 35 || event.velocityX > 450;

        if (isLeftSwipe) {
          handleQuoteSwap(1);
        } else if (isRightSwipe) {
          handleQuoteSwap(-1);
        }
      })
      .runOnJS(true),
    [handleQuoteSwap],
  );

  const today = new Date();
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const dateString = today.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading || !currentQuote) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

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
        </View>

        {/* Bismillah */}
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>

        {/* Quote of the Day label */}
        <Text style={styles.quoteOfTheDayLabel}>{t('today.quoteOfTheDay')}</Text>

        {/* Daily Quote Card — swipe for another quote, double-tap to save, tap flip hint for commentary */}
        <GestureDetector gesture={quoteSwipeGesture}>
          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [
                { translateX: cardSlide },
                { translateY: cardLift },
                { scale: cardScale },
                { rotateZ: cardRotation },
              ],
            }}
          >
          <Pressable onPress={handleDoubleTap} style={styles.cardWrapper}>
          {/* ── FRONT FACE ── */}
          <Animated.View style={[styles.cardFace, { opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}>
            <LinearGradient
              colors={['#1a1a1a', '#0d0d0d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteCard}
            >
              <View style={[styles.cardGlow, { backgroundColor: accentColor }]} />
              <View style={styles.cardTopContent}>
                <View style={styles.topicRow}>
                  <View style={[styles.topicRule, { backgroundColor: accentColor + '40' }]} />
                  <Text style={[styles.topicText, { color: accentColor }]}>{currentQuote.topic.toUpperCase()}</Text>
                  <View style={[styles.topicRule, { backgroundColor: accentColor + '40' }]} />
                </View>
                <Text style={[styles.glyph, { color: accentColor + '2e' }]}>{'\u201c'}</Text>
                <Text style={[styles.quoteText, isArabic && arabicQuoteOverride]}>
                  {isArabic && currentQuote.textAr ? currentQuote.textAr : currentQuote.text}
                </Text>
              </View>
              <View style={styles.cardBottomContent}>
                <View style={styles.ornament}>
                  <View style={[styles.ornamentLine, { backgroundColor: accentColor + '30' }]} />
                  <View style={[styles.ornamentDiamond, { backgroundColor: accentColor }]} />
                  <View style={[styles.ornamentLine, { backgroundColor: accentColor + '30' }]} />
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/scholar/${currentQuote.scholarId}`)}
                  activeOpacity={0.7}
                  style={styles.attribution}
                >
                  <Text style={styles.scholarName}>
                    {isArabic && currentQuote.scholar?.nameAr ? currentQuote.scholar.nameAr : currentQuote.scholar?.name}
                  </Text>
                  <Text style={styles.bookName}>
                    {isArabic && currentQuote.book?.titleAr ? currentQuote.book.titleAr : currentQuote.book?.title}
                  </Text>
                </TouchableOpacity>
                {commentaryText ? (
                  <TouchableOpacity onPress={handleCardFlip} activeOpacity={0.7} style={styles.flipHint}>
                    <FontAwesome name="refresh" size={11} color={Colors.textMuted} />
                    <Text style={styles.flipHintText}>{t('commentary.tapToFlip')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ── BACK FACE (Commentary) ── */}
          <Animated.View style={[styles.cardFace, styles.cardFaceBack, { opacity: backOpacity, transform: [{ perspective: 1000 }, { rotateY: backRotate }] }]}>
            <LinearGradient
              colors={['#141414', '#0a0a0a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteCard}
            >
              <View style={[styles.cardGlow, { backgroundColor: accentColor }]} />
              <View style={styles.commentaryContent}>
                <View style={styles.commentaryHeader}>
                  <FontAwesome name="lightbulb-o" size={18} color={accentColor} />
                  <Text style={[styles.commentaryTitle, { color: accentColor }]}>{t('commentary.title')}</Text>
                </View>
                <Text style={styles.commentaryText}>
                  {commentaryText || t('commentary.noCommentary')}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCardFlip} activeOpacity={0.7} style={styles.flipHint}>
                <FontAwesome name="refresh" size={11} color={Colors.textMuted} />
                <Text style={styles.flipHintText}>{t('commentary.tapToReturn')}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Heart overlay on double-tap */}
          <Animated.View pointerEvents="none" style={[styles.heartOverlay, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
            <FontAwesome name="heart" size={64} color={Colors.accent} />
          </Animated.View>
          </Pressable>
          </Animated.View>
        </GestureDetector>

        <View style={styles.swapHintRow}>
          <FontAwesome name="exchange" size={12} color={Colors.textMuted} />
          <Text style={styles.swapHintText}>{t('today.swipeHint')}</Text>
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
          {allQuotes
            .filter((q) => q.id !== currentQuote?.id)
            .slice(0, 3)
            .map((quote) => (
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
  bismillah: {
    fontSize: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  quoteOfTheDayLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  cardWrapper: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    minHeight: 420,
  },
  quoteCard: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  cardTopContent: {
    alignItems: 'center',
  },
  cardBottomContent: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  cardGlow: {
    position: 'absolute',
    top: -110,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.08,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  topicRule: {
    width: 22,
    height: 1,
  },
  topicText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  glyph: {
    fontSize: 68,
    lineHeight: 56,
    height: 44,
    fontWeight: '700',
    textAlign: 'center',
  },
  quoteText: {
    ...Typography.quoteDisplay,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  ornamentLine: {
    width: 32,
    height: 1,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  attribution: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scholarName: {
    ...Typography.scholarName,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  bookName: {
    ...Typography.bookTitle,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
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
  swapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  swapHintText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
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
  // ── Card flip ────────────────────────────────────────────
  cardFace: {
    width: '100%',
    minHeight: 420,
    backfaceVisibility: 'hidden',
  },
  cardFaceBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  flipHintText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  // ── Commentary back face ─────────────────────────────────
  commentaryContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  commentaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  commentaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  commentaryText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
