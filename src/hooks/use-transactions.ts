import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth-context";
import type { TransactionRow, TransactionType } from "@/lib/finance";

export const TRANSACTIONS_KEY = "transactions";

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

/**
 * PostgREST caps a response at 1000 rows, so the ledger is read page by page.
 * Without this the dashboard totals would silently miss older transactions.
 */
const fetchAllTransactions = async (userId: string): Promise<TransactionRow[]> => {
  const rows: TransactionRow[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);

    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
};

export const useTransactions = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: [TRANSACTIONS_KEY, userId],
    enabled: Boolean(userId),
    queryFn: () => fetchAllTransactions(userId!),
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export type TransactionInput = {
  type: TransactionType;
  amount: number;
  currency: string;
  exchange_rate: number;
  category_id: string | null;
  description: string;
  occurred_on: string;
};

export const useCreateTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TransactionInput) => {
      const { error } = await supabase.from("transactions").insert({
        ...input,
        user_id: user!.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: TransactionInput & { id: string }) => {
      const { error } = await supabase
        .from("transactions")
        .update(input)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
    },
  });
};
