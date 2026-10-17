import { formatMoney, localeFromLanguage } from "@/lib/currencies";
import { formatDate, type CategoryRow, type Totals, type TransactionRow } from "@/lib/finance";

export const exportTransactionsToCSV = (
  transactions: TransactionRow[],
  categories: CategoryRow[],
  baseCurrency: string,
) => {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    "ID",
    "Date",
    "Type",
    "Category",
    "Description",
    "Amount",
    "Currency",
    "Exchange Rate",
    `Converted Amount (${baseCurrency})`,
  ];

  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.occurred_on}"`,
    `"${t.type}"`,
    `"${(t.category_id ? catMap.get(t.category_id) : "") || "Uncategorized"}"`,
    `"${(t.description || "").replace(/"/g, '""')}"`,
    Number(t.amount || 0).toFixed(2),
    `"${t.currency}"`,
    Number(t.exchange_rate || 1).toFixed(4),
    Number(t.amount_base || 0).toFixed(2),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `mint_mosaic_transactions_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printFinancialSummaryPDF = (
  totals: Totals,
  transactions: TransactionRow[],
  categories: CategoryRow[],
  currency: string,
  periodLabel: string,
  locale = "en-US",
) => {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const topExpenses = [...transactions]
    .filter((t) => t.type === "expense")
    .sort((a, b) => (Number(b.amount_base) || 0) - (Number(a.amount_base) || 0))
    .slice(0, 15);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Mint Mosaic Hub - Financial Statement (${periodLabel})</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          padding: 32px;
          background: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f766e;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          color: #0f766e;
          margin: 0;
        }
        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .badge {
          display: inline-block;
          background: #ccfbf1;
          color: #0f766e;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 12px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .metric-card.income { border-left: 4px solid #10b981; }
        .metric-card.expense { border-left: 4px solid #f43f5e; }
        .metric-card.net { border-left: 4px solid #0f766e; }
        .metric-card.rate { border-left: 4px solid #8b5cf6; }
        .metric-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
        }
        .metric-value {
          font-size: 20px;
          font-weight: 800;
          margin-top: 6px;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          font-size: 12px;
        }
        th {
          background: #f1f5f9;
          text-align: left;
          padding: 10px;
          font-weight: 700;
          color: #334155;
          border-bottom: 1px solid #cbd5e1;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .amount-col {
          text-align: right;
          font-family: monospace;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 16px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Mint Mosaic Hub</h1>
          <div class="subtitle">Personal Financial Statement & Performance Summary</div>
        </div>
        <div style="text-align: right;">
          <span class="badge">${periodLabel}</span>
          <div class="subtitle" style="margin-top: 6px;">Generated: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card income">
          <div class="metric-label">Total Income</div>
          <div class="metric-value">${formatMoney(totals.income, currency, locale)}</div>
        </div>
        <div class="metric-card expense">
          <div class="metric-label">Total Expenses</div>
          <div class="metric-value">${formatMoney(totals.expense, currency, locale)}</div>
        </div>
        <div class="metric-card net">
          <div class="metric-label">Net Savings</div>
          <div class="metric-value">${formatMoney(totals.net, currency, locale)}</div>
        </div>
        <div class="metric-card rate">
          <div class="metric-label">Savings Rate</div>
          <div class="metric-value">${totals.savingsRate}%</div>
        </div>
      </div>

      <h3 style="font-size: 15px; margin-bottom: 4px; color: #0f172a;">Top 15 Largest Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${topExpenses
            .map(
              (t) => `
            <tr>
              <td>${formatDate(t.occurred_on, locale)}</td>
              <td><strong>${t.description || "Untitled"}</strong></td>
              <td>${(t.category_id ? catMap.get(t.category_id) : "") || "Uncategorized"}</td>
              <td><span style="color: ${t.type === "income" ? "#10b981" : "#f43f5e"}; text-transform: capitalize;">${t.type}</span></td>
              <td class="amount-col">${formatMoney(Number(t.amount_base || 0), currency, locale)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <span>Confidential - Generated for personal accounting records</span>
        <span>Mint Mosaic Hub Financial Engine</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
