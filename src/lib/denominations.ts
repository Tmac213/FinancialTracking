/** Common banknotes and coin denominations for major ISO currencies */
export const CURRENCY_DENOMINATIONS: Record<string, number[]> = {
  // United States Dollar
  USD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  // Lebanese Pound (as specifically requested)
  LBP: [100000, 50000, 20000, 10000, 5000, 1000, 500, 250],
  // Euro
  EUR: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  // British Pound Sterling
  GBP: [50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  // Saudi Riyal
  SAR: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25],
  // United Arab Emirates Dirham
  AED: [1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.5, 0.25],
  // Canadian Dollar
  CAD: [100, 50, 20, 10, 5, 2, 1, 0.25, 0.1, 0.05],
  // Australian Dollar
  AUD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  // Japanese Yen
  JPY: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  // Chinese Yuan (RMB)
  CNY: [100, 50, 20, 10, 5, 1, 0.5, 0.1],
  // Indian Rupee
  INR: [500, 200, 100, 50, 20, 10, 5, 2, 1],
  // Turkish Lira
  TRY: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25],
  // Russian Ruble
  RUB: [5000, 2000, 1000, 500, 200, 100, 50, 10, 5, 2, 1],
  // Brazilian Real
  BRL: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  // Swiss Franc
  CHF: [1000, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  // South Korean Won
  KRW: [50000, 10000, 5000, 1000, 500, 100, 50, 10],
  // Indonesian Rupiah
  IDR: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  // Mexican Peso
  MXN: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  // South African Rand
  ZAR: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  // Polish Zloty
  PLN: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  // Swedish Krona
  SEK: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  // Thai Baht
  THB: [1000, 500, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25],
  // Vietnamese Dong
  VND: [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500],
  // Egyptian Pound
  EGP: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25],
  // Kuwaiti Dinar
  KWD: [20, 10, 5, 1, 0.5, 0.25],
  // Qatari Riyal
  QAR: [500, 200, 100, 50, 10, 5, 1],
  // Jordanian Dinar
  JOD: [50, 20, 10, 5, 1, 0.5, 0.25],
  // Syrian Pound
  SYP: [5000, 2000, 1000, 500, 200, 100, 50],
  // Iraqi Dinar
  IQD: [50000, 25000, 10000, 5000, 1000, 500, 250],
  // Moroccan Dirham
  MAD: [200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  // Singapore Dollar
  SGD: [1000, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  // Malaysian Ringgit
  MYR: [100, 50, 20, 10, 5, 1, 0.5, 0.2, 0.1, 0.05],
  // New Zealand Dollar
  NZD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  // Hong Kong Dollar
  HKD: [1000, 500, 100, 50, 20, 10, 5, 2, 1],
  // Norwegian Krone
  NOK: [1000, 500, 200, 100, 50, 20, 10, 5, 1],
  // Danish Krone
  DKK: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  // Philippine Peso
  PHP: [1000, 500, 200, 100, 50, 20, 10, 5, 1],
};

/** Standard default denominations for any other ISO currency */
export const DEFAULT_DENOMINATIONS = [100, 50, 20, 10, 5, 1];

export const getDenominationsForCurrency = (currencyCode: string): number[] => {
  const code = currencyCode.toUpperCase();
  return CURRENCY_DENOMINATIONS[code] ?? DEFAULT_DENOMINATIONS;
};
