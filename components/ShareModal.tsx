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
    TurboModuleRegistry,
    View,
} from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import type { Quote } from '@/constants/Types';

import ShareQuoteCard from './ShareQuoteCard';
import StoryQuoteCard from './StoryQuoteCard';

// react-native-view-shot ships a native module (RNViewShot). It is only
// present in a development/production build that was compiled AFTER the
// package was installed — never in Expo Go. Instead of relying on the
// execution environment (unreliable), probe the native registry directly:
// TurboModuleRegistry.get() returns null when the module is missing rather
// than throwing, so we can safely fall back to text-only sharing.
const HAS_VIEW_SHOT = TurboModuleRegistry.get('RNViewShot') != null;

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  quote: Quote;
  isArabic: boolean;
}

export default function ShareModal({ visible, onClose, quote, isArabic }: ShareModalProps) {
  const { t } = useTranslation();
  const cardRef = useRef<View>(null);
  const storyRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);
  const [capturingStory, setCapturingStory] = useState(false);

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

  const shareImageFromRef = useCallback(async (ref: React.RefObject<View | null>, setLoading: (v: boolean) => void) => {
    if (!HAS_VIEW_SHOT) {
      onClose();
      Alert.alert(t('share.imageUnavailable'), t('share.imageUnavailableDesc'));
      return;
    }
    setLoading(true);
    try {
      const { captureRef } = await import('react-native-view-shot');
      const uri = await captureRef(ref, { format: 'png', quality: 1 });
      onClose();

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
      await Share.share({ url: uri });
    } catch {
      Alert.alert(t('share.imageUnavailable'), t('share.imageUnavailableDesc'));
    } finally {
      setLoading(false);
    }
  }, [onClose, t]);

  const handleShareImage = useCallback(() => {
    shareImageFromRef(cardRef, setCapturing);
  }, [shareImageFromRef]);

  const handleShareStory = useCallback(() => {
    shareImageFromRef(storyRef, setCapturingStory);
  }, [shareImageFromRef]);

  return (
    <>
      {/* Hidden cards for capture — rendered off-screen */}
      <View style={styles.offscreen} ref={cardRef} collapsable={false}>
        <ShareQuoteCard quote={quote} isArabic={isArabic} />
      </View>
      <View style={styles.offscreen} ref={storyRef} collapsable={false}>
        <StoryQuoteCard quote={quote} isArabic={isArabic} />
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

            {/* Story export option */}
            <TouchableOpacity
              style={styles.option}
              onPress={handleShareStory}
              activeOpacity={0.7}
              disabled={capturingStory}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.accent + '12' }]}>
                {capturingStory ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <FontAwesome name="mobile-phone" size={24} color={Colors.accent} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{t('share.storyExport')}</Text>
                <Text style={styles.optionDesc}>{t('share.storyExportDesc')}</Text>
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
