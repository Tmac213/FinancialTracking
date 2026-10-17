import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth-context";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string; // YYYY-MM-DD
  color: string;
  iconName?: string;
  createdAt: string;
}

const GOALS_STORAGE_PREFIX = "mint_mosaic_goals_";

export const useGoals = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const storageKey = `${GOALS_STORAGE_PREFIX}${userId}`;

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load savings goals:", e);
    }
    return [
      {
        id: "goal_emergency_fund",
        name: "Emergency Fund (6 Months)",
        targetAmount: 10000,
        currentAmount: 6500,
        currency: "USD",
        targetDate: "2026-12-31",
        color: "#10b981",
        iconName: "Shield",
        createdAt: new Date().toISOString(),
      },
      {
        id: "goal_vacation",
        name: "Tokyo & Kyoto Vacation",
        targetAmount: 3500,
        currentAmount: 1800,
        currency: "USD",
        targetDate: "2027-04-15",
        color: "#3b82f6",
        iconName: "Plane",
        createdAt: new Date().toISOString(),
      },
      {
        id: "goal_laptop",
        name: "New Workstation & Laptop",
        targetAmount: 2200,
        currentAmount: 1400,
        currency: "USD",
        targetDate: "2026-11-30",
        color: "#f59e0b",
        iconName: "Laptop",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (e) {
      console.error("Failed to persist savings goals:", e);
    }
  }, [goals, storageKey]);

  const addGoal = useCallback((input: Omit<SavingsGoal, "id" | "createdAt">) => {
    const goal: SavingsGoal = {
      ...input,
      id: "goal_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, goal]);
    return goal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const depositToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          currentAmount: Math.max(0, Math.round((g.currentAmount + amount) * 100) / 100),
        };
      }),
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return {
    goals,
    addGoal,
    updateGoal,
    depositToGoal,
    deleteGoal,
  };
};
