import React from "react";
import { cn } from "@/lib/utils";

// Mapping of Currency Code to ISO 3166-1 alpha-2 country code for flags
export const CURRENCY_FLAG_MAP: Record<string, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  CNY: "cn",
  LBP: "lb",
  SAR: "sa",
  AED: "ae",
  CAD: "ca",
  AUD: "au",
  CHF: "ch",
  INR: "in",
  TRY: "tr",
  RUB: "ru",
  BRL: "br",
  KRW: "kr",
  IDR: "id",
  MXN: "mx",
  ZAR: "za",
  PLN: "pl",
  SEK: "se",
  THB: "th",
  VND: "vn",
  EGP: "eg",
  KWD: "kw",
  QAR: "qa",
  JOD: "jo",
  SYP: "sy",
  IQD: "iq",
  MAD: "ma",
  SGD: "sg",
  MYR: "my",
  NZD: "nz",
  HKD: "hk",
  NOK: "no",
  DKK: "dk",
  PHP: "ph",
  BDT: "bd",
  PKR: "pk",
  TWD: "tw",
};

export const getCurrencyCountryCode = (currencyCode: string): string => {
  const code = (currencyCode || "").trim().toUpperCase();
  if (CURRENCY_FLAG_MAP[code]) {
    return CURRENCY_FLAG_MAP[code];
  }
  // Fallback to first two letters lowercase if 3-letter currency code (e.g. ARS -> ar)
  if (code.length === 3) {
    return code.slice(0, 2).toLowerCase();
  }
  return "us";
};

interface CurrencyFlagProps {
  currency: string;
  className?: string;
}

export const CurrencyFlag: React.FC<CurrencyFlagProps> = ({ currency, className }) => {
  const countryCode = getCurrencyCountryCode(currency);
  const [hasError, setHasError] = React.useState(false);

  return (
    <img
      src={hasError ? `https://flagcdn.com/w40/${countryCode}.png` : `/flags/${countryCode}.png`}
      alt={currency}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={cn(
        "h-3.5 w-5 rounded-[2px] object-cover shadow-xs border border-border/40 shrink-0 inline-block",
        className
      )}
      loading="eager"
    />
  );
};
