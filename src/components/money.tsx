import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatMoney, localeFromLanguage } from "@/lib/currencies";

export type MoneyTone = "default" | "income" | "expense" | "muted";

const toneClass: Record<MoneyTone, string> = {
  default: "text-foreground",
  income: "text-income",
  expense: "text-expense",
  muted: "text-muted-foreground",
};

type MoneyProps = {
  amount: number;
  currency: string;
  tone?: MoneyTone;
  /** Prefix a `+` for positive amounts (the formatter already prints `-`). */
  signed?: boolean;
  className?: string;
};

/** Every amount in the app renders through here, so figures stay consistent. */
export const Money = ({
  amount,
  currency,
  tone = "default",
  signed = false,
  className,
}: MoneyProps) => {
  const { i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const prefix = signed && amount > 0 ? "+" : "";

  return (
    <span className={cn("numeric", toneClass[tone], className)}>
      {prefix}
      {formatMoney(amount, currency, locale)}
    </span>
  );
};

type MoneyWithBaseProps = {
  amount: number;
  currency: string;
  baseAmount: number;
  baseCurrency: string;
  tone?: MoneyTone;
};

/**
 * A foreign-currency amount with its converted value underneath. Same-currency
 * rows render the plain amount, so the conversion line only appears when it
 * actually says something new.
 */
export const MoneyWithBase = ({
  amount,
  currency,
  baseAmount,
  baseCurrency,
  tone = "default",
}: MoneyWithBaseProps) => {
  const sameCurrency = currency.toUpperCase() === baseCurrency.toUpperCase();

  return (
    <div className="flex flex-col items-end gap-0.5">
      <Money
        amount={amount}
        currency={currency}
        tone={tone}
        className="font-semibold"
      />
      {!sameCurrency && (
        <Money
          amount={baseAmount}
          currency={baseCurrency}
          tone="muted"
          className="text-xs"
        />
      )}
    </div>
  );
};
