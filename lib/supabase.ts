import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase URL:', supabaseUrl);
  console.log('🔍 Supabase Key exists:', !!supabaseAnonKey);
  console.log('🔍 Supabase Key length:', supabaseAnonKey.length);
}

// Regular client for normal operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for admin operations (server-side only)
// Use service role key for admin features
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

