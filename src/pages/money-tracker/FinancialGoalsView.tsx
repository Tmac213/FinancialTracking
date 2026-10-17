import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit2,
  DollarSign,
  ArrowUpRight,
  Shield,
  Plane,
  Laptop,
  Home,
  Car,
  Gift,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoals, type SavingsGoal } from "@/hooks/use-goals";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, localeFromLanguage } from "@/lib/currencies";
import { formatDate } from "@/lib/finance";

const GOAL_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

export const FinancialGoalsView = () => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const { baseCurrency } = useProfile();
  const { goals, addGoal, updateGoal, depositToGoal, deleteGoal } = useGoals();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState(GOAL_COLORS[0]);

  const openCreateDialog = () => {
    setEditingGoal(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
    setColor(GOAL_COLORS[0]);
    setDialogOpen(true);
  };

  const openEditDialog = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setTargetDate(goal.targetDate || "");
    setColor(goal.color);
    setDialogOpen(true);
  };

  const handleSaveGoal = () => {
    if (!name.trim()) return;
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;
    if (isNaN(target) || target <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: target,
        currentAmount: curr,
        targetDate: targetDate || undefined,
        color,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: curr,
        currency: baseCurrency,
        targetDate: targetDate || undefined,
        color,
      });
    }
    setDialogOpen(false);
  };

  const handleDeposit = () => {
    if (!depositGoal) return;
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      depositToGoal(depositGoal.id, amount);
    }
    setDepositGoal(null);
    setDepositAmount("");
  };

  // Grand totals
  const totalTarget = useMemo(
    () => goals.reduce((acc, g) => acc + g.targetAmount, 0),
    [goals],
  );
  const totalSaved = useMemo(
    () => goals.reduce((acc, g) => acc + g.currentAmount, 0),
    [goals],
  );
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              {t("goals.overviewTitle")}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-extrabold text-foreground font-mono">
                {formatMoney(totalSaved, baseCurrency, locale)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / {formatMoney(totalTarget, baseCurrency, locale)} ({overallPercentage}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("goals.overviewSubtitle", { count: goals.length })}
            </p>
          </div>

          <Button onClick={openCreateDialog} variant="hero" className="gap-2">
            <Plus className="size-4" />
            {t("goals.createGoal")}
          </Button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-1.5">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
          );
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <Card
              key={goal.id}
              variant="elevated"
              className="group flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md"
            >
              <CardHeader className="gap-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <CardTitle className="truncate text-base font-semibold">
                      {goal.name}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive/70 hover:text-destructive"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {isCompleted ? (
                  <Badge variant="soft" className="w-fit gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    {t("goals.completed")}
                  </Badge>
                ) : goal.targetDate ? (
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Calendar className="size-3 text-muted-foreground" />
                    {t("goals.targetDate")}: {formatDate(goal.targetDate, locale)}
                  </CardDescription>
                ) : null}
              </CardHeader>

              <CardContent className="flex flex-col gap-4 pt-2">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-foreground">
                      {formatMoney(goal.currentAmount, goal.currency, locale)}
                    </span>
                    <span className="numeric font-bold" style={{ color: goal.color }}>
                      {percentage}%
                    </span>
                  </div>

                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {t("goals.target")}: {formatMoney(goal.targetAmount, goal.currency, locale)}
                    </span>
                    {!isCompleted && (
                      <span>
                        {t("goals.remaining")}: {formatMoney(remaining, goal.currency, locale)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Deposit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositGoal(goal)}
                  className="w-full gap-1.5 border-dashed text-xs hover:border-primary/50"
                >
                  <Plus className="size-3.5 text-primary" />
                  {t("goals.addSavings")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Goal Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? t("goals.editGoal") : t("goals.createGoal")}
            </DialogTitle>
            <DialogDescription>{t("goals.modalDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("goals.goalName")}
              </label>
              <Input
                placeholder="e.g. Vacation in Tokyo, House Downpayment"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("goals.targetAmount")} ({baseCurrency})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("goals.currentSavings")} ({baseCurrency})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("goals.targetDate")}
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("goals.colorTheme")}
              </label>
              <div className="flex gap-2">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`size-7 rounded-full transition-transform hover:scale-110 ${
                      color === c ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="hero" onClick={handleSaveGoal}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Deposit Dialog */}
      <Dialog open={Boolean(depositGoal)} onOpenChange={(o) => !o && setDepositGoal(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: depositGoal?.color }}
              />
              {t("goals.depositTitle", { name: depositGoal?.name })}
            </DialogTitle>
            <DialogDescription>
              {t("goals.depositDescription", { currency: depositGoal?.currency })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 150"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDepositGoal(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="hero" onClick={handleDeposit}>
              {t("goals.addSavings")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
