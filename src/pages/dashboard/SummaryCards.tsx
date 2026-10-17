import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Compass,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { percentChange, type SpendingVelocity, type Totals } from "@/lib/finance";
import { localeFromLanguage } from "@/lib/currencies";

type SummaryCardsProps = {
  current: Totals;
  previous: Totals;
  velocity: SpendingVelocity;
  currency: string;
};

export const SummaryCards = ({
  current,
  previous,
  velocity,
  currency,
}: SummaryCardsProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);

  const previousLabel = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
  );
  const hint = t("dashboard.vsPrevious", { period: previousLabel });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label={t("dashboard.income")}
        amount={current.income}
        currency={currency}
        icon={TrendingUp}
        tone="income"
        delta={percentChange(current.income, previous.income)}
        hint={hint}
        style={{ animationDelay: "0ms" }}
      />
      <StatCard
        label={t("dashboard.expenses")}
        amount={current.expense}
        currency={currency}
        icon={TrendingDown}
        tone="expense"
        delta={percentChange(current.expense, previous.expense)}
        positiveIsGood={false}
        hint={hint}
        style={{ animationDelay: "50ms" }}
      />
      <StatCard
        label={t("dashboard.net")}
        amount={current.net}
        currency={currency}
        icon={Wallet}
        tone={current.net >= 0 ? "income" : "expense"}
        delta={percentChange(current.net, previous.net)}
        hint={hint}
        style={{ animationDelay: "100ms" }}
      />
      <StatCard
        label={t("dashboard.savingsRate")}
        icon={PiggyBank}
        tone={current.savingsRate >= 0 ? "default" : "expense"}
        hint={t("dashboard.savingsHint")}
        style={{ animationDelay: "150ms" }}
        value={
          <span
            className={
              current.savingsRate >= 0
                ? "numeric text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
                : "numeric text-2xl font-semibold tracking-tight text-expense md:text-3xl"
            }
          >
            {current.savingsRate}%
          </span>
        }
      />
      <StatCard
        label={t("dashboard.velocity.dailyAverage")}
        amount={velocity.dailyAverage}
        currency={currency}
        icon={CalendarDays}
        tone="default"
        hint={t("dashboard.velocity.dailyHint", { days: velocity.daysPassed })}
        style={{ animationDelay: "200ms" }}
      />
      <StatCard
        label={t("dashboard.velocity.projectedMonthEnd")}
        amount={velocity.projectedMonthEnd}
        currency={currency}
        icon={Compass}
        tone={
          current.income > 0 && velocity.projectedMonthEnd > current.income
            ? "expense"
            : "default"
        }
        hint={t("dashboard.velocity.projectedHint")}
        style={{ animationDelay: "250ms" }}
      />
    </div>
  );
};
