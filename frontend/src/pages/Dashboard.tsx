import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Certificate } from "../types";

interface Stats {
  total: number;
  valid: number;
  revoked: number;
  expired: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Certificate[]>([]);
  const [vStats, setVStats] = useState<{ total: number; today: number } | null>(null);

  useEffect(() => {
    api.get("/certificates/stats/dashboard").then((r) => setStats(r.data));
    api.get("/certificates?page=1&pageSize=5").then((r) => setRecent(r.data.items));
    api.get("/verification/stats").then((r) => setVStats(r.data));
  }, []);

  const cards = [
    { label: "Total Certificates", value: stats?.total ?? "—" },
    { label: "Valid", value: stats?.valid ?? "—" },
    { label: "Revoked", value: stats?.revoked ?? "—" },
    { label: "Expired", value: stats?.expired ?? "—" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <Link to="/certificates/create" className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90">
          + New Certificate
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="text-3xl font-bold text-ink mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      {vStats && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm text-slate-500">Total Verifications</div>
            <div className="text-2xl font-bold text-ink mt-1">{vStats.total}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm text-slate-500">Verifications Today</div>
            <div className="text-2xl font-bold text-ink mt-1">{vStats.today}</div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 font-semibold text-ink">Recent Certificates</div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">No certificates yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Recipient</th>
                <th className="px-5 py-3 font-medium">Certificate</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/certificates/${c.id}`} className="text-ink hover:underline">
                      {c.recipient_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.course_name}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(c.completion_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
