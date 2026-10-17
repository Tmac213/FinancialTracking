import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  Landmark,
  CreditCard,
  Vault,
  Plus,
  Coins,
  Edit2,
  Trash2,
  TrendingUp,
  Banknote,
  Sparkles,
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
import { CurrencySelect } from "@/components/currency-select";
import { useAccounts, type AccountType, type WalletAccount } from "@/hooks/use-accounts";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";
import { formatMoney, localeFromLanguage } from "@/lib/currencies";

type AccountsOverviewProps = {
  targetCurrency: string;
  onOpenCashDenominations: () => void;
};

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ElementType> = {
  cash: Banknote,
  bank: Landmark,
  credit: CreditCard,
  savings: Vault,
  investment: TrendingUp,
};

const ACCOUNT_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

export const AccountsOverview = ({
  targetCurrency,
  onOpenCashDenominations,
}: AccountsOverviewProps) => {
  const { t, i18n } = useTranslation();
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { convert } = useExchangeRate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<WalletAccount | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [currency, setCurrency] = useState(targetCurrency);
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  const openCreateDialog = () => {
    setEditingAcc(null);
    setName("");
    setType("bank");
    setCurrency(targetCurrency);
    setBalance("");
    setInstitution("");
    setColor(ACCOUNT_COLORS[1]);
    setDialogOpen(true);
  };

  const openEditDialog = (acc: WalletAccount) => {
    setEditingAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setCurrency(acc.currency);
    setBalance(String(acc.balance));
    setInstitution(acc.institution || "");
    setColor(acc.color || ACCOUNT_COLORS[0]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const num = parseFloat(balance) || 0;

    if (editingAcc) {
      updateAccount(editingAcc.id, {
        name: name.trim(),
        type,
        currency,
        balance: num,
        institution: institution.trim() || undefined,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        currency,
        balance: num,
        institution: institution.trim() || undefined,
        color,
      });
    }
    setDialogOpen(false);
  };

  // Converted grand total
  const netWorthTotal = accounts.reduce((acc, a) => {
    const converted = convert(a.balance, a.currency, targetCurrency);
    // Credit card balances are liabilities if positive, or debt
    return acc + (a.type === "credit" ? -Math.abs(converted) : converted);
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Net Worth Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              {t("accounts.netWorthTitle")}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-5xl font-extrabold text-foreground font-mono">
                {formatMoney(netWorthTotal, targetCurrency, locale)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("accounts.netWorthSubtitle", { count: accounts.length, currency: targetCurrency })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={onOpenCashDenominations}
              className="gap-2 text-xs"
            >
              <Coins className="size-3.5 text-primary" />
              {t("accounts.cashCounterBtn")}
            </Button>
            <Button onClick={openCreateDialog} variant="hero" className="gap-2">
              <Plus className="size-4" />
              {t("accounts.addAccount")}
            </Button>
          </div>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const IconComponent = ACCOUNT_TYPE_ICONS[acc.type] || Wallet;
          const convertedVal = convert(acc.balance, acc.currency, targetCurrency);

          return (
            <Card
              key={acc.id}
              variant="elevated"
              className="group flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md"
            >
              <CardHeader className="gap-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: acc.color || "#10b981" }}
                    >
                      <IconComponent className="size-5" />
                    </span>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-base font-semibold text-foreground">
                          {acc.name}
                        </span>
                        {acc.isDefaultCash && (
                          <Badge variant="glow" className="px-1.5 py-0 text-[10px]">
                            {t("accounts.liveCash")}
                          </Badge>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {acc.institution || t(`accounts.type.${acc.type}`)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(acc)}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    {!acc.isDefaultCash && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive/70 hover:text-destructive"
                        onClick={() => deleteAccount(acc.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 pt-3">
                <div className="flex flex-col">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                    {formatMoney(acc.balance, acc.currency, locale)}
                  </span>
                  {acc.currency !== targetCurrency && (
                    <span className="font-mono text-xs text-muted-foreground mt-0.5">
                      ≈ {formatMoney(convertedVal, targetCurrency, locale)}
                    </span>
                  )}
                </div>

                {acc.isDefaultCash ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onOpenCashDenominations}
                    className="w-full gap-1.5 text-xs font-medium"
                  >
                    <Banknote className="size-3.5 text-primary" />
                    {t("accounts.countBanknotes")}
                  </Button>
                ) : (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>{t("accounts.accountType")}</span>
                    <span className="font-medium text-foreground capitalize">
                      {t(`accounts.type.${acc.type}`)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAcc ? t("accounts.editAccount") : t("accounts.addAccount")}
            </DialogTitle>
            <DialogDescription>{t("accounts.modalSubtitle")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("accounts.accountName")}
              </label>
              <Input
                placeholder="e.g. Chase Sapphire, Vault Savings, Cash"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("accounts.accountType")}
                </label>
                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">{t("accounts.type.bank")}</SelectItem>
                    <SelectItem value="cash">{t("accounts.type.cash")}</SelectItem>
                    <SelectItem value="savings">{t("accounts.type.savings")}</SelectItem>
                    <SelectItem value="credit">{t("accounts.type.credit")}</SelectItem>
                    <SelectItem value="investment">{t("accounts.type.investment")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("transactions.table.amount")}
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("currency")}
                </label>
                <CurrencySelect value={currency} onChange={setCurrency} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("accounts.institution")}
                </label>
                <Input
                  placeholder="e.g. Bank of America"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("goals.colorTheme")}
              </label>
              <div className="flex gap-2">
                {ACCOUNT_COLORS.map((c) => (
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
            <Button variant="hero" onClick={handleSave}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
