import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import { Tags } from "lucide-react";
import type { CategoryRow, TransactionType } from "@/lib/finance";

export type CategoryUsage = {
  count: number;
  total: number;
};

type CategoryListProps = {
  categories: CategoryRow[];
  usage: Map<string, CategoryUsage>;
  currency: string;
  type: TransactionType;
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
  onCreate: () => void;
};

export const CategoryList = ({
  categories,
  usage,
  currency,
  type,
  onEdit,
  onDelete,
  onCreate,
}: CategoryListProps) => {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title={t("categories.empty.title", { type: t(`transactions.type.${type}`) })}
        description={t("categories.empty.description")}
        action={
          <Button variant="hero" size="sm" onClick={onCreate}>
            {t("categories.add")}
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70 bg-card shadow-card">
      {categories.map((category) => {
        const stats = usage.get(category.id) ?? { count: 0, total: 0 };
        return (
          <li
            key={category.id}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40"
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium">{category.name}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {t("categories.used", { count: stats.count })}
                </span>
                {stats.count > 0 && (
                  <Badge variant="soft" className="px-2 py-0 font-medium">
                    <Money
                      amount={stats.total}
                      currency={currency}
                      tone={type === "income" ? "income" : "expense"}
                      className="text-[11px]"
                    />
                  </Badge>
                )}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.edit")}
                onClick={() => onEdit(category)}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.delete")}
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(category)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
