import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileSpreadsheet, FileText, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportTransactionsToCSV, printFinancialSummaryPDF } from "@/lib/reports";
import { localeFromLanguage } from "@/lib/currencies";
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
import { useCategoryBudgets } from "@/hooks/use-category-budgets";
import {
  calculateSpendingVelocity,
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
import { SummaryCards } from "./SummaryCards";
import { CashFlowChart } from "./CashFlowChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { RecentTransactions } from "./RecentTransactions";
import { CategoryBudgetCard } from "./CategoryBudgetCard";
import { TopExpensesAndBreakdown } from "./TopExpensesAndBreakdown";
import { SmartInsightsBanner } from "./SmartInsightsBanner";

const RECENT_COUNT = 8;
const CHART_MONTHS = 6;

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { baseCurrency: profileBaseCurrency } = useProfile();
  const { categories } = useCategories();
  const { transactions, isLoading, isError } = useTransactions();
  const { budgets, setCategoryBudget } = useCategoryBudgets();
  const { baseCurrency: uiBaseCurrency, convert } = useExchangeRate();

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

  const expenseSlices = useMemo(
    () => categoryBreakdown(currentRows, categories, "expense"),
    [currentRows, categories],
  );

  const slices = useMemo(
    () => (breakdownType === "expense" ? expenseSlices : categoryBreakdown(currentRows, categories, breakdownType)),
    [currentRows, categories, breakdownType, expenseSlices],
  );

  // Converted totals for UI base currency
  const convertedCurrentTotals = useMemo(
    () => ({
      ...totals,
      income: convert(totals.income, profileBaseCurrency, uiBaseCurrency),
      expense: convert(totals.expense, profileBaseCurrency, uiBaseCurrency),
      net: convert(totals.net, profileBaseCurrency, uiBaseCurrency),
    }),
    [totals, convert, profileBaseCurrency, uiBaseCurrency],
  );

  const convertedPreviousTotals = useMemo(
    () => ({
      ...previousTotals,
      income: convert(previousTotals.income, profileBaseCurrency, uiBaseCurrency),
      expense: convert(previousTotals.expense, profileBaseCurrency, uiBaseCurrency),
      net: convert(previousTotals.net, profileBaseCurrency, uiBaseCurrency),
    }),
    [previousTotals, convert, profileBaseCurrency, uiBaseCurrency],
  );

  // Calculate daily average and month-end projection
  const velocity = useMemo(() => {
    const rawVelocity = calculateSpendingVelocity(currentRows, period);
    return {
      ...rawVelocity,
      dailyAverage: convert(rawVelocity.dailyAverage, profileBaseCurrency, uiBaseCurrency),
      projectedMonthEnd: convert(rawVelocity.projectedMonthEnd, profileBaseCurrency, uiBaseCurrency),
    };
  }, [currentRows, period, convert, profileBaseCurrency, uiBaseCurrency]);

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
        icon={Receipt}
        title={t("dashboard.error.title")}
        description={t("dashboard.error.description")}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header with Title and Period Filter */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 text-xs">
                <Download className="size-3.5" />
                {t("reports.exportReport")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => exportTransactionsToCSV(currentRows, categories, uiBaseCurrency)}
                className="gap-2 cursor-pointer text-xs"
              >
                <FileSpreadsheet className="size-4 text-emerald-600" />
                <span>{t("reports.exportCSV")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
                  printFinancialSummaryPDF(
                    convertedCurrentTotals,
                    currentRows,
                    categories,
                    uiBaseCurrency,
                    t(`period.${period}`),
                    locale,
                  );
                }}
                className="gap-2 cursor-pointer text-xs"
              >
                <FileText className="size-4 text-primary" />
                <span>{t("reports.exportPDF")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.period")}
            </span>
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodKey)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("dashboard.selectPeriod")} />
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
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t("dashboard.empty.title")}
          description={t("dashboard.empty.description")}
        />
      ) : (
        <>
          {/* Feature 5: AI Smart Insights & Financial Health Alerts */}
          <SmartInsightsBanner
            totals={convertedCurrentTotals}
            previousTotals={convertedPreviousTotals}
            slices={expenseSlices}
            velocity={velocity}
            budgets={budgets}
            currency={uiBaseCurrency}
          />

          {/* Feature 3: Summary Cards with Daily Average & Month-End Forecast */}
          <SummaryCards
            current={convertedCurrentTotals}
            previous={convertedPreviousTotals}
            velocity={velocity}
            currency={uiBaseCurrency}
          />

          {/* Feature 1: Monthly Comparison & Cash Flow Chart with Line Chart & Monthly Trends */}
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <CashFlowChart
                data={series.map((pt) => ({
                  ...pt,
                  income: convert(pt.income, profileBaseCurrency, uiBaseCurrency),
                  expense: convert(pt.expense, profileBaseCurrency, uiBaseCurrency),
                  net: convert(pt.net, profileBaseCurrency, uiBaseCurrency),
                }))}
                currency={uiBaseCurrency}
              />
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

          {/* Feature 2: Category Budgeting & Spending Limits (Progress Bars) */}
          <CategoryBudgetCard
            slices={expenseSlices}
            categories={categories}
            budgets={budgets}
            onSetBudget={setCategoryBudget}
            currency={uiBaseCurrency}
          />

          {/* Feature 4: Top 5 Largest Transactions & Detailed Ranked Breakdown */}
          <TopExpensesAndBreakdown
            transactions={currentRows}
            categories={categories}
            slices={expenseSlices}
            currency={uiBaseCurrency}
          />

          {/* Recent Ledger Transactions */}
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
