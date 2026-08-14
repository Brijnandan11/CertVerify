import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogoMark } from "../components/LogoMark";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organizationName: "",
    organizationEmail: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "organizationName", label: "Organization Name", type: "text" },
    { key: "organizationEmail", label: "Organization Email", type: "email" },
    { key: "name", label: "Your Name", type: "text" },
    { key: "email", label: "Your Email", type: "email" },
    { key: "password", label: "Password", type: "password" },
  ];

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="flex justify-center mb-6">
        <LogoMark size={72} />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Create your organization</h1>
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm text-slate-600">{f.label}</label>
            <input
              type={f.type}
              required
              minLength={f.key === "password" ? 8 : undefined}
              value={(form as any)[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </div>
        ))}
        <button
          disabled={loading}
          className="w-full bg-ink text-white rounded-lg py-2.5 font-medium hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-500">
        Already have an account? <Link to="/login" className="text-ink font-medium">Sign in</Link>
      </p>
    </div>
  );
}
