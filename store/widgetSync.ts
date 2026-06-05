import { Platform } from 'react-native';

import type { Quote } from '@/constants/Types';
import { getQuoteLanguage } from '@/store/useLanguageStore';

const APP_GROUP = 'group.com.scholarquote.app';
const STORAGE_KEY = 'daily_quote';

type SharedQuotePayload = {
  id: string;
  text: string;
  scholarName: string;
  scholarInitials: string;
  bookTitle: string;
  topic: string;
  accentHex: string;
  updatedAt: number;
};

/**
 * Writes the current daily quote into the shared App Group `UserDefaults` so
 * the iOS Swift widget can render it offline. Safe to call on every platform —
 * it's a no-op outside iOS or in development builds without the native module.
 */
export async function syncDailyQuoteToWidget(quote: Quote): Promise<void> {
  if (Platform.OS !== 'ios') return;

  let ExtensionStorage: typeof import('@bacons/apple-targets').ExtensionStorage;
  try {
    // Lazy require so Expo Go (which doesn't include the native module) doesn't
    // crash at import time.
    ExtensionStorage = require('@bacons/apple-targets').ExtensionStorage;
  } catch {
    return;
  }

  const useArabic = getQuoteLanguage() === 'ar';
  const payload: SharedQuotePayload = {
    id: quote.id,
    text: useArabic && quote.textAr ? quote.textAr : quote.text,
    scholarName:
      (useArabic && quote.scholar?.nameAr ? quote.scholar.nameAr : quote.scholar?.name) ?? '',
    scholarInitials: quote.scholar?.initials ?? '',
    bookTitle:
      (useArabic && quote.book?.titleAr ? quote.book.titleAr : quote.book?.title) ?? '',
    topic: quote.topic,
    accentHex: quote.scholar?.accentColor ?? '#c4a882',
    updatedAt: Date.now(),
  };

  try {
    const storage = new ExtensionStorage(APP_GROUP);
    // The native module accepts strings or serialisable objects; we serialise
    // explicitly so the Swift side has a single, stable JSON contract.
    storage.set(STORAGE_KEY, JSON.stringify(payload));
    ExtensionStorage.reloadWidget('ScholarQuoteWidget');
  } catch {
    // Don't let widget sync failures break the app.
  }
}
