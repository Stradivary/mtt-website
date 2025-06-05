-- Migration: Add "Sapi 1/7" as new animal type
-- Date: 2025-01-18
-- Description: Adds "Sapi 1/7" to the jenis_hewan enum/constraint

-- Drop existing constraints if they exist
DO $$ 
BEGIN
    -- Drop check constraint on muzakki table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'muzakki_jenis_hewan_check' 
        AND table_name = 'muzakki'
    ) THEN
        ALTER TABLE muzakki DROP CONSTRAINT muzakki_jenis_hewan_check;
    END IF;
    
    -- Drop check constraint on distribusi table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'distribusi_jenis_hewan_check' 
        AND table_name = 'distribusi'
    ) THEN
        ALTER TABLE distribusi DROP CONSTRAINT distribusi_jenis_hewan_check;
    END IF;
END $$;

-- Add new constraints with "Sapi 1/7" included
ALTER TABLE muzakki 
ADD CONSTRAINT muzakki_jenis_hewan_check 
CHECK (jenis_hewan IN ('Sapi', 'Sapi 1/7', 'Kambing', 'Domba'));

ALTER TABLE distribusi 
ADD CONSTRAINT distribusi_jenis_hewan_check 
CHECK (jenis_hewan IN ('Sapi', 'Sapi 1/7', 'Kambing', 'Domba'));

-- Insert some sample data for testing the new animal type
INSERT INTO muzakki (
    uploader_id,
    nama_muzakki,
    email,
    telepon,
    alamat,
    provinsi,
    kabupaten,
    jenis_hewan,
    jumlah_hewan,
    nilai_qurban,
    tanggal_penyerahan
) VALUES 
(
    (SELECT id FROM uploaders LIMIT 1), -- Use first available uploader
    'Test Muzakki Sapi 1/7',
    'test.sapi17@example.com',
    '081234567999',
    'Jl. Test Sapi 1/7 No. 123',
    'Jawa Timur',
    'Surabaya',
    'Sapi 1/7',
    2,
    1500000,
    CURRENT_DATE
)
ON CONFLICT DO NOTHING; -- Avoid duplicates if script is run multiple times

-- Add comment for documentation
COMMENT ON CONSTRAINT muzakki_jenis_hewan_check ON muzakki 
IS 'Valid animal types: Sapi (regular cow), Sapi 1/7 (shared cow), Kambing (goat), Domba (sheep)';

COMMENT ON CONSTRAINT distribusi_jenis_hewan_check ON distribusi 
IS 'Valid animal types: Sapi (regular cow), Sapi 1/7 (shared cow), Kambing (goat), Domba (sheep)';

-- Success message
SELECT 'Migration completed: Sapi 1/7 animal type added successfully!' as status; 