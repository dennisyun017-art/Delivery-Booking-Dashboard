export type Role = "assembly" | "delivery";

export type DeliveryStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  company_name: string;
  role: Role;
  phone: string | null;
  conflict_buffer_minutes: number;
  created_at: string;
}

export interface Delivery {
  id: string;
  delivery_company_id: string;
  assembly_company_id: string;
  requested_at: string;
  note: string | null;
  status: DeliveryStatus;
  reject_reason: string | null;
  revision: number;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}
