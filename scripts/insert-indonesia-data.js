#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

dotenv.config({ path: join(projectRoot, '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

// Kabupaten data for major provinces
const kabupaten = [
  // DKI Jakarta (31)
  { kode_provinsi: 31, kode_kabupaten: 3101, nama_kabupaten: 'Kepulauan Seribu', latitude: -5.8625, longitude: 106.5794 },
  { kode_provinsi: 31, kode_kabupaten: 3171, nama_kabupaten: 'Jakarta Selatan', latitude: -6.2608, longitude: 106.8142 },
  { kode_provinsi: 31, kode_kabupaten: 3172, nama_kabupaten: 'Jakarta Timur', latitude: -6.2251, longitude: 106.9004 },
  { kode_provinsi: 31, kode_kabupaten: 3173, nama_kabupaten: 'Jakarta Pusat', latitude: -6.1805, longitude: 106.8284 },
  { kode_provinsi: 31, kode_kabupaten: 3174, nama_kabupaten: 'Jakarta Barat', latitude: -6.1352, longitude: 106.813 },
  { kode_provinsi: 31, kode_kabupaten: 3175, nama_kabupaten: 'Jakarta Utara', latitude: -6.1388, longitude: 106.863 },

  // Jawa Barat (32) - Major cities
  { kode_provinsi: 32, kode_kabupaten: 3201, nama_kabupaten: 'Bogor', latitude: -6.7024, longitude: 106.7787 },
  { kode_provinsi: 32, kode_kabupaten: 3202, nama_kabupaten: 'Sukabumi', latitude: -6.9175, longitude: 106.9269 },
  { kode_provinsi: 32, kode_kabupaten: 3203, nama_kabupaten: 'Cianjur', latitude: -6.8168, longitude: 107.1425 },
  { kode_provinsi: 32, kode_kabupaten: 3204, nama_kabupaten: 'Bandung', latitude: -7.0051, longitude: 107.5619 },
  { kode_provinsi: 32, kode_kabupaten: 3205, nama_kabupaten: 'Garut', latitude: -7.2125, longitude: 107.8769 },
  { kode_provinsi: 32, kode_kabupaten: 3206, nama_kabupaten: 'Tasikmalaya', latitude: -7.3506, longitude: 108.2172 },
  { kode_provinsi: 32, kode_kabupaten: 3207, nama_kabupaten: 'Ciamis', latitude: -7.3287, longitude: 108.3533 },
  { kode_provinsi: 32, kode_kabupaten: 3208, nama_kabupaten: 'Kuningan', latitude: -6.9764, longitude: 108.4840 },
  { kode_provinsi: 32, kode_kabupaten: 3209, nama_kabupaten: 'Cirebon', latitude: -6.7063, longitude: 108.5571 },
  { kode_provinsi: 32, kode_kabupaten: 3210, nama_kabupaten: 'Majalengka', latitude: -6.8364, longitude: 108.2274 },
  { kode_provinsi: 32, kode_kabupaten: 3211, nama_kabupaten: 'Sumedang', latitude: -6.8552, longitude: 107.9239 },
  { kode_provinsi: 32, kode_kabupaten: 3212, nama_kabupaten: 'Indramayu', latitude: -6.3274, longitude: 108.3199 },
  { kode_provinsi: 32, kode_kabupaten: 3213, nama_kabupaten: 'Subang', latitude: -6.5693, longitude: 107.7607 },
  { kode_provinsi: 32, kode_kabupaten: 3214, nama_kabupaten: 'Purwakarta', latitude: -6.5569, longitude: 107.4431 },
  { kode_provinsi: 32, kode_kabupaten: 3215, nama_kabupaten: 'Karawang', latitude: -6.3015, longitude: 107.3370 },
  { kode_provinsi: 32, kode_kabupaten: 3216, nama_kabupaten: 'Bekasi', latitude: -6.2349, longitude: 106.9896 },
  { kode_provinsi: 32, kode_kabupaten: 3217, nama_kabupaten: 'Bandung Barat', latitude: -6.8615, longitude: 107.4963 },
  { kode_provinsi: 32, kode_kabupaten: 3218, nama_kabupaten: 'Pangandaran', latitude: -7.6840, longitude: 108.6500 },
  { kode_provinsi: 32, kode_kabupaten: 3271, nama_kabupaten: 'Kota Bogor', latitude: -6.5944, longitude: 106.7892 },
  { kode_provinsi: 32, kode_kabupaten: 3272, nama_kabupaten: 'Kota Sukabumi', latitude: -6.9278, longitude: 106.9361 },
  { kode_provinsi: 32, kode_kabupaten: 3273, nama_kabupaten: 'Kota Bandung', latitude: -6.9034, longitude: 107.6181 },
  { kode_provinsi: 32, kode_kabupaten: 3274, nama_kabupaten: 'Kota Cirebon', latitude: -6.7320, longitude: 108.5520 },
  { kode_provinsi: 32, kode_kabupaten: 3275, nama_kabupaten: 'Kota Bekasi', latitude: -6.2383, longitude: 106.9756 },
  { kode_provinsi: 32, kode_kabupaten: 3276, nama_kabupaten: 'Depok', latitude: -6.4025, longitude: 106.7942 },
  { kode_provinsi: 32, kode_kabupaten: 3277, nama_kabupaten: 'Cimahi', latitude: -6.8722, longitude: 107.5391 },
  { kode_provinsi: 32, kode_kabupaten: 3278, nama_kabupaten: 'Kota Tasikmalaya', latitude: -7.3274, longitude: 108.2207 },
  { kode_provinsi: 32, kode_kabupaten: 3279, nama_kabupaten: 'Banjar', latitude: -7.3709, longitude: 108.5409 },

  // Jawa Tengah (33) - Major cities
  { kode_provinsi: 33, kode_kabupaten: 3301, nama_kabupaten: 'Cilacap', latitude: -7.7259, longitude: 109.0139 },
  { kode_provinsi: 33, kode_kabupaten: 3302, nama_kabupaten: 'Banyumas', latitude: -7.5148, longitude: 109.2919 },
  { kode_provinsi: 33, kode_kabupaten: 3303, nama_kabupaten: 'Purbalingga', latitude: -7.3883, longitude: 109.3568 },
  { kode_provinsi: 33, kode_kabupaten: 3304, nama_kabupaten: 'Banjarnegara', latitude: -7.3449, longitude: 109.6857 },
  { kode_provinsi: 33, kode_kabupaten: 3305, nama_kabupaten: 'Kebumen', latitude: -7.6707, longitude: 109.6544 },
  { kode_provinsi: 33, kode_kabupaten: 3306, nama_kabupaten: 'Purworejo', latitude: -7.7160, longitude: 110.0081 },
  { kode_provinsi: 33, kode_kabupaten: 3307, nama_kabupaten: 'Wonosobo', latitude: -7.3609, longitude: 109.9021 },
  { kode_provinsi: 33, kode_kabupaten: 3308, nama_kabupaten: 'Magelang', latitude: -7.4914, longitude: 110.2170 },
  { kode_provinsi: 33, kode_kabupaten: 3309, nama_kabupaten: 'Boyolali', latitude: -7.5322, longitude: 110.5953 },
  { kode_provinsi: 33, kode_kabupaten: 3310, nama_kabupaten: 'Klaten', latitude: -7.7058, longitude: 110.6061 },
  { kode_provinsi: 33, kode_kabupaten: 3311, nama_kabupaten: 'Sukoharjo', latitude: -7.6794, longitude: 110.8237 },
  { kode_provinsi: 33, kode_kabupaten: 3312, nama_kabupaten: 'Wonogiri', latitude: -7.8169, longitude: 110.9268 },
  { kode_provinsi: 33, kode_kabupaten: 3313, nama_kabupaten: 'Karanganyar', latitude: -7.6022, longitude: 111.0378 },
  { kode_provinsi: 33, kode_kabupaten: 3314, nama_kabupaten: 'Sragen', latitude: -7.4239, longitude: 111.0081 },
  { kode_provinsi: 33, kode_kabupaten: 3315, nama_kabupaten: 'Grobogan', latitude: -7.0543, longitude: 110.9421 },
  { kode_provinsi: 33, kode_kabupaten: 3316, nama_kabupaten: 'Blora', latitude: -6.9698, longitude: 111.4239 },
  { kode_provinsi: 33, kode_kabupaten: 3317, nama_kabupaten: 'Rembang', latitude: -6.7089, longitude: 111.3420 },
  { kode_provinsi: 33, kode_kabupaten: 3318, nama_kabupaten: 'Pati', latitude: -6.7459, longitude: 111.0378 },
  { kode_provinsi: 33, kode_kabupaten: 3319, nama_kabupaten: 'Kudus', latitude: -6.8048, longitude: 110.8405 },
  { kode_provinsi: 33, kode_kabupaten: 3320, nama_kabupaten: 'Jepara', latitude: -6.5943, longitude: 110.6689 },
  { kode_provinsi: 33, kode_kabupaten: 3321, nama_kabupaten: 'Demak', latitude: -6.8906, longitude: 110.6396 },
  { kode_provinsi: 33, kode_kabupaten: 3322, nama_kabupaten: 'Semarang', latitude: -7.1510, longitude: 110.4203 },
  { kode_provinsi: 33, kode_kabupaten: 3323, nama_kabupaten: 'Temanggung', latitude: -7.3147, longitude: 110.1717 },
  { kode_provinsi: 33, kode_kabupaten: 3324, nama_kabupaten: 'Kendal', latitude: -6.9269, longitude: 110.2037 },
  { kode_provinsi: 33, kode_kabupaten: 3325, nama_kabupaten: 'Batang', latitude: -6.9065, longitude: 109.7379 },
  { kode_provinsi: 33, kode_kabupaten: 3326, nama_kabupaten: 'Pekalongan', latitude: -6.8886, longitude: 109.6753 },
  { kode_provinsi: 33, kode_kabupaten: 3327, nama_kabupaten: 'Pemalang', latitude: -6.8983, longitude: 109.3789 },
  { kode_provinsi: 33, kode_kabupaten: 3328, nama_kabupaten: 'Tegal', latitude: -6.8694, longitude: 109.1402 },
  { kode_provinsi: 33, kode_kabupaten: 3329, nama_kabupaten: 'Brebes', latitude: -6.8732, longitude: 108.8406 },
  { kode_provinsi: 33, kode_kabupaten: 3371, nama_kabupaten: 'Kota Magelang', latitude: -7.4801, longitude: 110.2181 },
  { kode_provinsi: 33, kode_kabupaten: 3372, nama_kabupaten: 'Surakarta', latitude: -7.5755, longitude: 110.8243 },
  { kode_provinsi: 33, kode_kabupaten: 3373, nama_kabupaten: 'Salatiga', latitude: -7.3318, longitude: 110.4921 },
  { kode_provinsi: 33, kode_kabupaten: 3374, nama_kabupaten: 'Kota Semarang', latitude: -7.0051, longitude: 110.4381 },
  { kode_provinsi: 33, kode_kabupaten: 3375, nama_kabupaten: 'Kota Pekalongan', latitude: -6.8886, longitude: 109.6755 },
  { kode_provinsi: 33, kode_kabupaten: 3376, nama_kabupaten: 'Kota Tegal', latitude: -6.8694, longitude: 109.1402 },

  // Jawa Timur (35) - Major cities
  { kode_provinsi: 35, kode_kabupaten: 3501, nama_kabupaten: 'Pacitan', latitude: -8.1964, longitude: 111.0914 },
  { kode_provinsi: 35, kode_kabupaten: 3502, nama_kabupaten: 'Ponorogo', latitude: -7.8696, longitude: 111.4619 },
  { kode_provinsi: 35, kode_kabupaten: 3503, nama_kabupaten: 'Trenggalek', latitude: -8.0546, longitude: 111.7096 },
  { kode_provinsi: 35, kode_kabupaten: 3504, nama_kabupaten: 'Tulungagung', latitude: -8.0644, longitude: 111.9022 },
  { kode_provinsi: 35, kode_kabupaten: 3505, nama_kabupaten: 'Blitar', latitude: -8.0983, longitude: 112.1681 },
  { kode_provinsi: 35, kode_kabupaten: 3506, nama_kabupaten: 'Kediri', latitude: -7.8487, longitude: 112.0178 },
  { kode_provinsi: 35, kode_kabupaten: 3507, nama_kabupaten: 'Malang', latitude: -8.1335, longitude: 112.6123 },
  { kode_provinsi: 35, kode_kabupaten: 3508, nama_kabupaten: 'Lumajang', latitude: -8.1335, longitude: 113.2253 },
  { kode_provinsi: 35, kode_kabupaten: 3509, nama_kabupaten: 'Jember', latitude: -8.1844, longitude: 113.6680 },
  { kode_provinsi: 35, kode_kabupaten: 3510, nama_kabupaten: 'Banyuwangi', latitude: -8.2186, longitude: 114.3691 },
  { kode_provinsi: 35, kode_kabupaten: 3511, nama_kabupaten: 'Bondowoso', latitude: -7.9138, longitude: 113.8212 },
  { kode_provinsi: 35, kode_kabupaten: 3512, nama_kabupaten: 'Situbondo', latitude: -7.7063, longitude: 114.0095 },
  { kode_provinsi: 35, kode_kabupaten: 3513, nama_kabupaten: 'Probolinggo', latitude: -7.7543, longitude: 113.2159 },
  { kode_provinsi: 35, kode_kabupaten: 3514, nama_kabupaten: 'Pasuruan', latitude: -7.6453, longitude: 112.9075 },
  { kode_provinsi: 35, kode_kabupaten: 3515, nama_kabupaten: 'Sidoarjo', latitude: -7.4378, longitude: 112.7178 },
  { kode_provinsi: 35, kode_kabupaten: 3516, nama_kabupaten: 'Mojokerto', latitude: -7.5661, longitude: 112.4336 },
  { kode_provinsi: 35, kode_kabupaten: 3517, nama_kabupaten: 'Jombang', latitude: -7.5461, longitude: 112.2339 },
  { kode_provinsi: 35, kode_kabupaten: 3518, nama_kabupaten: 'Nganjuk', latitude: -7.6051, longitude: 111.9048 },
  { kode_provinsi: 35, kode_kabupaten: 3519, nama_kabupaten: 'Madiun', latitude: -7.6298, longitude: 111.5239 },
  { kode_provinsi: 35, kode_kabupaten: 3520, nama_kabupaten: 'Magetan', latitude: -7.6471, longitude: 111.3499 },
  { kode_provinsi: 35, kode_kabupaten: 3521, nama_kabupaten: 'Ngawi', latitude: -7.4040, longitude: 111.4462 },
  { kode_provinsi: 35, kode_kabupaten: 3522, nama_kabupaten: 'Bojonegoro', latitude: -7.1502, longitude: 111.8817 },
  { kode_provinsi: 35, kode_kabupaten: 3523, nama_kabupaten: 'Tuban', latitude: -6.8976, longitude: 111.9634 },
  { kode_provinsi: 35, kode_kabupaten: 3524, nama_kabupaten: 'Lamongan', latitude: -7.1196, longitude: 112.4133 },
  { kode_provinsi: 35, kode_kabupaten: 3525, nama_kabupaten: 'Gresik', latitude: -7.1554, longitude: 112.6536 },
  { kode_provinsi: 35, kode_kabupaten: 3526, nama_kabupaten: 'Bangkalan', latitude: -7.0455, longitude: 112.7351 },
  { kode_provinsi: 35, kode_kabupaten: 3527, nama_kabupaten: 'Sampang', latitude: -7.1851, longitude: 113.2394 },
  { kode_provinsi: 35, kode_kabupaten: 3528, nama_kabupaten: 'Pamekasan', latitude: -7.1568, longitude: 113.4775 },
  { kode_provinsi: 35, kode_kabupaten: 3529, nama_kabupaten: 'Sumenep', latitude: -7.0167, longitude: 113.8549 },
  { kode_provinsi: 35, kode_kabupaten: 3571, nama_kabupaten: 'Kota Kediri', latitude: -7.8487, longitude: 112.0178 },
  { kode_provinsi: 35, kode_kabupaten: 3572, nama_kabupaten: 'Kota Blitar', latitude: -8.0983, longitude: 112.1681 },
  { kode_provinsi: 35, kode_kabupaten: 3573, nama_kabupaten: 'Kota Malang', latitude: -7.9666, longitude: 112.6326 },
  { kode_provinsi: 35, kode_kabupaten: 3574, nama_kabupaten: 'Kota Probolinggo', latitude: -7.7543, longitude: 113.2159 },
  { kode_provinsi: 35, kode_kabupaten: 3575, nama_kabupaten: 'Kota Pasuruan', latitude: -7.6453, longitude: 112.9075 },
  { kode_provinsi: 35, kode_kabupaten: 3576, nama_kabupaten: 'Kota Mojokerto', latitude: -7.4664, longitude: 112.4339 },
  { kode_provinsi: 35, kode_kabupaten: 3577, nama_kabupaten: 'Kota Madiun', latitude: -7.6298, longitude: 111.5239 },
  { kode_provinsi: 35, kode_kabupaten: 3578, nama_kabupaten: 'Surabaya', latitude: -7.2575, longitude: 112.7521 },
  { kode_provinsi: 35, kode_kabupaten: 3579, nama_kabupaten: 'Batu', latitude: -7.8706, longitude: 112.5236 }
]

async function clearExistingData() {
  console.log('🧹 Clearing existing reference data...')
  
  try {
    // Clear kabupaten first (foreign key constraint)
    console.log('🗑️ Clearing kabupaten...')
    const { error: kabError } = await supabase
      .from('ref_kabupaten')
      .delete()
      .neq('id', 0)
    
    if (kabError && !kabError.message.includes('0 rows')) {
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
    
    if (provError && !provError.message.includes('0 rows')) {
      console.log('⚠️ Provinces clear warning:', provError.message)
    } else {
      console.log('✅ Provinces cleared')
    }

    return true
  } catch (error) {
    console.error('❌ Clear error:', error.message)
    return false
  }
}

async function insertProvinces() {
  console.log('\n📍 Inserting 38 Indonesian provinces...')
  
  try {
    const { data, error } = await supabase
      .from('ref_provinsi')
      .insert(provinces)
      .select()
    
    if (error) {
      console.error('❌ Error inserting provinces:', error.message)
      return false
    }
    
    console.log(`✅ Successfully inserted ${data.length} provinces`)
    return true
  } catch (error) {
    console.error('❌ Provinces insert error:', error.message)
    return false
  }
}

async function insertKabupaten() {
  console.log('\n🏘️ Inserting kabupaten/kota for major provinces...')
  
  try {
    const { data, error } = await supabase
      .from('ref_kabupaten')
      .insert(kabupaten)
      .select()
    
    if (error) {
      console.error('❌ Error inserting kabupaten:', error.message)
      return false
    }
    
    console.log(`✅ Successfully inserted ${data.length} kabupaten/kota`)
    return true
  } catch (error) {
    console.error('❌ Kabupaten insert error:', error.message)
    return false
  }
}

async function verifyData() {
  console.log('\n📊 Verifying inserted data...')
  
  try {
    const { count: provCount } = await supabase
      .from('ref_provinsi')
      .select('*', { count: 'exact', head: true })
    
    const { count: kabCount } = await supabase
      .from('ref_kabupaten')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📈 Final counts: ${provCount || 0} provinces, ${kabCount || 0} kabupaten`)
    
    if (provCount === 38) {
      console.log('✅ All 38 provinces inserted correctly')
    } else {
      console.log(`⚠️ Expected 38 provinces, got ${provCount}`)
    }
    
    return { provinces: provCount, kabupaten: kabCount }
  } catch (error) {
    console.error('❌ Verify error:', error.message)
    return { provinces: 0, kabupaten: 0 }
  }
}

async function main() {
  console.log('🚀 Indonesia Reference Data Setup\n')
  console.log('=' .repeat(50))
  
  // Step 1: Clear existing data
  const clearOk = await clearExistingData()
  if (!clearOk) {
    console.log('\n❌ Failed to clear existing data')
    process.exit(1)
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Step 2: Insert provinces
  const provincesOk = await insertProvinces()
  if (!provincesOk) {
    console.log('\n❌ Failed to insert provinces')
    process.exit(1)
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Step 3: Insert kabupaten
  const kabupatenOk = await insertKabupaten()
  if (!kabupatenOk) {
    console.log('\n❌ Failed to insert kabupaten')
    process.exit(1)
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Step 4: Verify data
  const counts = await verifyData()
  
  console.log('\n' + '=' .repeat(50))
  console.log('✨ Indonesia Reference Data Setup Complete!')
  console.log('\n📋 Summary:')
  console.log(`• ${counts.provinces} provinces inserted`)
  console.log(`• ${counts.kabupaten} kabupaten/kota inserted`)
  console.log('\n🎯 Ready for qurban registration system!')
}

// Run the script
main().catch(console.error) 