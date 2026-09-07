import { api } from "./client";
import type { Connection, User } from "../types";

export function listUsers(search: string) {
  return api.get<{ users: User[] }>(`/users?search=${encodeURIComponent(search)}`).then((r) => r.data.users);
}

export function listConnections(status?: string) {
  const query = status ? `?status=${status}` : "";
  return api.get<{ connections: Connection[] }>(`/connections${query}`).then((r) => r.data.connections);
}

export function sendConnectionRequest(userId: string) {
  return api.post<{ connection: Connection }>(`/connections/request/${userId}`).then((r) => r.data.connection);
}

export function acceptConnection(id: string) {
  return api.post<{ connection: Connection }>(`/connections/${id}/accept`).then((r) => r.data.connection);
}

export function declineConnection(id: string) {
  return api.post<{ connection: Connection }>(`/connections/${id}/decline`).then((r) => r.data.connection);
}