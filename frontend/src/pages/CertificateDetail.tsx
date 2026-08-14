import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { VerificationQR } from "../components/VerificationQR";
import { Certificate } from "../types";
import { Download, Ban, Copy, Check } from "lucide-react";
import { LogoMark } from "../components/LogoMark";

export function CertificateDetail() {
  const { id } = useParams();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/certificates/${id}`).then((r) => setCert(r.data.certificate));
  }, [id]);

  async function revoke() {
    if (!confirm("Revoke this certificate? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await api.patch(`/certificates/${id}/revoke`);
      setCert((c) => (c ? { ...c, status: res.data.certificate.status } : c));
    } finally {
      setBusy(false);
    }
  }

  if (!cert) return <div className="max-w-2xl mx-auto px-6 py-20 text-center text-slate-400">Loading…</div>;

  const verifyUrl = `${window.location.origin}/verify/${cert.certificate_id}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex justify-center mb-6">
        <LogoMark size={52} />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 flex items-center gap-6">
        <VerificationQR value={verifyUrl} size={120} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Scan to verify
          </p>
          <p className="text-ink break-all font-mono text-xs">{verifyUrl}</p>
          <CopyLink value={verifyUrl} />
        </div>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{cert.recipient_name}</h1>
          <p className="text-sm text-slate-500 font-mono mt-1">{cert.certificate_id}</p>
        </div>
        <StatusBadge status={cert.status} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 text-sm">
        <Row label="Certificate Title" value={cert.certificate_title} />
        <Row label="Course / Program" value={cert.course_name} />
        <Row label="Organization" value={cert.organization_name} />
        <Row label="Internship Duration" value={cert.internship_duration} />
        <Row label="Completion Date" value={new Date(cert.completion_date).toLocaleDateString()} />
        {cert.expiry_date && <Row label="Expiry Date" value={new Date(cert.expiry_date).toLocaleDateString()} />}
        <Row label="Signatory" value={`${cert.signatory_name} — ${cert.signatory_designation}`} />
      </div>

      <div className="flex gap-3 mt-6">
        <a
          href={`/api/v1/certificates/${cert.id}/pdf`}
          className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90"
        >
          <Download size={16} /> Download PDF
        </a>
        {cert.status !== "REVOKED" && (
          <button
            disabled={busy}
            onClick={revoke}
            className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            <Ban size={16} /> Revoke
          </button>
        )}
      </div>
    </div>
  );
}

function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-ink font-medium"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={`text-ink text-right max-w-xs truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
