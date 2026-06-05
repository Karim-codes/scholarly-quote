import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './ar';
import en from './en';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Initial language; the persisted user preference (via useLanguageStore /
// AsyncStorage) overrides this on app startup. We default to English here to
// avoid pulling in the `expo-localization` native module — users pick their
// language explicitly in Settings.
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
