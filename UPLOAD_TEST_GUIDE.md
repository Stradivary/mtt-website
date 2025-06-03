# 🧪 MTT Qurban Upload Test Guide

## Langkah-langkah Testing Upload

### 1. Setup Environment Variables
Pastikan file `.env` sudah ada dengan konfigurasi Supabase:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Jalankan Development Server
```bash
npm run dev
```

### 3. Akses Upload Page
1. Buka: `http://localhost:5173/service/qurban/upload`
2. Login dengan kode akses apapun (sementara mock authentication)

### 4. Test Upload Files

#### File untuk Testing:
- `docs/sample-data/BAZNAS_Surabaya_MUZAKKI_20250617_1400.csv` (15 records)
- `docs/sample-data/BAZNAS_Surabaya_DISTRIBUSI_20250617_1400_UPDATED.csv` (20 records)

### 5. Expected Results

#### ✅ Setelah Upload Berhasil:
- **Muzakki file**: 15 record baru, 0 duplikat (first upload)
- **Distribusi file**: 20 record baru, 0 duplikat (first upload)

#### 🔄 Upload Kedua (Same Files):
- **Muzakki file**: 0 record baru, 15 duplikat terdeteksi
- **Distribusi file**: 0 record baru, 20 duplikat terdeteksi

### 6. Debugging Steps

#### Check Browser Console:
```javascript
// Buka Developer Tools (F12) dan lihat:
// 1. Console logs dari CSV parsing
// 2. Supabase connection status
// 3. Upload process logs
```

#### Check Database:
```sql
-- Di Supabase SQL Editor:
SELECT COUNT(*) FROM muzakki;
SELECT COUNT(*) FROM distribusi;
SELECT * FROM upload_history ORDER BY created_at DESC LIMIT 5;
```

### 7. Common Issues & Solutions

#### ❌ "0 record baru" Issue:
**Cause**: Database connection atau CSV parsing error
**Solution**: 
1. Check browser console for errors
2. Verify Supabase credentials
3. Check CSV file format

#### ❌ "File size 0.00 MB" Issue:
**Cause**: File not properly read
**Solution**: 
1. Ensure CSV file has proper encoding (UTF-8)
2. Check file permissions
3. Try with smaller test file

#### ❌ Database Insert Error:
**Cause**: Missing required fields or constraint violations
**Solution**:
1. Check CSV headers match database schema
2. Verify uploader_id is properly set
3. Check for null values in required fields

### 8. Testing Different Scenarios

#### Test 1: Fresh Upload
1. Clear database tables (optional)
2. Upload muzakki file → expect all records as new
3. Upload distribusi file → expect all records as new

#### Test 2: Duplicate Detection
1. Upload same files again
2. Should show duplicates detected
3. Choose handling option (skip/merge/update)

#### Test 3: Mixed Data
1. Upload file with some new, some duplicate data
2. Should properly categorize each record

### 9. Debug Information

#### Browser Console Logs to Look For:
```
✅ "Parsed X records from filename.csv"
✅ "Fetched X existing muzakki/distribusi records"
✅ "Successfully saved X records to database"
❌ "Error parsing CSV: ..."
❌ "Error saving to database: ..."
```

#### Database Tables to Check:
- `muzakki` - Donor data
- `distribusi` - Beneficiary data  
- `upload_history` - Upload tracking
- `uploaders` - Upload permissions

### 10. Expected File Formats

#### Muzakki CSV Headers:
```csv
nama_muzakki,email,telepon,alamat,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan,status,catatan
```

#### Distribusi CSV Headers:
```csv
nama_penerima,alamat_penerima,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
```

---

## 🚨 Quick Troubleshooting

If uploads show "0 records":
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Reload page and try upload
4. Check for error messages
5. Copy any errors and share for debugging

If you see Supabase connection errors:
1. Verify `.env` file exists with correct values
2. Check Supabase project is active
3. Verify API keys have proper permissions 