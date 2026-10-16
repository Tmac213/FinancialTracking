import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoneyWithBase } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { localeFromLanguage } from "@/lib/currencies";
import { formatDate, type CategoryRow, type TransactionRow } from "@/lib/finance";

type RecentTransactionsProps = {
  transactions: TransactionRow[];
  categories: CategoryRow[];
  baseCurrency: string;
};

export const RecentTransactions = ({
  transactions,
  categories,
  baseCurrency,
}: RecentTransactionsProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const categoryById = new Map(categories.map((item) => [item.id, item]));

  return (
    <Card variant="elevated" className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">
            {t("dashboard.recent.title")}
          </CardTitle>
          <CardDescription>{t("dashboard.recent.description")}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/transactions">
            {t("dashboard.recent.viewAll")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="pt-2">
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t("dashboard.recent.empty")}
            className="border-none bg-transparent py-8"
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border/70">
            {transactions.map((row) => {
              const category = row.category_id
                ? categoryById.get(row.category_id)
                : undefined;
              const isIncome = row.type === "income";

              return (
                <li
                  key={row.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      isIncome ? "bg-income" : "bg-expense",
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-sm font-medium">
                      {row.description || t("transactions.noDescription")}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="numeric">
                        {formatDate(row.occurred_on, locale)}
                      </span>
                      {category ? (
                        <Badge
                          variant="soft"
                          className="gap-1.5 px-2 py-0 text-[11px] font-medium"
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                            aria-hidden="true"
                          />
                          {category.name}
                        </Badge>
                      ) : (
                        <span>{t("transactions.uncategorized")}</span>
                      )}
                    </span>
                  </div>
                  <MoneyWithBase
                    amount={Number(row.amount)}
                    currency={row.currency}
                    baseAmount={Number(row.amount_base)}
                    baseCurrency={baseCurrency}
                    tone={isIncome ? "income" : "expense"}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
