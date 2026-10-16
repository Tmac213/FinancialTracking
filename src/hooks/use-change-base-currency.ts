import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth-context";
import { CATEGORIES_KEY } from "@/hooks/use-categories";
import { TRANSACTIONS_KEY } from "@/hooks/use-transactions";
import { findRate, forgetRates, getRates } from "@/lib/fx";

export type BaseCurrencyChange = {
  updated: number;
  /** Currencies with no known rate — their stored rate was left untouched. */
  skipped: string[];
  ratesStale: boolean;
};

/**
 * Switching the account base currency re-converts every stored base amount.
 * `amount_base` is computed by a database trigger from `exchange_rate`, so
 * rewriting the rate per currency is enough — and because one update covers
 * every transaction in the same currency, this stays a small number of writes.
 *
 * If the rate service cannot be reached the change is aborted before anything
 * is written, so totals can never be relabelled into the wrong currency.
 */
export const useChangeBaseCurrency = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nextBase: string): Promise<BaseCurrencyChange> => {
      const base = nextBase.trim().toUpperCase();
      const userId = user!.id;

      const snapshot = await getRates(base);

      const { data: rows, error: readError } = await supabase
        .from("transactions")
        .select("currency")
        .eq("user_id", userId);

      if (readError) throw new Error(readError.message);

      const currencies = [
        ...new Set((rows ?? []).map((row) => row.currency.toUpperCase())),
      ];

      const skipped: string[] = [];
      let updated = 0;

      for (const code of currencies) {
        const rate = findRate(snapshot, code, base);
        if (rate === null) {
          skipped.push(code);
          continue;
        }

        const { error, count } = await supabase
          .from("transactions")
          .update({ exchange_rate: rate }, { count: "exact" })
          .eq("user_id", userId)
          .eq("currency", code);

        if (error) throw new Error(error.message);
        updated += count ?? 0;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ base_currency: base })
        .eq("id", userId);

      if (profileError) throw new Error(profileError.message);

      return { updated, skipped, ratesStale: snapshot.stale };
    },
    onSuccess: () => {
      forgetRates();
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
