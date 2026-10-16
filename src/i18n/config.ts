import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import {
  fallbackLng,
  getLanguageDirection,
  normalizeLanguage,
  supportedLngs,
} from "./util";

export * from "./util";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

// Bundle every public/locales file at build time and pass them as synchronous
// `resources`, so t() returns real strings on the first paint instead of returning
// the key and re-rendering the whole tree once HttpBackend finishes loading. That
// async swap is what remounts elements keyed off a translated value (key={t(...)})
// and breaks their mount-time effects (scroll/stack animations, layout measurement),
// leaving them flat after a reload. The preview re-imports these JSON files on every
// rebuild, so the bundled copy never goes stale.
// Initialize i18next with HttpBackend to load translations at runtime.
// Dynamically import all locale JSON files at build time using Vite's import.meta.globEager.
const localeModules = import.meta.glob('../../public/locales/*.json', { eager: true });
const resources = Object.entries(localeModules).reduce((acc, [path, module]) => {
  const lang = path.split('/').pop()?.replace('.json', '') ?? '';
  // Vite's eager import returns the JSON content as the default export.
  acc[lang] = { translation: (module as { default: Record<string, string> }).default };
  return acc;
}, {} as Record<string, { translation: Record<string, string> }>);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    supportedLngs,
    resources,
    load: 'languageOnly',
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

const syncDocumentLanguage = (lng: string) => {
  const code = normalizeLanguage(lng) ?? fallbackLng;
  document.documentElement.lang = code;
  document.documentElement.dir = getLanguageDirection(code);
};

i18n.on("initialized", () =>
  syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language),
);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
