import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth-context";

export type CategoryBudgets = Record<string, number>;

const BUDGETS_STORAGE_KEY = "mint_mosaic_category_budgets";

export const useCategoryBudgets = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const storageKey = `${BUDGETS_STORAGE_KEY}_${userId}`;

  const [budgets, setBudgets] = useState<CategoryBudgets>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setBudgets(raw ? JSON.parse(raw) : {});
    } catch {
      setBudgets({});
    }
  }, [storageKey]);

  const setCategoryBudget = useCallback(
    (categoryId: string, amount: number) => {
      setBudgets((prev) => {
        const next = { ...prev };
        if (amount <= 0) {
          delete next[categoryId];
        } else {
          next[categoryId] = Math.round(amount * 100) / 100;
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to persist budget:", e);
        }
        return next;
      });
    },
    [storageKey],
  );

  const removeCategoryBudget = useCallback(
    (categoryId: string) => {
      setBudgets((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to remove budget:", e);
        }
        return next;
      });
    },
    [storageKey],
  );

  return {
    budgets,
    setCategoryBudget,
    removeCategoryBudget,
  };
};
