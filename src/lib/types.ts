export type Role = "assembly" | "delivery" | "admin";

export type DeliveryStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  company_name: string;
  role: Role;
  phone: string | null;
  business_desc: string | null;
  conflict_buffer_minutes: number;
  created_at: string;
}

export interface Delivery {
  id: string;
  delivery_company_id: string;
  assembly_company_id: string;
  requested_at: string;
  lot_no: string;
  wo_no: string;
  contact_phone: string | null;
  note: string | null;
  status: DeliveryStatus;
  reject_reason: string | null;
  revision: number;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A Delivery with the delivery company's name already resolved, for
 * passing down to client components without re-fetching profiles. */
export interface DeliveryWithCompany extends Delivery {
  company_name: string;
}

export type FeedbackStatus = "open" | "answered" | "resolved";

export interface Feedback {
  id: string;
  reporter_id: string;
  message: string;
  image_path: string | null;
  status: FeedbackStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}
