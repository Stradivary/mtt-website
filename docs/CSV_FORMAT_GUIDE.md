# File Upload Format Guide - MTT Qurban Dashboard
**Supports both CSV and Excel (.xlsx) files**

## File Naming Convention
File names must follow this pattern:
```
{MITRA}_{LOCATION}_{TYPE}_{YYYYMMDD}_{HHMM}.{csv|xlsx}
```

**Examples:**
- `BAZNAS_Surabaya_MUZAKKI_20250617_1400.xlsx`
- `BAZNAS_Surabaya_DISTRIBUSI_20250617_1400.csv`
- `LAZIS_Jakarta_MUZAKKI_20250618_0900.xlsx`

## Supported File Formats
- ✅ **CSV Files** (.csv) - UTF-8 encoding, comma delimiter
- ✅ **Excel Files** (.xlsx) - Single sheet only, first sheet will be processed
- ✅ **File Size**: Maximum 10MB per file
- ✅ **Records**: Maximum 5000 records per file

## 🔄 **Advanced Duplicate Handling System**

### Detection Methods:
**🎯 Exact Duplicates** - Perfect matches based on key fields:
- **MUZAKKI**: `nama_muzakki + jenis_hewan + nilai_qurban`
- **DISTRIBUSI**: `nama_penerima + alamat_penerima + tanggal_distribusi`

**🔍 Fuzzy Duplicates** - Similar records using name similarity:
- **MUZAKKI**: Name similarity ≥80% + same animal type
- **DISTRIBUSI**: Address similarity ≥80% + same distribution date

**🔗 Partial Duplicates** - Matching on secondary keys:
- **MUZAKKI**: `nama_muzakki + telepon` (same person, different qurban)
- **DISTRIBUSI**: `alamat_penerima + tanggal_distribusi + jenis_hewan` (same location/date)

### Handling Options:
1. **🚫 Skip** - Ignore duplicate, keep existing data unchanged
2. **🔄 Update** - Replace existing record completely with new data  
3. **🔀 Merge** - Combine data (new values override empty existing fields)
4. **❓ Prompt** - Ask user to decide for each duplicate

### Interactive Review Process:
1. **Upload file** → System detects duplicates automatically
2. **Review modal opens** → Shows all duplicates with side-by-side comparison
3. **Choose actions** → Skip, update, or merge for each duplicate individually
4. **Apply changes** → Process according to selected actions
5. **Get detailed report** → Summary of all actions taken

### Detection Settings:
- **Strict Mode**: Only exact matches detected
- **Fuzzy Mode**: Includes similar name/address matches
- **Similarity Threshold**: 50%-100% (default 80%)
- **Default Action**: Skip/Update/Merge/Prompt

## 🗺️ **Province & Kabupaten Auto-Mapping**
- **✅ Auto-resolve**: System maps province/kabupaten codes to names
- **✅ Validation**: Verifies codes exist in reference database  
- **✅ Grouping**: Automatic geographic grouping for reports
- **⚠️ Fallback**: Manual mapping for unknown codes

## 1. MUZAKKI (Donors) CSV Format

### Required Columns (Exact Header Names):
```csv
nama_muzakki,email,telepon,alamat,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan,status,catatan
```

### Column Specifications:
| Column | Type | Required | Format | Example |
|--------|------|----------|---------|---------|
| `nama_muzakki` | String | ✅ Yes | Full name | "Ahmad Sudrajat" |
| `email` | String | ❌ No | Valid email | "ahmad@email.com" |
| `telepon` | String | ❌ No | Phone number | "081234567890" |
| `alamat` | Text | ❌ No | Full address | "Jl. Merdeka No. 123 RT 05 RW 02" |
| `kode_provinsi` | String | ❌ No | 2 digits | "35" (Jawa Timur) |
| `kode_kabupaten` | String | ❌ No | 4 digits | "3578" (Surabaya) |
| `jenis_hewan` | String | ✅ Yes | sapi/kambing/domba | "sapi" |
| `jumlah_hewan` | Integer | ✅ Yes | Positive number | 1 |
| `nilai_qurban` | Decimal | ✅ Yes | Amount in IDR | 25000000 |
| `tanggal_penyerahan` | Date | ❌ No | YYYY-MM-DD | "2025-06-15" |
| `status` | String | ❌ No | submitted/verified | "verified" |
| `catatan` | Text | ❌ No | Notes | "Sapi sehat siap kurban" |

### Sample Data:
```csv
nama_muzakki,email,telepon,alamat,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan,status,catatan
Ahmad Sudrajat,ahmad.sudrajat@email.com,081234567890,Jl. Merdeka No. 123 RT 05 RW 02 Gubeng,35,3578,sapi,1,25000000,2025-06-15,verified,Sapi sehat siap kurban
Siti Aminah,siti.aminah@gmail.com,081234567891,Jl. Diponegoro No. 456 Wonokromo,35,3578,kambing,2,8000000,2025-06-16,submitted,2 kambing etawa premium
```

## 2. DISTRIBUSI (Beneficiaries) CSV Format

### Required Columns (Exact Header Names):
```csv
nama_penerima,alamat_penerima,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
```

### Column Specifications:
| Column | Type | Required | Format | Example |
|--------|------|----------|---------|---------|
| `nama_penerima` | String | ✅ Yes | Full name | "Pak Samsul" |
| `alamat_penerima` | Text | ✅ Yes | Full address | "Masjid Al-Akbar Surabaya RT 03 RW 07" |
| `kode_provinsi` | String | ❌ No | 2 digits | "35" (Jawa Timur) |
| `kode_kabupaten` | String | ❌ No | 4 digits | "3578" (Surabaya) |
| `jenis_hewan` | String | ✅ Yes | sapi/kambing/domba | "sapi" |
| `jumlah_daging` | Decimal | ❌ No | Weight in KG | 15.5 |
| `tanggal_distribusi` | Date | ✅ Yes | YYYY-MM-DD | "2025-06-17" |
| `foto_distribusi_url` | Text | ❌ No | Valid URL | "https://example.com/foto1.jpg" |
| `status` | String | ❌ No | planned/distributed/completed | "distributed" |
| `catatan` | Text | ❌ No | Notes | "Pembagian daging sapi kepada jamaah" |

### Sample Data:
```csv
nama_penerima,alamat_penerima,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
Pak Samsul,Masjid Al-Akbar Surabaya RT 03 RW 07 Gubeng,35,3578,sapi,15.5,2025-06-17,https://example.com/foto1.jpg,distributed,Pembagian daging sapi kepada jamaah masjid
Bu Aminah,Balai RW 05 Wonokromo Surabaya,35,3578,kambing,8.2,2025-06-17,https://example.com/foto2.jpg,distributed,Daging kambing untuk warga kurang mampu
```

## 3. Province & Kabupaten Codes

### Supported Provinces:
| Code | Province Name |
|------|--------------|
| 31 | DKI Jakarta |
| 32 | Jawa Barat |
| 33 | Jawa Tengah |
| 35 | Jawa Timur |
| 12 | Sumatra Utara |
| 73 | Sulawesi Selatan |
| 51 | Bali |
| 64 | Kalimantan Timur |

### Supported Kabupaten (Jawa Timur):
| Code | Kabupaten Name |
|------|---------------|
| 3578 | Surabaya |
| 3525 | Gresik |
| 3515 | Sidoarjo |
| 3573 | Malang |

## 4. Data Validation Rules

### General Rules:
- ✅ CSV files must use UTF-8 encoding
- ✅ Use comma (,) as delimiter
- ✅ Headers must match exactly (case-sensitive)
- ✅ No empty rows allowed
- ✅ Maximum file size: 10MB
- ✅ Maximum records per file: 5000

### Value Constraints:
- **jenis_hewan**: Must be one of: `sapi`, `kambing`, `domba`
- **status (muzakki)**: Must be one of: `submitted`, `verified`, `distributed`
- **status (distribusi)**: Must be one of: `planned`, `distributed`, `completed`
- **dates**: Must use format `YYYY-MM-DD`
- **nilai_qurban**: Positive number (no currency symbols)
- **jumlah_hewan**: Positive integer
- **jumlah_daging**: Positive decimal number

## 5. Error Handling

### Common Upload Errors:
1. **Invalid Headers**: Column names don't match exactly
2. **Missing Required Fields**: Required columns are empty
3. **Invalid Province/Kabupaten Codes**: Codes not found in reference data
4. **Invalid Date Format**: Dates not in YYYY-MM-DD format
5. **Invalid Animal Type**: jenis_hewan not in allowed values
6. **Duplicate Records**: Same data uploaded multiple times

### Upload Response:
```json
{
  "upload_id": "uuid",
  "status": "completed",
  "total_records": 15,
  "successful_records": 14,
  "failed_records": 1,
  "errors": [
    {
      "row": 5,
      "field": "jenis_hewan",
      "error": "Invalid animal type: 'unta'. Must be: sapi, kambing, domba"
    }
  ]
}
```

## 6. Sample Files Location

Sample files are available at:
- `docs/sample-data/BAZNAS_Surabaya_MUZAKKI_20250617_1400.csv`
- `docs/sample-data/BAZNAS_Surabaya_DISTRIBUSI_20250617_1400_UPDATED.csv`
- `docs/sample-data/SAMPLE_UPLOADERS.csv`

## 7. Upload Authentication

Each uploader must have:
- Valid email in uploaders table
- Active upload_key
- Proper mitra_name assignment

Contact system administrator to get upload credentials. 