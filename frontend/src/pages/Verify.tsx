import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { VerificationResult } from "../types";

export function Verify() {
  const { certificateId } = useParams();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/verify/${certificateId}`)
      .then((r) => setResult(r.data))
      .catch(() => setResult({ result: "NOT_FOUND" }))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) {
    return <div className="max-w-md mx-auto px-6 py-24 text-center text-slate-400">Verifying…</div>;
  }

  if (!result) return null;

  // Tailwind's JIT scans for literal class strings, so dynamic template-literal
  // classes (e.g. `border-${color}-200`) get purged. Use a static class map instead.
  const views: Record<string, { icon: any; title: string; box: string; icon_c: string; title_c: string }> = {
    VALID: {
      icon: CheckCircle2,
      title: "VERIFIED CERTIFICATE",
      box: "border-emerald-200 bg-emerald-50",
      icon_c: "text-emerald-600",
      title_c: "text-emerald-800",
    },
    REVOKED: {
      icon: XCircle,
      title: "CERTIFICATE REVOKED",
      box: "border-red-200 bg-red-50",
      icon_c: "text-red-600",
      title_c: "text-red-800",
    },
    EXPIRED: {
      icon: AlertTriangle,
      title: "CERTIFICATE EXPIRED",
      box: "border-amber-200 bg-amber-50",
      icon_c: "text-amber-600",
      title_c: "text-amber-800",
    },
    NOT_FOUND: {
      icon: HelpCircle,
      title: "CERTIFICATE NOT FOUND",
      box: "border-slate-200 bg-slate-50",
      icon_c: "text-slate-500",
      title_c: "text-slate-700",
    },
  };
  const v = views[result.result];
  const Icon = v.icon;

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className={`border-2 rounded-2xl p-8 text-center ${v.box}`}>
        <Icon className={`mx-auto ${v.icon_c}`} size={52} />
        <h1 className={`font-display text-xl font-bold mt-4 ${v.title_c} tracking-wide`}>{v.title}</h1>

        {result.result === "VALID" && (
          <div className="mt-6 text-left bg-white rounded-xl p-5 space-y-3 text-sm">
            <p className="text-center text-slate-500 text-xs mb-2">
              This certificate is authentic and was issued by{" "}
              <span className="font-semibold text-ink">{result.certificate.organizationName}</span>
            </p>
            <Row label="Recipient" value={result.certificate.recipientName} />
            <Row label="Certificate" value={result.certificate.certificateTitle} />
            <Row label="Course" value={result.certificate.courseName} />
            <Row label="Internship Duration" value={result.certificate.internshipDuration} />
            <Row label="Completion Date" value={new Date(result.certificate.completionDate).toLocaleDateString()} />
            <Row label="Certificate ID" value={result.certificate.certificateId} mono />
            <Row label="Status" value="VALID" />
          </div>
        )}

        {result.result === "REVOKED" && (
          <div className="mt-6 text-sm text-slate-600">
            <p>This certificate has been revoked by the issuing organization.</p>
            <p className="mt-3 font-mono text-xs text-slate-400">{result.certificateId}</p>
          </div>
        )}

        {result.result === "EXPIRED" && (
          <div className="mt-6 text-sm text-slate-600">
            <p>This certificate was valid until {new Date(result.validUntil).toLocaleDateString()}.</p>
            <p className="mt-3 font-mono text-xs text-slate-400">{result.certificateId}</p>
          </div>
        )}

        {result.result === "NOT_FOUND" && (
          <div className="mt-6 text-sm text-slate-600">
            <p>We could not find a certificate matching this verification ID.</p>
            <p className="mt-1 text-slate-400">The certificate may be invalid or the verification URL may be incorrect.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b border-slate-50 last:border-0 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className={`text-ink font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
