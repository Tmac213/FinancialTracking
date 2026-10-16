import { useQuery } from "@tanstack/react-query";
import { getRates, type RateSnapshot } from "@/lib/fx";

/** Exchange rates for the account base currency. */
export const useRates = (baseCurrency: string | undefined) => {
  const base = baseCurrency?.trim().toUpperCase();

  const query = useQuery({
    queryKey: ["fx-rates", base],
    enabled: Boolean(base),
    staleTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: (): Promise<RateSnapshot> => getRates(base!),
  });

  return {
    snapshot: query.data,
    isLoading: query.isLoading,
    /** True when rates could not be loaded — the form then asks for a manual rate. */
    unavailable: query.isError,
    refetch: query.refetch,
  };
};
