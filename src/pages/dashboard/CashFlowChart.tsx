import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, localeFromLanguage } from "@/lib/currencies";
import { percentChange, type MonthPoint } from "@/lib/finance";
import { BarChart3, LineChart as LineChartIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";

type CashFlowChartProps = {
  data: MonthPoint[];
  currency: string;
};

export const CashFlowChart = ({ data, currency }: CashFlowChartProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const config = {
    income: { label: t("dashboard.income"), color: "hsl(var(--income))" },
    expense: { label: t("dashboard.expenses"), color: "hsl(var(--expense))" },
  } satisfies ChartConfig;

  const compact = (value: number) =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  // Month-over-month trend indicator between last two months
  const lastIndex = data.length - 1;
  const currentMonthPoint = data[lastIndex];
  const prevMonthPoint = data[lastIndex - 1];

  const expenseDelta =
    currentMonthPoint && prevMonthPoint
      ? percentChange(currentMonthPoint.expense, prevMonthPoint.expense)
      : null;

  const incomeDelta =
    currentMonthPoint && prevMonthPoint
      ? percentChange(currentMonthPoint.income, prevMonthPoint.income)
      : null;

  return (
    <Card variant="elevated">
      <CardHeader className="gap-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                {t("dashboard.cashFlow.title")}
              </CardTitle>
              {chartType === "line" && (
                <Badge variant="soft" className="text-[11px] font-medium">
                  {t("dashboard.chart.lineMode")}
                </Badge>
              )}
            </div>
            <CardDescription>{t("dashboard.cashFlow.description")}</CardDescription>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/50 p-1">
            <Button
              variant={chartType === "line" ? "hero" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="size-3.5" aria-hidden="true" />
              <span>{t("dashboard.chart.lines")}</span>
            </Button>
            <Button
              variant={chartType === "bar" ? "hero" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
              onClick={() => setChartType("bar")}
            >
              <BarChart3 className="size-3.5" aria-hidden="true" />
              <span>{t("dashboard.chart.bars")}</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Month Comparison Badges */}
        {currentMonthPoint && prevMonthPoint && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">
              {t("dashboard.chart.trendLabel", {
                current: currentMonthPoint.label,
                prev: prevMonthPoint.label,
              })}:
            </span>

            {/* Expense trend badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold numeric ${
                expenseDelta === null || expenseDelta === 0
                  ? "bg-muted text-muted-foreground"
                  : expenseDelta > 0
                  ? "bg-expense/15 text-expense border border-expense/20"
                  : "bg-income/15 text-income border border-income/20"
              }`}
            >
              {expenseDelta === null || expenseDelta === 0 ? (
                <Minus className="size-3" />
              ) : expenseDelta > 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {t("dashboard.expenses")}:{" "}
              {expenseDelta !== null
                ? `${expenseDelta > 0 ? "+" : ""}${expenseDelta.toFixed(1)}% (${
                    expenseDelta > 0
                      ? t("dashboard.chart.increasing")
                      : t("dashboard.chart.decreasing")
                  })`
                : "--"}
            </span>

            {/* Income trend badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold numeric ${
                incomeDelta === null || incomeDelta === 0
                  ? "bg-muted text-muted-foreground"
                  : incomeDelta > 0
                  ? "bg-income/15 text-income border border-income/20"
                  : "bg-expense/15 text-expense border border-expense/20"
              }`}
            >
              {incomeDelta === null || incomeDelta === 0 ? (
                <Minus className="size-3" />
              ) : incomeDelta > 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {t("dashboard.income")}:{" "}
              {incomeDelta !== null
                ? `${incomeDelta > 0 ? "+" : ""}${incomeDelta.toFixed(1)}%`
                : "--"}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={config} className="h-[290px] w-full">
          {chartType === "line" ? (
            <LineChart data={data} margin={{ left: 4, right: 12, top: 12, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.5} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={compact}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--muted-foreground) / 0.4)", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {config[name as keyof typeof config]?.label ?? name}
                        </span>
                        <span className="numeric font-semibold">
                          {formatMoney(Number(value), currency, locale)}
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--color-income)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                activeDot={{ r: 6, fill: "var(--color-income)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--color-expense)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                activeDot={{ r: 6, fill: "var(--color-expense)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.5} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={compact}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {config[name as keyof typeof config]?.label ?? name}
                        </span>
                        <span className="numeric font-semibold">
                          {formatMoney(Number(value), currency, locale)}
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
