import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for server-side operations (with service role key)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types for better TypeScript support
export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  message: string;
  submitted_at?: string;
  user_agent?: string;
  ip?: string;
  status?: 'new' | 'read' | 'replied';
  created_at?: string;
}

export interface InteractionLog {
  id?: number;
  session_id: string;
  action: string;
  data?: any;
  user_agent?: string;
  ip?: string;
  created_at?: string;
}
