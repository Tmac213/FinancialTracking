import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Money, type MoneyTone } from "@/components/money";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  icon: LucideIcon;
  tone?: MoneyTone;
  /** Percent change against the previous period; `null` when there is no baseline. */
  delta?: number | null;
  hint?: string;
  /** Higher deltas are good for income and net, bad for expenses. */
  positiveIsGood?: boolean;
  className?: string;
  style?: React.CSSProperties;
} & (
  | { amount: number; currency: string; value?: never }
  | { value: ReactNode; amount?: never; currency?: never }
);

export const StatCard = ({
  label,
  icon: Icon,
  tone = "default",
  delta = null,
  hint,
  positiveIsGood = true,
  amount,
  currency,
  value,
  className,
  style,
}: StatCardProps) => {
  const hasDelta = delta !== null && Number.isFinite(delta);
  const rising = hasDelta && delta! > 0;
  const flat = hasDelta && delta === 0;
  const good = hasDelta && !flat && rising === positiveIsGood;

  const DeltaIcon = flat ? Minus : rising ? ArrowUpRight : ArrowDownRight;

  return (
    <Card
      variant="elevated"
      className={cn(
        "animate-fade-in-up overflow-hidden transition-all duration-300 ease-smooth hover:border-primary/30 hover:shadow-elegant",
        className,
      )}
      style={style}
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              tone === "income" && "bg-income/12 text-income",
              tone === "expense" && "bg-expense/12 text-expense",
              tone === "muted" && "bg-muted text-muted-foreground",
              tone === "default" && "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>

        {value ?? (
          <Money
            amount={amount ?? 0}
            currency={currency ?? "USD"}
            tone={tone}
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          />
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {hasDelta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold numeric",
                flat && "bg-muted text-muted-foreground",
                !flat && good && "bg-income/12 text-income",
                !flat && !good && "bg-expense/12 text-expense",
              )}
            >
              <DeltaIcon className="size-3" aria-hidden="true" />
              {Math.abs(delta!).toFixed(1)}%
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
              --
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
