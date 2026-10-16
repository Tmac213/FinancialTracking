import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { useProfile } from "@/hooks/use-profile";
import { useTransactions } from "@/hooks/use-transactions";
import type { CategoryRow, TransactionType } from "@/lib/finance";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryList, type CategoryUsage } from "./CategoryList";

const CategoriesPage = () => {
  const { t } = useTranslation();
  const { baseCurrency } = useProfile();
  const { incomeCategories, expenseCategories, isLoading } = useCategories();
  const { transactions } = useTransactions();
  const deleteCategory = useDeleteCategory();

  const [type, setType] = useState<TransactionType>("expense");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryRow | null>(null);

  const usage = useMemo(() => {
    const map = new Map<string, CategoryUsage>();
    for (const row of transactions) {
      if (!row.category_id) continue;
      const current = map.get(row.category_id) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += Number(row.amount_base) || 0;
      map.set(row.category_id, current);
    }
    return map;
  }, [transactions]);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: CategoryRow) => {
    setEditing(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory.mutateAsync(pendingDelete.id);
      toast.success(t("categories.deleted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("categories.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("categories.subtitle")}</p>
        </div>
        <Button variant="hero" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          {t("categories.add")}
        </Button>
      </div>

      <Tabs value={type} onValueChange={(value) => setType(value as TransactionType)}>
        <TabsList>
          <TabsTrigger value="expense">{t("transactions.type.expense")}</TabsTrigger>
          <TabsTrigger value="income">{t("transactions.type.income")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <CategoryList
          categories={categories}
          usage={usage}
          currency={baseCurrency}
          type={type}
          onEdit={openEdit}
          onDelete={setPendingDelete}
          onCreate={openCreate}
        />
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        defaultType={type}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("categories.delete.title", { name: pendingDelete?.name ?? "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.delete.description")}
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

export default CategoriesPage;
