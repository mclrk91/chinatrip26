export interface Booking {
  id: string;
  type: "flight" | "hotel" | "tour" | "activity" | "transport" | "restaurant" | "other";
  status: "confirmed" | "cancelled" | "pending" | "modified";
  title: string;
  date_start: string | null;
  date_end: string | null;
  provider: string | null;
  confirmation_code: string | null;
  alt_codes: Record<string, string>;
  travelers: string[];
  details: Record<string, unknown>;
  payment_method: string | null;
  cost: Record<string, unknown>;
  cancellation_policy: string | null;
  booking_url: string | null;
  notes: string | null;
  raw_file_url: string | null;
  gdrive_file_id: string | null;
  wanderlog_synced: boolean;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type BookingInsert = Omit<Booking, "id" | "created_at" | "updated_at" | "wanderlog_synced">;

export interface DayNote {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  created_at: string;
  updated_at: string;
}

export type LoyaltyCategory =
  | "airline"
  | "hotel"
  | "known_traveler"
  | "credit_card"
  | "other";

export interface LoyaltyNumber {
  id: string;
  traveler_name: string;
  category: LoyaltyCategory;
  program_name: string;
  number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
