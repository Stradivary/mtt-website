import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Supabase Key:', supabaseKey?.substring(0, 20) + '...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

try {
  console.log('🔍 Testing connection...')
  const { data, error } = await supabase
    .from('ref_provinsi')
    .select('count(*)', { count: 'exact' })
  
  if (error) {
    console.error('❌ Connection failed:', error.message)
  } else {
    console.log('✅ Connection successful!')
    console.log('📊 Current provinces:', data[0]?.count || 0)
  }
} catch (err) {
  console.error('❌ Error:', err.message)
} 