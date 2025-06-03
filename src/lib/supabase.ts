import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names for the system
export const TABLES = {
  UPLOADERS: 'uploaders',
  MUZAKKI: 'muzakki',
  DISTRIBUSI: 'distribusi',
  UPLOAD_HISTORY: 'upload_history'
} as const;

// Types for the system
export interface Uploader {
  id: string;
  email: string;
  name: string;
  mitra_name: string;
  upload_key: string;
  is_active: boolean;
  created_at: string;
}

export interface Muzakki {
  id?: string;
  uploader_id: string;
  nama_muzakki: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  provinsi?: string;
  kabupaten?: string;
  jenis_hewan: 'Sapi' | 'Kambing' | 'Domba';
  jumlah_hewan: number;
  nilai_qurban: number;
  tanggal_penyerahan?: string;
  created_at?: string;
}

export interface Distribusi {
  id?: string;
  uploader_id: string;
  nama_penerima: string;
  alamat_penerima: string;
  provinsi?: string;
  kabupaten?: string;
  jenis_hewan: 'Sapi' | 'Kambing' | 'Domba';
  jumlah_daging?: number;
  tanggal_distribusi: string;
  foto_distribusi_url?: string;
  status?: string;
  catatan?: string;
  created_at?: string;
}

export interface UploadHistory {
  id?: string;
  uploader_id: string;
  filename: string;
  file_type: 'muzakki' | 'distribusi';
  total_records: number;
  successful_records: number;
  failed_records: number;
  file_size_bytes?: number;
  upload_status: string;
  created_at?: string;
}

// Helper functions
export const authenticateUploader = async (uploadKey: string): Promise<Uploader | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.UPLOADERS)
      .select('*')
      .eq('upload_key', uploadKey.trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Authentication failed:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const saveMuzakkiData = async (records: Muzakki[]): Promise<{ success: number; duplicates: number; errors: any[] }> => {
  try {
    let successCount = 0;
    let duplicateCount = 0;
    const errors: any[] = [];

    // Process records one by one to handle duplicates
    for (const record of records) {
      try {
        // Check if record already exists (nama + telepon combination)
        const { data: existing, error: checkError } = await supabase
          .from(TABLES.MUZAKKI)
          .select('id')
          .eq('nama_muzakki', record.nama_muzakki)
          .eq('telepon', record.telepon || '')
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is what we want
          errors.push(checkError);
          continue;
        }

        if (existing) {
          // Record already exists - skip as duplicate
          duplicateCount++;
          console.log(`⚠️ Duplicate skipped: ${record.nama_muzakki} (${record.telepon})`);
          continue;
        }

        // Record doesn't exist - insert it
        const { data, error } = await supabase
          .from(TABLES.MUZAKKI)
          .insert([record])
          .select();

        if (error) {
          errors.push(error);
        } else if (data && data.length > 0) {
          successCount++;
          console.log(`✅ Inserted: ${record.nama_muzakki}`);
        }
      } catch (err) {
        errors.push(err);
      }
    }

    return { success: successCount, duplicates: duplicateCount, errors };
  } catch (error) {
    console.error('Error saving muzakki data:', error);
    return { success: 0, duplicates: 0, errors: [error] };
  }
};

export const saveDistribusiData = async (records: Distribusi[]): Promise<{ success: number; duplicates: number; errors: any[] }> => {
  try {
    let successCount = 0;
    let duplicateCount = 0;
    const errors: any[] = [];

    // Process records one by one to handle duplicates
    for (const record of records) {
      try {
        // Check if record already exists (nama + alamat combination)
        const { data: existing, error: checkError } = await supabase
          .from(TABLES.DISTRIBUSI)
          .select('id')
          .eq('nama_penerima', record.nama_penerima)
          .eq('alamat_penerima', record.alamat_penerima)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is what we want
          errors.push(checkError);
          continue;
        }

        if (existing) {
          // Record already exists - skip as duplicate
          duplicateCount++;
          console.log(`⚠️ Duplicate skipped: ${record.nama_penerima} (${record.alamat_penerima})`);
          continue;
        }

        // Record doesn't exist - insert it
        const { data, error } = await supabase
          .from(TABLES.DISTRIBUSI)
          .insert([record])
          .select();

        if (error) {
          errors.push(error);
        } else if (data && data.length > 0) {
          successCount++;
          console.log(`✅ Inserted: ${record.nama_penerima}`);
        }
      } catch (err) {
        errors.push(err);
      }
    }

    return { success: successCount, duplicates: duplicateCount, errors };
  } catch (error) {
    console.error('Error saving distribusi data:', error);
    return { success: 0, duplicates: 0, errors: [error] };
  }
};

export const saveUploadHistory = async (record: UploadHistory): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.UPLOAD_HISTORY)
      .insert([record]);

    if (error) {
      console.error('Error saving upload history:', error);
    }
  } catch (error) {
    console.error('Error saving upload history:', error);
  }
}; 