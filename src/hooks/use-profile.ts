import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth-context";
import type { ProfileRow } from "@/lib/finance";

const PROFILE_KEY = "profile";

/** The signed-in user's profile row, including the account base currency. */
export const useProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: [PROFILE_KEY, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    },
  });

  return {
    profile: query.data ?? null,
    baseCurrency: query.data?.base_currency ?? "USD",
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<Pick<ProfileRow, "display_name" | "base_currency">>) => {
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user!.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
    },
  });
};
