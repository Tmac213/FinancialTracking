import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "@/pages/transactions/TransactionsFormDialog";
import { useCategories } from "@/hooks/use-categories";
import { useProfile } from "@/hooks/use-profile";
import { useRates } from "@/hooks/use-rates";
import { useTranslation } from "react-i18next";

export type GlobalQuickAddFABProps = {
  onOpenMintAi?: () => void;
};

export const GlobalQuickAddFAB = ({ onOpenMintAi }: GlobalQuickAddFABProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { baseCurrency } = useProfile();
  const { categories } = useCategories();
  const { snapshot, unavailable } = useRates(baseCurrency);

  return (
    <>
      <div className="fixed bottom-6 end-6 z-40 print:hidden flex items-center gap-3">
        {onOpenMintAi && (
          <Button
            onClick={onOpenMintAi}
            size="lg"
            variant="outline"
            className="group flex h-14 items-center gap-2 rounded-full px-4 border-primary/40 bg-background/90 backdrop-blur shadow-xl hover:scale-105 hover:border-primary transition-all duration-300"
            aria-label="Mint AI Assistant"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-4 animate-pulse text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground hidden md:inline">
              Mint AI
            </span>
          </Button>
        )}

        <Button
          onClick={() => setOpen(true)}
          size="lg"
          variant="hero"
          className="group flex h-14 items-center gap-2.5 rounded-full px-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-elegant"
          aria-label={t("transactions.add")}
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform group-hover:rotate-90">
            <Plus className="size-5" />
          </div>
          <span className="font-semibold tracking-wide text-sm text-white hidden sm:inline">
            {t("transactions.add")}
          </span>
        </Button>
      </div>

      <TransactionFormDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        baseCurrency={baseCurrency}
        snapshot={snapshot}
        ratesUnavailable={unavailable}
        defaultType="expense"
      />
    </>
  );
};
