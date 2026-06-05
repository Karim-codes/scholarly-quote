import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FREE_SAVE_LIMIT, useSavedQuotes } from '@/store/useAppStore';

/**
 * Wraps the saved-quotes store with paywall handling: when a free user hits the
 * save limit, it surfaces an upgrade prompt that routes to the premium screen.
 */
export function useSaveQuote() {
  const { toggleSave, isSaved } = useSavedQuotes();
  const router = useRouter();
  const { t } = useTranslation();

  const save = useCallback(
    (quoteId: string) => {
      const result = toggleSave(quoteId);
      if (!result.ok && result.limitReached) {
        Alert.alert(
          t('saveLimit.title'),
          t('saveLimit.message', { count: FREE_SAVE_LIMIT }),
          [
            { text: t('saveLimit.notNow'), style: 'cancel' },
            { text: t('saveLimit.upgrade'), onPress: () => router.push('/premium') },
          ]
        );
      }
      return result;
    },
    [toggleSave, router, t]
  );

  return { save, isSaved };
}
