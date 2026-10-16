import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Receipt } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { useCategories } from "@/hooks/use-categories";
import { useProfile } from "@/hooks/use-profile";
import { useTransactions } from "@/hooks/use-transactions";
import {
  categoryBreakdown,
  isWithinRange,
  monthlySeries,
  periodRange,
  previousRange,
  summarize,
  PERIOD_KEYS,
  type PeriodKey,
  type TransactionType,
} from "@/lib/finance";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";
import { listCurrencies } from "@/lib/currencies";
import { SummaryCards } from "./SummaryCards";
import { CashFlowChart } from "./CashFlowChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { RecentTransactions } from "./RecentTransactions";

const RECENT_COUNT = 8;
const CHART_MONTHS = 6;

const DashboardPage = () => {
  const { t } = useTranslation();
  const { baseCurrency: profileBaseCurrency } = useProfile();
  const { categories } = useCategories();
  const { transactions, isLoading, isError } = useTransactions();
  const { baseCurrency: uiBaseCurrency, setBaseCurrency, convert, rates } = useExchangeRate();

  const [period, setPeriod] = useState<PeriodKey>("this_month");
  const [breakdownType, setBreakdownType] = useState<TransactionType>("expense");

  const range = useMemo(() => periodRange(period), [period]);
  const comparisonRange = useMemo(() => previousRange(period), [period]);

  const currentRows = useMemo(
    () => transactions.filter((row) => isWithinRange(row.occurred_on, range)),
    [transactions, range],
  );

  const previousRows = useMemo(
    () =>
      comparisonRange
        ? transactions.filter((row) => isWithinRange(row.occurred_on, comparisonRange))
        : [],
    [transactions, comparisonRange],
  );

  const totals = useMemo(() => summarize(currentRows), [currentRows]);
  const previousTotals = useMemo(() => summarize(previousRows), [previousRows]);

  const series = useMemo(
    () => monthlySeries(transactions, CHART_MONTHS),
    [transactions],
  );

  const slices = useMemo(
    () => categoryBreakdown(currentRows, categories, breakdownType),
    [currentRows, categories, breakdownType],
  );

  const recent = useMemo(() => transactions.slice(0, RECENT_COUNT), [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Receipt />}
        title={t("dashboard.error.title")}
        description={t("dashboard.error.description")}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("dashboard.period")}
          </span>
          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodKey)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('dashboard.selectPeriod')} />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`period.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title={t("dashboard.empty.title")}
          description={t("dashboard.empty.description")}
        />
      ) : (
        <>
          <SummaryCards
            current={ {
              ...totals,
              income: convert(totals.income, profileBaseCurrency, uiBaseCurrency),
              expense: convert(totals.expense, profileBaseCurrency, uiBaseCurrency),
              net: convert(totals.net, profileBaseCurrency, uiBaseCurrency),
            } }
            previous={ {
              ...previousTotals,
              income: convert(previousTotals.income, profileBaseCurrency, uiBaseCurrency),
              expense: convert(previousTotals.expense, profileBaseCurrency, uiBaseCurrency),
              net: convert(previousTotals.net, profileBaseCurrency, uiBaseCurrency),
            } }
            currency={uiBaseCurrency}
          />

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <CashFlowChart data={series.map((pt) => ({
              ...pt,
              income: convert(pt.income, profileBaseCurrency, uiBaseCurrency),
              expense: convert(pt.expense, profileBaseCurrency, uiBaseCurrency),
              net: convert(pt.net, profileBaseCurrency, uiBaseCurrency),
            }))} currency={uiBaseCurrency} />
            </div>
            <div className="lg:col-span-2">
              <CategoryBreakdown
                slices={slices}
                currency={uiBaseCurrency}
                type={breakdownType}
                onTypeChange={setBreakdownType}
              />
            </div>
          </div>

          <RecentTransactions
            transactions={recent}
            categories={categories}
            baseCurrency={uiBaseCurrency}
          />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
