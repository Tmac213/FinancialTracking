import { supabase } from "@/integrations/supabase/client";

export type RateSnapshot = {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string | null;
  source: string;
  stale: boolean;
};

export class RatesUnavailableError extends Error {}

const snapshotCache = new Map<string, Promise<RateSnapshot>>();

/** Rates for a base currency, resolved once per session per base currency. */
export const getRates = async (base: string): Promise<RateSnapshot> => {
  const key = base.trim().toUpperCase();
  const pending = snapshotCache.get(key);
  if (pending) return pending;

  const fetchRates = async (): Promise<RateSnapshot> => {
    // 1. Try Supabase edge function if deployed
    try {
      const { data, error } = await supabase.functions.invoke("fx-rates", {
        body: { base: key },
        headers: { "Content-Type": "application/json" },
      });
      if (!error && data && !data.error && data.rates && Object.keys(data.rates).length > 0) {
        return data as RateSnapshot;
      }
    } catch {
      // Edge function failed or not deployed; fallback directly to open.er-api.com
    }

    // 2. Direct upstream fallback
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${key}`);
      if (res.ok) {
        const payload = await res.json();
        if (payload?.result === "success" && payload.rates) {
          return {
            base: key,
            rates: { ...payload.rates, [key]: 1 },
            fetchedAt: new Date().toISOString(),
            source: "open.er-api.com",
            stale: false,
          };
        }
      }
    } catch {
      // Network failed
    }

    throw new RatesUnavailableError("exchange rates unavailable");
  };

  const request = fetchRates().catch((error: unknown) => {
    snapshotCache.delete(key);
    throw error instanceof RatesUnavailableError
      ? error
      : new RatesUnavailableError(String(error));
  });

  snapshotCache.set(key, request);
  return request;
};

export const forgetRates = (base?: string) => {
  if (base) snapshotCache.delete(base.trim().toUpperCase());
  else snapshotCache.clear();
};

export const fetchFXRate = async (base: string = "USD") => {
  const snapshot = await getRates(base);
  // Return a simple rate for display; if base matches snapshot base return 1
  if (snapshot.base === base) return { rate: 1 };
  // Prefer USD rate if available, otherwise first available rate
  const usdRate = snapshot.rates["USD"];
  const firstKey = Object.keys(snapshot.rates)[0];
  const rate = usdRate ?? (firstKey ? snapshot.rates[firstKey] : null);
  return { rate };
};

export const updateFXRate = async (base: string = "USD", target: string, rate: number) => {
  // Placeholder implementation – replace with real API call to update a specific rate.
  // Example: await supabase.functions.invoke('fx-update', { body: { base, target, rate } });
  console.log(`Updating ${target} rate for base ${base} to ${rate}`);
  // Invalidate cache if you want fresh data on next fetch.
  // For now we just assume success.
};


/**
 * Exchange rate to convert `from` into `to`. Returns `null` when the rate is
 * unknown, so callers can surface that instead of silently using 1.
 */
export const findRate = (
  snapshot: RateSnapshot | undefined,
  from: string,
  to: string,
): number | null => {
  const source = from.trim().toUpperCase();
  const target = to.trim().toUpperCase();

  if (source === target) return 1;
  if (!snapshot || snapshot.base !== target) return null;

  const rate = snapshot.rates[source];
  return typeof rate === "number" && rate > 0 ? rate : null;
};

export const convertAmount = (
  amount: number,
  rate: number,
  fractionDigits = 2,
): number => {
  const factor = 10 ** fractionDigits;
  return Math.round(amount * rate * factor) / factor;
};
