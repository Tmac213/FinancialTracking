import { useMemo, useState } from "react";
import {
  isWithinRange,
  periodRange,
  type CategoryRow,
  type PeriodKey,
  type TransactionRow,
  type TransactionType,
} from "@/lib/finance";

export type TransactionSort =
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc";

export type TransactionFilterState = {
  search: string;
  type: "all" | TransactionType;
  categoryId: string;
  period: PeriodKey | "custom";
  from: string;
  to: string;
};

const INITIAL_FILTERS: TransactionFilterState = {
  search: "",
  type: "all",
  categoryId: "all",
  period: "last_3_months",
  from: "",
  to: "",
};

export const useTransactionFilters = (
  transactions: TransactionRow[],
  categories: CategoryRow[],
) => {
  const [filters, setFilters] = useState<TransactionFilterState>(INITIAL_FILTERS);
  const [sort, setSort] = useState<TransactionSort>("date_desc");

  const update = <K extends keyof TransactionFilterState>(
    key: K,
    value: TransactionFilterState[K],
  ) => setFilters((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setFilters(INITIAL_FILTERS);
    setSort("date_desc");
  };

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.categoryId !== "all" ||
    filters.period !== INITIAL_FILTERS.period;

  const filtered = useMemo(() => {
    const range =
      filters.period === "custom"
        ? filters.from && filters.to
          ? { from: filters.from, to: filters.to }
          : null
        : periodRange(filters.period);

    const term = filters.search.trim().toLowerCase();
    const categoryNames = new Map(
      categories.map((category) => [category.id, category.name.toLowerCase()]),
    );

    const rows = transactions.filter((row) => {
      if (filters.type !== "all" && row.type !== filters.type) return false;

      if (filters.categoryId === "none" && row.category_id) return false;
      if (
        filters.categoryId !== "all" &&
        filters.categoryId !== "none" &&
        row.category_id !== filters.categoryId
      ) {
        return false;
      }

      if (!isWithinRange(row.occurred_on, range)) return false;

      if (term) {
        const haystack = [
          row.description.toLowerCase(),
          row.currency.toLowerCase(),
          row.category_id ? (categoryNames.get(row.category_id) ?? "") : "",
          String(row.amount),
        ].join(" ");
        if (!haystack.includes(term)) return false;
      }

      return true;
    });

    const sorted = [...rows].sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return (
            a.occurred_on.localeCompare(b.occurred_on) ||
            a.created_at.localeCompare(b.created_at)
          );
        case "amount_desc":
          return Number(b.amount_base) - Number(a.amount_base);
        case "amount_asc":
          return Number(a.amount_base) - Number(b.amount_base);
        case "date_desc":
        default:
          return (
            b.occurred_on.localeCompare(a.occurred_on) ||
            b.created_at.localeCompare(a.created_at)
          );
      }
    });

    return sorted;
  }, [transactions, categories, filters, sort]);

  return { filters, update, reset, isFiltered, sort, setSort, filtered };
};
