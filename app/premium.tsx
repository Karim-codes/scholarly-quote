import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { scholars } from '@/data/mockData';
import { usePremium } from '@/store/useAppStore';

type PlanType = 'lifetime' | 'monthly';

const FEATURE_ICONS = ['th-large', 'image', 'bookmark', 'bell', 'heart'];
const FEATURE_KEYS = [
  'premium.feature1',
  'premium.feature2',
  'premium.feature3',
  'premium.feature4',
  'premium.feature5',
];

export default function PremiumScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('lifetime');
  const [processing, setProcessing] = useState(false);
  const { isPremium, purchase, restore } = usePremium();
  const allScholars = scholars;

  // Marquee animation for scholar chips
  const scrollX = useRef(new Animated.Value(0)).current;
  const CHIP_WIDTH = 160;
  const TOTAL_WIDTH = allScholars.length * CHIP_WIDTH;

  useEffect(() => {
    const animate = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -TOTAL_WIDTH,
        duration: allScholars.length * 3000,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
    return () => scrollX.stopAnimation();
  }, []);

  const handlePurchase = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const success = await purchase(selectedPlan);
      if (success) {
        Alert.alert(t('premium.successTitle'), t('premium.successMsg'), [
          { text: t('premium.ok'), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t('premium.failedTitle'), t('premium.failedMsg'), [{ text: t('premium.ok') }]);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const active = await restore();
      Alert.alert(
        active ? t('premium.restoredTitle') : t('premium.nothingTitle'),
        active ? t('premium.restoredMsg') : t('premium.nothingMsg'),
        [{ text: t('premium.ok'), onPress: () => active && router.back() }]
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <FontAwesome name="times" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <FontAwesome name="star" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>{t('premium.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('premium.subtitle')}</Text>
          <Text style={styles.heroDesc}>
            {t('premium.desc')}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURE_KEYS.map((key, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <FontAwesome name={FEATURE_ICONS[index] as any} size={14} color={Colors.accent} />
              </View>
              <Text style={styles.featureText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        {/* Scholars marquee */}
        <Text style={styles.sectionTitle}>{t('premium.unlockScholars')}</Text>
        <View style={styles.marqueeContainer}>
          <Animated.View
            style={[
              styles.marqueeTrack,
              { transform: [{ translateX: scrollX }] },
            ]}
          >
            {/* Duplicate list for seamless loop */}
            {[...allScholars, ...allScholars].map((scholar, i) => (
              <View key={`${scholar.id}-${i}`} style={styles.scholarChip}>
                <View
                  style={[styles.scholarDot, { backgroundColor: scholar.accentColor }]}
                />
                <Text style={styles.scholarChipText}>{scholar.shortName}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Pricing cards */}
        <View style={styles.pricingSection}>
          {/* Lifetime — hero plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'lifetime' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('lifetime')}
            activeOpacity={0.8}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>{t('premium.bestValue')}</Text>
            </View>
            <Text style={styles.planName}>{t('premium.lifetime')}</Text>
            <Text style={styles.planPrice}>{t('premium.lifetimePrice')}</Text>
            <Text style={styles.planPriceNote}>{t('premium.oneTime')}</Text>
            <Text style={styles.planSavings}>{t('premium.savings')}</Text>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'monthly' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={styles.planName}>{t('premium.monthly')}</Text>
            <Text style={styles.planPrice}>{t('premium.monthlyPrice')}</Text>
            <Text style={styles.planPriceNote}>{t('premium.perMonth')}</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, (processing || isPremium) && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          activeOpacity={0.8}
          disabled={processing || isPremium}
        >
          {processing ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.ctaText}>
              {isPremium
                ? t('premium.ctaActive')
                : selectedPlan === 'lifetime'
                  ? t('premium.ctaLifetime')
                  : t('premium.ctaMonthly')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legalText}>
          {t('premium.legal')}
        </Text>

        <TouchableOpacity activeOpacity={0.7} onPress={handleRestore} disabled={processing}>
          <Text style={styles.restoreText}>{t('premium.restore')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent + '0a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '20',
  },
  heroTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  heroDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresSection: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + '0a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  marqueeContainer: {
    overflow: 'hidden',
    height: 44,
    marginBottom: Spacing.lg,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scholarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  scholarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  scholarChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pricingSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  pricingCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '08',
  },
  bestValueBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.background,
  },
  planName: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  planPriceNote: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  planSavings: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: Spacing.md,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.background,
  },
  legalText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
