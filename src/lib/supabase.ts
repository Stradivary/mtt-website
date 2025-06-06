import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with cache control
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  // Disable automatic retries to get fresh errors instead of cached responses
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Cache-busting utility function
export const createQueryWithCacheBuster = (query: any) => {
  const timestamp = Date.now();
  console.log(`🔄 Query with cache buster: ${timestamp}`);
  
  // Add cache-busting order by to force new query plan
  return query.order('id', { ascending: false });
};

// Fresh data retrieval wrapper
export const fetchFreshData = async (tableName: string, selectQuery: string = '*', limit?: number) => {
  console.log(`🔄 Fetching fresh data from ${tableName}`);
  
  let query = supabase
    .from(tableName)
    .select(selectQuery)
    .order('created_at', { ascending: false }); // Force chronological order
    
  if (limit) {
    query = query.limit(limit);
  }
  
  const result = await query;
  
  if (result.error) {
    console.error(`❌ Error fetching from ${tableName}:`, result.error);
  } else {
    console.log(`✅ Fresh data retrieved from ${tableName}: ${result.data?.length || 0} records`);
  }
  
  return result;
};

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
  jenis_hewan: 'Sapi' | 'Sapi 1/7' | 'Domba';
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
  jenis_hewan: 'Sapi' | 'Sapi 1/7' | 'Domba';
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
        // Safer duplicate check with better error handling
        let isDuplicate = false;
        try {
        const { data: existing, error: checkError } = await supabase
          .from(TABLES.MUZAKKI)
          .select('id')
          .eq('nama_muzakki', record.nama_muzakki)
          .eq('telepon', record.telepon || '')
            .limit(1); // Add explicit limit to reduce query complexity

          if (checkError) {
            if (checkError.code === 'PGRST116') {
              // PGRST116 = no rows returned, which means no duplicate
              console.log(`✅ No duplicate found for: ${record.nama_muzakki}`);
              isDuplicate = false;
            } else {
              // Other error - try alternative duplicate checking method
              console.warn(`⚠️ Standard duplicate check failed, trying alternative method:`, checkError.message);
              
              // Alternative: Use simple name-only check which might be more reliable
              const { data: altExisting, error: altCheckError } = await supabase
                .from(TABLES.MUZAKKI)
                .select('id')
                .eq('nama_muzakki', record.nama_muzakki)
                .limit(1);
                
              if (altCheckError) {
                console.warn(`⚠️ Alternative duplicate check also failed, proceeding with insert:`, altCheckError.message);
                isDuplicate = false;
              } else {
                isDuplicate = altExisting && altExisting.length > 0;
              }
            }
          } else {
            isDuplicate = existing && existing.length > 0;
          }
        } catch (duplicateCheckError) {
          console.warn(`⚠️ Duplicate check exception, proceeding with insert:`, duplicateCheckError);
          isDuplicate = false;
        }

        if (isDuplicate) {
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

    console.log(`📊 Starting to save ${records.length} distribusi records`);

    // Process records one by one to handle duplicates
    for (const record of records) {
      try {
        console.log(`🔍 Processing record: ${record.nama_penerima} - ${record.alamat_penerima}`);
        
        // Validate record before checking duplicates
        if (!record.nama_penerima || !record.alamat_penerima) {
          console.error(`❌ Invalid record - missing required fields:`, record);
          errors.push({ message: `Missing required fields: nama_penerima or alamat_penerima`, record });
          continue;
        }

        // Safer duplicate check with better error handling
        let isDuplicate = false;
        try {
        const { data: existing, error: checkError } = await supabase
          .from(TABLES.DISTRIBUSI)
          .select('id')
          .eq('nama_penerima', record.nama_penerima)
          .eq('alamat_penerima', record.alamat_penerima)
            .limit(1); // Add explicit limit to reduce query complexity

          if (checkError) {
            if (checkError.code === 'PGRST116') {
              // PGRST116 = no rows returned, which means no duplicate
              console.log(`✅ No duplicate found for: ${record.nama_penerima}`);
              isDuplicate = false;
            } else {
              // Other error - try alternative duplicate checking method
              console.warn(`⚠️ Standard duplicate check failed, trying alternative method:`, checkError.message);
              
              // Alternative: Use text search which might be more reliable
              const { data: altExisting, error: altCheckError } = await supabase
                .from(TABLES.DISTRIBUSI)
                .select('id')
                .textSearch('nama_penerima', record.nama_penerima.replace(/['"]/g, ''))
                .textSearch('alamat_penerima', record.alamat_penerima.replace(/['"]/g, ''))
                .limit(1);
                
              if (altCheckError) {
                console.warn(`⚠️ Alternative duplicate check also failed, proceeding with insert:`, altCheckError.message);
                isDuplicate = false;
              } else {
                isDuplicate = altExisting && altExisting.length > 0;
              }
            }
          } else {
            isDuplicate = existing && existing.length > 0;
          }
        } catch (duplicateCheckError) {
          console.warn(`⚠️ Duplicate check exception, proceeding with insert:`, duplicateCheckError);
          isDuplicate = false;
        }

        if (isDuplicate) {
          // Record already exists - skip as duplicate
          duplicateCount++;
          console.log(`⚠️ Duplicate skipped: ${record.nama_penerima} (${record.alamat_penerima})`);
          continue;
        }

        // Record doesn't exist - insert it
        console.log(`✅ Inserting new record: ${record.nama_penerima}`);
        
        // Clean the record one more time before insertion
        const insertRecord = {
          ...record,
          nama_penerima: record.nama_penerima.trim(),
          alamat_penerima: record.alamat_penerima.trim(),
          // Ensure tanggal_distribusi is in correct format
          tanggal_distribusi: record.tanggal_distribusi || new Date().toISOString().split('T')[0]
        };
        
        const { data, error } = await supabase
          .from(TABLES.DISTRIBUSI)
          .insert([insertRecord])
          .select();

        if (error) {
          console.error(`❌ Insert error for ${record.nama_penerima}:`, error);
          console.error(`❌ Record data:`, insertRecord);
          errors.push({ message: `Insert failed: ${error.message}`, record: insertRecord, error });
        } else if (data && data.length > 0) {
          successCount++;
          console.log(`✅ Inserted: ${record.nama_penerima}`);
        }
      } catch (err) {
        console.error(`❌ Unexpected error processing ${record.nama_penerima}:`, err);
        errors.push({ message: `Unexpected error: ${err}`, record, error: err });
      }
    }

    console.log(`📊 Distribusi save complete: ${successCount} success, ${duplicateCount} duplicates, ${errors.length} errors`);
    return { success: successCount, duplicates: duplicateCount, errors };
  } catch (error) {
    console.error('❌ Error saving distribusi data:', error);
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