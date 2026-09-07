import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT" as Role,
    company: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/network");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(typeof message === "string" ? message : "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-slate-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-slate-400 text-sm mb-6">Join Abbey Circle</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CLIENT">Client</option>
              <option value="LOAN_OFFICER">Loan Officer</option>
              <option value="REALTOR">Realtor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Company (optional)</label>
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-slate-400 text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}