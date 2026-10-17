import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flame, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { formatDate, type CategoryRow, type CategorySlice, type TransactionRow } from "@/lib/finance";
import { localeFromLanguage } from "@/lib/currencies";

type TopExpensesAndBreakdownProps = {
  transactions: TransactionRow[];
  categories: CategoryRow[];
  slices: CategorySlice[];
  currency: string;
};

export const TopExpensesAndBreakdown = ({
  transactions,
  categories,
  slices,
  currency,
}: TopExpensesAndBreakdownProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  // Get Top 5 largest expense transactions in current range
  const topExpenses = [...transactions]
    .filter((row) => row.type === "expense")
    .sort((a, b) => (Number(b.amount_base) || 0) - (Number(a.amount_base) || 0))
    .slice(0, 5);

  const totalExpenseSum = slices.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Widget 1: Top 5 Largest Transactions */}
      <Card variant="elevated">
        <CardHeader className="gap-1 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="size-4 text-expense" />
            {t("dashboard.topExpenses.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.topExpenses.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
          {topExpenses.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {t("dashboard.topExpenses.empty")}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {topExpenses.map((tx, idx) => {
                const category = tx.category_id ? categoryById.get(tx.category_id) : null;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-expense/10 text-xs font-bold text-expense">
                        #{idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-medium text-foreground">
                          {tx.description || t("transactions.noDescription")}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(tx.occurred_on, locale)}</span>
                          {category && (
                            <Badge
                              variant="soft"
                              className="gap-1 px-1.5 py-0 text-[10px]"
                            >
                              <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Money
                        amount={Number(tx.amount_base) || 0}
                        currency={currency}
                        tone="expense"
                        className="font-semibold text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Widget 2: Detailed Category Breakdown & Ranking */}
      <Card variant="elevated">
        <CardHeader className="gap-1 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            {t("dashboard.rankedCategories.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.rankedCategories.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
          {slices.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {t("dashboard.rankedCategories.empty")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {slices.map((slice, index) => {
                const percentage =
                  totalExpenseSum > 0
                    ? ((slice.value / totalExpenseSum) * 100).toFixed(1)
                    : "0.0";

                return (
                  <div
                    key={slice.id}
                    className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-muted-foreground w-4">
                          #{index + 1}
                        </span>
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="truncate font-medium text-foreground text-sm">
                          {slice.name === "uncategorized"
                            ? t("transactions.uncategorized")
                            : slice.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="numeric font-semibold text-xs text-muted-foreground">
                          {percentage}%
                        </span>
                        <Money
                          amount={slice.value}
                          currency={currency}
                          className="font-semibold text-sm"
                        />
                      </div>
                    </div>

                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Number(percentage))}%`,
                          backgroundColor: slice.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
