import { useEffect, useState, FormEvent } from "react";
import { api } from "../lib/api";

export function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/organization").then((r) => {
      setName(r.data.organization.name);
      setEmail(r.data.organization.email);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api.patch("/organization", { name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Organization Settings</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-600">Organization Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Organization Email</label>
          <input value={email} disabled className="mt-1 w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500" />
        </div>
        <button className="bg-ink text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-ink/90">
          Save Changes
        </button>
        {saved && <span className="ml-3 text-sm text-emerald-600">Saved!</span>}
      </form>
    </div>
  );
}
