# 🚀 MTT Qurban - Upload System

## Overview

This is a **clean and simplified** MTT Qurban upload system, designed to be straightforward and easy to use. Unlike complex upload systems, this focuses on core functionality only.

## ✨ Key Features

- **🎯 Clean & Simple**: No complex duplicate detection, queuing, or modal workflows
- **📍 Text-based Locations**: Uses province/city names instead of complex codes
- **📁 Auto File Detection**: Automatically detects "muzakki" or "distribusi" from filename
- **📊 Real-time Progress**: Progress tracking during upload
- **🔐 Easy Authentication**: Upload key system
- **💾 Direct Database Save**: Straight-forward CSV → Database workflow
- **🔄 Duplicate Prevention**: Automatically skips duplicate entries based on nama+telepon (muzakki) or nama+alamat (distribusi)

## 🗄️ Database Structure

### Tables

1. **`uploaders`** - Mitra authentication
2. **`muzakki`** - Donor data (with text locations + unique constraints)
3. **`distribusi`** - Distribution data (with text locations + unique constraints) 
4. **`upload_history`** - Upload tracking

### Key Features

| Feature | Description |
|---------|-------------|
| Location Fields | `provinsi`, `kabupaten` (text) |
| Duplicate Prevention | UNIQUE constraints on nama+telepon (muzakki), nama+alamat (distribusi) |
| Upload Queue | Direct processing |
| File Processing | Single-step upload |
| Optional Fields | Nullable fields |

## 🚀 Quick Setup

### 1. Database Setup

```bash
# Setup the database tables
npm run setup:db
```

### 2. Access the Upload Page

Navigate to: `http://localhost:5173/service/qurban/upload`

### 3. Login Credentials

Contact administrator for upload keys. Each mitra has unique access credentials.

## 📊 CSV File Format

### Muzakki (Donor) Data

**Filename must contain "muzakki"**
**Duplicate detection**: Based on combination of `nama_muzakki` + `telepon`

```csv
nama_muzakki,email,telepon,alamat,provinsi,kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan
Ahmad Ridwan,ahmad.ridwan@email.com,081234567890,Jl. Sudirman No. 123,Jawa Timur,Surabaya,Sapi,1,8000000,2024-06-15
```

**Required Fields:**
- `nama_muzakki` - Donor name
- `jenis_hewan` - Animal type (Sapi/Kambing/Domba)
- `jumlah_hewan` - Number of animals
- `nilai_qurban` - Qurban value

**Optional Fields:**
- `email`, `telepon`, `alamat`, `provinsi`, `kabupaten`, `tanggal_penyerahan`

### Distribusi (Distribution) Data

**Filename must contain "distribusi"**
**Duplicate detection**: Based on combination of `nama_penerima` + `alamat_penerima`

```csv
nama_penerima,alamat_penerima,provinsi,kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
Pak Usman,Desa Kedungpandan RT 02/RW 01,Jawa Timur,Surabaya,Sapi,15.5,2024-06-20,,Selesai,Distribusi berjalan lancar
```

**Required Fields:**
- `nama_penerima` - Recipient name
- `alamat_penerima` - Recipient address
- `jenis_hewan` - Animal type (Sapi/Kambing/Domba)
- `tanggal_distribusi` - Distribution date

**Optional Fields:**
- `provinsi`, `kabupaten`, `jumlah_daging`, `foto_distribusi_url`, `status`, `catatan`

## 📥 Sample Data

Download sample CSV files:
- [Sample Muzakki CSV](./docs/sample-data/sample_muzakki.csv)
- [Sample Distribusi CSV](./docs/sample-data/sample_distribusi.csv)

## 🔧 Development

### File Structure

```
src/
├── lib/supabase.ts                 # Supabase client
├── pages/qurban/Upload.tsx         # Main upload page
└── ...

database/
└── setup-tables.sql               # Database schema

docs/sample-data/
├── sample_muzakki.csv             # Sample donor data
└── sample_distribusi.csv          # Sample distribution data

scripts/
└── setup-db.js                   # Database setup script
```

### Environment Variables

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎯 Usage Flow

1. **Login**: Enter upload key
2. **Upload File**: Drag & drop or select CSV/Excel file
3. **Auto Detection**: System detects file type from filename
4. **Process**: Direct CSV parsing and database insert
5. **Complete**: View upload results

## 🆚 Comparison with Previous Complex System

| Aspect | Previous (1676 lines) | Current (600+ lines) |
|--------|----------------------|-------------------|
| **Complexity** | Very high | Low |
| **Features** | Duplicate detection, queues, modals | Basic upload only |
| **User Flow** | Multi-step with reviews | Single-step |
| **Error Handling** | Complex retry logic | Error display |
| **State Management** | useRef, complex queues | Basic useState |
| **File Processing** | Advanced duplicate checking | Direct CSV parse |
| **Database** | Complex normalization | Direct insert |

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid file type"**
   - Ensure filename contains "muzakki" or "distribusi"

2. **"No valid records found"**
   - Check CSV format and headers
   - Ensure file is not empty

3. **"Authentication failed"**
   - Verify upload key is correct
   - Check database connection

### Debug Mode

Enable console logging to see detailed upload process:
```javascript
console.log('🚀 Processing file:', filename);
```

## 📈 Future Enhancements

Potential improvements while keeping it simple:

- [ ] Excel file support (.xlsx parsing)
- [ ] Basic data validation
- [ ] Export uploaded data
- [ ] Basic statistics view

## 🤝 Contributing

When modifying the upload system:

1. Keep it simple - avoid complex features
2. Maintain single-step workflow
3. Use text-based locations
4. Focus on core upload functionality

---

**✅ Ready to use!** Access at: `/service/qurban/upload` 