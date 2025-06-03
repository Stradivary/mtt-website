# 🤝 MTT Qurban - Panduan Upload untuk Mitra

> **⚠️ DOKUMEN INTERNAL - RAHASIA**  
> Dokumen ini berisi kode akses asli untuk upload data. Jangan bagikan ke publik.  
> UI website hanya menampilkan contoh "baznas2025" untuk keamanan.

## 🔑 **Akun Upload Mitra yang Tersedia**

| **Mitra** | **Kode Akses** | **Email** | **Status** |
|-----------|----------------|-----------|------------|
| **BMM** (Badan Musyawarah Masjid) | `bmm_2025_1` | admin@bmm.or.id | ✅ Aktif |
| **LAZIS Muhammadiyah** | `lazismu_2025_2` | admin@lazismu.or.id | ✅ Aktif |
| **LAZIS Nahdlatul Ulama** | `lazis_nu2025_3` | admin@lazisnu.or.id | ✅ Aktif |
| **BAZNAS Pusat** | `baznas_2025_4` | admin@baznas.go.id | ✅ Aktif |

---

## 📋 **Cara Upload Data**

### **1. Akses Upload Page**
```
URL: http://localhost:5173/service/qurban/upload
```

### **2. Login dengan Kode Akses**
- Masukkan salah satu kode akses sesuai mitra Anda
- Contoh: `bmm_2025_1` untuk BMM

### **3. Upload File CSV**
#### **Format File Muzakki:**
```
nama_muzakki,email,telepon,alamat,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_hewan,nilai_qurban,tanggal_penyerahan,status,catatan
```

#### **Format File Distribusi:**
```
nama_penerima,alamat_penerima,kode_provinsi,kode_kabupaten,jenis_hewan,jumlah_daging,tanggal_distribusi,foto_distribusi_url,status,catatan
```

### **4. Penamaan File**
```
[MITRA]_[LOKASI]_[TIPE]_[YYYYMMDD]_[HHMM].csv

Contoh:
- BMM_Jakarta_MUZAKKI_20250617_1400.csv
- LAZISMU_Yogya_DISTRIBUSI_20250617_1500.csv
```

---

## 🔍 **Fitur Deteksi Duplikat**

### **Muzakki (Donors):**
- **Exact Match**: nama + jenis_hewan + nilai_qurban
- **Phone Match**: nama + telepon
- **Fuzzy Match**: kemiripan nama ≥80%

### **Distribusi (Beneficiaries):**
- **Exact Match**: nama_penerima + alamat + tanggal
- **Location Match**: alamat + tanggal + jenis_hewan
- **Fuzzy Match**: kemiripan alamat ≥80%

---

## 📊 **Expected Results**

### **First Upload (Database Empty):**
```
✅ Upload Berhasil
📊 15 record baru, 🚫 0 duplikat dilewati, 🔀 0 record digabung
```

### **Subsequent Uploads (With Duplicates):**
```
✅ Upload Berhasil
📊 5 record baru, 🚫 10 duplikat dilewati, 🔀 2 record digabung
```

---

## 🧪 **Testing dengan Sample Data**

Untuk testing, gunakan file sample yang tersedia:
```
docs/sample-data/BAZNAS_Surabaya_MUZAKKI_20250617_1400.csv
docs/sample-data/BAZNAS_Surabaya_DISTRIBUSI_20250617_1400_UPDATED.csv
```

---

## 🚨 **Troubleshooting**

### **❌ "Invalid Upload Key"**
- Pastikan menggunakan salah satu dari 4 kode akses yang valid
- Check case sensitivity

### **❌ "File Format Error"**
- Pastikan file CSV dengan header yang benar
- Encoding file harus UTF-8

### **❌ "Database Connection Error"**
- Check dengan admin MTT
- Pastikan Supabase database aktif

### **❌ "0 Records Processed"**
- Buka Browser Developer Tools (F12)
- Check Console untuk error messages
- Pastikan CSV format sesuai schema

---

## 📞 **Kontak Support**

Jika ada masalah dengan upload:
1. **Screenshot error message**
2. **Copy console logs** (F12 → Console)
3. **Kirim sample file** yang bermasalah
4. **Hubungi**: admin@mtt.or.id

---

## 🔒 **Keamanan Data**

- Setiap mitra hanya bisa upload dengan kode akses masing-masing
- Data di-encrypt dalam database
- Audit trail untuk semua upload activities
- Row Level Security (RLS) untuk isolasi data mitra

---

## 📈 **Dashboard Monitoring**

Setelah upload berhasil, data dapat dimonitor di:
```
URL: http://localhost:5173/service/qurban/dashboard
```

Dashboard menampilkan:
- ✅ Total muzakki dan penerima
- 🗺️ Peta distribusi geografis  
- 📊 Statistik per provinsi/kabupaten
- 📋 Riwayat upload per mitra 