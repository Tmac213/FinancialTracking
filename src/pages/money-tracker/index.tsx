import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  Coins,
  DollarSign,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  TrendingUp,
  Wallet,
  Sparkles,
  CalendarClock,
  Target,
  Landmark,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CurrencySelect } from "@/components/currency-select";
import { CurrencyFlag } from "@/components/currency-flag";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts } from "@/hooks/use-accounts";
import { formatMoney, formatNumber, getCurrencySymbol, localeFromLanguage } from "@/lib/currencies";
import { getDenominationsForCurrency } from "@/lib/denominations";

import { AccountsOverview } from "./AccountsOverview";
import { RecurringSubscriptionsView } from "./RecurringSubscriptionsView";
import { FinancialGoalsView } from "./FinancialGoalsView";

interface CurrencyTrackerState {
  currency: string;
  counts: Record<number, number>;
  customDenominations: number[];
}

const STORAGE_KEY = "mint_mosaic_money_tracker_state";

export const MoneyTrackerPage = () => {
  const { t, i18n } = useTranslation();
  const { baseCurrency: defaultBase } = useProfile();
  const { rates, convert, refreshRates } = useExchangeRate();
  const { syncCashBalance } = useAccounts();
  const activeLocale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);

  // Active top-level Hub tab
  const [activeTab, setActiveTab] = useState<string>("accounts");

  // Currency selection to add in banknote counter
  const [selectedCurrencyToAdd, setSelectedCurrencyToAdd] = useState<string>("USD");

  // Trackers list (banknote denominations)
  const [trackers, setTrackers] = useState<CurrencyTrackerState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load money tracker state", e);
    }
    return [
      {
        currency: "USD",
        counts: {},
        customDenominations: [],
      },
    ];
  });

  // Target conversion currency (defaults to baseCurrency from user profile or USD)
  const [targetCurrency, setTargetCurrency] = useState<string>(defaultBase || "USD");

  useEffect(() => {
    if (defaultBase && (!targetCurrency || targetCurrency === "USD")) {
      setTargetCurrency(defaultBase);
    }
  }, [defaultBase]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers));
    } catch (e) {
      console.error("Failed to persist money tracker state", e);
    }
  }, [trackers]);

  // Helper to calculate single currency total
  const getCurrencyTotal = (tracker: CurrencyTrackerState) => {
    let total = 0;
    Object.entries(tracker.counts).forEach(([denomStr, count]) => {
      const denom = parseFloat(denomStr);
      if (!isNaN(denom) && count > 0) {
        total += denom * count;
      }
    });
    return total;
  };

  // Grand combined total of cash converted to target currency
  const grandTotalCash = useMemo(() => {
    let sum = 0;
    trackers.forEach((tracker) => {
      const currTotal = getCurrencyTotal(tracker);
      if (currTotal > 0) {
        sum += convert(currTotal, tracker.currency, targetCurrency);
      }
    });
    return sum;
  }, [trackers, convert, targetCurrency]);

  // Automatically sync cash wallet balance in accounts hub with live banknote counter total
  useEffect(() => {
    syncCashBalance(grandTotalCash, targetCurrency);
  }, [grandTotalCash, targetCurrency, syncCashBalance]);

  // Add currency card
  const handleAddCurrency = () => {
    if (!selectedCurrencyToAdd) return;
    const code = selectedCurrencyToAdd.toUpperCase();
    if (trackers.some((t) => t.currency === code)) return;
    setTrackers((prev) => [
      ...prev,
      {
        currency: code,
        counts: {},
        customDenominations: [],
      },
    ]);
  };

  // Remove currency card
  const handleRemoveCurrency = (code: string) => {
    setTrackers((prev) => prev.filter((t) => t.currency !== code));
  };

  // Helper to normalize any localized numerals to ASCII digits
  const normalizeDigits = (str: string): string => {
    return str
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
      .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406))
      .replace(/[๐-๙]/g, (d) => String(d.charCodeAt(0) - 3664));
  };

  // Update bill count
  const handleCountChange = (currencyCode: string, denomination: number, countStr: string) => {
    const normalized = normalizeDigits(countStr.replace(/[^0-9٠-٩۰-۹०-९๐-๙]/g, ""));
    const count = parseInt(normalized, 10);
    const validCount = isNaN(count) || count < 0 ? 0 : count;

    setTrackers((prev) =>
      prev.map((tracker) => {
        if (tracker.currency !== currencyCode) return tracker;
        return {
          ...tracker,
          counts: {
            ...tracker.counts,
            [denomination]: validCount,
          },
        };
      })
    );
  };

  // Clear counts for a currency
  const handleClearCurrencyCounts = (currencyCode: string) => {
    setTrackers((prev) =>
      prev.map((tracker) => {
        if (tracker.currency !== currencyCode) return tracker;
        return {
          ...tracker,
          counts: {},
        };
      })
    );
  };

  // Add custom denomination
  const [customValueInput, setCustomValueInput] = useState<Record<string, string>>({});
  const handleAddCustomDenomination = (currencyCode: string) => {
    const valStr = customValueInput[currencyCode]?.trim();
    if (!valStr) return;
    const val = parseFloat(valStr);
    if (isNaN(val) || val <= 0) return;

    setTrackers((prev) =>
      prev.map((tracker) => {
        if (tracker.currency !== currencyCode) return tracker;
        if (
          getDenominationsForCurrency(tracker.currency).includes(val) ||
          tracker.customDenominations.includes(val)
        ) {
          return tracker;
        }
        return {
          ...tracker,
          customDenominations: [...tracker.customDenominations, val].sort((a, b) => b - a),
        };
      })
    );

    setCustomValueInput((prev) => ({ ...prev, [currencyCode]: "" }));
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Landmark className="size-5" />
            </span>
            {t("moneyTracker.hubTitle")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("moneyTracker.hubSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshRates()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />
            {t("moneyTracker.liveRates")}
          </Button>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 rounded-xl">
          <TabsTrigger value="accounts" className="gap-2 text-xs sm:text-sm">
            <Landmark className="size-4" />
            {t("accounts.tabTitle")}
          </TabsTrigger>
          <TabsTrigger value="cash-counter" className="gap-2 text-xs sm:text-sm">
            <Banknote className="size-4" />
            {t("accounts.cashTabTitle")}
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-2 text-xs sm:text-sm">
            <CalendarClock className="size-4" />
            {t("recurring.tabTitle")}
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2 text-xs sm:text-sm">
            <Target className="size-4" />
            {t("goals.tabTitle")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Multi-Wallet & Accounts Overview */}
        <TabsContent value="accounts" className="mt-6">
          <AccountsOverview
            targetCurrency={targetCurrency}
            onOpenCashDenominations={() => setActiveTab("cash-counter")}
          />
        </TabsContent>

        {/* Tab 2: Banknote Denomination Cash Counter */}
        <TabsContent value="cash-counter" className="mt-6 flex flex-col gap-6">
          {/* Grand Cash Summary Card */}
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  {t("moneyTracker.allInAll")}
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                    {formatMoney(grandTotalCash, targetCurrency, activeLocale)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("accounts.liveSyncedToWallet")}
                </p>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("moneyTracker.convertedTotal")} ({targetCurrency})
                </label>
                <CurrencySelect
                  value={targetCurrency}
                  onChange={(newCode) => setTargetCurrency(newCode)}
                />
              </div>
            </div>
          </Card>

          {/* Add Currency Bar */}
          <Card className="p-4 border-border/70 bg-card/60 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-64">
                <CurrencySelect
                  value={selectedCurrencyToAdd}
                  onChange={setSelectedCurrencyToAdd}
                />
              </div>
              <Button
                variant="hero"
                onClick={handleAddCurrency}
                className="w-full sm:w-auto gap-2"
                disabled={trackers.some((t) => t.currency === selectedCurrencyToAdd)}
              >
                <Plus className="size-4" />
                {t("moneyTracker.addCurrency")}
              </Button>
            </div>
          </Card>

          {/* Denomination Counter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackers.map((tracker) => {
              const defaultDenoms = getDenominationsForCurrency(tracker.currency);
              const allDenoms = Array.from(
                new Set([...defaultDenoms, ...tracker.customDenominations])
              ).sort((a, b) => b - a);

              const currTotal = getCurrencyTotal(tracker);
              const convertedTotal = convert(currTotal, tracker.currency, targetCurrency);
              const currencySymbol = getCurrencySymbol(tracker.currency);

              return (
                <Card
                  key={tracker.currency}
                  className="flex flex-col justify-between border-border/80 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2.5">
                        <CurrencyFlag code={tracker.currency} className="size-6 rounded-full" />
                        <div>
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {tracker.currency}
                            <span className="text-xs font-normal text-muted-foreground">
                              ({currencySymbol})
                            </span>
                          </CardTitle>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClearCurrencyCounts(tracker.currency)}
                          title={t("moneyTracker.resetCounts")}
                          className="size-8 text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                        {trackers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCurrency(tracker.currency)}
                            title={t("common.delete")}
                            className="size-8 text-destructive/70 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 flex flex-col gap-4">
                      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                        <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground px-2 pb-1 border-b border-border/40">
                          <span className="col-span-4 sm:col-span-5">{t("moneyTracker.denomination")}</span>
                          <span className="col-span-4 sm:col-span-3 text-center">{t("moneyTracker.quantity")}</span>
                          <span className="col-span-4 text-end">{t("moneyTracker.subtotal")}</span>
                        </div>

                        <div className="flex flex-col divide-y divide-border/30">
                          {allDenoms.map((denom) => {
                            const count = tracker.counts[denom] || 0;
                            const subtotal = count * denom;

                            return (
                              <div
                                key={denom}
                                className="grid grid-cols-12 items-center py-2 px-2 hover:bg-muted/30 rounded-lg transition-colors"
                              >
                                <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                                  <Coins className="size-3.5 text-muted-foreground/60 shrink-0" />
                                  <span>
                                    {currencySymbol}
                                    {formatNumber(denom, activeLocale)}
                                  </span>
                                </div>

                                <div className="col-span-4 sm:col-span-3 flex items-center justify-center">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={count === 0 ? "" : formatNumber(count, activeLocale)}
                                    placeholder={formatNumber(0, activeLocale)}
                                    onChange={(e) =>
                                      handleCountChange(tracker.currency, denom, e.target.value)
                                    }
                                    className="h-8 w-20 text-center font-mono text-xs"
                                  />
                                </div>

                                <div className="col-span-4 text-end font-mono text-sm font-medium">
                                  {subtotal > 0 ? (
                                    <span className="text-foreground">
                                      {formatMoney(subtotal, tracker.currency, activeLocale)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/40">—</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Add Custom Denomination input */}
                      <div className="pt-2 flex items-center gap-2 border-t border-border/50">
                        <Input
                          type="number"
                          step="any"
                          placeholder={t("moneyTracker.customBill")}
                          value={customValueInput[tracker.currency] || ""}
                          onChange={(e) =>
                            setCustomValueInput((prev) => ({
                              ...prev,
                              [tracker.currency]: e.target.value,
                            }))
                          }
                          className="h-8 text-xs font-mono"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddCustomDenomination(tracker.currency);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAddCustomDenomination(tracker.currency)}
                          className="h-8 text-xs whitespace-nowrap"
                        >
                          <Plus className="size-3.5 mr-1" />
                          {t("moneyTracker.add")}
                        </Button>
                      </div>
                    </CardContent>
                  </div>

                  {/* Footer with Card Totals & Conversion */}
                  <div className="border-t border-border/60 bg-muted/20 p-4 sm:p-5 rounded-b-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("moneyTracker.totalCash")} ({tracker.currency})
                      </span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {formatMoney(currTotal, tracker.currency, activeLocale)}
                      </span>
                    </div>

                    {targetCurrency !== tracker.currency && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="size-3.5 text-primary" />
                          {t("moneyTracker.convertedTotal")} ({targetCurrency})
                        </span>
                        <span className="font-bold font-mono text-primary text-sm">
                          ≈ {formatMoney(convertedTotal, targetCurrency, activeLocale)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Recurring Transactions & Subscriptions */}
        <TabsContent value="recurring" className="mt-6">
          <RecurringSubscriptionsView />
        </TabsContent>

        {/* Tab 4: Financial Goals & Savings Buckets */}
        <TabsContent value="goals" className="mt-6">
          <FinancialGoalsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoneyTrackerPage;
