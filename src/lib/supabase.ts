import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser-safe Supabase client (anon key). Server writes use `@/lib/supabase-admin`. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  message: string;
  submitted_at?: string;
  user_agent?: string;
  ip?: string;
  status?: "new" | "read" | "replied";
  created_at?: string;
}

export interface InteractionLog {
  id?: number;
  session_id: string;
  action: string;
  data?: unknown;
  user_agent?: string;
  ip?: string;
  created_at?: string;
}
