import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import en from './locales/en.json';
import zh from './locales/zh.json';

i18n.translations = { en, zh };
i18n.locale = Localization.locale.includes('zh') ? 'zh' : 'en';
i18n.fallbacks = true;

export default i18n;
