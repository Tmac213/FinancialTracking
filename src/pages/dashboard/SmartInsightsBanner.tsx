import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  PieChart as PieChartIcon,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney, localeFromLanguage } from "@/lib/currencies";
import type { CategorySlice, SpendingVelocity, Totals, TransactionRow } from "@/lib/finance";

export type AIInsight = {
  id: string;
  type: "warning" | "danger" | "success" | "info";
  title: string;
  message: string;
};

type SmartInsightsBannerProps = {
  totals: Totals;
  previousTotals: Totals;
  slices: CategorySlice[];
  velocity: SpendingVelocity;
  budgets: Record<string, number>;
  currency: string;
};

export const SmartInsightsBanner = ({
  totals,
  previousTotals,
  slices,
  velocity,
  budgets,
  currency,
}: SmartInsightsBannerProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);

  const insights = useMemo<AIInsight[]>(() => {
    const list: AIInsight[] = [];
    const totalExpenses = totals.expense;

    if (totalExpenses === 0 && totals.income === 0) {
      return list;
    }

    // 1. Dominant Category Alert (e.g., > 50% or single category consuming bulk)
    if (totalExpenses > 0 && slices.length > 0) {
      const topSlice = slices[0];
      const pct = (topSlice.value / totalExpenses) * 100;
      if (pct >= 50) {
        list.push({
          id: "dominant_category",
          type: pct >= 80 ? "danger" : "warning",
          title: t("dashboard.insights.dominantTitle"),
          message: t("dashboard.insights.dominantMsg", {
            category: topSlice.name === "uncategorized" ? t("transactions.uncategorized") : topSlice.name,
            percent: pct.toFixed(1),
          }),
        });
      }
    }

    // 2. Budget Overruns Alert
    let overBudgetCategoriesCount = 0;
    const overBudgetNames: string[] = [];
    for (const slice of slices) {
      const budget = budgets[slice.id];
      if (budget && budget > 0 && slice.value > budget) {
        overBudgetCategoriesCount++;
        overBudgetNames.push(slice.name);
      }
    }

    if (overBudgetCategoriesCount > 0) {
      list.push({
        id: "budget_overruns",
        type: "danger",
        title: t("dashboard.insights.budgetExceededTitle"),
        message: t("dashboard.insights.budgetExceededMsg", {
          count: overBudgetCategoriesCount,
          categories: overBudgetNames.slice(0, 2).join(", ") + (overBudgetNames.length > 2 ? ` +${overBudgetNames.length - 2}` : ""),
        }),
      });
    }

    // 3. Spending Velocity & Month-End Projection Warning
    if (velocity.daysPassed < velocity.daysTotal && totals.income > 0) {
      if (velocity.projectedMonthEnd > totals.income) {
        list.push({
          id: "deficit_forecast",
          type: "warning",
          title: t("dashboard.insights.deficitTitle"),
          message: t("dashboard.insights.deficitMsg", {
            forecast: formatMoney(velocity.projectedMonthEnd, currency, locale),
            income: formatMoney(totals.income, currency, locale),
          }),
        });
      }
    }

    // 4. Expense spike vs previous period (> 25% surge)
    if (previousTotals.expense > 0 && totals.expense > previousTotals.expense) {
      const jump = ((totals.expense - previousTotals.expense) / previousTotals.expense) * 100;
      if (jump >= 25) {
        list.push({
          id: "expense_surge",
          type: "warning",
          title: t("dashboard.insights.surgeTitle"),
          message: t("dashboard.insights.surgeMsg", {
            jump: jump.toFixed(1),
          }),
        });
      }
    }

    // 5. Positive Health Alert: High Savings Rate
    if (totals.savingsRate >= 35 && totals.income > 0) {
      list.push({
        id: "healthy_savings",
        type: "success",
        title: t("dashboard.insights.healthyTitle"),
        message: t("dashboard.insights.healthyMsg", {
          rate: totals.savingsRate,
        }),
      });
    }

    // Default general advisory if empty
    if (list.length === 0 && totalExpenses > 0) {
      list.push({
        id: "on_track",
        type: "info",
        title: t("dashboard.insights.balancedTitle"),
        message: t("dashboard.insights.balancedMsg"),
      });
    }

    return list;
  }, [totals, previousTotals, slices, velocity, budgets, currency, locale, t]);

  if (insights.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-background to-accent/15 p-4 shadow-sm transition-all hover:border-primary/40">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="size-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              {t("dashboard.insights.badge")}
              <Badge variant="glow" className="text-[10px] uppercase font-bold tracking-wider">
                AI Health
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.insights.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => {
          let toneBg = "bg-primary/10 border-primary/20 text-primary";
          let Icon = Info;

          if (insight.type === "danger") {
            toneBg = "bg-expense/10 border-expense/25 text-expense";
            Icon = ShieldAlert;
          } else if (insight.type === "warning") {
            toneBg = "bg-warning/10 border-warning/25 text-warning";
            Icon = AlertTriangle;
          } else if (insight.type === "success") {
            toneBg = "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400";
            Icon = CheckCircle2;
          }

          return (
            <div
              key={insight.id}
              className={`flex flex-col gap-1 rounded-xl border p-3 backdrop-blur-sm transition-all ${toneBg}`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{insight.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {insight.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
