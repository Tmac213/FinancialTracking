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
  "元": "CNY",
  "円": "JPY",
  "₩": "KRW",
  "฿": "THB",
  "₫": "VND",
  "₽": "RUB",
};

/** Multilingual keywords dictionary for intent detection */
const MULTILINGUAL_KEYWORDS = {
  income: [
    // English
    "received", "got", "income", "salary", "earned", "freelance", "dividend", "bonus", "deposit", "sold", "refund", "reimbursement", "cashback", "+",
    // Arabic
    "استلمت", "راتب", "دخل", "مكافأة", "إيداع", "قبضت", "حصلت", "ربح",
    // Chinese (Simplified & Traditional)
    "收入", "工资", "薪水", "收到", "入账", "挣", "赚", "存入", "奖金", "分红", "退款", "報銷", "薪資",
    // Spanish
    "recibido", "ingreso", "salario", "sueldo", "gané", "ganado", "depósito", "bono", "cobrado",
    // French
    "reçu", "revenu", "salaire", "gagné", "dépôt", "prime", "virement",
    // German
    "erhalten", "einkommen", "gehalt", "verdient", "einzahlung", "bonus",
    // Japanese
    "収入", "給料", "もらった", "稼いだ", "入金", "ボーナス",
    // Turkish
    "gelir", "maaş", "aldım", "kazandım", "yattı", "prim",
    // Vietnamese
    "thu nhập", "lương", "nhận được", "tiền vào",
  ],
  expense: [
    // English
    "spent", "paid", "bought", "buy", "expense", "cost", "purchased", "fee", "bill", "rent", "order", "sub", "subscription", "-",
    // Arabic
    "صرفت", "دفعت", "اشتريت", "مصروف", "فاتورة", "ايجار", "اشتراك", "شراء",
    // Chinese
    "支出", "花", "买了", "支付", "消费", "付了", "扣款", "账单", "费用", "開銷", "買了",
    // Spanish
    "gasté", "gastado", "pagué", "pagado", "compré", "gasto", "factura", "costó",
    // French
    "dépensé", "payé", "acheté", "dépense", "coût", "facture",
    // German
    "ausgegeben", "bezahlt", "gekauft", "ausgabe", "rechnung", "kosten",
    // Japanese
    "支出", "払った", "買った", "使った", "費用",
    // Turkish
    "harcadım", "ödedim", "aldım", "masraf", "gider", "fatura",
    // Vietnamese
    "chi tiêu", "trả", "mua", "hóa đơn", "chi",
  ],
  walletCash: ["cash", "pocket", "نقدا", "كاش", "现金", "現金", "efectivo", "espèces", "bargeld", "nakit", "tiền mặt"],
  walletBank: ["bank", "checking", "account", "بنك", "حساب", "银行", "銀行", "banco", "banque", "bankkonto", "ngân hàng"],
  walletCard: ["card", "credit", "بطاقة", "فيزا", "卡", "信用卡", "tarjeta", "carte", "karte", "kredi kartı", "thẻ"],
  walletSavings: ["saving", "vault", "ادخار", "储蓄", "儲蓄", "ahorro", "épargne", "sparen", "birikim", "tiết kiệm"],
};

/**
 * Extract intent to log a transaction from natural language in any supported language.
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
  let type: "income" | "expense" = "expense";
  if (MULTILINGUAL_KEYWORDS.income.some((kw) => lower.includes(kw))) {
    type = "income";
  } else if (MULTILINGUAL_KEYWORDS.expense.some((kw) => lower.includes(kw))) {
    type = "expense";
  }

  // 2. Extract Amount
  // Matches "$15", "15$", "15.50", "15,50", "45 EUR", "€ 45", "100", "١٥", "1500"
  const amountRegex = /(?:(\$|€|£|¥|₹|₺|AED|SAR|CAD|AUD|EGP|QAR|KWD|CHF|CNY|元|円|₩|฿|₫|₽)\s*)?([0-9]+(?:[.,][0-9]{1,2})?)\s*(k|thousand|千|万)?\s*(\$|€|£|¥|₹|₺|AED|SAR|CAD|AUD|EGP|QAR|KWD|CHF|CNY|元|円|₩|฿|₫|₽|[A-Z]{3})?/i;
  const amountMatch = text.match(amountRegex);

  if (!amountMatch) {
    return null; // Cannot parse without at least an amount
  }

  let rawNum = parseFloat(amountMatch[2].replace(",", "."));
  if (isNaN(rawNum) || rawNum <= 0) return null;

  if (amountMatch[3]?.toLowerCase() === "k" || amountMatch[3]?.toLowerCase() === "thousand" || amountMatch[3] === "千") {
    rawNum *= 1000;
  } else if (amountMatch[3] === "万") {
    rawNum *= 10000;
  }
  const amount = Math.round(rawNum * 100) / 100;

  // 3. Extract Currency
  let currency = baseCurrency.toUpperCase();
  const prefixSym = amountMatch[1];
  const suffixSym = amountMatch[4];
  const foundSymbol = prefixSym || suffixSym;

  if (foundSymbol) {
    const symUpper = foundSymbol.toUpperCase();
    if (CURRENCY_SYMBOLS[foundSymbol] || CURRENCY_SYMBOLS[symUpper]) {
      currency = CURRENCY_SYMBOLS[foundSymbol] || CURRENCY_SYMBOLS[symUpper];
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
    if (MULTILINGUAL_KEYWORDS.walletCash.some((kw) => lower.includes(kw))) {
      matchedWallet = accounts.find((a) => a.isDefaultCash || a.type === "cash") || null;
    } else if (MULTILINGUAL_KEYWORDS.walletBank.some((kw) => lower.includes(kw))) {
      matchedWallet = accounts.find((a) => a.type === "bank") || null;
    } else if (MULTILINGUAL_KEYWORDS.walletCard.some((kw) => lower.includes(kw))) {
      matchedWallet = accounts.find((a) => a.type === "credit") || null;
    } else if (MULTILINGUAL_KEYWORDS.walletSavings.some((kw) => lower.includes(kw))) {
      matchedWallet = accounts.find((a) => a.type === "savings") || null;
    }
  }

  if (!matchedWallet && accounts.length > 0) {
    matchedWallet = accounts.find((a) => a.isDefaultCash) || accounts[0];
  }

  // 5. Match Category
  const typeCategories = categories.filter((c) => c.type === type);
  let matchedCategory: CategoryRow | null = null;

  for (const cat of typeCategories) {
    if (lower.includes(cat.name.toLowerCase())) {
      matchedCategory = cat;
      break;
    }
  }

  // Heuristic match for common categories in multiple languages
  if (!matchedCategory) {
    const categoryKeywords: Record<string, string[]> = {
      food: [
        "lunch", "dinner", "breakfast", "burger", "mcdonald", "coffee", "starbucks", "meal", "restaurant", "food", "snack", "groceries", "supermarket",
        "مطعم", "غداء", "عشاء", "قهوة", "اكل", "طعام", "سوبرماركت", "بقالة",
        "餐饮", "午饭", "晚饭", "早饭", "咖啡", "麦当劳", "餐", "超市", "买菜", "吃",
        "comida", "almuerzo", "cena", "desayuno", "café", "restaurante", "supermercado",
        "déjeuner", "dîner", "café", "restaurant", "nourriture", "courses",
        "mittagessen", "abendessen", "kaffee", "restaurant", "lebensmittel",
        "昼食", "夕食", "朝食", "コーヒー", "外食", "スーパー",
        "yemek", "öğle yemeği", "akşam yemeği", "kahve", "market",
      ],
      shopping: [
        "amazon", "clothes", "shoes", "mall", "shopping", "store",
        "تسوق", "ملابس", "مشتريات",
        "购物", "衣服", "鞋", "商场", "网购", "淘宝", "京东",
        "compras", "ropa", "tienda",
        "achats", "vêtements", "magasin",
        "einkaufen", "kleidung",
        "買い物", "服",
        "alışveriş", "kıyafet",
      ],
      transport: [
        "uber", "taxi", "gas", "fuel", "metro", "subway", "train", "flight", "bus",
        "بنزين", "تاكسي", "مواصلات", "وقود", "مترو", "طيران",
        "交通", "加油", "打车", "地铁", "公交", "机票", "滴滴",
        "transporte", "gasolina", "taxi", "vuelo",
        "transport", "essence", "avion",
        "tank", "benzin", "zug", "flug",
        "交通費", "タクシー", "ガソリン", "電車",
        "ulaşım", "benzin", "taksi", "otobüs",
      ],
      housing: [
        "rent", "electricity", "water", "internet", "utility", "maintenance",
        "إيجار", "كهرباء", "انترنت", "ماء", "صيانة",
        "房租", "水电", "电费", "水费", "网费", "物业",
        "alquiler", "renta", "luz", "agua", "internet",
        "loyer", "électricité", "eau",
        "miete", "strom", "wasser",
        "家賃", "電気", "水道",
        "kira", "elektrik", "su",
      ],
      entertainment: [
        "cinema", "movie", "game", "steam", "playstation", "netflix", "spotify", "concert",
        "ترفيه", "سينما", "ألعاب", "حفلة",
        "娱乐", "电影", "游戏", "演唱会",
        "entretenimiento", "cine", "película", "juego",
        "divertissement", "cinéma", "jeux",
        "unterhaltung", "kino", "spiele",
        "娯楽", "映画", "ゲーム",
        "eğlence", "sinema", "oyun",
      ],
      health: [
        "doctor", "pharmacy", "medicine", "hospital", "gym", "workout",
        "صيدلية", "دواء", "طبيب", "جيم", "مستشفى", "علاج",
        "医疗", "药品", "药店", "医院", "健身", "看病",
        "médico", "farmacia", "medicina", "gimnasio",
        "médecin", "pharmacie", "médicament", "santé",
        "arzt", "apotheke", "medizin", "fitness",
        "病院", "薬", "ジム",
        "doktor", "eczane", "ilaç", "hastane", "spor",
      ],
      salary: [
        "salary", "payroll", "employer", "راتب", "معاش", "工资", "薪水", "salario", "sueldo", "salaire", "gehalt", "給料", "maaş", "lương"
      ],
      freelance: [
        "freelance", "client", "gig", "contract", "عمل حر", "مشروع", "兼职", "自由职业", "freelance", "müşteri", "dự án"
      ],
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
  let description = text;
  const prefixes = [
    /^(?:spent|paid|bought|add|log|record|put|received|got)\s+(?:[\$€£¥₹₺]?\s*[0-9]+(?:[.,][0-9]{1,2})?\s*[a-zA-Z]*)\s+(?:on|for|in|from|at)\s+/i,
    /^(?:spent|paid|bought|received|got|gasté|pagué|compré|dépensé|payé|ausgegeben|bezahlt|صرفت|دفعت|اشتريt|花了|买了|支付了)\s+/i,
  ];
  for (const regex of prefixes) {
    if (regex.test(description)) {
      description = description.replace(regex, "");
      break;
    }
  }

  if (matchedWallet) {
    description = description.replace(new RegExp(`(?:using|with|via|from|to|into)\\s+${matchedWallet.name}`, "i"), "");
    description = description.replace(/(?:using|with|via|por|avec|mit|через)\s+(?:cash|bank|card|savings|كاش|بنك|现金|银行)\s*(?:wallet|account)?/i, "");
  }

  description = description.trim();
  if (!description) {
    description = matchedCategory ? matchedCategory.name : (type === "income" ? "Income" : "Expense");
  }

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
 * Handle conversational Q&A, spending insights, budget checks, and financial warnings
 * localized directly into the user's active language.
 */
export function answerFinancialQuery(
  input: string,
  transactions: TransactionRow[],
  categories: CategoryRow[],
  accounts: WalletAccount[],
  recurring: RecurringRule[],
  goals: SavingsGoal[],
  budgets: Record<string, number>,
  baseCurrency: string,
  lang = "en"
): FinancialInsightResponse {
  const query = input.toLowerCase().trim();
  const langPrefix = lang.split("-")[0].toLowerCase();

  // Helper strings for active language
  const isZh = langPrefix === "zh";
  const isAr = langPrefix === "ar";
  const isEs = langPrefix === "es";
  const isFr = langPrefix === "fr";
  const isDe = langPrefix === "de";
  const isTr = langPrefix === "tr";

  // 1. Check if user is asking about spending in a specific category
  for (const cat of categories) {
    const catNameLower = cat.name.toLowerCase();
    const isAskingCategory =
      query.includes(catNameLower) &&
      (query.includes("how much") || query.includes("spend") || query.includes("cost") || query.includes("total") ||
       query.includes("کم") || query.includes("صرفت") || query.includes("花了") || query.includes("多少") ||
       query.includes("cuánto") || query.includes("combien") || query.includes("wieviel") || query.includes("ne kadar"));

    if (isAskingCategory) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const catTxs = transactions.filter(
        (t) => t.category_id === cat.id && t.occurred_on.startsWith(currentMonthKey)
      );

      const totalSpent = catTxs.reduce((sum, t) => sum + (Number(t.amount_base) || 0), 0);
      const budgetLimit = budgets[cat.id] || 0;

      let msg = "";
      let suggestions: string[] = [];

      if (isAr) {
        msg = `لقد أنفقت **${totalSpent.toFixed(2)} ${baseCurrency}** على **${cat.name}** هذا الشهر عبر ${catTxs.length} معاملة.`;
        if (budgetLimit > 0) {
          const pct = Math.round((totalSpent / budgetLimit) * 100);
          if (pct >= 100) {
            msg += ` ⚠️ **تنبيه:** لقد تجاوزت ميزانيتك المحددة (${budgetLimit.toFixed(2)} ${baseCurrency}) بمقدار ${(totalSpent - budgetLimit).toFixed(2)} ${baseCurrency} (${pct}%).`;
          } else {
            msg += ` لقد استهلكت **${pct}%** من ميزانية قدرها ${budgetLimit.toFixed(2)} ${baseCurrency} (المتبقي: ${(budgetLimit - totalSpent).toFixed(2)} ${baseCurrency}).`;
          }
        }
        suggestions = [`أكبر مصروفاتي هذا الشهر`, `كم ادخرت هذا الشهر؟`, `الاشتراكات القادمة`];
      } else if (isZh) {
        msg = `您本月在 **${cat.name}** 上已支出 **${totalSpent.toFixed(2)} ${baseCurrency}**（共 ${catTxs.length} 笔交易）。`;
        if (budgetLimit > 0) {
          const pct = Math.round((totalSpent / budgetLimit) * 100);
          if (pct >= 100) {
            msg += ` ⚠️ **超支预警：** 您已超出设定的预算 (${budgetLimit.toFixed(2)} ${baseCurrency})，超出金额为 ${(totalSpent - budgetLimit).toFixed(2)} ${baseCurrency} (${pct}%)。`;
          } else {
            msg += ` 您已使用预算的 **${pct}%**（总预算 ${budgetLimit.toFixed(2)} ${baseCurrency}，剩余 ${(budgetLimit - totalSpent).toFixed(2)} ${baseCurrency}）。`;
          }
        }
        suggestions = [`我本月的最大开销有哪些？`, `本月财务健康诊断`, `查看储蓄目标进度`];
      } else if (isEs) {
        msg = `Has gastado **${totalSpent.toFixed(2)} ${baseCurrency}** en **${cat.name}** este mes en ${catTxs.length} transacciones.`;
        if (budgetLimit > 0) {
          const pct = Math.round((totalSpent / budgetLimit) * 100);
          if (pct >= 100) {
            msg += ` ⚠️ **Aviso:** Has superado tu presupuesto de ${budgetLimit.toFixed(2)} ${baseCurrency} en ${(totalSpent - budgetLimit).toFixed(2)} ${baseCurrency} (${pct}%).`;
          } else {
            msg += ` Has utilizado el **${pct}%** de tu presupuesto de ${budgetLimit.toFixed(2)} ${baseCurrency} (${(budgetLimit - totalSpent).toFixed(2)} ${baseCurrency} restante).`;
          }
        }
        suggestions = [`¿Cuáles son mis mayores gastos?`, `Resumen de salud financiera`, `Ver objetivos de ahorro`];
      } else {
        msg = `You have spent **${totalSpent.toFixed(2)} ${baseCurrency}** on **${cat.name}** this month across ${catTxs.length} transaction${catTxs.length === 1 ? "" : "s"}.`;
        if (budgetLimit > 0) {
          const pct = Math.round((totalSpent / budgetLimit) * 100);
          if (pct >= 100) {
            msg += ` ⚠️ **Warning:** You have exceeded your budget of ${budgetLimit.toFixed(2)} ${baseCurrency} by ${(totalSpent - budgetLimit).toFixed(2)} ${baseCurrency} (${pct}%).`;
          } else {
            msg += ` You have used **${pct}%** of your ${budgetLimit.toFixed(2)} ${baseCurrency} budget (${(budgetLimit - totalSpent).toFixed(2)} ${baseCurrency} remaining).`;
          }
        }
        suggestions = [`What are my top expenses this month?`, `Financial health summary`, `Show my savings goals`];
      }

      return {
        isQuery: true,
        reply: msg,
        suggestions,
      };
    }
  }

  // 2. Month comparison: "Compare my expenses between September and October" / "compare"
  if (query.includes("compare") || query.includes("vs") || query.includes("مقارنة") || query.includes("对比") || query.includes("比较") || query.includes("comparar") || query.includes("karşılaştır")) {
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

    let reply = "";
    if (isAr) {
      reply = `📊 **مقارنة الإنفاق الشهري:**\n\n`;
      reply += `• **هذا الشهر (${thisMonthKey}):** ${thisMonthExpense.toFixed(2)} ${baseCurrency}\n`;
      reply += `• **الشهر السابق (${lastMonthKey}):** ${lastMonthExpense.toFixed(2)} ${baseCurrency}\n\n`;
      if (diff > 0) {
        reply += `⚠️ إنفاقك **مرتفع بمقدار ${diff.toFixed(2)} ${baseCurrency} (+${diffPct}%)** مقارنة بالشهر السابق. انتبه للمصاريف الإضافية!`;
      } else if (diff < 0) {
        reply += `🎉 أحسنت! إنفاقك **انخفض بمقدار ${Math.abs(diff).toFixed(2)} ${baseCurrency} (-${diffPct}%)** مقارنة بالشهر السابق!`;
      } else {
        reply += `إنفاقك متطابق تماماً مع الشهر الماضي.`;
      }
      return {
        isQuery: true,
        reply,
        suggestions: ["أكبر المصاريف هذا الشهر", "الاشتراكات الدورية", "نصيحة مالية"]
      };
    } else if (isZh) {
      reply = `📊 **月度支出对比分析：**\n\n`;
      reply += `• **本月 (${thisMonthKey})：** ${thisMonthExpense.toFixed(2)} ${baseCurrency}\n`;
      reply += `• **上月 (${lastMonthKey})：** ${lastMonthExpense.toFixed(2)} ${baseCurrency}\n\n`;
      if (diff > 0) {
        reply += `⚠️ 相比上月，您的支出 **增加了 ${diff.toFixed(2)} ${baseCurrency} (+${diffPct}%)**。建议留意非必要开支！`;
      } else if (diff < 0) {
        reply += `🎉 太棒了！相比上月，您的支出 **减少了 ${Math.abs(diff).toFixed(2)} ${baseCurrency} (-${diffPct}%)**！继续保持！`;
      } else {
        reply += `支出与上月完全持平。`;
      }
      return {
        isQuery: true,
        reply,
        suggestions: ["我的最大支出项？", "财务健康诊断", "我的储蓄目标"]
      };
    } else if (isEs) {
      reply = `📊 **Comparación de Gastos Mensuales:**\n\n`;
      reply += `• **Este Mes (${thisMonthKey}):** ${thisMonthExpense.toFixed(2)} ${baseCurrency}\n`;
      reply += `• **Mes Pasado (${lastMonthKey}):** ${lastMonthExpense.toFixed(2)} ${baseCurrency}\n\n`;
      if (diff > 0) {
        reply += `⚠️ Tus gastos han **aumentado en ${diff.toFixed(2)} ${baseCurrency} (+${diffPct}%)** respecto al mes pasado.`;
      } else if (diff < 0) {
        reply += `🎉 ¡Excelente trabajo! Tus gastos han **disminuido en ${Math.abs(diff).toFixed(2)} ${baseCurrency} (-${diffPct}%)** respecto al mes pasado.`;
      } else {
        reply += `Tus gastos son idénticos a los del mes pasado.`;
      }
      return {
        isQuery: true,
        reply,
        suggestions: ["Mayores gastos", "Suscripciones recurrentes", "Diagnóstico financiero"]
      };
    }

    // Default English
    reply = `📊 **Monthly Spending Comparison:**\n\n`;
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
  if (query.includes("advice") || query.includes("health") || query.includes("status") || query.includes("summary") || query.includes("overview") ||
      query.includes("نصيحة") || query.includes("وضع") || query.includes("تقرير") ||
      query.includes("诊断") || query.includes("建议") || query.includes("财务状况") || query.includes("概览") ||
      query.includes("salud") || query.includes("consejo") || query.includes("resumen") ||
      query.includes("durum") || query.includes("özet") || query.includes("tavsiye")) {
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

    let advice = "";
    if (isAr) {
      advice = `💡 **نظرة عامة على صحتك المالية (هذا الشهر):**\n\n`;
      advice += `• **إجمالي الدخل:** +${monthIncome.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **إجمالي المصروفات:** -${monthExpense.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **صافي التدفق المالي:** ${net >= 0 ? "+" : ""}${net.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **معدل الادخار:** ${savingsRate}%\n`;
      advice += `• **إجمالي الأصول والسيولة:** ${totalNetWorth.toFixed(2)} ${baseCurrency}\n\n`;
      if (savingsRate >= 20) {
        advice += `🌟 **التقييم: ممتاز!** أنت تدخر ${savingsRate}% من دخلك وتتجاوز قاعدة الـ 20% الموصى بها.`;
      } else if (savingsRate > 0) {
        advice += `⚖️ **التقييم: جيد.** لديك تدفق مالي إيجابي (${savingsRate}% ادخار). حاول تقليص المصاريف الكمالية.`;
      } else {
        advice += `🚨 **التقييم: تحذير.** مصروفاتك تفوق أو تساوي دخلك هذا الشهر. تحقق من الاشتراكات وحدود الميزانية.`;
      }
      return {
        isQuery: true,
        reply: advice,
        suggestions: ["الاشتراكات الدورية", "عرض الأهداف الادخارية", "مقارنة مع الشهر الماضي"]
      };
    } else if (isZh) {
      advice = `💡 **本月财务健康体检报告：**\n\n`;
      advice += `• **总收入：** +${monthIncome.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **总支出：** -${monthExpense.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **净现金流：** ${net >= 0 ? "+" : ""}${net.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **储蓄率：** ${savingsRate}%\n`;
      advice += `• **账户总流动资金：** ${totalNetWorth.toFixed(2)} ${baseCurrency}\n\n`;
      if (savingsRate >= 20) {
        advice += `🌟 **健康评级：优秀！** 您的储蓄率达 ${savingsRate}%，超过了经典的20%储蓄法则，财务结构稳健！`;
      } else if (savingsRate > 0) {
        advice += `⚖️ **健康评级：良好。** 现金流为正（储蓄率 ${savingsRate}%），建议合理精简非必要支出以提高储蓄率。`;
      } else {
        advice += `🚨 **健康评级：赤字警报。** 您本月的支出已接近或超出总收入，请尽快检查订阅扣费和各分类预算！`;
      }
      return {
        isQuery: true,
        reply: advice,
        suggestions: ["本月各项订阅扣款", "查看储蓄目标进度", "对比上月支出"]
      };
    } else if (isEs) {
      advice = `💡 **Informe de Salud Financiera (Este Mes):**\n\n`;
      advice += `• **Ingresos:** +${monthIncome.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **Gastos:** -${monthExpense.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **Flujo Neto:** ${net >= 0 ? "+" : ""}${net.toFixed(2)} ${baseCurrency}\n`;
      advice += `• **Tasa de Ahorro:** ${savingsRate}%\n`;
      advice += `• **Fondos Totales:** ${totalNetWorth.toFixed(2)} ${baseCurrency}\n\n`;
      if (savingsRate >= 20) {
        advice += `🌟 **Calificación: ¡Excelente!** Ahorras el ${savingsRate}%, superando la regla del 20%.`;
      } else if (savingsRate > 0) {
        advice += `⚖️ **Calificación: Bueno.** Flujo positivo (${savingsRate}% ahorrado).`;
      } else {
        advice += `🚨 **Calificación: Alerta.** Tus gastos superan o igualan tus ingresos.`;
      }
      return {
        isQuery: true,
        reply: advice,
        suggestions: ["Suscripciones activas", "Metas de ahorro", "Comparar con mes anterior"]
      };
    }

    advice = `💡 **Financial Health Snapshot (This Month):**\n\n`;
    advice += `• **Income:** +${monthIncome.toFixed(2)} ${baseCurrency}\n`;
    advice += `• **Expenses:** -${monthExpense.toFixed(2)} ${baseCurrency}\n`;
    advice += `• **Net Cash Flow:** ${net >= 0 ? "+" : ""}${net.toFixed(2)} ${baseCurrency}\n`;
    advice += `• **Savings Rate:** ${savingsRate}%\n`;
    advice += `• **Total Liquid Balances:** ${totalNetWorth.toFixed(2)} ${baseCurrency}\n\n`;
    if (savingsRate >= 20) {
      advice += `🌟 **Health Rating: Excellent!** You are saving ${savingsRate}% of your income, comfortably exceeding the 20% rule.`;
    } else if (savingsRate > 0) {
      advice += `⚖️ **Health Rating: Good.** You have a positive cash flow (${savingsRate}% saved).`;
    } else {
      advice += `🚨 **Health Rating: Warning.** Your expenses match or exceed your income this month. Check your subscriptions and category budgets.`;
    }
    return {
      isQuery: true,
      reply: advice,
      suggestions: ["Upcoming subscriptions", "Show my savings goals", "What is my daily average spending?"]
    };
  }

  // 4. Subscriptions & recurring queries
  if (query.includes("subscription") || query.includes("recurring") || query.includes("bills") ||
      query.includes("اشتراكات") || query.includes("فواتير") ||
      query.includes("订阅") || query.includes("固定支出") || query.includes("账单") ||
      query.includes("suscripciones") || query.includes("abonnement") || query.includes("abonelik")) {
    const activeRules = recurring.filter((r) => r.active);
    const totalMonthlySubs = activeRules.reduce((sum, r) => {
      let monthly = r.amount;
      if (r.cycle === "weekly") monthly *= 4.33;
      if (r.cycle === "yearly") monthly /= 12;
      return sum + monthly;
    }, 0);

    let reply = "";
    if (isAr) {
      reply = `📅 لديك **${activeRules.length} التزامات واشتراكات دورية نشطة** بتكلفة تقريبية **~${totalMonthlySubs.toFixed(2)} ${baseCurrency}/شهر**:\n\n`;
      activeRules.slice(0, 5).forEach((r) => {
        reply += `• **${r.name}:** ${r.amount} ${r.currency} (${r.cycle}، الاستحقاق: ${r.nextDueDate})\n`;
      });
      return { isQuery: true, reply, suggestions: ["تسجيل اشتراك الآن", "حالة الميزانية"] };
    } else if (isZh) {
      reply = `📅 您当前有 **${activeRules.length} 个进行中的定期订阅/账单**，每月预估支出约 **~${totalMonthlySubs.toFixed(2)} ${baseCurrency}**：\n\n`;
      activeRules.slice(0, 5).forEach((r) => {
        reply += `• **${r.name}：** ${r.amount} ${r.currency}（周期：${r.cycle}，下次扣费：${r.nextDueDate}）\n`;
      });
      return { isQuery: true, reply, suggestions: ["查看储蓄目标", "财务健康诊断"] };
    } else if (isEs) {
      reply = `📅 Tienes **${activeRules.length} suscripciones y pagos recurrentes activos** por aprox **~${totalMonthlySubs.toFixed(2)} ${baseCurrency}/mes**:\n\n`;
      activeRules.slice(0, 5).forEach((r) => {
        reply += `• **${r.name}:** ${r.amount} ${r.currency} (${r.cycle}, vencimiento: ${r.nextDueDate})\n`;
      });
      return { isQuery: true, reply, suggestions: ["Registrar factura ahora", "Estado del presupuesto"] };
    }

    reply = `📅 You have **${activeRules.length} active recurring commitments** costing approx **~${totalMonthlySubs.toFixed(2)} ${baseCurrency}/month**.\n\n`;
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
  if (query.includes("goal") || query.includes("savings") || query.includes("bucket") ||
      query.includes("أهداف") || query.includes("ادخار") ||
      query.includes("目标") || query.includes("存钱") ||
      query.includes("meta") || query.includes("ahorro") || query.includes("hedef")) {
    if (goals.length === 0) {
      const emptyMsg = isAr
        ? "لم تقم بإعداد أهداف ادخارية بعد. انتقل إلى متتبع الأموال -> تبويب الأهداف لإنشاء أول هدف!"
        : isZh
        ? "您尚未创建任何储蓄目标。可前往“资金管家 -> 储蓄目标”创建您的第一个存钱愿望！"
        : isEs
        ? "No tienes metas de ahorro configuradas aún. Ve a Control de Dinero -> Metas para crear la primera."
        : "You don't have any savings goals set up yet. Go to the Money Tracker -> Goals tab to create your first goal!";
      return { isQuery: true, reply: emptyMsg, suggestions: ["Financial health advice", "How much did I spend this month?"] };
    }

    let reply = isAr
      ? `🎯 **تقدم أهدافك الادخارية:**\n\n`
      : isZh
      ? `🎯 **您的储蓄目标进度概览：**\n\n`
      : isEs
      ? `🎯 **Progreso de tus metas de ahorro:**\n\n`
      : `🎯 **Your Savings Goals Progress:**\n\n`;

    goals.forEach((g) => {
      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      reply += `• **${g.name}:** ${g.currentAmount} / ${g.targetAmount} ${g.currency} (**${pct}%**)${pct >= 100 ? " ✅" : ""}\n`;
    });

    return {
      isQuery: true,
      reply,
      suggestions: isAr ? ["كم يمكنني الادخار هذا الشهر؟", "الوضع المالي"] : isZh ? ["我本月能存多少钱？", "财务健康诊断"] : ["How much can I save this month?", "Financial health status"]
    };
  }

  // 6. Wallets / Accounts query
  if (query.includes("wallet") || query.includes("account") || query.includes("balance") ||
      query.includes("حساب") || query.includes("رصيد") || query.includes("محفظة") ||
      query.includes("账户") || query.includes("钱包") || query.includes("余额") ||
      query.includes("cuenta") || query.includes("billetera") || query.includes("saldo") ||
      query.includes("bakiye") || query.includes("hesap")) {
    let reply = isAr
      ? `💳 **أرصدة الحسابات والمحافظ:**\n\n`
      : isZh
      ? `💳 **各账户与钱包实时余额：**\n\n`
      : isEs
      ? `💳 **Resumen de cuentas y billeteras:**\n\n`
      : `💳 **Accounts & Balances Overview:**\n\n`;

    accounts.forEach((acc) => {
      reply += `• **${acc.name}** (${acc.type}): **${acc.balance.toFixed(2)} ${acc.currency}**\n`;
    });

    const total = accounts.reduce((sum, a) => sum + a.balance, 0);
    reply += `\n**${isAr ? "إجمالي الأصول" : isZh ? "总资产" : isEs ? "Total Activos" : "Total Assets"}:** ${total.toFixed(2)} ${baseCurrency}`;

    return {
      isQuery: true,
      reply,
      suggestions: isAr ? ["كم أنفقت هذا الشهر؟", "نصيحة مالية"] : isZh ? ["我本月花了多少钱？", "财务健康体检"] : ["How much did I spend this month?", "Give me financial advice"]
    };
  }

  // Default fallback guidance in active language
  if (isAr) {
    return {
      isQuery: false,
      reply: "لم أتمكن من التعرف على المعاملة أو السؤال بدقة. جرب أحد الأوامر التالية:\n• *'صرفت 15 دولار على الغداء من محفظة الكاش'*\n• *'كم أنفقت على الطعام هذا الشهر؟'*\n• *'قارن مصاريفي مع الشهر الماضي'*\n• *'ما هو وضعي المالي؟'*",
      suggestions: [
        "صرفت 15 دولار على قهوة ستاربكس",
        "كم أنفقت هذا الشهر؟",
        "نصيحة مالية وحالة الميزانية",
        "الاشتراكات الدورية القادمة"
      ]
    };
  }

  if (isZh) {
    return {
      isQuery: false,
      reply: "我未能精确识别具体的记账指令或查询。您可以尝试输入类似内容：\n• *'用现金钱包支付了15美元午餐'* 或 *'花了25元买咖啡'*\n• *'我这个月在餐饮上花了多少钱？'*\n• *'对比我和上个月的支出情况'*\n• *'我的储蓄目标进度怎么样了？'*",
      suggestions: [
        "用现金买了25美元午餐",
        "我这个月总共花了多少钱？",
        "财务健康诊断建议",
        "查看我的定期订阅与账单"
      ]
    };
  }

  if (isEs) {
    return {
      isQuery: false,
      reply: "No pude identificar la transacción o consulta exacta. Puedes probar con:\n• *'Gasté 15$ en almuerzo usando Efectivo'*\n• *'¿Cuánto he gastado en Comida este mes?'*\n• *'Compara mis gastos con el mes pasado'*\n• *'¿Cómo van mis metas de ahorro?'*",
      suggestions: [
        "Gasté 12$ en café Starbucks",
        "¿Cuánto he gastado este mes?",
        "Diagnóstico de salud financiera",
        "Ver mis suscripciones recurrentes"
      ]
    };
  }

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
