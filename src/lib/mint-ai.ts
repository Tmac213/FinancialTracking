import type { TransactionRow, CategoryRow } from "@/lib/finance";
import type { WalletAccount } from "@/hooks/use-accounts";
import type { RecurringRule } from "@/hooks/use-recurring";
import type { SavingsGoal } from "@/hooks/use-goals";
import { CURRENCY_CODES } from "@/lib/currencies";

export type ParsedTransactionIntent = {
  type: "income" | "expense";
  amount: number;
  currency: string;
  category_id: string | null;
  categoryName?: string;
  wallet_id?: string | null;
  walletName?: string;
  description: string;
  occurred_on: string; // YYYY-MM-DD
  confidence: "high" | "medium" | "low";
  originalQuery: string;
};

export type MintAIMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  parsedTransaction?: ParsedTransactionIntent;
  suggestions?: string[];
  actionTaken?: "created" | "cancelled" | "pending";
};

// Common currency symbol and keyword matching
const CURRENCY_SYMBOLS: Record<string, string> = {
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
  "₺": "TRY",
  "د.إ": "AED",
  "AED": "AED",
  "SAR": "SAR",
  "ر.س": "SAR",
  "CAD": "CAD",
  "AUD": "AUD",
  "EGP": "EGP",
  "ج.م": "EGP",
  "QAR": "QAR",
  "KWD": "KWD",
  "CHF": "CHF",
  "CNY": "CNY",
};

/**
 * Extract intent to log a transaction from natural language.
 * Handles inputs like:
 * "Spent $15 on lunch at McDonald's using Cash Wallet"
 * "Paid 45 EUR for groceries via Bank Account"
 * "Received 2500 USD salary in Main Checking"
 * "Add expense 30 for coffee"
 * "+150 freelance income"
 */
export function parseNaturalLanguageTransaction(
  input: string,
  categories: CategoryRow[],
  accounts: WalletAccount[],
  baseCurrency: string
): ParsedTransactionIntent | null {
  const text = input.trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  // 1. Determine Transaction Type
  const incomeKeywords = [
    "received", "got", "income", "salary", "earned", "freelance", "dividend", 
    "bonus", "deposit", "sold", "refund", "reimbursement", "cashback", "+",
    "استلمت", "راتب", "دخل", "مكافأة", "إيداع"
  ];
  const expenseKeywords = [
    "spent", "paid", "bought", "buy", "expense", "cost", "purchased", "fee", 
    "bill", "rent", "order", "sub", "subscription", "-",
    "صرفت", "دفعت", "اشتريت", "مصروف", "فاتورة"
  ];

  let type: "income" | "expense" = "expense";
  if (incomeKeywords.some((kw) => lower.includes(kw))) {
    type = "income";
  } else if (expenseKeywords.some((kw) => lower.includes(kw))) {
    type = "expense";
  }

  // 2. Extract Amount
  // Matches "$15", "15$", "15.50", "15,50", "45 EUR", "€ 45", "100"
  const amountRegex = /(?:(\$|€|£|¥|₹|₺|AED|SAR|CAD|AUD|EGP|QAR|KWD|CHF|CNY)\s*)?([0-9]+(?:[.,][0-9]{1,2})?)\s*(k|thousand)?\s*(\$|€|£|¥|₹|₺|AED|SAR|CAD|AUD|EGP|QAR|KWD|CHF|CNY|[A-Z]{3})?/i;
  const amountMatch = text.match(amountRegex);

  if (!amountMatch) {
    return null; // Cannot parse without at least an amount
  }

  let rawNum = parseFloat(amountMatch[2].replace(",", "."));
  if (isNaN(rawNum) || rawNum <= 0) return null;

  if (amountMatch[3]?.toLowerCase() === "k" || amountMatch[3]?.toLowerCase() === "thousand") {
    rawNum *= 1000;
  }
  const amount = Math.round(rawNum * 100) / 100;

  // 3. Extract Currency
  let currency = baseCurrency.toUpperCase();
  const prefixSym = amountMatch[1];
  const suffixSym = amountMatch[4];
  const foundSymbol = prefixSym || suffixSym;

  if (foundSymbol) {
    const symUpper = foundSymbol.toUpperCase();
    if (CURRENCY_SYMBOLS[symUpper]) {
      currency = CURRENCY_SYMBOLS[symUpper];
    } else if (CURRENCY_CODES.includes(symUpper as any)) {
      currency = symUpper;
    }
  } else {
    // Check if any currency code exists anywhere in words
    const words = text.split(/\s+/);
    for (const w of words) {
      const cleanW = w.toUpperCase().replace(/[^A-Z]/g, "");
      if (cleanW.length === 3 && CURRENCY_CODES.includes(cleanW as any)) {
        currency = cleanW;
        break;
      }
    }
  }

  // 4. Match Wallet / Account
  let matchedWallet: WalletAccount | null = null;
  for (const acc of accounts) {
    const accName = acc.name.toLowerCase();
    if (lower.includes(accName)) {
      matchedWallet = acc;
      break;
    }
  }

  if (!matchedWallet) {
    // Check wallet type mentions like "cash", "pocket", "bank", "credit card", "savings"
    if (lower.includes("cash") || lower.includes("pocket") || lower.includes("نقدا") || lower.includes("كاش")) {
      matchedWallet = accounts.find((a) => a.isDefaultCash || a.type === "cash") || null;
    } else if (lower.includes("bank") || lower.includes("checking") || lower.includes("بنك")) {
      matchedWallet = accounts.find((a) => a.type === "bank") || null;
    } else if (lower.includes("card") || lower.includes("credit") || lower.includes("بطاقة")) {
      matchedWallet = accounts.find((a) => a.type === "credit") || null;
    } else if (lower.includes("saving") || lower.includes("vault") || lower.includes("ادخار")) {
      matchedWallet = accounts.find((a) => a.type === "savings") || null;
    }
  }

  // Default to primary cash or first account if none matched
  if (!matchedWallet && accounts.length > 0) {
    matchedWallet = accounts.find((a) => a.isDefaultCash) || accounts[0];
  }

  // 5. Match Category
  const typeCategories = categories.filter((c) => c.type === type);
  let matchedCategory: CategoryRow | null = null;

  // Direct match by name
  for (const cat of typeCategories) {
    if (lower.includes(cat.name.toLowerCase())) {
      matchedCategory = cat;
      break;
    }
  }

  // Heuristic match for common categories
  if (!matchedCategory) {
    const categoryKeywords: Record<string, string[]> = {
      food: ["lunch", "dinner", "breakfast", "burger", "mcdonald", "coffee", "starbucks", "meal", "restaurant", "food", "snack", "groceries", "supermarket", "مطعم", "غداء", "عشاء", "قهوة", "اكل"],
      shopping: ["amazon", "clothes", "shoes", "mall", "shopping", "store", "تسوق", "ملابس"],
      transport: ["uber", "taxi", "gas", "fuel", "metro", "subway", "train", "flight", "bus", "بنزين", "تاكسي", "مواصلات"],
      housing: ["rent", "electricity", "water", "internet", "utility", "maintenance", "إيجار", "كهرباء", "انترنت"],
      entertainment: ["cinema", "movie", "game", "steam", "playstation", "netflix", "spotify", "concert", "ترفيه", "سينما", "ألعاب"],
      health: ["doctor", "pharmacy", "medicine", "hospital", "gym", "workout", "صيدلية", "دواء", "طبيب", "جيم"],
      salary: ["salary", "payroll", "employer", "راتب"],
      freelance: ["freelance", "client", "gig", "contract", "عمل حر", "مشروع"],
    };

    for (const cat of typeCategories) {
      const catLower = cat.name.toLowerCase();
      for (const [key, kws] of Object.entries(categoryKeywords)) {
        if (catLower.includes(key)) {
          if (kws.some((kw) => lower.includes(kw))) {
            matchedCategory = cat;
            break;
          }
        }
      }
      if (matchedCategory) break;
    }
  }

  // 6. Build Clean Description
  // Clean off "spent $15 on", "paid 20 for", etc.
  let description = text;
  const prefixes = [
    /^(?:spent|paid|bought|add|log|record|put|received|got)\s+(?:[\$€£¥₹₺]?\s*[0-9]+(?:[.,][0-9]{1,2})?\s*[a-zA-Z]*)\s+(?:on|for|in|from|at)\s+/i,
    /^(?:spent|paid|bought|received|got)\s+/i,
  ];
  for (const regex of prefixes) {
    if (regex.test(description)) {
      description = description.replace(regex, "");
      break;
    }
  }

  // Remove "using Cash Wallet" or "via Bank Account" from the note if extracted
  if (matchedWallet) {
    description = description.replace(new RegExp(`(?:using|with|via|from|to|into)\\s+${matchedWallet.name}`, "i"), "");
    description = description.replace(/(?:using|with|via)\s+(?:cash|bank|card|savings)\s*(?:wallet|account)?/i, "");
  }

  description = description.trim();
  if (!description) {
    description = matchedCategory ? matchedCategory.name : (type === "income" ? "Income" : "Expense");
  }

  // Capitalize first letter of description
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    type,
    amount,
    currency,
    category_id: matchedCategory ? matchedCategory.id : (typeCategories[0]?.id || null),
    categoryName: matchedCategory?.name || typeCategories[0]?.name,
    wallet_id: matchedWallet?.id || null,
    walletName: matchedWallet?.name,
    description,
    occurred_on: new Date().toISOString().slice(0, 10),
    confidence: matchedCategory ? "high" : "medium",
    originalQuery: input,
  };
}

export type FinancialInsightResponse = {
  isQuery: boolean;
  reply: string;
  suggestions?: string[];
};

/**
 * Handle conversational Q&A, spending insights, budget checks, and financial warnings.
 */
export function answerFinancialQuery(
  input: string,
  transactions: TransactionRow[],
  categories: CategoryRow[],
  accounts: WalletAccount[],
  recurring: RecurringRule[],
  goals: SavingsGoal[],
  budgets: Record<string, number>,
  baseCurrency: string
): FinancialInsightResponse {
  const query = input.toLowerCase().trim();

  // 1. Check if user is asking about spending in a specific category
  // e.g., "How much did I spend on Entertainment this month?" or "food expenses"
  for (const cat of categories) {
    const catNameLower = cat.name.toLowerCase();
    if (query.includes(catNameLower) && (query.includes("how much") || query.includes("spend") || query.includes("cost") || query.includes("total") || query.includes("کم") || query.includes("صرفت"))) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const catTxs = transactions.filter(
        (t) => t.category_id === cat.id && t.occurred_on.startsWith(currentMonthKey)
      );

      const totalSpent = catTxs.reduce((sum, t) => sum + (Number(t.amount_base) || 0), 0);
      const budgetLimit = budgets[cat.id] || 0;

      let msg = `You have spent **${totalSpent.toFixed(2)} ${baseCurrency}** on **${cat.name}** this month across ${catTxs.length} transaction${catTxs.length === 1 ? "" : "s"}.`;

      if (budgetLimit > 0) {
        const pct = Math.round((totalSpent / budgetLimit) * 100);
        if (pct >= 100) {
          msg += ` ⚠️ **Warning:** You have exceeded your budget of ${budgetLimit.toFixed(2)} ${baseCurrency} by ${(totalSpent - budgetLimit).toFixed(2)} ${baseCurrency} (${pct}%).`;
        } else {
          msg += ` You have used **${pct}%** of your ${budgetLimit.toFixed(2)} ${baseCurrency} budget (${(budgetLimit - totalSpent).toFixed(2)} ${baseCurrency} remaining).`;
        }
      }

      return {
        isQuery: true,
        reply: msg,
        suggestions: [
          `Show all transactions for ${cat.name}`,
          `What are my top expenses this month?`,
          `How much did I save this month?`
        ],
      };
    }
  }

  // 2. Month comparison: "Compare my expenses between September and October" or "compare months"
  if (query.includes("compare") || query.includes("vs") || query.includes("مقارنة")) {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const thisMonthExpense = transactions
      .filter((t) => t.type === "expense" && t.occurred_on.startsWith(thisMonthKey))
      .reduce((sum, t) => sum + (Number(t.amount_base) || 0), 0);

    const lastMonthExpense = transactions
      .filter((t) => t.type === "expense" && t.occurred_on.startsWith(lastMonthKey))
      .reduce((sum, t) => sum + (Number(t.amount_base) || 0), 0);

    const diff = thisMonthExpense - lastMonthExpense;
    const diffPct = lastMonthExpense > 0 ? Math.round((Math.abs(diff) / lastMonthExpense) * 100) : 0;

    let reply = `📊 **Monthly Spending Comparison:**\n\n`;
    reply += `• **This Month (${thisMonthKey}):** ${thisMonthExpense.toFixed(2)} ${baseCurrency}\n`;
    reply += `• **Last Month (${lastMonthKey}):** ${lastMonthExpense.toFixed(2)} ${baseCurrency}\n\n`;

    if (diff > 0) {
      reply += `⚠️ Your spending is **up by ${diff.toFixed(2)} ${baseCurrency} (+${diffPct}%)** compared to last month. Watch out for discretionary purchases!`;
    } else if (diff < 0) {
      reply += `🎉 Great job! Your spending is **down by ${Math.abs(diff).toFixed(2)} ${baseCurrency} (-${diffPct}%)** compared to last month!`;
    } else {
      reply += `Your spending is exactly on par with last month.`;
    }

    return {
      isQuery: true,
      reply,
      suggestions: ["What are my top expenses?", "Check my budget status", "How are my savings goals?"]
    };
  }

  // 3. Overall financial health / summary / advice
  if (query.includes("advice") || query.includes("health") || query.includes("status") || query.includes("summary") || query.includes("overview") || query.includes("نصيحة") || query.includes("وضع")) {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthIncome = transactions
      .filter((t) => t.type === "income" && t.occurred_on.startsWith(thisMonthKey))
      .reduce((sum, t) => sum + (Number(t.amount_base) || 0), 0);

    const monthExpense = transactions
      .filter((t) => t.type === "expense" && t.occurred_on.startsWith(thisMonthKey))
      .reduce((sum, t) => sum + (Number(t.amount_base) || 0), 0);

    const net = monthIncome - monthExpense;
    const savingsRate = monthIncome > 0 ? Math.round((net / monthIncome) * 100) : 0;

    const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

    let advice = `💡 **Financial Health Snapshot (This Month):**\n\n`;
    advice += `• **Income:** +${monthIncome.toFixed(2)} ${baseCurrency}\n`;
    advice += `• **Expenses:** -${monthExpense.toFixed(2)} ${baseCurrency}\n`;
    advice += `• **Net Cash Flow:** ${net >= 0 ? "+" : ""}${net.toFixed(2)} ${baseCurrency}\n`;
    advice += `• **Savings Rate:** ${savingsRate}%\n`;
    advice += `• **Total Liquid Balances:** ${totalNetWorth.toFixed(2)} ${baseCurrency}\n\n`;

    if (savingsRate >= 20) {
      advice += `🌟 **Health Rating: Excellent!** You are saving ${savingsRate}% of your income, comfortably exceeding the 20% rule. Consider putting extra funds into your savings goals.`;
    } else if (savingsRate > 0) {
      advice += `⚖️ **Health Rating: Good.** You have a positive cash flow (${savingsRate}% saved). Try reducing non-essential expenses to reach the 20% savings target.`;
    } else {
      advice += `🚨 **Health Rating: Warning.** Your expenses match or exceed your income this month. Check your subscriptions and category budgets to cut unnecessary outflow.`;
    }

    return {
      isQuery: true,
      reply: advice,
      suggestions: [
        "Upcoming subscriptions",
        "Show my savings goals",
        "What is my daily average spending?"
      ]
    };
  }

  // 4. Subscriptions & recurring queries
  if (query.includes("subscription") || query.includes("recurring") || query.includes("bills") || query.includes("اشتراكات") || query.includes("فواتير")) {
    const activeRules = recurring.filter((r) => r.active);
    const totalMonthlySubs = activeRules.reduce((sum, r) => {
      let monthly = r.amount;
      if (r.cycle === "weekly") monthly *= 4.33;
      if (r.cycle === "yearly") monthly /= 12;
      return sum + monthly;
    }, 0);

    let reply = `📅 You have **${activeRules.length} active recurring commitments** costing approx **~${totalMonthlySubs.toFixed(2)} ${baseCurrency}/month**.\n\n`;
    activeRules.slice(0, 5).forEach((r) => {
      reply += `• **${r.name}:** ${r.amount} ${r.currency} (${r.cycle}, due ${r.nextDueDate})\n`;
    });

    return {
      isQuery: true,
      reply,
      suggestions: ["Log recurring bill now", "Check my budget status"]
    };
  }

  // 5. Goals query
  if (query.includes("goal") || query.includes("savings") || query.includes("bucket") || query.includes("أهداف") || query.includes("ادخار")) {
    if (goals.length === 0) {
      return {
        isQuery: true,
        reply: "You don't have any savings goals set up yet. Go to the Money Tracker -> Goals tab to create your first goal!",
        suggestions: ["Give me financial advice", "How much did I spend this month?"]
      };
    }

    let reply = `🎯 **Your Savings Goals Progress:**\n\n`;
    goals.forEach((g) => {
      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      reply += `• **${g.name}:** ${g.currentAmount} / ${g.targetAmount} ${g.currency} (**${pct}%**)${pct >= 100 ? " ✅ Complete!" : ""}\n`;
    });

    return {
      isQuery: true,
      reply,
      suggestions: ["How much can I save this month?", "Financial health status"]
    };
  }

  // 6. Wallets / Accounts query
  if (query.includes("wallet") || query.includes("account") || query.includes("balance") || query.includes("حساب") || query.includes("رصيد")) {
    let reply = `💳 **Accounts & Balances Overview:**\n\n`;
    accounts.forEach((acc) => {
      reply += `• **${acc.name}** (${acc.type}): **${acc.balance.toFixed(2)} ${acc.currency}**\n`;
    });

    const total = accounts.reduce((sum, a) => sum + a.balance, 0);
    reply += `\n**Total Assets:** ${total.toFixed(2)} ${baseCurrency}`;

    return {
      isQuery: true,
      reply,
      suggestions: ["How much did I spend this month?", "Give me financial advice"]
    };
  }

  // Default fallback guidance
  return {
    isQuery: false,
    reply: "I couldn't quite identify an exact transaction or query. Try asking something like:\n• *'Spent $15 on lunch using Cash Wallet'*\n• *'How much did I spend on Food this month?'*\n• *'Compare my spending with last month'*\n• *'How are my savings goals doing?'*",
    suggestions: [
      "Spent $12 on coffee at Starbucks",
      "How much did I spend this month?",
      "Financial health advice",
      "Check my recurring subscriptions"
    ]
  };
}
