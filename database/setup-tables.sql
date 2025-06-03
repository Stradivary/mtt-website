-- MTT Qurban Upload System
-- Standard database structure with text-based locations

-- =====================================================
-- 0. DROP EXISTING TABLES (Clean slate)
-- =====================================================
DROP TABLE IF EXISTS upload_history CASCADE;
DROP TABLE IF EXISTS distribusi CASCADE;
DROP TABLE IF EXISTS muzakki CASCADE;
DROP TABLE IF EXISTS uploaders CASCADE;

-- Drop old tables if they exist
DROP TABLE IF EXISTS simple_upload_history CASCADE;
DROP TABLE IF EXISTS simple_distribusi CASCADE;
DROP TABLE IF EXISTS simple_muzakki CASCADE;
DROP TABLE IF EXISTS simple_uploaders CASCADE;

-- Drop original complex tables if they exist
DROP TABLE IF EXISTS qurban_upload_history CASCADE;
DROP TABLE IF EXISTS qurban_distribusi CASCADE;
DROP TABLE IF EXISTS qurban_muzakki CASCADE;
DROP TABLE IF EXISTS qurban_uploaders CASCADE;

-- Drop views
DROP VIEW IF EXISTS dashboard_summary CASCADE;
DROP VIEW IF EXISTS simple_dashboard_summary CASCADE;

-- =====================================================
-- 1. UPLOADERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS uploaders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mitra_name VARCHAR(255) NOT NULL,
    upload_key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. MUZAKKI TABLE - Simplified donor data
-- =====================================================
CREATE TABLE IF NOT EXISTS muzakki (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID NOT NULL,
    nama_muzakki VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telepon VARCHAR(20),
    alamat TEXT,
    provinsi VARCHAR(100), -- Now using text instead of codes
    kabupaten VARCHAR(100), -- Now using text instead of codes
    jenis_hewan VARCHAR(50) NOT NULL, -- 'Sapi', 'Kambing', 'Domba'
    jumlah_hewan INTEGER NOT NULL DEFAULT 1,
    nilai_qurban DECIMAL(15, 2) NOT NULL,
    tanggal_penyerahan DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (uploader_id) REFERENCES uploaders(id),
    -- Prevent duplicates based on nama + telepon combination
    UNIQUE(nama_muzakki, telepon)
);

-- =====================================================
-- 3. DISTRIBUSI TABLE - Simplified distribution data
-- =====================================================
CREATE TABLE IF NOT EXISTS distribusi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID NOT NULL,
    nama_penerima VARCHAR(255) NOT NULL,
    alamat_penerima TEXT NOT NULL,
    provinsi VARCHAR(100), -- Now using text instead of codes
    kabupaten VARCHAR(100), -- Now using text instead of codes
    jenis_hewan VARCHAR(50) NOT NULL,
    jumlah_daging DECIMAL(8, 2), -- kg
    tanggal_distribusi DATE NOT NULL,
    foto_distribusi_url TEXT, -- Optional
    status VARCHAR(50) DEFAULT 'Selesai', -- Optional with default
    catatan TEXT, -- Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (uploader_id) REFERENCES uploaders(id),
    -- Prevent duplicates based on nama + alamat combination
    UNIQUE(nama_penerima, alamat_penerima)
);

-- =====================================================
-- 4. UPLOAD HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS upload_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'muzakki', 'distribusi'
    total_records INTEGER NOT NULL DEFAULT 0,
    successful_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    file_size_bytes BIGINT,
    upload_status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (uploader_id) REFERENCES uploaders(id)
);

-- =====================================================
-- 5. ADD INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_uploaders_email ON uploaders(email);
CREATE INDEX IF NOT EXISTS idx_uploaders_upload_key ON uploaders(upload_key);

CREATE INDEX IF NOT EXISTS idx_muzakki_uploader ON muzakki(uploader_id);
CREATE INDEX IF NOT EXISTS idx_muzakki_provinsi ON muzakki(provinsi);
CREATE INDEX IF NOT EXISTS idx_muzakki_kabupaten ON muzakki(kabupaten);

CREATE INDEX IF NOT EXISTS idx_distribusi_uploader ON distribusi(uploader_id);
CREATE INDEX IF NOT EXISTS idx_distribusi_provinsi ON distribusi(provinsi);
CREATE INDEX IF NOT EXISTS idx_distribusi_kabupaten ON distribusi(kabupaten);

-- =====================================================
-- 6. INSERT SAMPLE UPLOADERS
-- =====================================================
INSERT INTO uploaders (id, email, name, mitra_name, upload_key, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@bmm.or.id', 'Admin BMM', 'BMM', 'bmm2025', true),
('550e8400-e29b-41d4-a716-446655440001', 'admin@lazismu.or.id', 'Admin LAZIS Muhammadiyah', 'LAZIS_MUHAMMADIYAH', 'lazismu2025', true),
('550e8400-e29b-41d4-a716-446655440002', 'admin@lazisnu.or.id', 'Admin LAZIS NU', 'LAZIS_NU', 'lazisnu2025', true),
('550e8400-e29b-41d4-a716-446655440003', 'admin@baznas.go.id', 'Admin BAZNAS', 'BAZNAS', 'baznas2025', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. CREATE DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
    COUNT(DISTINCT m.id) as total_muzakki,
    COALESCE(SUM(m.jumlah_hewan), 0) as total_hewan,
    COALESCE(SUM(m.nilai_qurban), 0) as total_nilai_qurban,
    COUNT(DISTINCT d.id) as total_penerima,
    COUNT(DISTINCT m.provinsi) as provinsi_coverage,
    COUNT(DISTINCT m.kabupaten) as kabupaten_coverage
FROM muzakki m
FULL OUTER JOIN distribusi d ON m.kabupaten = d.kabupaten; 