-- MTT Qurban Dashboard Database Setup
-- Run this script in Supabase SQL Editor

-- =====================================================
-- 1. UPLOADERS TABLE - Manage upload authentication
-- =====================================================
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploaders_email ON uploaders(email);
CREATE INDEX IF NOT EXISTS idx_uploaders_upload_key ON uploaders(upload_key);
CREATE INDEX IF NOT EXISTS idx_uploaders_mitra ON uploaders(mitra_name);

-- =====================================================
-- 2. REF_PROVINSI TABLE - Reference for provinces
-- =====================================================
CREATE TABLE IF NOT EXISTS ref_provinsi (
    id SERIAL PRIMARY KEY,
    kode_provinsi VARCHAR(2) UNIQUE NOT NULL,
    nama_provinsi VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. REF_KABUPATEN TABLE - Reference for regencies
-- =====================================================
CREATE TABLE IF NOT EXISTS ref_kabupaten (
    id SERIAL PRIMARY KEY,
    kode_kabupaten VARCHAR(4) UNIQUE NOT NULL,
    nama_kabupaten VARCHAR(255) NOT NULL,
    kode_provinsi VARCHAR(2) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (kode_provinsi) REFERENCES ref_provinsi(kode_provinsi)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_kabupaten_provinsi ON ref_kabupaten(kode_provinsi);

-- =====================================================
-- 4. MUZAKKI TABLE - Qurban donors data
-- =====================================================
CREATE TABLE IF NOT EXISTS muzakki (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID NOT NULL,
    nama_muzakki VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telepon VARCHAR(20),
    alamat TEXT,
    kode_provinsi VARCHAR(2),
    kode_kabupaten VARCHAR(4),
    jenis_hewan VARCHAR(50) NOT NULL, -- 'sapi', 'kambing', 'domba'
    jumlah_hewan INTEGER NOT NULL DEFAULT 1,
    nilai_qurban DECIMAL(15, 2) NOT NULL,
    tanggal_penyerahan DATE,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'verified', 'distributed'
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (uploader_id) REFERENCES uploaders(id),
    FOREIGN KEY (kode_provinsi) REFERENCES ref_provinsi(kode_provinsi),
    FOREIGN KEY (kode_kabupaten) REFERENCES ref_kabupaten(kode_kabupaten)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_muzakki_uploader ON muzakki(uploader_id);
CREATE INDEX IF NOT EXISTS idx_muzakki_provinsi ON muzakki(kode_provinsi);
CREATE INDEX IF NOT EXISTS idx_muzakki_kabupaten ON muzakki(kode_kabupaten);
CREATE INDEX IF NOT EXISTS idx_muzakki_status ON muzakki(status);
CREATE INDEX IF NOT EXISTS idx_muzakki_jenis_hewan ON muzakki(jenis_hewan);
CREATE INDEX IF NOT EXISTS idx_muzakki_tanggal ON muzakki(tanggal_penyerahan);

-- =====================================================
-- 5. DISTRIBUSI TABLE - Distribution beneficiaries
-- =====================================================
CREATE TABLE IF NOT EXISTS distribusi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID NOT NULL,
    nama_penerima VARCHAR(255) NOT NULL,
    alamat_penerima TEXT NOT NULL,
    kode_provinsi VARCHAR(2),
    kode_kabupaten VARCHAR(4),
    jenis_hewan VARCHAR(50) NOT NULL,
    jumlah_daging DECIMAL(8, 2), -- kg
    tanggal_distribusi DATE NOT NULL,
    foto_distribusi_url TEXT,
    status VARCHAR(50) DEFAULT 'distributed', -- 'planned', 'distributed', 'completed'
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (uploader_id) REFERENCES uploaders(id),
    FOREIGN KEY (kode_provinsi) REFERENCES ref_provinsi(kode_provinsi),
    FOREIGN KEY (kode_kabupaten) REFERENCES ref_kabupaten(kode_kabupaten)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_distribusi_uploader ON distribusi(uploader_id);
CREATE INDEX IF NOT EXISTS idx_distribusi_provinsi ON distribusi(kode_provinsi);
CREATE INDEX IF NOT EXISTS idx_distribusi_kabupaten ON distribusi(kode_kabupaten);
CREATE INDEX IF NOT EXISTS idx_distribusi_tanggal ON distribusi(tanggal_distribusi);
CREATE INDEX IF NOT EXISTS idx_distribusi_status ON distribusi(status);

-- =====================================================
-- 6. UPLOAD_HISTORY TABLE - Track all upload activities
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
    processing_time_ms INTEGER,
    error_details JSONB,
    upload_status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (uploader_id) REFERENCES uploaders(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_upload_history_uploader ON upload_history(uploader_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_status ON upload_history(upload_status);
CREATE INDEX IF NOT EXISTS idx_upload_history_type ON upload_history(file_type);
CREATE INDEX IF NOT EXISTS idx_upload_history_date ON upload_history(created_at);

-- =====================================================
-- 7. CREATE VIEWS FOR DASHBOARD ANALYTICS
-- =====================================================

-- Dashboard summary view
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
    COUNT(DISTINCT m.id) as total_muzakki,
    COALESCE(SUM(m.jumlah_hewan), 0) as total_hewan,
    COALESCE(SUM(m.nilai_qurban), 0) as total_nilai_qurban,
    COUNT(DISTINCT d.id) as total_penerima,
    COUNT(DISTINCT m.kode_kabupaten) as kabupaten_coverage,
    COUNT(DISTINCT m.kode_provinsi) as provinsi_coverage
FROM muzakki m
FULL OUTER JOIN distribusi d ON m.kode_kabupaten = d.kode_kabupaten;

-- Kabupaten summary view
CREATE OR REPLACE VIEW kabupaten_summary AS
SELECT 
    rk.nama_kabupaten,
    rp.nama_provinsi,
    COUNT(DISTINCT d.id) as total_penerima,
    COUNT(DISTINCT m.id) as total_muzakki,
    COALESCE(SUM(m.jumlah_hewan), 0) as total_hewan,
    COALESCE(SUM(m.nilai_qurban), 0) as total_nilai,
    ARRAY_AGG(DISTINCT u.mitra_name) FILTER (WHERE u.mitra_name IS NOT NULL) as active_mitra,
    MAX(d.tanggal_distribusi) as latest_distribution
FROM ref_kabupaten rk
LEFT JOIN ref_provinsi rp ON rk.kode_provinsi = rp.kode_provinsi
LEFT JOIN distribusi d ON rk.kode_kabupaten = d.kode_kabupaten
LEFT JOIN muzakki m ON rk.kode_kabupaten = m.kode_kabupaten
LEFT JOIN uploaders u ON m.uploader_id = u.id OR d.uploader_id = u.id
GROUP BY rk.nama_kabupaten, rp.nama_provinsi, rk.kode_kabupaten
ORDER BY total_penerima DESC;

-- =====================================================
-- 8. INSERT SAMPLE REFERENCE DATA
-- =====================================================

-- Insert sample uploader for testing
INSERT INTO uploaders (id, email, name, mitra_name, upload_key, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@lazis-telkomsel.or.id', 'Admin LAZIS', 'LAZIS_TELKOMSEL', 'baznas2025', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample provinces (you can add more)
INSERT INTO ref_provinsi (kode_provinsi, nama_provinsi, latitude, longitude) VALUES
('31', 'DKI Jakarta', -6.208763, 106.845599),
('32', 'Jawa Barat', -6.914744, 107.609344),
('33', 'Jawa Tengah', -7.797068, 110.370529),
('35', 'Jawa Timur', -7.972429, 112.238402),
('12', 'Sumatra Utara', 3.597031, 98.678513),
('73', 'Sulawesi Selatan', -5.147665, 120.307842),
('51', 'Bali', -8.455472, 115.188919),
('64', 'Kalimantan Timur', 1.688530, 116.419389),
('13', 'Sumatra Barat', -0.789275, 100.351906),
('14', 'Riau', 0.507068, 101.447777)
ON CONFLICT (kode_provinsi) DO NOTHING;

-- Insert sample kabupaten
INSERT INTO ref_kabupaten (kode_kabupaten, nama_kabupaten, kode_provinsi, latitude, longitude) VALUES
('3171', 'Jakarta Selatan', '31', -6.261493, 106.810600),
('3172', 'Jakarta Timur', '31', -6.225014, 106.900447),
('3173', 'Jakarta Pusat', '31', -6.186200, 106.834091),
('3201', 'Bogor', '32', -6.595038, 106.816635),
('3273', 'Bandung', '32', -6.917464, 107.619123),
('3578', 'Surabaya', '35', -7.257472, 112.752088)
ON CONFLICT (kode_kabupaten) DO NOTHING;

-- Insert sample uploaders
INSERT INTO uploaders (email, name, mitra_name, upload_key) VALUES
('admin@lazis-jakarta.org', 'Admin LAZIS Jakarta', 'LAZIS Jakarta', 'LAZIS_JKT_2025'),
('upload@baznas-sby.org', 'Upload BAZNAS Surabaya', 'BAZNAS Surabaya', 'BAZNAS_SBY_2025'),
('data@mtt-bandung.org', 'Data MTT Bandung', 'MTT Bandung', 'MTT_BDG_2025')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 9. RLS (Row Level Security) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE uploaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzakki ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- Basic read policy for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON uploaders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON muzakki
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON distribusi
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 10. FUNCTIONS FOR DASHBOARD
-- =====================================================

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_muzakki', COALESCE(COUNT(DISTINCT m.id), 0),
        'total_hewan', COALESCE(SUM(m.jumlah_hewan), 0),
        'total_penerima', COALESCE(COUNT(DISTINCT d.id), 0),
        'kabupaten_coverage', COALESCE(COUNT(DISTINCT COALESCE(m.kode_kabupaten, d.kode_kabupaten)), 0),
        'total_nilai_qurban', COALESCE(SUM(m.nilai_qurban), 0),
        'hewan_breakdown', json_build_object(
            'sapi', COALESCE(SUM(CASE WHEN m.jenis_hewan = 'sapi' THEN m.jumlah_hewan ELSE 0 END), 0),
            'kambing', COALESCE(SUM(CASE WHEN m.jenis_hewan = 'kambing' THEN m.jumlah_hewan ELSE 0 END), 0),
            'domba', COALESCE(SUM(CASE WHEN m.jenis_hewan = 'domba' THEN m.jumlah_hewan ELSE 0 END), 0)
        )
    )
    INTO result
    FROM muzakki m
    FULL OUTER JOIN distribusi d ON m.kode_kabupaten = d.kode_kabupaten;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ Supabase database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: uploaders, ref_provinsi, ref_kabupaten, muzakki, distribusi, upload_history';
    RAISE NOTICE '🔍 Views created: dashboard_summary, kabupaten_summary';
    RAISE NOTICE '⚡ Functions created: get_dashboard_stats()';
    RAISE NOTICE '🔒 RLS policies enabled for security';
    RAISE NOTICE '📝 Sample data inserted for testing';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Database ready for MTT Qurban Dashboard!';
END $$; 