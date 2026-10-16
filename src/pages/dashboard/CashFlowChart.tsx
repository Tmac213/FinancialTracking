import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { formatMoney, localeFromLanguage } from "@/lib/currencies";
import type { MonthPoint } from "@/lib/finance";

type CashFlowChartProps = {
  data: MonthPoint[];
  currency: string;
};

export const CashFlowChart = ({ data, currency }: CashFlowChartProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);

  const config = {
    income: { label: t("dashboard.income"), color: "hsl(var(--income))" },
    expense: { label: t("dashboard.expenses"), color: "hsl(var(--expense))" },
  } satisfies ChartConfig;

  const compact = (value: number) =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <Card variant="elevated">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-base font-semibold">
          {t("dashboard.cashFlow.title")}
        </CardTitle>
        <CardDescription>{t("dashboard.cashFlow.description")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={config} className="h-[280px] w-full">
          <BarChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
