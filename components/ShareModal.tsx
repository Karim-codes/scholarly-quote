import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import type { Quote } from '@/constants/Types';

import ShareQuoteCard from './ShareQuoteCard';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  quote: Quote;
  isArabic: boolean;
}

export default function ShareModal({ visible, onClose, quote, isArabic }: ShareModalProps) {
  const { t } = useTranslation();
  const cardRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);

  const handleShareText = async () => {
    onClose();
    const scholarName = isArabic && quote.scholar?.nameAr
      ? quote.scholar.nameAr
      : quote.scholar?.name;
    const bookTitle = isArabic && quote.book?.titleAr
      ? quote.book.titleAr
      : quote.book?.title;
    const quoteText = isArabic && quote.textAr ? quote.textAr : quote.text;

    try {
      await Share.share({
        message: `"${quoteText}"\n\n— ${scholarName}\nSource: ${bookTitle}\n\nvia Scholar Quote`,
      });
    } catch {
      // Silently handle
    }
  };

  const handleShareImage = useCallback(async () => {
    setCapturing(true);
    try {
      // Lazy-import to avoid crashing in Expo Go (no native modules)
      const { captureRef } = await import('react-native-view-shot');
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      onClose();

      // Try expo-sharing first (works in dev client / production builds)
      try {
        const Sharing = await import('expo-sharing');
        if (Sharing.isAvailableAsync && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: t('share.shareImage'),
          });
          return;
        }
      } catch {
        // expo-sharing not available — fall through
      }
      // Fallback: share file URI via RN Share (iOS supports url)
      await Share.share({ url: uri });
    } catch {
      Alert.alert(
        'Image sharing unavailable',
        'This feature requires a development build. Use "Text Only" for now.',
      );
    } finally {
      setCapturing(false);
    }
  }, [onClose, t]);

  return (
    <>
      {/* Hidden card for capture — rendered off-screen */}
      <View style={styles.offscreen} ref={cardRef} collapsable={false}>
        <ShareQuoteCard quote={quote} isArabic={isArabic} />
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>{t('share.title')}</Text>

            {/* Text option */}
            <TouchableOpacity
              style={styles.option}
              onPress={handleShareText}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <FontAwesome name="font" size={20} color={Colors.accent} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{t('share.textOnly')}</Text>
                <Text style={styles.optionDesc}>{t('share.textOnlyDesc')}</Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Image option */}
            <TouchableOpacity
              style={styles.option}
              onPress={handleShareImage}
              activeOpacity={0.7}
              disabled={capturing}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.accent + '12' }]}>
                {capturing ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <FontAwesome name="image" size={20} color={Colors.accent} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{t('share.image')}</Text>
                <Text style={styles.optionDesc}>{t('share.imageDesc')}</Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accentSubtle,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
