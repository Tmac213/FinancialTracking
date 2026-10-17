import type { Database } from "@/integrations/supabase/types";

export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type TransactionType = "income" | "expense";

/** Reporting windows offered on the dashboard and the ledger. */
export type PeriodKey =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "this_year"
  | "all_time";

export const PERIOD_KEYS: PeriodKey[] = [
  "this_month",
  "last_month",
  "last_3_months",
  "this_year",
  "all_time",
];

export type DateRange = { from: string; to: string };

const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayISO = (): string => toISODate(new Date());

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

/** Inclusive date range for a reporting window; `null` means "no bound". */
export const periodRange = (
  period: PeriodKey,
  now = new Date(),
): DateRange | null => {
  switch (period) {
    case "this_month":
      return { from: toISODate(startOfMonth(now)), to: toISODate(endOfMonth(now)) };
    case "last_month": {
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        from: toISODate(startOfMonth(previous)),
        to: toISODate(endOfMonth(previous)),
      };
    }
    case "last_3_months": {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { from: toISODate(startOfMonth(from)), to: toISODate(endOfMonth(now)) };
    }
    case "this_year":
      return {
        from: toISODate(new Date(now.getFullYear(), 0, 1)),
        to: toISODate(new Date(now.getFullYear(), 11, 31)),
      };
    case "all_time":
    default:
      return null;
  }
};

/** The window immediately before `period`, used for month-over-month deltas. */
export const previousRange = (period: PeriodKey, now = new Date()): DateRange | null => {
  switch (period) {
    case "this_month":
    case "last_month":
    case "last_3_months":
      return periodRange("last_month", now);
    case "this_year":
      return {
        from: toISODate(new Date(now.getFullYear() - 1, 0, 1)),
        to: toISODate(new Date(now.getFullYear() - 1, 11, 31)),
      };
    default:
      return null;
  }
};

export const isWithinRange = (
  isoDate: string,
  range: DateRange | null,
): boolean => {
  if (!range) return true;
  return isoDate >= range.from && isoDate <= range.to;
};

/** `2026-10` from `2026-10-13`. */
export const monthKeyOf = (isoDate: string): string => isoDate.slice(0, 7);

/** The last `count` month keys ending at `now`, oldest first. */
export const recentMonthKeys = (count: number, now = new Date()): string[] => {
  const keys: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    keys.push(`${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`);
  }
  return keys;
};

export const monthLabel = (monthKey: string, locale = "en-US"): string => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(
    new Date(year, (month ?? 1) - 1, 1),
  );
};

export const formatDate = (isoDate: string, locale = "en-US"): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
};

export type Totals = {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  count: number;
};

/** Totals in the account's base currency (the trigger keeps `amount_base` true). */
export const summarize = (rows: TransactionRow[]): Totals => {
  let income = 0;
  let expense = 0;

  for (const row of rows) {
    const value = Number(row.amount_base) || 0;
    if (row.type === "income") income += value;
    else expense += value;
  }

  const net = income - expense;
  return {
    income: round2(income),
    expense: round2(expense),
    net: round2(net),
    savingsRate: income > 0 ? Math.round((net / income) * 100) : 0,
    count: rows.length,
  };
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

export type MonthPoint = {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
};

export const monthlySeries = (
  rows: TransactionRow[],
  months: number,
  locale = "en-US",
  now = new Date(),
): MonthPoint[] => {
  const keys = recentMonthKeys(months, now);
  const buckets = new Map<string, MonthPoint>(
    keys.map((key) => [
      key,
      { month: key, label: monthLabel(key, locale), income: 0, expense: 0, net: 0 },
    ]),
  );

  for (const row of rows) {
    const bucket = buckets.get(monthKeyOf(row.occurred_on));
    if (!bucket) continue;
    const value = Number(row.amount_base) || 0;
    if (row.type === "income") bucket.income += value;
    else bucket.expense += value;
  }

  return keys.map((key) => {
    const bucket = buckets.get(key)!;
    bucket.income = round2(bucket.income);
    bucket.expense = round2(bucket.expense);
    bucket.net = round2(bucket.income - bucket.expense);
    return bucket;
  });
};

export type CategorySlice = {
  id: string;
  name: string;
  color: string;
  value: number;
  percentage: number;
};

export const categoryBreakdown = (
  rows: TransactionRow[],
  categories: CategoryRow[],
  type: TransactionType,
): CategorySlice[] => {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const totals = new Map<string, CategorySlice>();
  let sum = 0;

  for (const row of rows) {
    if (row.type !== type) continue;
    const value = Number(row.amount_base) || 0;
    if (value <= 0) continue;

    const key = row.category_id ?? "__uncategorized__";
    const existing = totals.get(key);
    if (existing) {
      existing.value += value;
    } else {
      const category = row.category_id ? byId.get(row.category_id) : undefined;
      totals.set(key, {
        id: key,
        name: category?.name ?? "uncategorized",
        color: category?.color ?? "#94a3b8",
        value,
        percentage: 0,
      });
    }
    sum += value;
  }

  return [...totals.values()]
    .map((slice) => ({
      ...slice,
      value: round2(slice.value),
      percentage: sum > 0 ? Math.round((slice.value / sum) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);
};

export const byCategoryId = (categories: CategoryRow[]) =>
  new Map(categories.map((category) => [category.id, category]));

export const percentChange = (current: number, previous: number): number | null => {
  if (!previous) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
};

export const todayISOForInput = todayISO;

/** Daily average spending and month-end projection calculations. */
export type SpendingVelocity = {
  dailyAverage: number;
  projectedMonthEnd: number;
  daysPassed: number;
  daysTotal: number;
};

export const calculateSpendingVelocity = (
  rows: TransactionRow[],
  period: PeriodKey,
  now = new Date(),
): SpendingVelocity => {
  let daysPassed = 1;
  let daysTotal = 30;

  if (period === "this_month") {
    daysPassed = Math.max(1, now.getDate());
    daysTotal = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  } else if (period === "last_month") {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth(), 0);
    daysPassed = lastMonthDate.getDate();
    daysTotal = lastMonthDate.getDate();
  } else if (period === "last_3_months") {
    daysPassed = 90;
    daysTotal = 90;
  } else if (period === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    daysPassed = Math.max(1, diff + 1);
    daysTotal = 365;
  } else {
    // all_time or other: use distinct days in dataset or fallback
    const dates = new Set(rows.map((r) => r.occurred_on));
    daysPassed = Math.max(1, dates.size);
    daysTotal = daysPassed;
  }

  let totalExpense = 0;
  for (const row of rows) {
    if (row.type === "expense") {
      totalExpense += Number(row.amount_base) || 0;
    }
  }

  const dailyAverage = round2(totalExpense / daysPassed);
  // For this_month, projected month end is current expenses + dailyAverage * (daysTotal - daysPassed)
  const remainingDays = Math.max(0, daysTotal - daysPassed);
  const projectedMonthEnd = round2(totalExpense + dailyAverage * remainingDays);

  return {
    dailyAverage,
    projectedMonthEnd,
    daysPassed,
    daysTotal,
  };
};
