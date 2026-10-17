import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth-context";

export type AccountType = "cash" | "bank" | "credit" | "savings" | "investment";

export interface WalletAccount {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  color?: string;
  institution?: string;
  isDefaultCash?: boolean; // connected to banknote counter
  updatedAt: string;
}

const ACCOUNTS_STORAGE_PREFIX = "mint_mosaic_accounts_";

export const useAccounts = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const storageKey = `${ACCOUNTS_STORAGE_PREFIX}${userId}`;

  const [accounts, setAccounts] = useState<WalletAccount[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load accounts:", e);
    }
    return [
      {
        id: "default-cash-wallet",
        name: "Cash in Pocket",
        type: "cash",
        currency: "USD",
        balance: 0,
        color: "#10b981",
        isDefaultCash: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "default-bank-account",
        name: "Main Checking Account",
        type: "bank",
        currency: "USD",
        balance: 3450,
        color: "#3b82f6",
        institution: "Chase / Bank",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "default-savings-vault",
        name: "High-Yield Savings Vault",
        type: "savings",
        currency: "USD",
        balance: 12800,
        color: "#8b5cf6",
        institution: "Marcus / Savings",
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(accounts));
    } catch (e) {
      console.error("Failed to persist accounts:", e);
    }
  }, [accounts, storageKey]);

  const addAccount = useCallback((newAcc: Omit<WalletAccount, "id" | "updatedAt">) => {
    const acc: WalletAccount = {
      ...newAcc,
      id: "acc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      updatedAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, acc]);
    return acc;
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<WalletAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc)),
    );
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }, []);

  const syncCashBalance = useCallback((cashTotal: number, currency: string) => {
    setAccounts((prev) => {
      const cashIdx = prev.findIndex((a) => a.isDefaultCash || a.type === "cash");
      if (cashIdx >= 0) {
        const updated = [...prev];
        updated[cashIdx] = {
          ...updated[cashIdx],
          balance: cashTotal,
          currency,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return prev;
    });
  }, []);

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    syncCashBalance,
  };
};
