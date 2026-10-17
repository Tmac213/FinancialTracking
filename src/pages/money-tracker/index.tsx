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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CurrencySelect } from "@/components/currency-select";
import { CurrencyFlag } from "@/components/currency-flag";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, formatNumber, getCurrencySymbol, localeFromLanguage } from "@/lib/currencies";
import { getDenominationsForCurrency } from "@/lib/denominations";

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
  const activeLocale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);

  // Currency selection to add
  const [selectedCurrencyToAdd, setSelectedCurrencyToAdd] = useState<string>("USD");

  // Trackers list
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

  // Helper to normalize any localized numerals (Eastern Arabic, Devanagari, Thai) to ASCII digits
  const normalizeDigits = (str: string): string => {
    return str
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)) // Arabic-Indic
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)) // Extended Arabic
      .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406)) // Devanagari
      .replace(/[๐-๙]/g, (d) => String(d.charCodeAt(0) - 3664)); // Thai
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

  // Calculate currency total
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

  // Calculate grand combined total converted to target currency
  const grandTotal = useMemo(() => {
    let sum = 0;
    trackers.forEach((tracker) => {
      const currTotal = getCurrencyTotal(tracker);
      if (currTotal > 0) {
        sum += convert(currTotal, tracker.currency, targetCurrency);
      }
    });
    return sum;
  }, [trackers, convert, targetCurrency]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Banknote className="size-6" />
            </span>
            {t("moneyTracker.title")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("moneyTracker.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* Grand Summary Card */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              {t("moneyTracker.allInAll")}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                {formatMoney(grandTotal, targetCurrency, activeLocale)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("transactions.subtitle", { base: targetCurrency })}
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
            onClick={handleAddCurrency}
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-medium"
          >
            <Plus className="size-4" />
            {t("moneyTracker.addCurrency")}
          </Button>
        </div>
      </Card>

      {/* Currency Cards List */}
      {trackers.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center gap-3 max-w-sm mx-auto text-muted-foreground">
            <Wallet className="size-10 text-muted-foreground/60" />
            <p className="text-sm">{t("moneyTracker.noCurrencies")}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {trackers.map((tracker) => {
            const defaultDenoms = getDenominationsForCurrency(tracker.currency);
            const allDenominations = Array.from(
              new Set([...defaultDenoms, ...tracker.customDenominations])
            ).sort((a, b) => b - a);

            const currTotal = getCurrencyTotal(tracker);
            const convertedTotal = convert(currTotal, tracker.currency, targetCurrency);
            const unitRate = convert(1, tracker.currency, targetCurrency);
            const symbol = getCurrencySymbol(tracker.currency, activeLocale);

            return (
              <Card
                key={tracker.currency}
                className="border-border/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="border-b border-border/50 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm overflow-hidden p-1">
                          <CurrencyFlag currency={tracker.currency} className="h-6 w-8 rounded-sm shadow-sm" />
                        </span>
                        <div className="flex flex-col">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <span>{tracker.currency}</span>
                            <Badge variant="outline" className="text-xs">
                              {symbol}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {t("moneyTracker.unitRate", {
                              currency: tracker.currency,
                              rate: formatMoney(unitRate, targetCurrency, activeLocale),
                            })}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClearCurrencyCounts(tracker.currency)}
                          title={t("moneyTracker.clearAll")}
                          className="size-8 text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCurrency(tracker.currency)}
                          title={t("moneyTracker.removeCurrency")}
                          className="size-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Denominations table / grid */}
                  <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
                    <div className="divide-y divide-border/40">
                      <div className="grid grid-cols-12 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
                        <div className="col-span-4 sm:col-span-5">{t("moneyTracker.bill")}</div>
                        <div className="col-span-4 sm:col-span-3 text-center">{t("moneyTracker.quantity")}</div>
                        <div className="col-span-4 text-end">{t("moneyTracker.subtotal")}</div>
                      </div>

                      <div className="flex flex-col divide-y divide-border/20 max-h-[380px] overflow-y-auto pr-1">
                        {allDenominations.map((denom) => {
                          const count = tracker.counts[denom] || 0;
                          const subtotal = denom * count;
                          const isCoin = denom < 1;

                          return (
                            <div
                              key={denom}
                              className="grid grid-cols-12 items-center py-2 px-2 hover:bg-muted/40 rounded transition-colors gap-2"
                            >
                              {/* Bill / denomination tag */}
                              <div className="col-span-4 sm:col-span-5 flex items-center gap-2">
                                <span
                                  className={`flex size-7 shrink-0 items-center justify-center rounded text-xs font-semibold ${
                                    isCoin
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {isCoin ? (
                                    <Coins className="size-3.5" />
                                  ) : (
                                    <Banknote className="size-3.5" />
                                  )}
                                </span>
                                <span className="font-mono text-sm font-semibold">
                                  {formatMoney(denom, tracker.currency, activeLocale)}
                                </span>
                              </div>

                              {/* Quantity input */}
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

                              {/* Subtotal */}
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
      )}
    </div>
  );
};

export default MoneyTrackerPage;
