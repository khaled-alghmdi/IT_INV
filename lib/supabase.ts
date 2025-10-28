import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase URL:', supabaseUrl);
  console.log('🔍 Supabase Key exists:', !!supabaseAnonKey);
  console.log('🔍 Supabase Key length:', supabaseAnonKey.length);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

