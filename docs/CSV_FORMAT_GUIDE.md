# 📊 **MTT Qurban - CSV Format Guide**

Panduan lengkap format file CSV untuk upload data muzakki dan distribusi qurban.

---

## 📋 **Format File Muzakki**

### **Column Headers (Wajib):**
```csv
nama_muzakki,email,telepon,alamat,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan,status,catatan
```

### **Deskripsi Kolom:**

| **Kolom** | **Tipe** | **Wajib** | **Deskripsi** | **Contoh** |
|-----------|----------|-----------|---------------|------------|
| `nama_muzakki` | Text | ✅ | Nama lengkap pemberi qurban | Ahmad Subekti |
| `email` | Email | ❌ | Email muzakki | ahmad@email.com |
| `telepon` | Text | ❌ | Nomor telepon | 08123456789 |
| `alamat` | Text | ❌ | Alamat lengkap | Jl. Gubeng No. 15 Surabaya |
| `kode_provinsi` | Text(2) | ❌ | Kode provinsi BPS | 35 |
| `kode_kabupaten` | Text(4) | ❌ | Kode kabupaten BPS | 3578 |
| `jenis_hewan` | Text | ✅ | sapi/kambing/domba | sapi |
| `jumlah_hewan` | Number | ✅ | Jumlah hewan | 1 |
| `nilai_qurban` | Number | ✅ | Nilai dalam Rupiah | 5500000 |
| `tanggal_penyerahan` | Date | ❌ | Format: YYYY-MM-DD | 2025-06-17 |
| `status` | Text | ❌ | submitted/verified | submitted |
| `catatan` | Text | ❌ | Catatan tambahan | Qurban keluarga |

### **Contoh File Muzakki:**
```csv
nama_muzakki,email,telepon,alamat,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan,status,catatan
Ahmad Subekti,ahmad@email.com,08123456701,Jl. Gubeng No. 15 Surabaya,35,3578,sapi,1,5500000,2025-06-17,submitted,Qurban sapi keluarga
Fatimah Zahra,fatimah@email.com,08123456702,Jakarta Selatan Kebayoran,31,3171,kambing,2,3500000,2025-06-17,submitted,Qurban kambing
```

---

## 📋 **Format File Distribusi**

### **Column Headers (Wajib):**
```csv
nama_penerima,alamat_penerima,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
```

### **Deskripsi Kolom:**

| **Kolom** | **Tipe** | **Wajib** | **Deskripsi** | **Contoh** |
|-----------|----------|-----------|---------------|------------|
| `nama_penerima` | Text | ✅ | Nama penerima daging | Pak Samsul |
| `alamat_penerima` | Text | ✅ | Alamat lengkap penerima | Masjid Al-Akbar Surabaya |
| `kode_provinsi` | Text(2) | ❌ | Kode provinsi BPS | 35 |
| `kode_kabupaten` | Text(4) | ❌ | Kode kabupaten BPS | 3578 |
| `jenis_hewan` | Text | ✅ | sapi/kambing/domba | sapi |
| `jumlah_daging` | Number | ❌ | Berat daging (kg) | 15.5 |
| `tanggal_distribusi` | Date | ✅ | Format: YYYY-MM-DD | 2025-06-17 |
| `foto_distribusi_url` | URL | ❌ | Link foto distribusi | https://... |
| `status` | Text | ❌ | distributed/completed | distributed |
| `catatan` | Text | ❌ | Catatan distribusi | Untuk jamaah masjid |

### **Contoh File Distribusi:**
```csv
nama_penerima,alamat_penerima,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
Pak Samsul,Masjid Al-Akbar Surabaya,35,3578,sapi,15.5,2025-06-17,https://example.com/foto1.jpg,distributed,Pembagian jamaah masjid
Bu Aminah,Jakarta Selatan Kebayoran,31,3171,kambing,8.2,2025-06-17,,distributed,Daging kambing warga
```

---

## 🗺️ **Kode Wilayah (Opsional)**

Sistem akan otomatis mendeteksi kode wilayah dari alamat, tapi Anda dapat menyertakan kode BPS:

### **Kode Provinsi:**
- `31` - DKI Jakarta
- `32` - Jawa Barat  
- `33` - Jawa Tengah
- `34` - DI Yogyakarta
- `35` - Jawa Timur

### **Kode Kabupaten/Kota (Contoh):**
- `3171` - Jakarta Selatan
- `3578` - Kota Surabaya
- `3525` - Kabupaten Gresik
- `3273` - Kota Bandung
- `3471` - Kota Yogyakarta

---

## 🔧 **Auto-Normalization**

Sistem akan otomatis menormalisasi variasi nama lokasi:

### **Jakarta:**
- ✅ "Jakarta Selatan" → Kode: 3171
- ✅ "jaksel" → Kode: 3171
- ✅ "Jakarta Timur" → Kode: 3172

### **Jawa Timur:**
- ✅ "Surabaya" → Kode: 3578
- ✅ "Kota Malang" → Kode: 3573
- ✅ "Gresik" → Kode: 3525

### **Jawa Barat:**
- ✅ "Bandung Kota" → Kode: 3273
- ✅ "Bogor Kota" → Kode: 3271
- ✅ "Depok" → Kode: 3276

---

## 📝 **Penamaan File**

### **Format Penamaan:**
```
[MITRA]_[LOKASI]_[TIPE]_[YYYYMMDD]_[HHMM].csv
```

### **Contoh:**
```
BAZNAS_Surabaya_MUZAKKI_20250617_1400.csv
LAZISMU_Jakarta_DISTRIBUSI_20250617_1500.csv
BMM_Bandung_MUZAKKI_20250617_0900.csv
```

---

## ✅ **Validasi Data**

### **Wajib Diisi:**
- Muzakki: `nama_muzakki`, `jenis_hewan`, `jumlah_hewan`, `nilai_qurban`
- Distribusi: `nama_penerima`, `alamat_penerima`, `jenis_hewan`, `tanggal_distribusi`

### **Format Tanggal:**
- ✅ `2025-06-17` (YYYY-MM-DD)
- ❌ `17/06/2025` (DD/MM/YYYY)

### **Jenis Hewan:**
- ✅ `sapi`, `kambing`, `domba`
- ❌ `Sapi`, `KAMBING`, `Domba`

### **Nilai Qurban:**
- ✅ `5500000` (tanpa titik/koma)
- ❌ `5.500.000` atau `5,500,000`

---

## 📁 **Sample Files**

Download contoh file yang sudah benar:

- 📄 [BAZNAS_Surabaya_MUZAKKI_20250617_1400.csv](sample-data/BAZNAS_Surabaya_MUZAKKI_20250617_1400.csv)
- 📄 [BAZNAS_Surabaya_DISTRIBUSI_20250617_1400_UPDATED.csv](sample-data/BAZNAS_Surabaya_DISTRIBUSI_20250617_1400_UPDATED.csv)

---

## 🚨 **Common Errors**

### **Schema Mismatch:**
```
❌ Error: Could not find 'nama_kabupaten' column
✅ Fix: Gunakan 'alamat' untuk muzakki, 'alamat_penerima' untuk distribusi
```

### **Date Format:**
```
❌ Error: Invalid date format
✅ Fix: Gunakan format YYYY-MM-DD (2025-06-17)
```

### **Required Fields:**
```
❌ Error: Missing required field
✅ Fix: Pastikan semua kolom wajib terisi
```

---

## 📞 **Support**

Jika ada masalah dengan format CSV:
1. Periksa contoh file di `docs/sample-data/`
2. Pastikan header kolom sesuai schema
3. Validasi format tanggal dan angka
4. Hubungi: admin@mtt.or.id 