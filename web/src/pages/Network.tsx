import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as connectionsApi from "../api/connections";
import { useAuth } from "../context/AuthContext";

export function Network() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["users", search],
    queryFn: () => connectionsApi.listUsers(search),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionsApi.listConnections(),
  });

  const sendRequest = useMutation({
    mutationFn: connectionsApi.sendConnectionRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections"] }),
  });

  const accept = useMutation({
    mutationFn: connectionsApi.acceptConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections"] }),
  });

  const decline = useMutation({
    mutationFn: connectionsApi.declineConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections"] }),
  });

  const pendingReceived = connections.filter(
    (c) => c.status === "PENDING" && c.addresseeId === user?.id
  );
  const accepted = connections.filter((c) => c.status === "ACCEPTED");
  const connectedIds = new Set(
    connections
      .filter((c) => c.status !== "DECLINED")
      .flatMap((c) => [c.requesterId, c.addresseeId])
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Abbey Circle</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/profile" className="text-slate-300 hover:text-white">
            {user?.name}
          </Link>
          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        {pendingReceived.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">
              Pending Requests ({pendingReceived.length})
            </h2>
            <div className="space-y-2">
              {pendingReceived.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{c.requester.name}</p>
                    <p className="text-sm text-slate-400">
                      {c.requester.role.replace("_", " ")}
                      {c.requester.company ? ` · ${c.requester.company}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => accept.mutate(c.id)}
                      className="bg-green-600 hover:bg-green-500 text-sm px-3 py-1.5 rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => decline.mutate(c.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded-lg"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3">
            My Connections ({accepted.length})
          </h2>
          {accepted.length === 0 ? (
            <p className="text-slate-500 text-sm">No connections yet.</p>
          ) : (
            <div className="space-y-2">
              {accepted.map((c) => {
                const other = c.requesterId === user?.id ? c.addressee : c.requester;
                return (
                  <div key={c.id} className="bg-slate-800 rounded-lg p-4">
                    <p className="font-medium">{other.name}</p>
                    <p className="text-sm text-slate-400">
                      {other.role.replace("_", " ")}
                      {other.company ? ` · ${other.company}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Find People</h2>
          <input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-slate-800 text-white px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-2">
            {users.map((u) => {
              const isConnected = connectedIds.has(u.id);
              return (
                <div
                  key={u.id}
                  className="bg-slate-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-slate-400">
                      {u.role.replace("_", " ")}
                      {u.company ? ` · ${u.company}` : ""}
                    </p>
                  </div>
                  <button
                    disabled={isConnected || sendRequest.isPending}
                    onClick={() => sendRequest.mutate(u.id)}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm px-3 py-1.5 rounded-lg"
                  >
                    {isConnected ? "Connected" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}