import { useTranslation } from "react-i18next";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyWithBase } from "@/components/money";
import { formatDate, type CategoryRow, type TransactionRow } from "@/lib/finance";
import { localeFromLanguage } from "@/lib/currencies";
import { cn } from "@/lib/utils";

type TransactionTableProps = {
  transactions: TransactionRow[];
  categories: CategoryRow[];
  baseCurrency: string;
  onEdit: (row: TransactionRow) => void;
  onDelete: (row: TransactionRow) => void;
};

export const TransactionTable = ({
  transactions,
  categories,
  baseCurrency,
  onEdit,
  onDelete,
}: TransactionTableProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const categoryById = new Map(categories.map((item) => [item.id, item]));

  const rowActions = (row: TransactionRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("common.actions")}>
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(row)}>
          <Pencil className="size-4" aria-hidden="true" />
          {t("common.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onDelete(row)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t("common.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Desktop ledger */}
      <div className="hidden overflow-hidden rounded-lg border border-border/70 bg-card shadow-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px]">
                {t("transactions.table.date")}
              </TableHead>
              <TableHead>{t("transactions.table.details")}</TableHead>
              <TableHead className="w-[160px]">
                {t("transactions.table.category")}
              </TableHead>
              <TableHead className="w-[170px] text-right">
                {t("transactions.table.amount")}
              </TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((row) => {
              const category = row.category_id
                ? categoryById.get(row.category_id)
                : undefined;
              const isIncome = row.type === "income";

              return (
                <TableRow key={row.id} className="group">
                  <TableCell className="numeric text-sm text-muted-foreground">
                    {formatDate(row.occurred_on, locale)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          isIncome ? "bg-income" : "bg-expense",
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">
                        {row.description || t("transactions.noDescription")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category ? (
                      <span className="inline-flex items-center gap-2 text-sm">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                          aria-hidden="true"
                        />
                        {category.name}
                      </span>
                    ) : (
                      <Badge variant="soft">
                        {t("transactions.uncategorized")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyWithBase
                      amount={Number(row.amount)}
                      currency={row.currency}
                      baseAmount={Number(row.amount_base)}
                      baseCurrency={baseCurrency}
                      tone={isIncome ? "income" : "expense"}
                    />
                  </TableCell>
                  <TableCell className="text-right">{rowActions(row)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile ledger */}
      <ul className="flex flex-col gap-2 md:hidden">
        {transactions.map((row) => {
          const category = row.category_id
            ? categoryById.get(row.category_id)
            : undefined;
          const isIncome = row.type === "income";

          return (
            <li
              key={row.id}
              className="flex items-start gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-card"
            >
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  isIncome ? "bg-income" : "bg-expense",
                )}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium">
                  {row.description || t("transactions.noDescription")}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="numeric">{formatDate(row.occurred_on, locale)}</span>
                  {category ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      {category.name}
                    </span>
                  ) : (
                    <span>{t("transactions.uncategorized")}</span>
                  )}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <MoneyWithBase
                  amount={Number(row.amount)}
                  currency={row.currency}
                  baseAmount={Number(row.amount_base)}
                  baseCurrency={baseCurrency}
                  tone={isIncome ? "income" : "expense"}
                />
                {rowActions(row)}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
