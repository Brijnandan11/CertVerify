import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { CertificateStatus } from "../types";

const CONFIG: Record<
  CertificateStatus | "NOT_FOUND",
  { label: string; bg: string; text: string; icon: any }
> = {
  VALID: { label: "VALID", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  REVOKED: { label: "REVOKED", bg: "bg-red-50 border-red-200", text: "text-red-700", icon: XCircle },
  EXPIRED: { label: "EXPIRED", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: AlertTriangle },
  NOT_FOUND: { label: "NOT FOUND", bg: "bg-slate-100 border-slate-200", text: "text-slate-600", icon: HelpCircle },
};

export function StatusBadge({ status }: { status: CertificateStatus | "NOT_FOUND" }) {
  const c = CONFIG[status];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${c.bg} ${c.text}`}>
      <Icon size={14} />
      {c.label}
    </span>
  );
}
