import i18n from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';

export type Language = 'en' | 'ar';
// 'auto' = follow UI language; otherwise force a specific language for quotes
export type QuoteLanguage = 'auto' | 'en' | 'ar';

const STORAGE_KEY = '@scholar_quote_language';
const QUOTE_LANG_KEY = '@scholar_quote_quote_language';

let currentLanguage: Language = (i18n.language as Language) || 'en';
let currentQuoteLanguage: QuoteLanguage = 'auto';
let listeners: Array<() => void> = [];
let initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

// Layout always stays LTR — only text content is translated. Make sure RTL is
// disabled in case a previous build flipped it.
function ensureLTR() {
  try {
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
    }
    I18nManager.allowRTL(false);
  } catch (_) {}
}

// Load persisted language on startup
export async function initLanguage(): Promise<void> {
  if (initialized) return;
  initialized = true;
  ensureLTR();
  try {
    const [saved, savedQuote] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(QUOTE_LANG_KEY),
    ]);
    if (saved === 'ar' || saved === 'en') {
      currentLanguage = saved;
      i18n.changeLanguage(saved);
    }
    if (savedQuote === 'auto' || savedQuote === 'ar' || savedQuote === 'en') {
      currentQuoteLanguage = savedQuote;
    }
    notify();
  } catch (_) {}
}

export function useLanguage() {
  const [, forceUpdate] = useState(0);

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  const setLanguage = useCallback((lang: Language) => {
    currentLanguage = lang;
    i18n.changeLanguage(lang);
    ensureLTR();
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
    notify();
  }, []);

  const setQuoteLanguage = useCallback((lang: QuoteLanguage) => {
    currentQuoteLanguage = lang;
    AsyncStorage.setItem(QUOTE_LANG_KEY, lang).catch(() => {});
    notify();
  }, []);

  const language = currentLanguage;
  const quoteLanguage = currentQuoteLanguage;
  // Resolved language for quote text (auto -> follow UI)
  const effectiveQuoteLanguage: Language =
    quoteLanguage === 'auto' ? currentLanguage : quoteLanguage;

  return {
    language,
    quoteLanguage,
    effectiveQuoteLanguage,
    setLanguage,
    setQuoteLanguage,
  };
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function getQuoteLanguage(): Language {
  return currentQuoteLanguage === 'auto' ? currentLanguage : currentQuoteLanguage;
}

