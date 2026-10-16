import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/category-palette";
import type { CategoryRow, TransactionType } from "@/lib/finance";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";

export type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryRow | null;
  defaultType?: TransactionType;
};

type CategoryFormProps = Omit<CategoryFormDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
};

const CategoryForm = ({
  category = null,
  defaultType = "expense",
  onClose,
}: CategoryFormProps) => {
  const { t } = useTranslation();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = Boolean(category);
  const saving = createCategory.isPending || updateCategory.isPending;

  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType);
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError(t("categories.form.error.name"));
      return;
    }

    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, name, type, color });
      } else {
        await createCategory.mutateAsync({ name, type, color });
      }
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFormError(
        message.toLowerCase().includes("duplicate")
          ? t("categories.form.error.duplicate")
          : message,
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="category-name">{t("categories.form.name")}</Label>
        <Input
          id="category-name"
          value={name}
          maxLength={40}
          placeholder={t("categories.form.namePlaceholder")}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("categories.form.type")}</Label>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          {(["expense", "income"] as TransactionType[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition-all",
                type === option
                  ? option === "income"
                    ? "bg-gradient-income text-income-foreground shadow-sm"
                    : "bg-gradient-expense text-expense-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`transactions.type.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("categories.form.color")}</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={option}
              aria-pressed={color === option}
              onClick={() => setColor(option)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110",
                color === option && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: option }}
            >
              {color === option && (
                <Check className="size-4 text-primary-foreground" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

      <DialogFooter className="gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="hero" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isEditing ? t("common.save") : t("categories.form.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const CategoryFormDialog = ({
  open,
  onOpenChange,
  category = null,
  defaultType = "expense",
}: CategoryFormDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? t("categories.form.editTitle") : t("categories.form.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("categories.form.description")}</DialogDescription>
        </DialogHeader>

        <CategoryForm
          category={category}
          defaultType={defaultType}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
