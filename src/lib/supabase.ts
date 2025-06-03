import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key not found in environment variables');
}

if (!supabaseServiceKey) {
  console.warn('Supabase Service Role Key not found - admin operations may fail');
}

// Regular client for public operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database table names
export const TABLES = {
  UPLOADERS: 'uploaders',
  MUZAKKI: 'muzakki',
  DISTRIBUSI: 'distribusi',
  UPLOAD_HISTORY: 'upload_history',
  REF_PROVINSI: 'ref_provinsi',
  REF_KABUPATEN: 'ref_kabupaten',
} as const; 