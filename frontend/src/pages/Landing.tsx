import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, FilePlus2, QrCode, ScanLine, BadgeCheck } from "lucide-react";
import { LogoMark } from "../components/LogoMark";

export function Landing() {
  const steps = [
    { icon: FilePlus2, label: "CREATE" },
    { icon: QrCode, label: "GENERATE" },
    { icon: ScanLine, label: "SCAN" },
    { icon: BadgeCheck, label: "VERIFY" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="flex justify-center mb-6">
        <LogoMark size={96} />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-display text-5xl font-bold text-ink leading-tight"
      >
        Issue certificates.
        <br />
        Verify them instantly.
      </motion.h1>
      <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto">
        Create professional digital certificates with built-in QR verification.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link to="/register" className="bg-ink text-white px-6 py-3 rounded-lg font-medium hover:bg-ink/90">
          Create Certificate
        </Link>
        <Link
          to="/verify/CERT-DEMO"
          className="border border-slate-300 text-ink px-6 py-3 rounded-lg font-medium hover:bg-slate-50"
        >
          Verify Certificate
        </Link>
      </div>

      <div className="mt-24 flex items-center justify-center gap-6">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-ink/5 border border-ink/10 flex items-center justify-center text-ink">
                <s.icon size={22} />
              </div>
              <span className="text-xs font-semibold tracking-wide text-slate-500">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowDown size={16} className="rotate-[-90deg] text-slate-300" />}
          </div>
        ))}
      </div>
    </div>
  );
}
