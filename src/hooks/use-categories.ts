import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth-context";
import type { CategoryRow, TransactionType } from "@/lib/finance";

export const CATEGORIES_KEY = "categories";

export const useCategories = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: [CATEGORIES_KEY, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<CategoryRow[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId!)
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const categories = query.data ?? [];

  return {
    categories,
    incomeCategories: categories.filter((item) => item.type === "income"),
    expenseCategories: categories.filter((item) => item.type === "expense"),
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export type CategoryInput = {
  name: string;
  type: TransactionType;
  color: string;
};

export const useCreateCategory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { error } = await supabase.from("categories").insert({
        user_id: user!.id,
        name: input.name.trim(),
        type: input.type,
        color: input.color,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CategoryInput & { id: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: input.name.trim(), type: input.type, color: input.color })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
};

/** Deleting a category leaves its transactions in place; they become uncategorized. */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
