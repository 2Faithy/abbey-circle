export type Role = "LOAN_OFFICER" | "REALTOR" | "CLIENT";
export type ConnectionStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company: string | null;
  bio: string | null;
  phone: string | null;
}

export interface Connection {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: ConnectionStatus;
  createdAt: string;
  requester: Pick<User, "id" | "name" | "email" | "role" | "company">;
  addressee: Pick<User, "id" | "name" | "email" | "role" | "company">;
}