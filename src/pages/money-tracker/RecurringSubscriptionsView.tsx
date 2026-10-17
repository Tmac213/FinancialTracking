import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  Plus,
  Play,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRecurring, type BillingCycle, type RecurringRule } from "@/hooks/use-recurring";
import { useCategories } from "@/hooks/use-categories";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, localeFromLanguage } from "@/lib/currencies";
import { formatDate, type TransactionType } from "@/lib/finance";

export const RecurringSubscriptionsView = () => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const { baseCurrency } = useProfile();
  const { categories } = useCategories();
  const { rules, addRule, updateRule, deleteRule, triggerRuleManually } = useRecurring();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<string>("none");
  const [description, setDescription] = useState("");

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const openCreateDialog = () => {
    setEditingRule(null);
    setName("");
    setType("expense");
    setAmount("");
    setCycle("monthly");
    setStartDate(new Date().toISOString().slice(0, 10));
    setCategoryId("none");
    setDescription("");
    setDialogOpen(true);
  };

  const openEditDialog = (rule: RecurringRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setType(rule.type);
    setAmount(String(rule.amount));
    setCycle(rule.cycle);
    setStartDate(rule.startDate);
    setCategoryId(rule.category_id || "none");
    setDescription(rule.description || "");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    if (editingRule) {
      updateRule(editingRule.id, {
        name: name.trim(),
        type,
        amount: num,
        cycle,
        category_id: categoryId === "none" ? null : categoryId,
        description: description.trim() || undefined,
      });
    } else {
      addRule({
        name: name.trim(),
        type,
        amount: num,
        currency: baseCurrency,
        cycle,
        startDate,
        nextDueDate: startDate,
        active: true,
        category_id: categoryId === "none" ? null : categoryId,
        description: description.trim() || undefined,
      });
    }
    setDialogOpen(false);
  };

  // Monthly commitment estimate
  const monthlyCommitment = rules
    .filter((r) => r.active && r.type === "expense")
    .reduce((acc, r) => {
      let multiplier = 1;
      if (r.cycle === "weekly") multiplier = 4.33;
      if (r.cycle === "yearly") multiplier = 1 / 12;
      return acc + r.amount * multiplier;
    }, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-accent/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CalendarClock className="size-4 text-primary" />
              {t("recurring.overviewTitle")}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-extrabold text-foreground font-mono">
                {formatMoney(monthlyCommitment, baseCurrency, locale)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / {t("recurring.perMonth")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("recurring.overviewSubtitle", { count: rules.filter((r) => r.active).length })}
            </p>
          </div>

          <Button onClick={openCreateDialog} variant="hero" className="gap-2">
            <Plus className="size-4" />
            {t("recurring.createRule")}
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div className="grid gap-3">
        {rules.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("recurring.empty")}
          </p>
        ) : (
          rules.map((rule) => {
            const cat = rule.category_id ? catMap.get(rule.category_id) : null;
            return (
              <div
                key={rule.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:bg-muted/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                      rule.type === "income"
                        ? "bg-income/10 text-income"
                        : "bg-expense/10 text-expense"
                    }`}
                  >
                    {rule.type === "income" ? (
                      <ArrowDownLeft className="size-5" />
                    ) : (
                      <ArrowUpRight className="size-5" />
                    )}
                  </span>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground text-sm">
                        {rule.name}
                      </span>
                      <Badge variant="soft" className="px-2 py-0 text-[10px] capitalize">
                        {t(`recurring.cycle.${rule.cycle}`)}
                      </Badge>
                      {!rule.active && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-muted-foreground">
                          {t("recurring.paused")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {t("recurring.nextDue")}: {formatDate(rule.nextDueDate, locale)}
                      </span>
                      {cat && (
                        <Badge
                          variant="soft"
                          className="gap-1 px-1.5 py-0 text-[10px]"
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span
                    className={`font-mono font-bold text-base ${
                      rule.type === "income" ? "text-income" : "text-foreground"
                    }`}
                  >
                    {rule.type === "income" ? "+" : "-"}
                    {formatMoney(rule.amount, rule.currency, locale)}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title={t("recurring.triggerNow")}
                      className="h-8 gap-1 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={async () => {
                        await triggerRuleManually(rule.id);
                        toast.success(`${rule.name} logged & due date updated!`);
                      }}
                    >
                      <Play className="size-3.5 fill-current" />
                      <span className="hidden md:inline">{t("recurring.logNow")}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(rule)}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive/70 hover:text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? t("recurring.editTitle") : t("recurring.createTitle")}
            </DialogTitle>
            <DialogDescription>{t("recurring.modalSubtitle")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("recurring.name")}
              </label>
              <Input
                placeholder="e.g. Netflix, Gym, Office Rent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("transactions.filters.type")}
                </label>
                <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">{t("transactions.type.expense")}</SelectItem>
                    <SelectItem value="income">{t("transactions.type.income")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("transactions.form.amount")} ({baseCurrency})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="20"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("recurring.cycleLabel")}
                </label>
                <Select value={cycle} onValueChange={(v) => setCycle(v as BillingCycle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t("recurring.cycle.weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("recurring.cycle.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("recurring.cycle.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("recurring.startDate")}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("transactions.table.category")}
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("transactions.form.noCategory")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="hero" onClick={handleSave}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
