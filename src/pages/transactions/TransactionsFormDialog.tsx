import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, TriangleAlert } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/currency-select";
import { Money } from "@/components/money";
import { cn } from "@/lib/utils";
import { findRate, type RateSnapshot } from "@/lib/fx";
import {
  todayISO,
  type CategoryRow,
  type TransactionRow,
  type TransactionType,
} from "@/lib/finance";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";

export type TransactionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionRow | null;
  categories: CategoryRow[];
  baseCurrency: string;
  snapshot?: RateSnapshot;
  ratesUnavailable: boolean;
  defaultType?: TransactionType;
};

const parseAmount = (value: string): number => {
  const normalised = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalised);
  return Number.isFinite(parsed) ? parsed : NaN;
};

type TransactionFormProps = Omit<TransactionFormDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
};

/**
 * Radix unmounts the dialog content when it closes, and this form lives inside
 * it — so every open starts from clean state without any manual reset logic.
 */
const TransactionForm = ({
  transaction = null,
  categories,
  baseCurrency,
  snapshot,
  ratesUnavailable,
  defaultType = "expense" as TransactionType,
  onClose,
}: TransactionFormProps) => {
  const { t } = useTranslation();

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = Boolean(transaction);
  const saving = createTransaction.isPending || updateTransaction.isPending;

  const [type, setType] = useState<TransactionType>(() => {
    return (transaction?.type as TransactionType) ?? defaultType ?? ("expense" as TransactionType);
  });
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [currency, setCurrency] = useState(transaction?.currency ?? baseCurrency);
  const [rateInput, setRateInput] = useState(
    transaction
      ? String(transaction.exchange_rate)
      : String(findRate(snapshot, currency, baseCurrency) ?? 1),
  );
  const [rateEdited, setRateEdited] = useState(false);
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "none");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [occurredOn, setOccurredOn] = useState(
    transaction?.occurred_on ?? todayISO(),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const autoRate = useMemo(
    () => findRate(snapshot, currency, baseCurrency),
    [snapshot, currency, baseCurrency],
  );

  const rate = parseAmount(rateInput);
  const amountValue = parseAmount(amount);
  const rateKnown = Number.isFinite(rate) && rate > 0;
  const categoryOptions = categories.filter((item) => item.type === type);

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    setRateEdited(false);

    const next = findRate(snapshot, code, baseCurrency);
    if (next !== null) setRateInput(String(next));
    else if (code === baseCurrency) setRateInput("1");
    else setRateInput("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError(t("transactions.form.error.amount"));
      return;
    }
    if (!rateKnown) {
      setFormError(t("transactions.form.error.rate"));
      return;
    }
    if (!occurredOn) {
      setFormError(t("transactions.form.error.date"));
      return;
    }

    const payload = {
      type,
      amount: Math.round(amountValue * 100) / 100,
      currency,
      exchange_rate: rate,
      category_id: categoryId === "none" ? null : categoryId,
      description: description.trim(),
      occurred_on: occurredOn,
    };

    try {
      if (transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, ...payload });
      } else {
        await createTransaction.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error));
    }
  };

  const basePreview =
    Number.isFinite(amountValue) && rateKnown
      ? Math.round(amountValue * rate * 100) / 100
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
        {(["expense", "income"] as TransactionType[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setType(option);
              setCategoryId("none");
            }}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition-all",
              type === option
                ? option === "income"
                  ? "bg-income text-income-foreground shadow-sm"
                  : "bg-expense text-expense-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`transactions.type.${option}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-amount">
            {t("transactions.form.amount")}
          </Label>
          <Input
            id="transaction-amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="numeric text-lg font-semibold"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-currency">
            {t("transactions.form.currency")}
          </Label>
          <CurrencySelect
            id="transaction-currency"
            value={currency}
            onChange={handleCurrencyChange}
          />
        </div>
      </div>

      {currency !== baseCurrency && (
        <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="transaction-rate" className="text-xs">
              {t("transactions.form.rate", { from: currency, to: baseCurrency })}
            </Label>
            {autoRate === null && (
              <span className="text-[11px] text-warning">
                {t("transactions.form.rateMissing")}
              </span>
            )}
          </div>
          <Input
            id="transaction-rate"
            inputMode="decimal"
            value={rateInput}
            onChange={(event) => {
              setRateEdited(true);
              setRateInput(event.target.value);
            }}
            className="numeric"
            placeholder="0.00"
          />
          {basePreview !== null && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {t("transactions.form.converted")}
              <Money
                amount={basePreview}
                currency={baseCurrency}
                tone="muted"
                className="font-semibold"
              />
            </p>
          )}
          {!rateEdited && autoRate !== null && (
            <p className="text-[11px] text-muted-foreground">
              {t("transactions.form.rateAuto", { to: baseCurrency })}
            </p>
          )}
        </div>
      )}

      {ratesUnavailable && currency !== baseCurrency && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {t("transactions.form.ratesUnavailable")}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-category">
            {t("transactions.form.category")}
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="transaction-category">
              <SelectValue placeholder={t("transactions.form.noCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                {t("transactions.form.noCategory")}
              </SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: option.color }}
                      aria-hidden="true"
                    />
                    {option.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-date">{t("transactions.form.date")}</Label>
          <Input
            id="transaction-date"
            type="date"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
            className="numeric"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="transaction-description">
          {t("transactions.form.note")}
        </Label>
        <Textarea
          id="transaction-description"
          rows={2}
          maxLength={240}
          placeholder={t("transactions.form.notePlaceholder")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
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
          {isEditing ? t("common.save") : t("transactions.form.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const TransactionFormDialog = ({
  open,
  onOpenChange,
  transaction = null,
  categories,
  baseCurrency,
  snapshot,
  ratesUnavailable,
  defaultType = "expense",
}: TransactionFormDialogProps) => {
  const { t } = useTranslation();
  const isEditing = Boolean(transaction);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("transactions.form.editTitle")
              : t("transactions.form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("transactions.form.description", { base: baseCurrency })}
          </DialogDescription>
        </DialogHeader>

        <TransactionForm
          transaction={transaction}
          categories={categories}
          baseCurrency={baseCurrency}
          snapshot={snapshot}
          ratesUnavailable={ratesUnavailable}
          defaultType={defaultType}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
