import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// In Vite, env vars need VITE_ prefix to be accessible in browser
// But we also check for the non-prefixed version for flexibility
const getServiceKey = () => {
  // Check if we have the VITE_ prefixed version first (this will work in browser)
  if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    return import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  }
  
  // Fallback to non-prefixed (may not work in browser with Vite)
  // User should add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local
  return import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';
};

const supabaseServiceKey = getServiceKey();

// Check if we're in demo mode (invalid URLs or demo credentials)
const isDemoMode = !supabaseUrl || 
                   supabaseUrl.includes('demo') || 
                   supabaseKey.includes('demo') || 
                   supabaseKey.length < 100; // Real Supabase keys are much longer

// Debug environment variables (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Environment Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    hasServiceKey: !!supabaseServiceKey,
    url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing',
    keyLength: supabaseKey ? supabaseKey.length : 0,
    serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
    isDemoMode: isDemoMode,
    // Debug which env vars are available
    envVars: {
      VITE_SUPABASE_SERVICE_ROLE_KEY: !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  
  // Show a helpful message if service key is missing
  if (!supabaseServiceKey) {
    console.warn('🚨 IMPORTANT: Service role key not found!');
    console.warn('📝 Please add to your .env.local file:');
    console.warn('   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
    console.warn('🔍 Vite requires VITE_ prefix for client-side environment variables');
  }
}

// Create mock clients for demo mode
const createMockClient = () => ({
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: { message: 'Demo mode - no real data' } }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Demo mode - insert simulated' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Demo mode - update simulated' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Demo mode - delete simulated' } }),
    eq: function() { return this; },
    in: function() { return this; },
    limit: function() { return this; },
    single: function() { return this; }
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signIn: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
    signOut: () => Promise.resolve({ error: null })
  }
});

// Create singleton clients to avoid multiple instances
let _supabase: any = null;
let _supabaseAdmin: any = null;

// Regular client for public operations (singleton with unique storage key)
export const supabase = (() => {
  if (!_supabase) {
    if (isDemoMode) {
      console.log('🎭 Creating demo Supabase client');
      _supabase = createMockClient();
    } else {
      _supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          storageKey: 'mtt-qurban-public', // Unique storage key to prevent conflicts
          autoRefreshToken: true,
          persistSession: false // Disable persistence for upload tool
        }
      });
    }
  }
  return _supabase;
})();

// Service role client for admin operations (singleton with unique storage key)
export const supabaseAdmin = (() => {
  if (!_supabaseAdmin) {
    if (isDemoMode) {
      console.log('🎭 Creating demo Supabase admin client');
      _supabaseAdmin = createMockClient();
    } else if (supabaseServiceKey) {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          storageKey: 'mtt-qurban-admin', // Unique storage key to prevent conflicts
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      });
    } else {
      console.warn('⚠️ Service role key not found - using regular client for admin operations');
      _supabaseAdmin = supabase;
    }
  }
  return _supabaseAdmin;
})();

// Database table names
export const TABLES = {
  UPLOADERS: 'uploaders',
  MUZAKKI: 'muzakki',
  DISTRIBUSI: 'distribusi',
  UPLOAD_HISTORY: 'upload_history',
  REF_PROVINSI: 'ref_provinsi',
  REF_KABUPATEN: 'ref_kabupaten',
} as const;

// Export demo mode status
export const isInDemoMode = isDemoMode;

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    if (isDemoMode) {
      console.log('🎭 Demo mode active - no real connection test needed');
      return true;
    }
    
    // Test with a simple query
    const { data, error } = await supabaseAdmin
      .from('uploaders')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}; 