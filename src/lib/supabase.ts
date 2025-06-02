import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table names
export const TABLES = {
  UPLOADERS: 'uploaders',
  MUZAKKI: 'muzakki',
  DISTRIBUSI: 'distribusi',
  UPLOAD_HISTORY: 'upload_history',
  REF_PROVINSI: 'ref_provinsi',
  REF_KABUPATEN: 'ref_kabupaten',
} as const; 