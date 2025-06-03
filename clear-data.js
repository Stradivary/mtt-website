import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

console.log('🧹 Clearing existing reference data...')

try {
  // Clear kabupaten first (due to foreign key constraint)
  console.log('🗑️ Clearing kabupaten...')
  const { error: kabError } = await supabase
    .from('ref_kabupaten')
    .delete()
    .neq('id', 0)
  
  if (kabError) {
    console.log('⚠️ Kabupaten clear warning:', kabError.message)
  } else {
    console.log('✅ Kabupaten cleared')
  }

  // Clear provinces
  console.log('🗑️ Clearing provinces...')
  const { error: provError } = await supabase
    .from('ref_provinsi')
    .delete()
    .neq('id', 0)
  
  if (provError) {
    console.log('⚠️ Provinces clear warning:', provError.message)
  } else {
    console.log('✅ Provinces cleared')
  }

  // Check counts
  const { count: provCount } = await supabase
    .from('ref_provinsi')
    .select('*', { count: 'exact', head: true })
    
  const { count: kabCount } = await supabase
    .from('ref_kabupaten')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Final counts: ${provCount || 0} provinces, ${kabCount || 0} kabupaten`)
  console.log('🎯 Database cleared successfully!')

} catch (err) {
  console.error('❌ Clear error:', err.message)
} 