import { createClient } from '@supabase/supabase-js'

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test Supabase Connection
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('ref_provinsi')
      .select('count(*)', { count: 'exact' })
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log(`📊 Current provinces count: ${data[0]?.count || 0}`)
    return true
  } catch (error) {
    console.error('❌ Connection test error:', error)
    return false
  }
}

// Insert Indonesia Reference Data
export async function insertIndonesiaReferenceData() {
  try {
    console.log('🗺️ Starting Indonesia reference data insertion...')
    
    // Check if data already exists
    const { data: existingProvinces } = await supabase
      .from('ref_provinsi')
      .select('count(*)', { count: 'exact' })
    
    if (existingProvinces && existingProvinces[0]?.count > 0) {
      console.log('⚠️ Reference data already exists. Skipping insertion.')
      return { success: true, message: 'Data already exists' }
    }
    
    // Insert Provinces
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
    
    console.log('📍 Inserting provinces...')
    const { error: provincesError } = await supabase
      .from('ref_provinsi')
      .insert(provinces)
    
    if (provincesError) {
      console.error('❌ Error inserting provinces:', provincesError.message)
      return { success: false, error: provincesError.message }
    }
    
    console.log('✅ Provinces inserted successfully!')
    
    // Insert Sample Kabupaten for major provinces
    const kabupaten = [
      // DKI Jakarta
      { kode_provinsi: 31, kode_kabupaten: 3101, nama_kabupaten: 'Kepulauan Seribu', latitude: -5.8625, longitude: 106.5794 },
      { kode_provinsi: 31, kode_kabupaten: 3171, nama_kabupaten: 'Jakarta Selatan', latitude: -6.2608, longitude: 106.8142 },
      { kode_provinsi: 31, kode_kabupaten: 3172, nama_kabupaten: 'Jakarta Timur', latitude: -6.2251, longitude: 106.9004 },
      { kode_provinsi: 31, kode_kabupaten: 3173, nama_kabupaten: 'Jakarta Pusat', latitude: -6.1805, longitude: 106.8284 },
      { kode_provinsi: 31, kode_kabupaten: 3174, nama_kabupaten: 'Jakarta Barat', latitude: -6.1352, longitude: 106.813 },
      { kode_provinsi: 31, kode_kabupaten: 3175, nama_kabupaten: 'Jakarta Utara', latitude: -6.1388, longitude: 106.863 },
      
      // Jawa Tengah (Sample)
      { kode_provinsi: 33, kode_kabupaten: 3374, nama_kabupaten: 'Semarang', latitude: -7.0051, longitude: 110.4381 },
      { kode_provinsi: 33, kode_kabupaten: 3372, nama_kabupaten: 'Surakarta', latitude: -7.5755, longitude: 110.8243 },
      { kode_provinsi: 33, kode_kabupaten: 3322, nama_kabupaten: 'Semarang', latitude: -7.1510, longitude: 110.4203 },
      { kode_provinsi: 33, kode_kabupaten: 3321, nama_kabupaten: 'Demak', latitude: -6.8906, longitude: 110.6396 },
      { kode_provinsi: 33, kode_kabupaten: 3324, nama_kabupaten: 'Kendal', latitude: -6.9269, longitude: 110.2037 },
      
      // Jawa Barat (Sample)
      { kode_provinsi: 32, kode_kabupaten: 3273, nama_kabupaten: 'Bandung', latitude: -6.9034, longitude: 107.6181 },
      { kode_provinsi: 32, kode_kabupaten: 3276, nama_kabupaten: 'Depok', latitude: -6.4025, longitude: 106.7942 },
      { kode_provinsi: 32, kode_kabupaten: 3275, nama_kabupaten: 'Bekasi', latitude: -6.2383, longitude: 106.9756 },
      
      // Jawa Timur (Sample)
      { kode_provinsi: 35, kode_kabupaten: 3578, nama_kabupaten: 'Surabaya', latitude: -7.2575, longitude: 112.7521 },
      { kode_provinsi: 35, kode_kabupaten: 3573, nama_kabupaten: 'Malang', latitude: -7.9666, longitude: 112.6326 }
    ]
    
    console.log('🏘️ Inserting kabupaten/kota...')
    const { error: kabupatenError } = await supabase
      .from('ref_kabupaten')
      .insert(kabupaten)
    
    if (kabupatenError) {
      console.error('❌ Error inserting kabupaten:', kabupatenError.message)
      return { success: false, error: kabupatenError.message }
    }
    
    console.log('✅ Kabupaten/kota inserted successfully!')
    
    // Get final counts
    const { data: finalProvinces } = await supabase
      .from('ref_provinsi')
      .select('count(*)', { count: 'exact' })
    
    const { data: finalKabupaten } = await supabase
      .from('ref_kabupaten')
      .select('count(*)', { count: 'exact' })
    
    console.log(`📊 Final count: ${finalProvinces?.[0]?.count} provinces, ${finalKabupaten?.[0]?.count} kabupaten`)
    
    return { 
      success: true, 
      message: 'Indonesia reference data inserted successfully',
      provinces: finalProvinces?.[0]?.count,
      kabupaten: finalKabupaten?.[0]?.count
    }
    
  } catch (error) {
    console.error('❌ Error inserting Indonesia reference data:', error)
    return { success: false, error: error.message }
  }
}

// Test dashboard data insertion
export async function testDashboardDataInsertion() {
  try {
    console.log('📊 Testing dashboard data insertion...')
    
    // Insert sample qurban data
    const sampleQurbanData = [
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
      }
    ]
    
    const { error: qurbanError } = await supabase
      .from('qurban_pendaftaran')
      .insert(sampleQurbanData)
    
    if (qurbanError) {
      console.error('❌ Error inserting qurban data:', qurbanError.message)
      return { success: false, error: qurbanError.message }
    }
    
    console.log('✅ Sample qurban data inserted successfully!')
    
    // Test data retrieval for dashboard
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('dashboard_summary')
      .select('*')
      .limit(5)
    
    if (dashboardError) {
      console.warn('⚠️ Dashboard view not available yet:', dashboardError.message)
    } else {
      console.log('📈 Dashboard data retrieved:', dashboardData?.length || 0, 'records')
    }
    
    return { success: true, message: 'Dashboard test completed successfully' }
    
  } catch (error) {
    console.error('❌ Dashboard test error:', error)
    return { success: false, error: error.message }
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Starting Supabase tests...\n')
  
  // Test connection
  const connectionResult = await testSupabaseConnection()
  if (!connectionResult) {
    console.log('❌ Stopping tests due to connection failure')
    return
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Insert reference data
  const referenceResult = await insertIndonesiaReferenceData()
  console.log('Reference data result:', referenceResult)
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Test dashboard
  const dashboardResult = await testDashboardDataInsertion()
  console.log('Dashboard test result:', dashboardResult)
  
  console.log('\n✨ All tests completed!')
}

// Export default for easy import
export default {
  testSupabaseConnection,
  insertIndonesiaReferenceData,
  testDashboardDataInsertion,
  runAllTests
} 