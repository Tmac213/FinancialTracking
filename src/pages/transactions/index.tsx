import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Receipt, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCategories } from "@/hooks/use-categories";
import { useProfile } from "@/hooks/use-profile";
import { useRates } from "@/hooks/use-rates";
import {
  useDeleteTransaction,
  useTransactions,
} from "@/hooks/use-transactions";
import { summarize, type TransactionRow } from "@/lib/finance";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionFormDialog } from "./TransactionsFormDialog";
import { TransactionTable } from "./TransactionTable";
import { useTransactionFilters } from "./useTransactionFilters";

const TransactionsPage = () => {
  const { t } = useTranslation();
  const { baseCurrency } = useProfile();
  const { categories } = useCategories();
  const { transactions, isLoading, isError } = useTransactions();
  const { snapshot, unavailable } = useRates(baseCurrency);
  const deleteTransaction = useDeleteTransaction();

  const { filters, update, reset, isFiltered, sort, setSort, filtered } =
    useTransactionFilters(transactions, categories);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TransactionRow | null>(null);

  const totals = useMemo(() => summarize(filtered), [filtered]);
  const hasAnyTransaction = transactions.length > 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: TransactionRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTransaction.mutateAsync(pendingDelete.id);
      toast.success(t("transactions.deleted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("transactions.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("transactions.subtitle", { base: baseCurrency })}
          </p>
        </div>
        <Button variant="hero" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          {t("transactions.add")}
        </Button>
      </div>

      <TransactionFilters
        filters={filters}
        update={update}
        reset={reset}
        isFiltered={isFiltered}
        sort={sort}
        setSort={setSort}
        categories={categories}
        resultCount={filtered.length}
      />

      <Card variant="elevated">
        <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-5">
          {[
            { key: "income", label: t("dashboard.income"), value: totals.income, tone: "income" as const },
            { key: "expense", label: t("dashboard.expenses"), value: totals.expense, tone: "expense" as const },
            { key: "net", label: t("dashboard.net"), value: totals.net, tone: totals.net >= 0 ? ("income" as const) : ("expense" as const) },
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
              <Money
                amount={item.value}
                currency={baseCurrency}
                tone={item.tone}
                className="text-xl font-semibold"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<Receipt />}
          title={t("transactions.error.title")}
          description={t("transactions.error.description")}
        />
      ) : filtered.length === 0 ? (
        hasAnyTransaction ? (
          <EmptyState
            icon={<SearchX />}
            title={t("transactions.emptyFiltered.title")}
            description={t("transactions.emptyFiltered.description")}
            action={
              <Button variant="soft" size="sm" onClick={reset}>
                {t("transactions.filters.reset")}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Receipt />}
            title={t("transactions.empty.title")}
            description={t("transactions.empty.description")}
            action={
              <Button variant="hero" size="sm" onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                {t("transactions.add")}
              </Button>
            }
          />
        )
      ) : (
        <TransactionTable
          transactions={filtered}
          categories={categories}
          baseCurrency={baseCurrency}
          onEdit={openEdit}
          onDelete={setPendingDelete}
        />
      )}

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editing}
        categories={categories}
        baseCurrency={baseCurrency}
        snapshot={snapshot}
        ratesUnavailable={unavailable}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("transactions.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("transactions.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionsPage;
