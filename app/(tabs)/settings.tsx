import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { useLanguage, type Language, type QuoteLanguage } from '@/store/useLanguageStore';
import { useUser } from '@/store/useUserStore';

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
  const { name: userName, updateName } = useUser();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [quoteLangModalVisible, setQuoteLangModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [appearanceModalVisible, setAppearanceModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(userName);

  const [notifTime, setNotifTime] = useState('5:30 AM');
  const [appearance, setAppearance] = useState('dark');

  const NOTIF_TIME_OPTIONS = ['5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '9:00 PM', '10:00 PM'];
  const APPEARANCE_OPTIONS = [{ key: 'dark', label: 'Dark' }, { key: 'midnight', label: 'Midnight' }, { key: 'amoled', label: 'AMOLED' }];

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateName(editedName.trim());
    }
    setNameModalVisible(false);
  };

  // TODO: Replace with your real App Store ID once published
  const APP_STORE_ID = '6504000000';
  const SUPPORT_EMAIL = 'support@scholarquote.app';

  const handleRateApp = () => {
    const url = Platform.select({
      ios: `itms-apps://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`,
      default: `https://apps.apple.com/app/id${APP_STORE_ID}`,
    });
    Linking.openURL(url!);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Scholar Quote — daily wisdom from classical Islamic scholars.\nhttps://apps.apple.com/app/id' + APP_STORE_ID,
      });
    } catch (_) {}
  };

  const handleSendFeedback = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Scholar%20Quote%20Feedback`);
  };

  const handleHelpFaq = () => {
    Alert.alert(
      t('settings.helpFaq'),
      'Have a question? Email us at ' + SUPPORT_EMAIL + ' and we\'ll get back to you within 24 hours.',
      [{ text: t('premium.ok') }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Scholar Quote',
      'Scholar Quote delivers daily wisdom from classical Islamic scholars — for the sake of Allah.\n\nAll features are free. Your support keeps us going.\n\nVersion 1.0.0',
      [{ text: t('premium.ok') }]
    );
  };

  const handleTerms = () => {
    Linking.openURL('https://wisdom-flow-archive.vercel.app/terms');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://wisdom-flow-archive.vercel.app/privacy');
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

      {/* Notification time picker modal */}
      <Modal
        visible={notifModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setNotifModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.notifications')}</Text>
            {NOTIF_TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.langOption,
                  notifTime === time && styles.langOptionActive,
                ]}
                onPress={() => { setNotifTime(time); setNotifModalVisible(false); }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.langOptionText,
                  notifTime === time && styles.langOptionTextActive,
                ]}>
                  {time}
                </Text>
                {notifTime === time && (
                  <FontAwesome name="check" size={14} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Appearance picker modal */}
      <Modal
        visible={appearanceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAppearanceModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAppearanceModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.appearance')}</Text>
            {APPEARANCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.langOption,
                  appearance === opt.key && styles.langOptionActive,
                ]}
                onPress={() => { setAppearance(opt.key); setAppearanceModalVisible(false); }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.langOptionText,
                  appearance === opt.key && styles.langOptionTextActive,
                ]}>
                  {opt.label}
                </Text>
                {appearance === opt.key && (
                  <FontAwesome name="check" size={14} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Name edit modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setNameModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <View style={styles.nameInputRow}>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={styles.nameButton}
              onPress={handleSaveName}
              activeOpacity={0.8}
            >
              <Text style={styles.nameButtonText}>Save</Text>
            </TouchableOpacity>
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

        {/* User name card */}
        <TouchableOpacity
          style={styles.accountCard}
          activeOpacity={0.8}
          onPress={() => { setEditedName(userName); setNameModalVisible(true); }}
        >
          <View style={styles.avatarCircle}>
            <FontAwesome name="user" size={22} color={Colors.textSecondary} />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              {userName || 'Scholar Quote User'}
            </Text>
            <Text style={styles.accountEmail}>Tap to edit name</Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Support Us Banner */}
        <TouchableOpacity
          style={styles.supportBanner}
          onPress={() => router.push('/premium')}
          activeOpacity={0.8}
        >
          <View style={styles.supportLeft}>
            <FontAwesome name="heart" size={18} color="#e85d5d" />
            <View style={styles.supportTextGroup}>
              <Text style={styles.supportTitle}>{t('settings.upgradePremium')}</Text>
              <Text style={styles.supportDesc}>{t('settings.premiumDesc')}</Text>
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
            value={notifTime}
            onPress={() => setNotifModalVisible(true)}
          />
          <SettingsRow
            icon="moon-o"
            label={t('settings.appearance')}
            value={APPEARANCE_OPTIONS.find(o => o.key === appearance)?.label || 'Dark'}
            onPress={() => setAppearanceModalVisible(true)}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
        <View style={styles.section}>
          <SettingsRow icon="question-circle-o" label={t('settings.helpFaq')} onPress={handleHelpFaq} />
          <SettingsRow icon="envelope-o" label={t('settings.sendFeedback')} onPress={handleSendFeedback} />
          <SettingsRow icon="star-o" label={t('settings.rateApp')} onPress={handleRateApp} />
          <SettingsRow icon="share-alt" label={t('settings.shareWithFriends')} onPress={handleShareApp} />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.section}>
          <SettingsRow icon="info-circle" label={t('settings.aboutApp')} onPress={handleAbout} />
          <SettingsRow icon="file-text-o" label={t('settings.terms')} onPress={handleTerms} />
          <SettingsRow icon="lock" label={t('settings.privacy')} onPress={handlePrivacy} />
          <SettingsRow
            icon="code"
            label={t('settings.version')}
            value="1.0.0"
            showChevron={false}
          />
        </View>

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
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e85d5d' + '08',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#e85d5d' + '18',
    marginBottom: Spacing.xl,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportTextGroup: {
    marginLeft: Spacing.md,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  supportDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  nameInputRow: {
    marginBottom: Spacing.md,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  nameButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});
