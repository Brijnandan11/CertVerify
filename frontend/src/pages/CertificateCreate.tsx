import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { VerificationQR } from "../components/VerificationQR";
import { CheckCircle2, Copy, Download } from "lucide-react";

const STEPS = ["Recipient", "Certificate", "Signatory", "Preview"];

export function CertificateCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    certificateTitle: "",
    courseName: "",
    description: "",
    internshipDuration: "3 months",
    completionDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    signatoryName: "",
    signatoryDesignation: "",
  });
  const [created, setCreated] = useState<{ id: string; certificateId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const payload: any = { ...form };
      if (!payload.expiryDate) delete payload.expiryDate;
      if (!payload.description) delete payload.description;
      const res = await api.post("/certificates", payload);
      setCreated({ id: res.data.certificate.id, certificateId: res.data.certificate.certificate_id });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Failed to create certificate");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const verifyUrl = `${window.location.origin}/verify/${created.certificateId}`;
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
        <h1 className="font-display text-2xl font-bold text-ink mt-4">Certificate Created</h1>
        <p className="text-sm text-slate-500 mt-1">Certificate ID</p>
        <p className="font-mono text-ink font-semibold">{created.certificateId}</p>
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scan to verify</p>
          <VerificationQR value={verifyUrl} size={140} />
          <p className="font-mono text-xs text-slate-500 break-all max-w-sm">{verifyUrl}</p>
          <button
            onClick={() => navigator.clipboard.writeText(verifyUrl)}
            className="flex items-center justify-center gap-2 text-slate-500 text-sm hover:text-ink"
          >
            <Copy size={14} /> Copy Verification Link
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <a
            href={`/api/v1/certificates/${created.id}/pdf`}
            className="w-full flex items-center justify-center gap-2 bg-ink text-white rounded-lg py-2.5 font-medium hover:bg-ink/90"
          >
            <Download size={16} /> Download PDF
          </a>
          <button
            onClick={() => navigate(`/certificates/${created.id}`)}
            className="w-full border border-slate-300 rounded-lg py-2.5 font-medium hover:bg-slate-50"
          >
            View Certificate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= step ? "bg-ink text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i <= step ? "text-ink font-medium" : "text-slate-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        {step === 0 && (
          <>
            <Field label="Recipient Name" value={form.recipientName} onChange={(v) => update("recipientName", v)} />
            <Field label="Recipient Email" type="email" value={form.recipientEmail} onChange={(v) => update("recipientEmail", v)} />
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Certificate Title" value={form.certificateTitle} onChange={(v) => update("certificateTitle", v)} />
            <Field label="Course / Program Name" value={form.courseName} onChange={(v) => update("courseName", v)} />
            <Field label="Internship Duration" value={form.internshipDuration} onChange={(v) => update("internshipDuration", v)} />
            <Field label="Description (optional)" value={form.description} onChange={(v) => update("description", v)} />
            <Field label="Completion Date" type="date" value={form.completionDate} onChange={(v) => update("completionDate", v)} />
            <Field label="Expiry Date (optional)" type="date" value={form.expiryDate} onChange={(v) => update("expiryDate", v)} />
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Signatory Name" value={form.signatoryName} onChange={(v) => update("signatoryName", v)} />
            <Field label="Signatory Designation" value={form.signatoryDesignation} onChange={(v) => update("signatoryDesignation", v)} />
          </>
        )}
        {step === 3 && (
          <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center">
            <p className="text-sm text-slate-500 mb-4">Preview</p>
            <h2 className="font-display text-xl font-bold text-ink">{form.certificateTitle || "Certificate Title"}</h2>
            <p className="text-sm text-slate-500 mt-2">This certifies that</p>
            <p className="font-display text-lg font-bold text-ink mt-1">{form.recipientName || "Recipient Name"}</p>
            <p className="text-sm text-slate-500 mt-2">has completed</p>
            <p className="font-semibold text-ink">{form.courseName || "Course Name"}</p>
            <p className="text-sm text-slate-500 mt-3">
              Internship duration: <span className="font-medium text-ink">{form.internshipDuration || "3 months"}</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Completion date: <span className="font-medium text-ink">{form.completionDate || "YYYY-MM-DD"}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="px-5 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90"
          >
            Next
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={submit}
            className="px-5 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate Certificate"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
      />
    </div>
  );
}
