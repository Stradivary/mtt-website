# 🔐 Authentication Setup Guide - MTT Qurban

## 🚨 **ISSUE**: "Kode akses tidak valid atau tidak aktif"

The mitra access codes (`bmm_2025_1`, `lazismu_2025_2`, `lazis_nu2025_3`, `baznas_2025_4`) are not working because the database setup is incomplete.

---

## 🛠️ **STEP-BY-STEP FIX:**

### **Step 1: Environment Variables Setup**
```bash
# Run the environment setup script
node setup-env.js
```

**What it does:**
- Creates `.env.local` file with your Supabase credentials
- Prompts for Supabase URL, Anon Key, and Service Role Key
- Validates the inputs

**Required Info:**
- **Supabase URL**: `https://your-project-id.supabase.co`
- **Anon Key**: Found in Supabase Dashboard → Settings → API
- **Service Role Key**: Found in Supabase Dashboard → Settings → API (keep secret!)

---

### **Step 2: Database Tables Setup**

#### **Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy-paste the entire content of `database/setup-supabase-tables.sql`
4. Click **Run** to execute the SQL

#### **Option B: Manual Table Creation**
If SQL file is too large, run these essential commands:

```sql
-- Create uploaders table
CREATE TABLE IF NOT EXISTS uploaders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mitra_name VARCHAR(255) NOT NULL,
    upload_key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_uploaders_upload_key ON uploaders(upload_key);
CREATE INDEX IF NOT EXISTS idx_uploaders_mitra ON uploaders(mitra_name);
```

---

### **Step 3: Create Mitra Accounts**
```bash
# Run the uploader setup script
node scripts/setup-uploader.js
```

**What it does:**
- Creates 4 mitra accounts in the `uploaders` table
- Uses Service Role Key for admin access
- Outputs success/failure status for each account

**Expected Output:**
```
✅ Created: Admin BMM (bmm_2025_1)
✅ Created: Admin LAZIS MU (lazismu_2025_2)
✅ Created: Admin LAZIS NU (lazis_nu2025_3)
✅ Created: Admin BAZNAS (baznas_2025_4)
```

---

### **Step 4: Verify Setup**
```bash
# Restart development server
npm run dev
```

1. Navigate to: `http://localhost:5173/service`
2. Click **"Upload Data"**
3. Try login with: `bmm_2025_1`
4. Should show: **"✅ Authenticated as: Admin BMM (BMM_MASJID)"**

---

## 🔍 **TROUBLESHOOTING:**

### **❌ "Missing Supabase credentials"**
- **Problem**: No `.env.local` file or incomplete credentials
- **Solution**: Run `node setup-env.js` again

### **❌ "relation 'uploaders' does not exist"**
- **Problem**: Database tables not created
- **Solution**: Run the SQL from `database/setup-supabase-tables.sql` in Supabase Dashboard

### **❌ "Error creating uploader: permission denied"**
- **Problem**: Using Anon Key instead of Service Role Key
- **Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### **❌ "Upload key already exists"**
- **Problem**: Accounts already created (this is actually good!)
- **Solution**: Continue to testing

### **❌ Still getting "Kode akses tidak valid"**
- **Problem**: Authentication code not connecting to database
- **Check**: 
  1. `.env.local` exists and has correct credentials
  2. `uploaders` table exists in Supabase
  3. Accounts created by running `scripts/setup-uploader.js`
  4. Development server restarted after changes

---

## 📋 **VERIFICATION CHECKLIST:**

- [ ] ✅ `.env.local` file exists with Supabase credentials
- [ ] ✅ Database tables created (run SQL from `database/setup-supabase-tables.sql`)
- [ ] ✅ Mitra accounts created (`node scripts/setup-uploader.js`)
- [ ] ✅ Development server restarted (`npm run dev`)
- [ ] ✅ Can access upload page: `http://localhost:5173/service` → "Upload Data"
- [ ] ✅ Login works with `bmm_2025_1`, `lazismu_2025_2`, `lazis_nu2025_3`, `baznas_2025_4`

---

## 🎯 **QUICK SETUP COMMANDS:**

```bash
# Complete setup in 4 commands:
node setup-env.js                    # Step 1: Environment
# (Manual: Run SQL in Supabase)      # Step 2: Database  
node scripts/setup-uploader.js       # Step 3: Accounts
npm run dev                          # Step 4: Test
```

---

## 📞 **Still Having Issues?**

1. **Check Browser Console** (F12 → Console) for detailed error messages
2. **Verify Supabase Project** is active and accessible
3. **Double-check credentials** in Supabase Dashboard → Settings → API
4. **Test database connection** using Supabase client library

**Contact**: Include screenshots of error messages and console logs when reporting issues.

---

*Last Updated: 2025-06-03*  
*Status: Authentication system fully configured* ✅ 