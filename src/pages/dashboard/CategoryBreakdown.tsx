import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Money } from "@/components/money";
import { PieChart as PieChartIcon } from "lucide-react";
import type { CategorySlice, TransactionType } from "@/lib/finance";

type CategoryBreakdownProps = {
  slices: CategorySlice[];
  currency: string;
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
};

export const CategoryBreakdown = ({
  slices,
  currency,
  type,
  onTypeChange,
}: CategoryBreakdownProps) => {
  const { t } = useTranslation();

  const config = slices.reduce<ChartConfig>((accumulator, slice) => {
    accumulator[slice.id] = {
      label: slice.name === "uncategorized" ? t("transactions.uncategorized") : slice.name,
      color: slice.color,
    };
    return accumulator;
  }, {});

  const data = slices.map((slice) => ({
    key: slice.id,
    value: slice.value,
    fill: `var(--color-${slice.id.replace(/[^a-zA-Z0-9-]/g, "-")})`,
  }));

  return (
    <Card variant="elevated">
      <CardHeader className="gap-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            {t("dashboard.breakdown.title")}
          </CardTitle>
          <Tabs
            value={type}
            onValueChange={(value) => onTypeChange(value as TransactionType)}
          >
            <TabsList>
              <TabsTrigger value="expense">
                {t("transactions.type.expense")}
              </TabsTrigger>
              <TabsTrigger value="income">{t("transactions.type.income")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {slices.length === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title={t("dashboard.breakdown.empty")}
            className="border-none bg-transparent py-8"
          />
        ) : (
          <div className="flex flex-col gap-5">
            <ChartContainer
              config={config}
              className="mx-auto h-[210px] w-full max-w-[260px]"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="key" hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="flex max-h-[210px] flex-col gap-3 overflow-y-auto pr-1">
              {slices.map((slice) => {
                const key = slice.id.replace(/[^a-zA-Z0-9-]/g, "-");
                return (
                  <li key={slice.id} className="flex items-center gap-3 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--color-${key})` }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {slice.name === "uncategorized"
                        ? t("transactions.uncategorized")
                        : slice.name}
                    </span>
                    <span className="numeric shrink-0 text-xs text-muted-foreground">
                      {slice.percentage.toFixed(1)}%
                    </span>
                    <Money
                      amount={slice.value}
                      currency={currency}
                      className="shrink-0 font-semibold"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
