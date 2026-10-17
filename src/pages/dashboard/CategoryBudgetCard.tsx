import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Money } from "@/components/money";
import type { CategoryRow, CategorySlice } from "@/lib/finance";

type CategoryBudgetCardProps = {
  slices: CategorySlice[];
  categories: CategoryRow[];
  budgets: Record<string, number>;
  onSetBudget: (categoryId: string, amount: number) => void;
  currency: string;
};

export const CategoryBudgetCard = ({
  slices,
  categories,
  budgets,
  onSetBudget,
  currency,
}: CategoryBudgetCardProps) => {
  const { t } = useTranslation();
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [budgetInput, setBudgetInput] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Map of spent amount by category id for current period
  const spentMap = new Map<string, number>();
  for (const s of slices) {
    spentMap.set(s.id, s.value);
  }

  const handleOpenEdit = (category: CategoryRow) => {
    setEditingCategory(category);
    setBudgetInput(budgets[category.id] ? String(budgets[category.id]) : "");
  };

  const handleSaveBudget = () => {
    if (!editingCategory) return;
    const num = parseFloat(budgetInput);
    if (!isNaN(num) && num > 0) {
      onSetBudget(editingCategory.id, num);
    } else {
      onSetBudget(editingCategory.id, 0);
    }
    setEditingCategory(null);
  };

  // Build list of all categories that either have a budget or have spending
  const items = expenseCategories.map((cat) => {
    const spent = spentMap.get(cat.id) ?? 0;
    const budget = budgets[cat.id] ?? 0;
    const percent = budget > 0 ? (spent / budget) * 100 : 0;
    const isExceeded = budget > 0 && spent > budget;
    const isNearLimit = budget > 0 && !isExceeded && percent >= 80;

    return {
      category: cat,
      spent,
      budget,
      percent,
      isExceeded,
      isNearLimit,
    };
  });

  // Sort so budgeted or high-spending categories appear first
  items.sort((a, b) => {
    if (a.budget > 0 && b.budget === 0) return -1;
    if (b.budget > 0 && a.budget === 0) return 1;
    return b.spent - a.spent;
  });

  return (
    <>
      <Card variant="elevated">
        <CardHeader className="gap-2 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                {t("dashboard.budgeting.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.budgeting.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          {items.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {t("dashboard.budgeting.empty")}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(({ category, spent, budget, percent, isExceeded, isNearLimit }) => {
                const displayPercent = Math.min(100, Math.round(percent));

                // Color progression: Safe (Emerald) -> Warning (Orange/Amber >=80%) -> Overbudget (Red >=100%)
                let progressColor = "bg-primary";
                let statusBadge = null;

                if (budget > 0) {
                  if (isExceeded) {
                    progressColor = "bg-expense";
                    statusBadge = (
                      <Badge variant="destructive" className="h-5 gap-1 px-1.5 text-[10px] font-semibold">
                        <ShieldAlert className="size-3" />
                        {t("dashboard.budgeting.overBudget", {
                          pct: Math.round(percent),
                        })}
                      </Badge>
                    );
                  } else if (isNearLimit) {
                    progressColor = "bg-warning";
                    statusBadge = (
                      <Badge variant="warning" className="h-5 gap-1 px-1.5 text-[10px] font-semibold">
                        <AlertTriangle className="size-3" />
                        {t("dashboard.budgeting.nearLimit", {
                          pct: Math.round(percent),
                        })}
                      </Badge>
                    );
                  } else {
                    statusBadge = (
                      <Badge variant="soft" className="h-5 gap-1 px-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        {t("dashboard.budgeting.onTrack")}
                      </Badge>
                    );
                  }
                }

                return (
                  <div
                    key={category.id}
                    className="group rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:bg-muted/40 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-semibold text-foreground">
                          {category.name}
                        </span>
                        {statusBadge}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(category)}
                        >
                          {budget > 0
                            ? t("dashboard.budgeting.editLimit")
                            : t("dashboard.budgeting.setLimit")}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="space-y-1.5 pt-1">
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${budget > 0 ? displayPercent : Math.min(100, (spent > 0 ? 100 : 0))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-foreground">
                            <Money amount={spent} currency={currency} />
                          </span>
                          <span>{t("dashboard.budgeting.spentOf")}</span>
                          {budget > 0 ? (
                            <span className="font-semibold text-foreground">
                              <Money amount={budget} currency={currency} />
                            </span>
                          ) : (
                            <span className="italic">{t("dashboard.budgeting.noBudgetSet")}</span>
                          )}
                        </span>

                        {budget > 0 && (
                          <span
                            className={`numeric font-semibold ${
                              isExceeded
                                ? "text-expense"
                                : isNearLimit
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {Math.round(percent)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Category Budget Modal */}
      <Dialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: editingCategory?.color }}
              />
              {t("dashboard.budgeting.modalTitle", {
                category: editingCategory?.name,
              })}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.budgeting.modalDescription", { currency })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs font-semibold text-muted-foreground">
              {t("dashboard.budgeting.limitAmount")} ({currency})
            </label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 250"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="mt-1.5"
              autoFocus
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("dashboard.budgeting.modalHint")}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingCategory(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" variant="hero" onClick={handleSaveBudget}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
