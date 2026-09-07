import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as accountApi from "../api/account";

export function Profile() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: accountApi.getMe });

  const [form, setForm] = useState({ name: "", company: "", bio: "", phone: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        company: user.company || "",
        bio: user.bio || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: accountApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(form);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Abbey Circle</h1>
        <Link to="/network" className="text-slate-300 hover:text-white text-sm">
          ← Back to Network
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-slate-400">{user.email}</p>
          <p className="text-sm text-slate-400">{user.role.replace("_", " ")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Company</label>
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="w-full rounded-lg bg-slate-800 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition"
          >
            {updateMutation.isPending ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}