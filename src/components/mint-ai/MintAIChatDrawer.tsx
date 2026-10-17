import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Wallet,
  TrendingDown,
  TrendingUp,
  Tag,
  Calendar,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  parseNaturalLanguageTransaction,
  answerFinancialQuery,
  type MintAIMessage,
  type ParsedTransactionIntent,
} from "@/lib/mint-ai";
import { useTransactions, useCreateTransaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useProfile } from "@/hooks/use-profile";
import { useRecurring } from "@/hooks/use-recurring";
import { useGoals } from "@/hooks/use-goals";
import { findRate } from "@/lib/fx";
import { useRates } from "@/hooks/use-rates";

type MintAIChatDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MintAIChatDrawer = ({ open, onOpenChange }: MintAIChatDrawerProps) => {
  const { t } = useTranslation();
  const { baseCurrency } = useProfile();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { accounts, updateAccount } = useAccounts();
  const { rules: recurring } = useRecurring();
  const { goals } = useGoals();
  const { snapshot } = useRates(baseCurrency);
  const createTransaction = useCreateTransaction();

  // Load budgets from localStorage (same key used in CategoryBudgetCard)
  const [budgets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("mint_mosaic_category_budgets");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<MintAIMessage[]>(() => [
    {
      id: "welcome",
      sender: "assistant",
      text: "👋 Hi! I'm **Mint AI**, your intelligent financial co-pilot.\n\nYou can log transactions in plain English or Arabic (e.g., *'Spent $15 on lunch at McDonald\\'s using Cash Wallet'*), or ask me anything about your spending, budget alerts, and goals!",
      timestamp: new Date().toISOString(),
      suggestions: [
        "Spent $15 on lunch at McDonald's using Cash Wallet",
        "How much did I spend on Food this month?",
        "Compare spending with last month",
        "Financial health summary",
      ],
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Voice recognition setup if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error(t("mintAi.voiceNotSupported") || "Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = (userText?: string) => {
    const textToSend = (userText ?? input).trim();
    if (!textToSend) return;

    const userMsg: MintAIMessage = {
      id: "msg_" + Date.now().toString(36),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput("");

    // 1. First, check if input looks like a question or conversational query
    const lower = textToSend.toLowerCase();
    const isQuestion =
      textToSend.includes("?") ||
      lower.startsWith("how") ||
      lower.startsWith("what") ||
      lower.startsWith("compare") ||
      lower.startsWith("check") ||
      lower.startsWith("show") ||
      lower.startsWith("give") ||
      lower.includes("advice") ||
      lower.includes("health") ||
      lower.includes("هل") ||
      lower.includes("كم") ||
      lower.includes("ما هو") ||
      lower.includes("مقارنة");

    if (isQuestion) {
      const queryResult = answerFinancialQuery(
        textToSend,
        transactions,
        categories,
        accounts,
        recurring,
        goals,
        budgets,
        baseCurrency
      );
      setMessages((prev) => [
        ...prev,
        {
          id: "bot_" + Date.now().toString(36),
          sender: "assistant",
          text: queryResult.reply,
          timestamp: new Date().toISOString(),
          suggestions: queryResult.suggestions,
        },
      ]);
      return;
    }

    // 2. Otherwise, attempt to parse natural language transaction
    const parsed = parseNaturalLanguageTransaction(
      textToSend,
      categories,
      accounts,
      baseCurrency
    );

    if (parsed) {
      const botMsg: MintAIMessage = {
        id: "bot_" + Date.now().toString(36),
        sender: "assistant",
        text: `I've prepared this **${parsed.type.toUpperCase()}** entry for you. Review the details below and click **Confirm & Log** to record it immediately:`,
        timestamp: new Date().toISOString(),
        parsedTransaction: parsed,
        actionTaken: "pending",
      };
      setMessages((prev) => [...prev, botMsg]);
    } else {
      // Fallback query responder
      const fallbackResult = answerFinancialQuery(
        textToSend,
        transactions,
        categories,
        accounts,
        recurring,
        goals,
        budgets,
        baseCurrency
      );
      setMessages((prev) => [
        ...prev,
        {
          id: "bot_" + Date.now().toString(36),
          sender: "assistant",
          text: fallbackResult.reply,
          timestamp: new Date().toISOString(),
          suggestions: fallbackResult.suggestions,
        },
      ]);
    }
  };

  const handleConfirmTransaction = async (msgId: string, intent: ParsedTransactionIntent) => {
    try {
      // Find exchange rate
      const rate = findRate(snapshot, intent.currency, baseCurrency) ?? 1;

      await createTransaction.mutateAsync({
        type: intent.type,
        amount: intent.amount,
        currency: intent.currency,
        exchange_rate: rate,
        category_id: intent.category_id,
        description: intent.description,
        occurred_on: intent.occurred_on,
      });

      // If a wallet was matched, update its balance
      if (intent.wallet_id) {
        const wallet = accounts.find((a) => a.id === intent.wallet_id);
        if (wallet) {
          const delta = intent.type === "income" ? intent.amount : -intent.amount;
          updateAccount(wallet.id, { balance: wallet.balance + delta });
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, actionTaken: "created" } : m
        )
      );

      toast.success(
        `Logged ${intent.amount} ${intent.currency} ${intent.type} (${intent.description})!`
      );
    } catch (err: any) {
      toast.error(`Failed to record transaction: ${err.message}`);
    }
  };

  const handleCancelIntent = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, actionTaken: "cancelled" } : m
      )
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md lg:max-w-lg border-l border-border/80 shadow-2xl backdrop-blur-xl bg-background/95"
      >
        <SheetHeader className="border-b border-border/70 p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <Sparkles className="size-5 animate-pulse" />
            </div>
            <div className="flex-1 text-left rtl:text-right">
              <SheetTitle className="text-lg font-bold flex items-center gap-2">
                Mint AI
                <Badge variant="glow" className="text-[10px] uppercase font-semibold">
                  Assistant
                </Badge>
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Natural language logger, budget insights & financial advice
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-sm ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {isUser ? <User className="size-4" /> : <Bot className="size-4 text-primary" />}
                </div>

                <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/70 text-foreground border border-border/60 rounded-bl-none whitespace-pre-wrap"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Transaction confirmation card */}
                  {m.parsedTransaction && (
                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-md space-y-3">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Parsed Transaction
                        </span>
                        <Badge
                          variant={m.parsedTransaction.type === "income" ? "glow" : "outline"}
                          className={m.parsedTransaction.type === "income" ? "text-emerald-500" : "text-rose-500"}
                        >
                          {m.parsedTransaction.type.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <TrendingUp className="size-3.5" />
                          <span>Amount:</span>
                        </div>
                        <span className="font-bold text-foreground numeric text-right rtl:text-left">
                          {m.parsedTransaction.amount.toFixed(2)} {m.parsedTransaction.currency}
                        </span>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Tag className="size-3.5" />
                          <span>Category:</span>
                        </div>
                        <span className="font-medium text-foreground text-right rtl:text-left">
                          {m.parsedTransaction.categoryName || "Uncategorized"}
                        </span>

                        {m.parsedTransaction.walletName && (
                          <>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Wallet className="size-3.5" />
                              <span>Wallet:</span>
                            </div>
                            <span className="font-medium text-foreground text-right rtl:text-left">
                              {m.parsedTransaction.walletName}
                            </span>
                          </>
                        )}

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>Description:</span>
                        </div>
                        <span className="font-medium text-foreground truncate text-right rtl:text-left">
                          {m.parsedTransaction.description}
                        </span>
                      </div>

                      {m.actionTaken === "pending" && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            onClick={() => handleConfirmTransaction(m.id, m.parsedTransaction!)}
                            disabled={createTransaction.isPending}
                          >
                            <CheckCircle2 className="size-4" />
                            Confirm & Log
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelIntent(m.id)}
                            disabled={createTransaction.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {m.actionTaken === "created" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="size-4" />
                          Successfully logged to your ledger & wallet!
                        </div>
                      )}

                      {m.actionTaken === "cancelled" && (
                        <div className="text-xs text-muted-foreground italic">
                          Transaction entry cancelled.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="rounded-full border border-border/80 bg-background/80 hover:bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border/70 p-3 sm:p-4 bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className="size-10 shrink-0 rounded-full"
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Speak (Voice input)"}
            >
              {isListening ? (
                <MicOff className="size-4 animate-bounce" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g. Spent $25 on groceries using Cash..."
              className="h-10 flex-1 rounded-full px-4 text-sm focus-visible:ring-1"
            />

            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0 rounded-full bg-gradient-primary text-white shadow-md hover:scale-105 transition-all"
              disabled={!input.trim()}
            >
              <Send className="size-4" />
            </Button>
          </form>
          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            Mint AI parses amounts, categories & wallets in real time.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
