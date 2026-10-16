import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getCurrencyName,
  getCurrencySymbol,
  localeFromLanguage,
  searchCurrencies,
} from "@/lib/currencies";

type CurrencySelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/** Searchable picker covering the full ISO 4217 currency list. */
export const CurrencySelect = ({
  value,
  onChange,
  disabled = false,
  id,
  className,
}: CurrencySelectProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const locale = localeFromLanguage(i18n.resolvedLanguage ?? i18n.language);

  const options = useMemo(
    () => searchCurrencies(query, locale).slice(0, 60),
    [query, locale],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t("transactions.form.currency")}
          disabled={disabled}
          className={cn(
            "w-full justify-between border-input bg-background font-normal",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="numeric font-semibold">
              {getCurrencySymbol(value, locale)}
            </span>
            <span className="font-medium">{value}</span>
            <span className="truncate text-xs text-muted-foreground">
              {getCurrencyName(value, locale)}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,var(--radix-popover-trigger-width))] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("currency.search")}
          />
          <CommandList>
            <CommandEmpty>{t("currency.empty")}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.code}
                value={option.code}
                onSelect={() => {
                  onChange(option.code);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex items-center gap-3"
              >
                <span className="numeric w-8 text-sm font-semibold text-muted-foreground">
                  {option.symbol}
                </span>
                <span className="font-medium">{option.code}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {option.name}
                </span>
                <Check
                  className={cn(
                    "ml-auto size-4 shrink-0",
                    value === option.code ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
