# 🚀 MTT Website - Supabase Database Setup

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Git**: Latest version

## 🔧 Step 1: Supabase Project Setup

### 1.1 Create New Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Organization**: Select or create
   - **Name**: `mtt-website`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
4. Click **"Create new project"**

### 1.2 Get API Keys
1. In your project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔧 Step 2: Environment Configuration

### 2.1 Create Environment File
Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_QURBAN_REGISTRATION=true
NEXT_PUBLIC_ENABLE_DASHBOARD=true
```

### 2.2 Replace Values
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-anon-key-here` with your actual anon key

## 🗃️ Step 3: Database Setup

### 3.1 Create Tables
In Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Create tables from the setup script
\i database/setup-supabase-tables.sql
```

Or copy and paste the content from `mtt-website/database/setup-supabase-tables.sql`

### 3.2 Run Automated Setup
Use our automated setup script:

```bash
# Install dependencies first
npm install

# Run database setup and populate reference data
npm run setup:db

# Or alternatively
npm run test:supabase
```

## 📊 Step 4: Verify Setup

### 4.1 Check Tables
In Supabase dashboard, go to **Table Editor** and verify these tables exist:
- ✅ `ref_provinsi` (38 provinces)
- ✅ `ref_kabupaten` (Major cities/regencies)
- ✅ `qurban_pendaftaran` (Qurban registrations)
- ✅ `distribusi` (Distribution records)
- ✅ `upload_history` (File uploads)
- ✅ `muzakki` (Donors)

### 4.2 Check Data
Verify reference data:
- **Provinces**: Should have 38 records
- **Kabupaten**: Should have major Indonesian cities

### 4.3 Test Application
```bash
# Start development server
npm run dev

# Open browser and test:
# 1. Homepage: http://localhost:3000
# 2. Qurban Registration: http://localhost:3000/service/qurban/pendaftaran
# 3. Dashboard: http://localhost:3000/service/qurban/dashboard
```

## 🔒 Step 5: Row Level Security (RLS)

### 5.1 Enable RLS
For production, enable RLS on sensitive tables:

```sql
-- Enable RLS on all tables
ALTER TABLE qurban_pendaftaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzakki ENABLE ROW LEVEL SECURITY;

-- Create policies (example for qurban_pendaftaran)
CREATE POLICY "Allow public read access" ON qurban_pendaftaran
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON qurban_pendaftaran
  FOR INSERT WITH CHECK (true);
```

### 5.2 Reference Tables (Public)
Keep ref_provinsi and ref_kabupaten as public read:

```sql
-- Allow public read access to reference tables
CREATE POLICY "Allow public read provinces" ON ref_provinsi
  FOR SELECT USING (true);

CREATE POLICY "Allow public read kabupaten" ON ref_kabupaten
  FOR SELECT USING (true);
```

## 🎯 Step 6: Production Deployment

### 6.1 Environment Variables
For production deployment, set these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 6.2 Database Backup
Set up automated backups in Supabase dashboard:
1. Go to **Settings** > **Database**
2. Enable **Point-in-time Recovery**
3. Configure backup retention period

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Failed
```
❌ Supabase connection failed: Invalid API key
```
**Solution**: Check your API keys in `.env.local`

#### 2. Table Not Found
```
❌ relation "ref_provinsi" does not exist
```
**Solution**: Run the table creation script first

#### 3. RLS Policy Error
```
❌ new row violates row-level security policy
```
**Solution**: Check RLS policies or disable RLS for development

#### 4. Environment Variables Not Loaded
```
❌ Missing Supabase environment variables!
```
**Solution**: Ensure `.env.local` exists and contains correct values

### Debug Commands

```bash
# Test connection only
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Testing...', await supabase.from('ref_provinsi').select('count'));
"

# Clear and recreate data
npm run setup:db

# Check logs
npm run dev -- --verbose
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review error logs in Supabase dashboard
3. Test with the provided debug commands
4. Create an issue in this repository

---

## 🎉 Success!

If all steps completed successfully, you should have:
- ✅ Working Supabase connection
- ✅ 38 Indonesian provinces in database
- ✅ Major cities/regencies populated
- ✅ Qurban registration system working
- ✅ Interactive dashboard with real data
- ✅ Ready for production deployment 