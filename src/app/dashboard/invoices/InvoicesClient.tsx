"use client";

import { useState } from "react";
import { Receipt, Download, Eye, Wallet } from "lucide-react";
import { Badge, EmptyState, Modal } from "@/components/ui";
import { useT, useLang } from "@/lib/i18n";
import { formatEGP, formatDate, STATUS_BADGE } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";

type Invoice = Tables<"invoices">;

interface Props {
  businessId: string;
  invoices: Invoice[];
  walletBalance: number;
}

export default function InvoicesClient({ invoices, walletBalance }: Props) {
  const { lang } = useLang();
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const t = useT({
    ar: {
      num: "رقم الفاتورة", amount: "المبلغ", tax: "الضريبة", total: "الإجمالي",
      status: "الحالة", date: "التاريخ", download: "تحميل PDF", view: "عرض",
      noInvoices: "لا توجد فواتير", invoice: "فاتورة", paidAt: "تاريخ الدفع", dueDate: "تاريخ الاستحقاق",
      wallet: "المحفظة / الرصيد المتبقي",
    },
    en: {
      num: "Invoice #", amount: "Amount", tax: "Tax", total: "Total",
      status: "Status", date: "Date", download: "Download PDF", view: "View",
      noInvoices: "No invoices yet", invoice: "Invoice", paidAt: "Paid at", dueDate: "Due date",
      wallet: "Wallet / Remaining Balance",
    },
  });

  const openPdf = (inv: Invoice) => {
    if (inv.pdf_path) window.open(inv.pdf_path, "_blank");
    else setViewInvoice(inv);
  };

  return (
    <div className="space-y-4">
      {/* Wallet Widget */}
      <div className="card p-5 bg-gradient-to-br from-[var(--bg-solid)] to-[rgba(184,144,99,0.05)] border-l-4 border-l-accent flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(184,144,99,0.15)] flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold">{t.wallet}</h3>
            <p className="text-2xl font-bold text-accent">{formatEGP(walletBalance, lang)}</p>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={<Receipt className="w-12 h-12" />} title={t.noInvoices} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {[t.num, t.amount, t.tax, t.total, t.status, t.date, ""].map((h) => (
                    <th key={h} className="text-start p-3 font-semibold text-muted text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[var(--border)] hover:bg-[rgba(14,32,56,0.04)]">
                    <td className="p-3 font-mono text-xs text-accent">{inv.number}</td>
                    <td className="p-3">{formatEGP(inv.amount_egp, lang)}</td>
                    <td className="p-3 text-muted">{formatEGP(inv.tax_egp, lang)}</td>
                    <td className="p-3 font-bold">{formatEGP(inv.total_egp, lang)}</td>
                    <td className="p-3"><Badge variant={STATUS_BADGE[inv.status] ?? "neutral"}>{inv.status}</Badge></td>
                    <td className="p-3 text-muted text-xs">{formatDate(inv.created_at, lang)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewInvoice(inv)} className="btn-ghost !p-1.5">
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.pdf_path && (
                          <button onClick={() => openPdf(inv)} className="btn-ghost !p-1.5">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!viewInvoice} onClose={() => setViewInvoice(null)} title={`${t.invoice} ${viewInvoice?.number ?? ""}`}>
        {viewInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted text-xs mb-1">{t.num}</p><p className="font-mono">{viewInvoice.number}</p></div>
              <div><p className="text-muted text-xs mb-1">{t.status}</p><Badge variant={STATUS_BADGE[viewInvoice.status] ?? "neutral"}>{viewInvoice.status}</Badge></div>
              <div><p className="text-muted text-xs mb-1">{t.amount}</p><p>{formatEGP(viewInvoice.amount_egp, lang)}</p></div>
              <div><p className="text-muted text-xs mb-1">{t.tax}</p><p>{formatEGP(viewInvoice.tax_egp, lang)}</p></div>
              <div><p className="text-muted text-xs mb-1">{t.total}</p><p className="font-bold text-lg">{formatEGP(viewInvoice.total_egp, lang)}</p></div>
              <div><p className="text-muted text-xs mb-1">{t.date}</p><p>{formatDate(viewInvoice.created_at, lang)}</p></div>
              {viewInvoice.due_date && <div><p className="text-muted text-xs mb-1">{t.dueDate}</p><p>{formatDate(viewInvoice.due_date, lang)}</p></div>}
              {viewInvoice.paid_at && <div><p className="text-muted text-xs mb-1">{t.paidAt}</p><p>{formatDate(viewInvoice.paid_at, lang)}</p></div>}
            </div>
            {viewInvoice.pdf_path && (
              <a href={viewInvoice.pdf_path} target="_blank" rel="noopener noreferrer" className="btn-primary w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> {t.download}
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
