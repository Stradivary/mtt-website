#!/usr/bin/env node

/**
 * Supabase Test Runner Script
 * Run: node scripts/test-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

dotenv.config({ path: join(projectRoot, '.env.local') })

// Supabase Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env.local file contains:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🔧 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
console.log('🔧 Supabase Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

// Test functions
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    const { count, error } = await supabase
      .from('ref_provinsi')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log(`📊 Current provinces: ${count || 0}`)
    return true
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

async function insertIndonesiaData() {
  try {
    console.log('\n🗺️ Starting Indonesia reference data insertion...')
    
    // Check existing data
    const { count: existingCount } = await supabase
      .from('ref_provinsi')
      .select('*', { count: 'exact', head: true })
    
    if (existingCount && existingCount > 0) {
      console.log('⚠️ Found ${existingCount} provinces. Clearing first...')
      
      // Clear existing data
      await supabase.from('ref_kabupaten').delete().gte('id', 0)
      await supabase.from('ref_provinsi').delete().gte('id', 0)
      
      console.log('🧹 Existing data cleared.')
    }
    
    // 38 Provinces data
    const provinces = [
      { kode_provinsi: 11, nama_provinsi: 'Aceh', latitude: 4.695135, longitude: 96.749397 },
      { kode_provinsi: 12, nama_provinsi: 'Sumatera Utara', latitude: 2.1153547, longitude: 99.5450974 },
      { kode_provinsi: 13, nama_provinsi: 'Sumatera Barat', latitude: -0.7399397, longitude: 100.8000051 },
      { kode_provinsi: 14, nama_provinsi: 'Riau', latitude: 0.2933469, longitude: 101.7068294 },
      { kode_provinsi: 15, nama_provinsi: 'Jambi', latitude: -1.4851831, longitude: 102.4380581 },
      { kode_provinsi: 16, nama_provinsi: 'Sumatera Selatan', latitude: -3.31987, longitude: 103.914399 },
      { kode_provinsi: 17, nama_provinsi: 'Bengkulu', latitude: -3.5778471, longitude: 102.3463875 },
      { kode_provinsi: 18, nama_provinsi: 'Lampung', latitude: -4.5585849, longitude: 105.4068079 },
      { kode_provinsi: 19, nama_provinsi: 'Kepulauan Bangka Belitung', latitude: -2.7410513, longitude: 106.4405872 },
      { kode_provinsi: 21, nama_provinsi: 'Kepulauan Riau', latitude: 3.9456514, longitude: 108.1428669 },
      { kode_provinsi: 31, nama_provinsi: 'DKI Jakarta', latitude: -6.211544, longitude: 106.845172 },
      { kode_provinsi: 32, nama_provinsi: 'Jawa Barat', latitude: -6.9147444, longitude: 107.6098111 },
      { kode_provinsi: 33, nama_provinsi: 'Jawa Tengah', latitude: -7.150975, longitude: 110.1402594 },
      { kode_provinsi: 34, nama_provinsi: 'DI Yogyakarta', latitude: -7.8753849, longitude: 110.4262088 },
      { kode_provinsi: 35, nama_provinsi: 'Jawa Timur', latitude: -7.5360639, longitude: 112.2384017 },
      { kode_provinsi: 36, nama_provinsi: 'Banten', latitude: -6.4058172, longitude: 106.0640179 },
      { kode_provinsi: 51, nama_provinsi: 'Bali', latitude: -8.4095178, longitude: 115.188916 },
      { kode_provinsi: 52, nama_provinsi: 'Nusa Tenggara Barat', latitude: -8.6529334, longitude: 117.3616476 },
      { kode_provinsi: 53, nama_provinsi: 'Nusa Tenggara Timur', latitude: -8.6573819, longitude: 121.0793705 },
      { kode_provinsi: 61, nama_provinsi: 'Kalimantan Barat', latitude: -0.2787808, longitude: 111.4752851 },
      { kode_provinsi: 62, nama_provinsi: 'Kalimantan Tengah', latitude: -1.6814878, longitude: 113.3823545 },
      { kode_provinsi: 63, nama_provinsi: 'Kalimantan Selatan', latitude: -3.0926415, longitude: 115.2837585 },
      { kode_provinsi: 64, nama_provinsi: 'Kalimantan Timur', latitude: 1.6406296, longitude: 116.419389 },
      { kode_provinsi: 65, nama_provinsi: 'Kalimantan Utara', latitude: 3.0730929, longitude: 116.0413889 },
      { kode_provinsi: 71, nama_provinsi: 'Sulawesi Utara', latitude: 1.2379274, longitude: 124.8413568 },
      { kode_provinsi: 72, nama_provinsi: 'Sulawesi Tengah', latitude: -1.4300254, longitude: 121.4456179 },
      { kode_provinsi: 73, nama_provinsi: 'Sulawesi Selatan', latitude: -3.6687994, longitude: 119.9740534 },
      { kode_provinsi: 74, nama_provinsi: 'Sulawesi Tenggara', latitude: -4.14491, longitude: 122.174605 },
      { kode_provinsi: 75, nama_provinsi: 'Gorontalo', latitude: 0.6999372, longitude: 122.4467238 },
      { kode_provinsi: 76, nama_provinsi: 'Sulawesi Barat', latitude: -2.8441371, longitude: 119.2320784 },
      { kode_provinsi: 81, nama_provinsi: 'Maluku', latitude: -3.2384616, longitude: 130.1452734 },
      { kode_provinsi: 82, nama_provinsi: 'Maluku Utara', latitude: 1.5709993, longitude: 127.8087693 },
      { kode_provinsi: 91, nama_provinsi: 'Papua Barat', latitude: -1.3361154, longitude: 133.1747162 },
      { kode_provinsi: 92, nama_provinsi: 'Papua', latitude: -4.269928, longitude: 138.080353 },
      { kode_provinsi: 93, nama_provinsi: 'Papua Tengah', latitude: -4.0648636, longitude: 136.2672466 },
      { kode_provinsi: 94, nama_provinsi: 'Papua Pegunungan', latitude: -4.0648636, longitude: 138.5800934 },
      { kode_provinsi: 95, nama_provinsi: 'Papua Selatan', latitude: -6.08823, longitude: 140.7713169 },
      { kode_provinsi: 96, nama_provinsi: 'Papua Barat Daya', latitude: -1.9344757, longitude: 132.2755051 }
    ]
    
    console.log('📍 Inserting 38 provinces...')
    const { error: provincesError } = await supabase
      .from('ref_provinsi')
      .insert(provinces)
    
    if (provincesError) {
      console.error('❌ Error inserting provinces:', provincesError.message)
      return false
    }
    
    console.log('✅ Provinces inserted successfully!')
    
    // Major kabupaten/cities
    const kabupaten = [
      // DKI Jakarta (31)
      { kode_provinsi: 31, kode_kabupaten: 3101, nama_kabupaten: 'Kepulauan Seribu', latitude: -5.8625, longitude: 106.5794 },
      { kode_provinsi: 31, kode_kabupaten: 3171, nama_kabupaten: 'Jakarta Selatan', latitude: -6.2608, longitude: 106.8142 },
      { kode_provinsi: 31, kode_kabupaten: 3172, nama_kabupaten: 'Jakarta Timur', latitude: -6.2251, longitude: 106.9004 },
      { kode_provinsi: 31, kode_kabupaten: 3173, nama_kabupaten: 'Jakarta Pusat', latitude: -6.1805, longitude: 106.8284 },
      { kode_provinsi: 31, kode_kabupaten: 3174, nama_kabupaten: 'Jakarta Barat', latitude: -6.1352, longitude: 106.813 },
      { kode_provinsi: 31, kode_kabupaten: 3175, nama_kabupaten: 'Jakarta Utara', latitude: -6.1388, longitude: 106.863 },
      
      // Jawa Tengah (33) - Key cities
      { kode_provinsi: 33, kode_kabupaten: 3374, nama_kabupaten: 'Semarang', latitude: -7.0051, longitude: 110.4381 },
      { kode_provinsi: 33, kode_kabupaten: 3372, nama_kabupaten: 'Surakarta', latitude: -7.5755, longitude: 110.8243 },
      { kode_provinsi: 33, kode_kabupaten: 3322, nama_kabupaten: 'Kabupaten Semarang', latitude: -7.1510, longitude: 110.4203 },
      { kode_provinsi: 33, kode_kabupaten: 3321, nama_kabupaten: 'Demak', latitude: -6.8906, longitude: 110.6396 },
      { kode_provinsi: 33, kode_kabupaten: 3324, nama_kabupaten: 'Kendal', latitude: -6.9269, longitude: 110.2037 },
      { kode_provinsi: 33, kode_kabupaten: 3319, nama_kabupaten: 'Kudus', latitude: -6.8048, longitude: 110.8405 },
      { kode_provinsi: 33, kode_kabupaten: 3318, nama_kabupaten: 'Pati', latitude: -6.7459, longitude: 111.0378 },
      
      // Jawa Barat (32) - Major cities
      { kode_provinsi: 32, kode_kabupaten: 3273, nama_kabupaten: 'Bandung', latitude: -6.9034, longitude: 107.6181 },
      { kode_provinsi: 32, kode_kabupaten: 3276, nama_kabupaten: 'Depok', latitude: -6.4025, longitude: 106.7942 },
      { kode_provinsi: 32, kode_kabupaten: 3275, nama_kabupaten: 'Bekasi', latitude: -6.2383, longitude: 106.9756 },
      { kode_provinsi: 32, kode_kabupaten: 3204, nama_kabupaten: 'Kabupaten Bandung', latitude: -7.0051, longitude: 107.5619 },
      { kode_provinsi: 32, kode_kabupaten: 3216, nama_kabupaten: 'Kabupaten Bekasi', latitude: -6.2349, longitude: 106.9896 },
      
      // Jawa Timur (35) - Major cities
      { kode_provinsi: 35, kode_kabupaten: 3578, nama_kabupaten: 'Surabaya', latitude: -7.2575, longitude: 112.7521 },
      { kode_provinsi: 35, kode_kabupaten: 3573, nama_kabupaten: 'Malang', latitude: -7.9666, longitude: 112.6326 },
      { kode_provinsi: 35, kode_kabupaten: 3507, nama_kabupaten: 'Kabupaten Malang', latitude: -8.1335, longitude: 112.6123 },
      { kode_provinsi: 35, kode_kabupaten: 3515, nama_kabupaten: 'Sidoarjo', latitude: -7.4378, longitude: 112.7178 },
      
      // Other major provinces
      { kode_provinsi: 12, kode_kabupaten: 1271, nama_kabupaten: 'Medan', latitude: 3.5952, longitude: 98.6722 },
      { kode_provinsi: 73, kode_kabupaten: 7371, nama_kabupaten: 'Makassar', latitude: -5.1477, longitude: 119.4327 },
      { kode_provinsi: 51, kode_kabupaten: 5171, nama_kabupaten: 'Denpasar', latitude: -8.6705, longitude: 115.2126 }
    ]
    
    console.log('🏘️ Inserting major kabupaten/kota...')
    const { error: kabupatenError } = await supabase
      .from('ref_kabupaten')
      .insert(kabupaten)
    
    if (kabupatenError) {
      console.error('❌ Error inserting kabupaten:', kabupatenError.message)
      return false
    }
    
    console.log('✅ Kabupaten/kota inserted successfully!')
    
    // Get final counts
    const { data: finalProvinces } = await supabase
      .from('ref_provinsi')
      .select('*', { count: 'exact', head: true })
    
    const { data: finalKabupaten } = await supabase
      .from('ref_kabupaten')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Final count: ${finalProvinces?.[0]?.count} provinces, ${finalKabupaten?.[0]?.count} kabupaten`)
    
    return true
  } catch (error) {
    console.error('❌ Error inserting data:', error.message)
    return false
  }
}

async function testDashboard() {
  try {
    console.log('\n📊 Testing dashboard functionality...')
    
    // Insert sample qurban data
    const sampleData = [
      {
        nama_penyetor: 'Ahmad Sudrajat',
        no_hp: '081234567890',
        alamat: 'Jl. Merdeka No. 123, Semarang',
        jenis_hewan: 'sapi',
        jumlah_hewan: 1,
        total_bayar: 25000000,
        status_pembayaran: 'lunas',
        provinsi_distribusi: 33,
        kabupaten_distribusi: 3374
      },
      {
        nama_penyetor: 'Siti Aminah',
        no_hp: '081234567891',
        alamat: 'Jl. Diponegoro No. 456, Jakarta',
        jenis_hewan: 'kambing',
        jumlah_hewan: 2,
        total_bayar: 8000000,
        status_pembayaran: 'lunas',
        provinsi_distribusi: 31,
        kabupaten_distribusi: 3171
      },
      {
        nama_penyetor: 'Budi Santoso',
        no_hp: '081234567892',
        alamat: 'Jl. Ahmad Yani No. 789, Bandung',
        jenis_hewan: 'kambing',
        jumlah_hewan: 3,
        total_bayar: 12000000,
        status_pembayaran: 'dp',
        provinsi_distribusi: 32,
        kabupaten_distribusi: 3273
      }
    ]
    
    const { error: qurbanError } = await supabase
      .from('qurban_pendaftaran')
      .insert(sampleData)
    
    if (qurbanError) {
      console.error('❌ Error inserting qurban data:', qurbanError.message)
      return false
    }
    
    console.log('✅ Sample qurban data inserted!')
    
    // Test data retrieval
    const { data: qurbanData, error: retrieveError } = await supabase
      .from('qurban_pendaftaran')
      .select(`
        *,
        ref_provinsi:provinsi_distribusi(nama_provinsi),
        ref_kabupaten:kabupaten_distribusi(nama_kabupaten)
      `)
      .limit(5)
    
    if (retrieveError) {
      console.warn('⚠️ Data retrieval issue:', retrieveError.message)
    } else {
      console.log(`📈 Retrieved ${qurbanData?.length || 0} qurban records`)
      console.log('Sample data:', qurbanData?.[0])
    }
    
    return true
  } catch (error) {
    console.error('❌ Dashboard test error:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 MTT Supabase Test & Setup\n')
  console.log('=' .repeat(50))
  
  // Test connection
  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('\n❌ Setup failed - connection issue')
    process.exit(1)
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Insert reference data
  const referenceOk = await insertIndonesiaData()
  if (!referenceOk) {
    console.log('\n❌ Setup failed - reference data issue')
    process.exit(1)
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Test dashboard
  const dashboardOk = await testDashboard()
  if (!dashboardOk) {
    console.log('\n⚠️ Dashboard test had issues')
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('✨ Setup completed successfully!')
  console.log('\n📋 Next steps:')
  console.log('1. Check your Supabase dashboard')
  console.log('2. Run: npm run dev')
  console.log('3. Test the qurban dashboard at /service/qurban/dashboard')
  console.log('4. Test the registration form at /service/qurban/pendaftaran')
}

// Run the script
main().catch(console.error) 