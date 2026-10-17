/** ISO 4217 currency helpers.
 *
 * The code list is the full ISO 4217 set; symbols, names and formatting all come
 * from the runtime's ICU data (`Intl.NumberFormat` / `Intl.DisplayNames`) so there
 * is no hand-maintained symbol table to drift out of date.
 */

export const CURRENCY_CODES = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR",
  "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF",
  "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL",
  "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR",
  "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR",
  "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR",
  "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD",
  "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB",
  "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX",
  "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF",
  "XPF", "YER", "ZAR", "ZMW", "ZWL",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

const CODE_SET = new Set<string>(CURRENCY_CODES);

export const DEFAULT_CURRENCY = "USD";

export const isCurrencyCode = (value: string): boolean =>
  CODE_SET.has(value.trim().toUpperCase());

/** BCP-47 locale used for number and currency formatting with native numbering systems */
export const localeFromLanguage = (language: string): string => {
  if (!language) return "en-US";
  const lang = language.trim().toLowerCase();

  switch (lang) {
    case "ar":
      return "ar-u-nu-arab"; // Arabic-Indic digits (٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩)
    case "hi":
      return "hi-u-nu-deva"; // Devanagari digits (० १ २ ३ ४ ५ ६ ७ ८ ९)
    case "th":
      return "th-u-nu-thai"; // Thai numerals (๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙)
    case "zh-cn":
    case "zh":
      return "zh-CN";
    case "zh-tw":
    case "zh-hk":
    case "zh-hant":
      return "zh-TW";
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    case "it":
      return "it-IT";
    case "ja":
      return "ja-JP";
    case "ko":
      return "ko-KR";
    case "ru":
      return "ru-RU";
    case "pt":
      return "pt-BR";
    case "nl":
      return "nl-NL";
    case "tr":
      return "tr-TR";
    case "id":
    case "ms":
      return "id-ID";
    case "pl":
      return "pl-PL";
    case "vi":
      return "vi-VN";
    case "sv":
      return "sv-SE";
    case "en":
    default:
      return "en-US";
  }
};

/** Format general numbers using the active locale's native numbering system */
export const formatNumber = (
  value: number,
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
};

const symbolCache = new Map<string, string>();

/** The currency's symbol ("$", "€", "₫"); falls back to the code itself. */
export const getCurrencySymbol = (code: string, locale = "en-US"): string => {
  const currency = code.toUpperCase();
  const cacheKey = `${locale}:${currency}`;
  const cached = symbolCache.get(cacheKey);
  if (cached) return cached;

  let symbol = currency;
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    symbol = parts.find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    symbol = currency;
  }

  symbolCache.set(cacheKey, symbol);
  return symbol;
};

const displayNames = (locale: string) => {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" });
  } catch {
    return null;
  }
};

/** The currency's English/translated name ("Euro", "Vietnamese Dong"). */
export const getCurrencyName = (code: string, locale = "en-US"): string => {
  const currency = code.toUpperCase();
  try {
    return displayNames(locale)?.of(currency) ?? currency;
  } catch {
    return currency;
  }
};

/** Format an amount in its own currency, e.g. `formatMoney(1234.5, "EUR")`. */
export const formatMoney = (
  amount: number,
  code: string,
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): string => {
  const currency = isCurrencyCode(code) ? code.toUpperCase() : DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

export type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  search: string;
};

/** All currencies prepared for the searchable picker. */
export const listCurrencies = (locale = "en-US"): CurrencyOption[] =>
  CURRENCY_CODES.map((code) => {
    const name = getCurrencyName(code, locale);
    const symbol = getCurrencySymbol(code, locale);
    return {
      code,
      name,
      symbol,
      search: `${code} ${name} ${symbol}`.toLowerCase(),
    };
  });

/** Rank currencies matching `query`, prioritising exact code matches. */
export const searchCurrencies = (
  query: string,
  locale = "en-US",
): CurrencyOption[] => {
  const term = query.trim().toLowerCase();
  const all = listCurrencies(locale);
  if (!term) return all;

  const matches = all.filter((option) => option.search.includes(term));
  return matches.sort((a, b) => {
    const aExact = a.code.toLowerCase() === term ? 0 : 1;
    const bExact = b.code.toLowerCase() === term ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const aPrefix = a.code.toLowerCase().startsWith(term) ? 0 : 1;
    const bPrefix = b.code.toLowerCase().startsWith(term) ? 0 : 1;
    return aPrefix - bPrefix;
  });
};
