import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Environment Check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Found' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

console.log('\n🔍 Testing connection...')
console.log('URL:', supabaseUrl.substring(0, 30) + '...')

try {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data, error } = await supabase
    .from('ref_provinsi')
    .select('count(*)', { count: 'exact' })
  
  if (error) {
    console.error('❌ Connection failed:', error.message)
  } else {
    console.log('✅ Connection successful!')
    console.log('📊 Provinces count:', data[0]?.count || 0)
  }
} catch (err) {
  console.error('❌ Error:', err.message)
} 