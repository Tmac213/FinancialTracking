// Returns currency exchange rates for a base currency.
//
// Response shape:
//   { base, rates: { [CODE]: number }, fetchedAt, source, stale, cached }
//
// Rates are cached in public.exchange_rates and refreshed when older than the TTL.
// When the upstream provider is unreachable the last cached snapshot is returned
// with `stale: true`; when there is no snapshot at all `rates` is empty and the
// client falls back to a manually entered rate.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const UPSTREAM_URL = "https://open.er-api.com/v6/latest";
const CODE_PATTERN = /^[A-Z]{3}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let rawBase = new URL(req.url).searchParams.get("base") ?? "";

    if (!rawBase && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { base?: string };
      rawBase = body.base ?? "";
    }

    const base = rawBase.trim().toUpperCase();
    if (!CODE_PATTERN.test(base)) {
      return json({ error: "base must be a 3-letter currency code" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("fx-rates: missing backend connection environment");
      return json({ error: "backend not configured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: cached, error: readError } = await admin
      .from("exchange_rates")
      .select("base_currency, rates, fetched_at, source")
      .eq("base_currency", base)
      .maybeSingle();

    if (readError) {
      console.error("fx-rates: cache read failed", readError.message);
    }

    const fetchedAt = cached ? new Date(cached.fetched_at).getTime() : 0;
    const isFresh = cached ? Date.now() - fetchedAt < CACHE_TTL_MS : false;

    if (cached && isFresh) {
      return json({
        base,
        rates: cached.rates,
        fetchedAt: cached.fetched_at,
        source: cached.source,
        stale: false,
        cached: true,
      });
    }

    let rates: Record<string, number> | null = null;

    try {
      const response = await fetch(`${UPSTREAM_URL}/${base}`, {
        headers: { accept: "application/json" },
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          result?: string;
          rates?: Record<string, number>;
          "error-type"?: string;
        };

        if (payload?.result === "success" && payload.rates) {
          rates = { ...payload.rates, [base]: 1 };
        } else {
          console.error("fx-rates: upstream rejected", payload?.["error-type"]);
        }
      } else {
        console.error("fx-rates: upstream status", response.status);
      }
    } catch (error) {
      console.error("fx-rates: upstream request failed", String(error));
    }

    if (rates) {
      const now = new Date().toISOString();
      const { error: writeError } = await admin
        .from("exchange_rates")
        .upsert(
          {
            base_currency: base,
            rates,
            fetched_at: now,
            source: "open.er-api.com",
          },
          { onConflict: "base_currency" },
        );

      if (writeError) {
        console.error("fx-rates: cache write failed", writeError.message);
      }

      return json({
        base,
        rates,
        fetchedAt: now,
        source: "open.er-api.com",
        stale: false,
        cached: false,
      });
    }

    if (cached) {
      return json({
        base,
        rates: cached.rates,
        fetchedAt: cached.fetched_at,
        source: cached.source,
        stale: true,
        cached: true,
      });
    }

    return json({
      base,
      rates: {},
      fetchedAt: null,
      source: "unavailable",
      stale: true,
      cached: false,
    });
  } catch (error) {
    console.error("fx-rates: unhandled error", String(error));
    return json({ error: "unexpected error" }, 500);
  }
});
