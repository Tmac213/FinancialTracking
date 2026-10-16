import { useTranslation } from "react-i18next";
import { ArrowUpDown, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_KEYS, type CategoryRow } from "@/lib/finance";
import type {
  TransactionFilterState,
  TransactionSort,
} from "./useTransactionFilters";

type TransactionFiltersProps = {
  filters: TransactionFilterState;
  update: <K extends keyof TransactionFilterState>(key: K, value: TransactionFilterState[K]) => void;
  reset: () => void;
  isFiltered: boolean;
  sort: TransactionSort;
  setSort: (sort: TransactionSort) => void;
  categories: CategoryRow[];
  resultCount: number;
};

const SORTS: TransactionSort[] = [
  "date_desc",
  "date_asc",
  "amount_desc",
  "amount_asc",
];

export const TransactionFilters = ({
  filters,
  update,
  reset,
  isFiltered,
  sort,
  setSort,
  categories,
  resultCount,
}: TransactionFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border70 bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-12 size-4 -translate-y-12 text-muted-foreground" aria-hidden />
          <Input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder={t('transactions.filters.searchPlaceholder')}
            aria-label={t('transactions.filters.search')}
            className="pl-9"
          />
        </div>

        <Badge variant="soft" className="numeric shrink-0">
          <Filter className="mr-1 size-3" aria-hidden />
          {t('transactions.filters.count', { count: resultCount })}
        </Badge>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="size-4" aria-hidden />
            {t('transactions.filters.reset')}
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Type filter */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">{t('transactions.filters.type')}</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => update('type', value as TransactionFilterState['type'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transactions.filters.allTypes')}</SelectItem>
              <SelectItem value="income">{t('transactions.type.income')}</SelectItem>
              <SelectItem value="expense">{t('transactions.type.expense')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category filter */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">{t('transactions.filters.category')}</Label>
          <Select
            value={filters.categoryId}
            onValueChange={(value) => update('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transactions.filters.allCategories')}</SelectItem>
              <SelectItem value="none">{t('transactions.form.noCategory')}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} aria-hidden />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Period filter */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">{t('transactions.filters.period')}</Label>
          <Select
            value={filters.period}
            onValueChange={(value) => update('period', value as TransactionFilterState['period'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`period.${key}`)}
                </SelectItem>
              ))}
              <SelectItem value="custom">{t('transactions.filters.customRange')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort filter */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">{t('transactions.filters.sort')}</Label>
          <Select value={sort} onValueChange={(value) => setSort(value as TransactionSort)}>
            <SelectTrigger>
              <ArrowUpDown className="mr-1 size-3.5 opacity-60" aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {t(`transactions.sort.${opt}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom date range */}
      {filters.period === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-from" className="text-xs text-muted-foreground">
              {t('transactions.filters.from')}
            </Label>
            <Input
              id="filter-from"
              type="date"
              value={filters.from}
              onChange={(e) => update('from', e.target.value)}
              className="numeric"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-to" className="text-xs text-muted-foreground">
              {t('transactions.filters.to')}
            </Label>
            <Input
              id="filter-to"
              type="date"
              value={filters.to}
              onChange={(e) => update('to', e.target.value)}
              className="numeric"
            />
          </div>
        </div>
      )}
    </div>
  );
};
