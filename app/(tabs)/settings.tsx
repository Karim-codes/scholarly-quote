import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { usePremium } from '@/store/useAppStore';
import { signOut, useAuth } from '@/store/useAuthStore';
import { useLanguage, type Language, type QuoteLanguage } from '@/store/useLanguageStore';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <FontAwesome
          name={icon as any}
          size={16}
          color={destructive ? Colors.error : Colors.textSecondary}
          style={styles.rowIcon}
        />
        <Text style={[styles.rowLabel, destructive && { color: Colors.error }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showChevron && onPress && (
          <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const LANGUAGE_OPTIONS: { code: Language; labelKey: string; native: string }[] = [
  { code: 'en', labelKey: 'settings.english', native: 'English' },
  { code: 'ar', labelKey: 'settings.arabic', native: 'العربية' },
];

const QUOTE_LANG_OPTIONS: { code: QuoteLanguage; native: string }[] = [
  { code: 'auto', native: 'Same as app' },
  { code: 'en', native: 'English' },
  { code: 'ar', native: 'العربية' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, quoteLanguage, setLanguage, setQuoteLanguage } = useLanguage();
  const { user, isSignedIn } = useAuth();
  const { isPremium } = usePremium();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [quoteLangModalVisible, setQuoteLangModalVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.signOut'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const currentLangLabel = language === 'ar' ? t('settings.arabic') : t('settings.english');
  const currentQuoteLangLabel =
    quoteLanguage === 'auto'
      ? 'Same as app'
      : quoteLanguage === 'ar'
        ? t('settings.arabic')
        : t('settings.english');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangModalVisible(false);
  };

  const handleQuoteLanguageChange = (lang: QuoteLanguage) => {
    setQuoteLanguage(lang);
    setQuoteLangModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Language picker modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.langOption,
                  language === opt.code && styles.langOptionActive,
                ]}
                onPress={() => handleLanguageChange(opt.code)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.langOptionText,
                  language === opt.code && styles.langOptionTextActive,
                ]}>
                  {opt.native}
                </Text>
                {language === opt.code && (
                  <FontAwesome name="check" size={14} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Quote-language picker modal */}
      <Modal
        visible={quoteLangModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuoteLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQuoteLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quote language</Text>
            {QUOTE_LANG_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.langOption,
                  quoteLanguage === opt.code && styles.langOptionActive,
                ]}
                onPress={() => handleQuoteLanguageChange(opt.code)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.langOptionText,
                  quoteLanguage === opt.code && styles.langOptionTextActive,
                ]}>
                  {opt.native}
                </Text>
                {quoteLanguage === opt.code && (
                  <FontAwesome name="check" size={14} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* Account section */}
        <TouchableOpacity
          style={styles.accountCard}
          activeOpacity={isSignedIn ? 1 : 0.8}
          disabled={isSignedIn}
          onPress={() => router.push('/auth')}
        >
          <View style={styles.avatarCircle}>
            <FontAwesome name="user" size={22} color={Colors.textSecondary} />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              {isSignedIn ? user?.displayName || user?.email || t('settings.guestUser') : t('settings.guestUser')}
            </Text>
            <Text style={styles.accountEmail}>
              {isSignedIn ? user?.email ?? '' : t('settings.signInPrompt')}
            </Text>
          </View>
          {!isSignedIn && <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />}
        </TouchableOpacity>

        {/* Premium Banner */}
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => router.push('/premium')}
          activeOpacity={0.8}
        >
          <View style={styles.premiumLeft}>
            <FontAwesome name="star" size={18} color={Colors.textPrimary} />
            <View style={styles.premiumTextGroup}>
              <Text style={styles.premiumTitle}>
                {isPremium ? t('settings.premiumActive') : t('settings.upgradePremium')}
              </Text>
              <Text style={styles.premiumDesc}>
                {isPremium ? t('settings.premiumActiveDesc') : t('settings.premiumDesc')}
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* General */}
        <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="globe"
            label={t('settings.language')}
            value={currentLangLabel}
            onPress={() => setLangModalVisible(true)}
          />
          <SettingsRow
            icon="quote-right"
            label="Quote language"
            value={currentQuoteLangLabel}
            onPress={() => setQuoteLangModalVisible(true)}
          />
          <SettingsRow
            icon="bell-o"
            label={t('settings.notifications')}
            value="5:30 AM"
            onPress={() => {}}
          />
          <SettingsRow
            icon="moon-o"
            label={t('settings.appearance')}
            value={t('settings.dark')}
            onPress={() => {}}
          />
        </View>

        {/* Widget */}
        <Text style={styles.sectionTitle}>{t('settings.widget')}</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="th-large"
            label={t('settings.widgetSize')}
            value={t('settings.medium')}
            onPress={() => {}}
          />
          <SettingsRow
            icon="paint-brush"
            label={t('settings.widgetTheme')}
            value={t('settings.classic')}
            onPress={() => router.push('/premium')}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
        <View style={styles.section}>
          <SettingsRow icon="question-circle-o" label={t('settings.helpFaq')} onPress={() => {}} />
          <SettingsRow icon="envelope-o" label={t('settings.sendFeedback')} onPress={() => {}} />
          <SettingsRow icon="star-o" label={t('settings.rateApp')} onPress={() => {}} />
          <SettingsRow icon="share-alt" label={t('settings.shareWithFriends')} onPress={() => {}} />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.section}>
          <SettingsRow icon="info-circle" label={t('settings.aboutApp')} onPress={() => {}} />
          <SettingsRow icon="file-text-o" label={t('settings.terms')} onPress={() => {}} />
          <SettingsRow icon="lock" label={t('settings.privacy')} onPress={() => {}} />
          <SettingsRow
            icon="code"
            label={t('settings.version')}
            value="1.0.0"
            showChevron={false}
          />
        </View>

        {/* Danger zone */}
        {isSignedIn && (
          <View style={styles.section}>
            <SettingsRow
              icon="sign-out"
              label={t('settings.signOut')}
              onPress={handleSignOut}
              showChevron={false}
              destructive
            />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={styles.footerText}>{t('settings.footerDua')}</Text>
        </View>

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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent + '08',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '12',
    marginBottom: Spacing.xl,
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumTextGroup: {
    marginLeft: Spacing.md,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  premiumDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: Spacing.md,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerBismillah: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
  },
  langOptionActive: {
    backgroundColor: Colors.accent + '0c',
  },
  langOptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  langOptionTextActive: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
