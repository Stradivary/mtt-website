import { supabase, TABLES } from '../lib/supabase';

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  time: number;
}

export class SupabaseConnectionTest {
  async testConnection(): Promise<TestResult> {
    const start = Date.now();
    try {
      const { data, error } = await supabase.from('test').select('*').limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, but connection works
        return {
          name: 'Database Connection',
          status: 'success',
          message: '✅ Koneksi berhasil! Database accessible.',
          time: Date.now() - start
        };
      } else if (error) {
        return {
          name: 'Database Connection',
          status: 'error', 
          message: `❌ Connection error: ${error.message}`,
          time: Date.now() - start
        };
      } else {
        return {
          name: 'Database Connection',
          status: 'success',
          message: '✅ Koneksi berhasil! Database connected.',
          time: Date.now() - start
        };
      }
    } catch (err: any) {
      return {
        name: 'Database Connection',
        status: 'error',
        message: `❌ Network error: ${err.message}`,
        time: Date.now() - start
      };
    }
  }

  async testTables(): Promise<TestResult> {
    const start = Date.now();
    try {
      // Test if expected tables exist
      const tableTests = [
        { name: 'muzakki', query: supabase.from(TABLES.MUZAKKI).select('*').limit(1) },
        { name: 'distribusi', query: supabase.from(TABLES.DISTRIBUSI).select('*').limit(1) },
        { name: 'upload_history', query: supabase.from(TABLES.UPLOAD_HISTORY).select('*').limit(1) },
        { name: 'uploaders', query: supabase.from(TABLES.UPLOADERS).select('*').limit(1) },
        { name: 'ref_provinsi', query: supabase.from(TABLES.REF_PROVINSI).select('*').limit(1) },
        { name: 'ref_kabupaten', query: supabase.from(TABLES.REF_KABUPATEN).select('*').limit(1) }
      ];

      const results = await Promise.all(
        tableTests.map(async (test) => {
          try {
            const { error } = await test.query;
            return {
              table: test.name,
              exists: !error || error.code === 'PGRST116' || error.code === 'PGRST103'
            };
          } catch {
            return { table: test.name, exists: false };
          }
        })
      );

      const existingTables = results.filter(r => r.exists).map(r => r.table);
      const missingTables = results.filter(r => !r.exists).map(r => r.table);

      if (existingTables.length === 0) {
        return {
          name: 'Database Tables',
          status: 'error',
          message: '❌ Tidak ada tabel yang ditemukan. Database mungkin belum dikonfigurasi.',
          time: Date.now() - start
        };
      } else if (missingTables.length > 0) {
        return {
          name: 'Database Tables',
          status: 'warning',
          message: `⚠️ ${existingTables.length}/6 tabel tersedia. Missing: ${missingTables.join(', ')}`,
          time: Date.now() - start
        };
      } else {
        return {
          name: 'Database Tables',
          status: 'success',
          message: `✅ Semua tabel tersedia (${existingTables.length}/6): ${existingTables.join(', ')}`,
          time: Date.now() - start
        };
      }
    } catch (err: any) {
      return {
        name: 'Database Tables',
        status: 'error',
        message: `❌ Table test error: ${err.message}`,
        time: Date.now() - start
      };
    }
  }

  async testUploadCapability(): Promise<TestResult> {
    const start = Date.now();
    try {
      // Test uploaders table and sample insert capability
      const { data: uploaders, error: uploadersError } = await supabase
        .from(TABLES.UPLOADERS)
        .select('*')
        .limit(1);

      if (uploadersError) {
        return {
          name: 'Upload Capability',
          status: 'error',
          message: `❌ Cannot access uploaders table: ${uploadersError.message}`,
          time: Date.now() - start
        };
      }

      // Test insert permission with dry run
      const testRecord = {
        email: 'test@example.com',
        name: 'Test User',
        mitra_name: 'Test Mitra',
        upload_key: 'test-key-' + Date.now(),
        is_active: false
      };

      const { error: insertError } = await supabase
        .from(TABLES.UPLOADERS)
        .insert(testRecord)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          // Duplicate key - means structure is OK
          return {
            name: 'Upload Capability',
            status: 'success',
            message: '✅ Upload struktur OK. Database siap untuk upload data.',
            time: Date.now() - start
          };
        } else {
          return {
            name: 'Upload Capability',
            status: 'warning',
            message: `⚠️ Upload test warning: ${insertError.message}`,
            time: Date.now() - start
          };
        }
      } else {
        // Successfully inserted - clean up test record
        await supabase
          .from(TABLES.UPLOADERS)
          .delete()
          .eq('upload_key', testRecord.upload_key);

        return {
          name: 'Upload Capability',
          status: 'success',
          message: '✅ Upload capability confirmed. Database ready for real data.',
          time: Date.now() - start
        };
      }
    } catch (err: any) {
      return {
        name: 'Upload Capability',
        status: 'error',
        message: `❌ Upload test error: ${err.message}`,
        time: Date.now() - start
      };
    }
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Supabase Backend Tests...\n');
    
    const results: TestResult[] = [];

    // Test 1: Connection
    console.log('Testing database connection...');
    const connectionResult = await this.testConnection();
    results.push(connectionResult);
    console.log(`${connectionResult.message} (${connectionResult.time}ms)\n`);

    if (connectionResult.status === 'success') {
      // Test 2: Tables
      console.log('Testing database tables...');
      const tablesResult = await this.testTables();
      results.push(tablesResult);
      console.log(`${tablesResult.message} (${tablesResult.time}ms)\n`);

      // Test 3: Upload capability
      console.log('Testing upload capability...');
      const uploadResult = await this.testUploadCapability();
      results.push(uploadResult);
      console.log(`${uploadResult.message} (${uploadResult.time}ms)\n`);
    } else {
      console.log('⚠️ Skipping further tests due to connection failure.\n');
    }

    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log('📊 Test Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Warning: ${warningCount}`);
    console.log(`   ❌ Error: ${errorCount}`);
    
    if (errorCount === 0 && warningCount === 0) {
      console.log('\n🎉 Semua test berhasil! Database siap untuk upload sample data.');
    } else if (errorCount === 0) {
      console.log('\n✅ Database OK dengan beberapa warning. Dapat melanjutkan upload.');
    } else {
      console.log('\n🚨 Ada error critical. Perbaiki sebelum upload sample data.');
    }

    return results;
  }
}

// Export function for direct usage
export const testSupabaseConnection = async (): Promise<TestResult[]> => {
  const tester = new SupabaseConnectionTest();
  return await tester.runAllTests();
};

// Test environment configuration
export const checkEnvironment = () => {
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  };

  console.log('🔧 Environment Configuration:');
  console.log(`   VITE_SUPABASE_URL: ${config.supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${config.supabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.log('\n🚨 Environment variables missing! Check .env.local file.\n');
    return false;
  }
  
  console.log('\n✅ Environment configuration OK.\n');
  return true;
}; 