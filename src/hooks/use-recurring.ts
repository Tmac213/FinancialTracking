import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/auth-context";
import { useCreateTransaction } from "@/hooks/use-transactions";
import type { TransactionType } from "@/lib/finance";

export type BillingCycle = "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category_id: string | null;
  cycle: BillingCycle;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  lastLoggedDate: string | null; // YYYY-MM-DD
  active: boolean;
  description?: string;
  createdAt: string;
}

const RECURRING_STORAGE_PREFIX = "mint_mosaic_recurring_rules_";

const addCycleToDate = (isoDate: string, cycle: BillingCycle): string => {
  const d = new Date(isoDate);
  if (cycle === "weekly") {
    d.setDate(d.getDate() + 7);
  } else if (cycle === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else if (cycle === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  }
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useRecurring = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const storageKey = `${RECURRING_STORAGE_PREFIX}${userId}`;
  const createTx = useCreateTransaction();
  const hasCheckedDue = useRef(false);

  const [rules, setRules] = useState<RecurringRule[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load recurring rules:", e);
    }
    const today = new Date().toISOString().slice(0, 10);
    return [
      {
        id: "rec_netflix",
        name: "Netflix Premium",
        type: "expense",
        amount: 19.99,
        currency: "USD",
        category_id: null,
        cycle: "monthly",
        startDate: today,
        nextDueDate: today,
        lastLoggedDate: null,
        active: true,
        description: "Streaming subscription",
        createdAt: new Date().toISOString(),
      },
      {
        id: "rec_gym",
        name: "Fitness Gym Membership",
        type: "expense",
        amount: 45.0,
        currency: "USD",
        category_id: null,
        cycle: "monthly",
        startDate: today,
        nextDueDate: today,
        lastLoggedDate: null,
        active: true,
        description: "Monthly health club fee",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rules));
    } catch (e) {
      console.error("Failed to persist recurring rules:", e);
    }
  }, [rules, storageKey]);

  // Automated execution check: on mount, check if any active recurring items are due today or overdue
  useEffect(() => {
    if (hasCheckedDue.current || !user) return;
    hasCheckedDue.current = true;

    const today = new Date().toISOString().slice(0, 10);
    let changed = false;
    const updated = rules.map((r) => {
      if (!r.active) return r;
      if (r.nextDueDate <= today && r.lastLoggedDate !== today) {
        // Automatically log transaction
        createTx.mutate({
          type: r.type,
          amount: r.amount,
          currency: r.currency,
          exchange_rate: 1, // trigger recalculates amount_base or live
          category_id: r.category_id,
          description: `[Recurring] ${r.name}`,
          occurred_on: r.nextDueDate,
        });

        changed = true;
        const nextDate = addCycleToDate(r.nextDueDate, r.cycle);
        return {
          ...r,
          lastLoggedDate: today,
          nextDueDate: nextDate,
        };
      }
      return r;
    });

    if (changed) {
      setRules(updated);
    }
  }, [rules, user, createTx]);

  const addRule = useCallback((input: Omit<RecurringRule, "id" | "createdAt" | "lastLoggedDate">) => {
    const item: RecurringRule = {
      ...input,
      id: "rec_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      lastLoggedDate: null,
      createdAt: new Date().toISOString(),
    };
    setRules((prev) => [...prev, item]);
    return item;
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<RecurringRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const triggerRuleManually = useCallback(
    async (id: string) => {
      const today = new Date().toISOString().slice(0, 10);
      let triggeredRule: RecurringRule | null = null;
      let calculatedNextDate = "";

      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          triggeredRule = r;
          calculatedNextDate = addCycleToDate(r.nextDueDate || today, r.cycle);
          return {
            ...r,
            lastLoggedDate: today,
            nextDueDate: calculatedNextDate,
          };
        }),
      );

      if (!triggeredRule) return;
      const target = triggeredRule as RecurringRule;

      try {
        await createTx.mutateAsync({
          type: target.type,
          amount: target.amount,
          currency: target.currency,
          exchange_rate: 1,
          category_id: target.category_id,
          description: `[Recurring] ${target.name}`,
          occurred_on: today,
        });
      } catch (err) {
        console.error("Failed to log recurring transaction to ledger:", err);
      }
    },
    [createTx],
  );

  return {
    rules,
    addRule,
    updateRule,
    deleteRule,
    triggerRuleManually,
  };
};
