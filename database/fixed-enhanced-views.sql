-- Fixed Enhanced Dashboard Views for MTT Qurban System
-- Based on actual table structure in Supabase

-- Drop existing views to recreate them
DROP VIEW IF EXISTS dashboard_summary CASCADE;
DROP VIEW IF EXISTS advanced_analytics CASCADE;
DROP VIEW IF EXISTS activity_feed CASCADE;

-- =====================================================
-- CORRECTED DASHBOARD SUMMARY VIEW WITH ADVANCED ANALYTICS
-- =====================================================

CREATE VIEW dashboard_summary AS
SELECT 
  -- Basic Counts
  (SELECT COUNT(*) FROM muzakki) as total_muzakki,
  (SELECT COUNT(*) FROM distribusi) as total_penerima,
  (SELECT COUNT(DISTINCT provinsi) FROM distribusi WHERE provinsi IS NOT NULL) as provinsi_coverage,
  (SELECT COUNT(DISTINCT kabupaten) FROM distribusi WHERE kabupaten IS NOT NULL) as kabupaten_coverage,
  
  -- Financial Data
  (SELECT COALESCE(SUM(nilai_qurban), 0) FROM muzakki) as total_nilai_qurban,
  (SELECT COALESCE(AVG(nilai_qurban), 0) FROM muzakki WHERE nilai_qurban > 0) as avg_nilai_qurban,
  
  -- Hewan Statistics (use actual jumlah_hewan column)
  (SELECT COALESCE(SUM(jumlah_hewan), 0) FROM muzakki) as total_hewan,
  
  -- Distribution Progress Percentage
  (SELECT 
    CASE 
      WHEN (SELECT COUNT(*) FROM muzakki) > 0 
      THEN ROUND((COUNT(*)::decimal / (SELECT COUNT(*) FROM muzakki)) * 100, 1) 
      ELSE 0 
    END 
   FROM distribusi) as distribution_progress,
   
  -- Upload Statistics (using correct column names)
  (SELECT COUNT(*) FROM upload_history) as total_uploads,
  (SELECT COALESCE(SUM(successful_records), 0) FROM upload_history) as total_successful_records,
  (SELECT COALESCE(SUM(failed_records), 0) FROM upload_history) as total_failed_records,
  
  -- Mitra Performance
  (SELECT COUNT(DISTINCT mitra_name) FROM uploaders u 
   WHERE EXISTS (SELECT 1 FROM upload_history uh WHERE uh.uploader_id = u.id)) as active_mitras,
   
  -- Time-based Analytics
  (SELECT COUNT(*) FROM upload_history WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as uploads_last_7_days,
  (SELECT COUNT(*) FROM distribusi WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as distributions_last_7_days,
  
  -- Last Update
  GREATEST(
    COALESCE((SELECT MAX(created_at) FROM muzakki), '1970-01-01'::timestamp),
    COALESCE((SELECT MAX(created_at) FROM distribusi), '1970-01-01'::timestamp),
    COALESCE((SELECT MAX(created_at) FROM upload_history), '1970-01-01'::timestamp)
  ) as last_update;

-- =====================================================
-- ADVANCED ANALYTICS VIEW FOR CHARTS & INSIGHTS
-- =====================================================

CREATE VIEW advanced_analytics AS
SELECT 
  -- Daily Statistics (last 7 days) as JSON
  (SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'date', TO_CHAR(date_series, 'DD Mon'),
      'muzakki_count', COALESCE(m.daily_count, 0),
      'distribusi_count', COALESCE(d.daily_count, 0),
      'upload_count', COALESCE(u.daily_count, 0)
    ) ORDER BY date_series
  ) FROM (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date as date_series
  ) dates
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as daily_count
    FROM muzakki 
    WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(created_at)
  ) m ON dates.date_series = m.date
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as daily_count
    FROM distribusi 
    WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(created_at)
  ) d ON dates.date_series = d.date
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as daily_count
    FROM upload_history 
    WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(created_at)
  ) u ON dates.date_series = u.date) as daily_trends,
  
  -- Top Kabupaten Performance as JSON
  (SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', kabupaten || ', ' || provinsi,
      'penerima', total_penerima,
      'hewan', GREATEST(1, FLOOR(total_penerima * 0.8)),
      'percentage', percentage
    ) ORDER BY total_penerima DESC
  ) FROM (
    SELECT 
      COALESCE(kabupaten, 'Unknown') as kabupaten,
      COALESCE(provinsi, 'Unknown') as provinsi,
      COUNT(*) as total_penerima,
      ROUND((COUNT(*)::decimal / GREATEST(1, (SELECT COUNT(*) FROM distribusi WHERE kabupaten IS NOT NULL))) * 100, 1) as percentage
    FROM distribusi 
    WHERE kabupaten IS NOT NULL AND provinsi IS NOT NULL
    GROUP BY kabupaten, provinsi
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) top_kabupaten) as top_kabupaten_performance,
  
  -- Provinsi Distribution as JSON  
  (SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'provinsi', provinsi,
      'total_penerima', total_penerima,
      'percentage', percentage,
      'color', 
        CASE 
          WHEN row_number = 1 THEN '#ef4444'  -- Red for top
          WHEN row_number = 2 THEN '#f97316'  -- Orange for 2nd
          WHEN row_number = 3 THEN '#eab308'  -- Yellow for 3rd
          ELSE '#6b7280'                      -- Gray for others
        END
    ) ORDER BY total_penerima DESC
  ) FROM (
    SELECT 
      COALESCE(provinsi, 'Unknown') as provinsi,
      COUNT(*) as total_penerima,
      ROUND((COUNT(*)::decimal / GREATEST(1, (SELECT COUNT(*) FROM distribusi WHERE provinsi IS NOT NULL))) * 100, 1) as percentage,
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as row_number
    FROM distribusi 
    WHERE provinsi IS NOT NULL 
    GROUP BY provinsi
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) top_provinsi) as provinsi_breakdown,
  
  -- Mitra Performance as JSON
  (SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'mitra_name', mitra_name,
      'total_uploads', total_uploads,
      'successful_records', successful_records,
      'failed_records', failed_records,
      'muzakki_count', muzakki_count,
      'distribusi_count', distribusi_count,
      'success_rate', success_rate
    ) ORDER BY successful_records DESC
  ) FROM (
    SELECT 
      u.mitra_name,
      COUNT(uh.id) as total_uploads,
      COALESCE(SUM(uh.successful_records), 0) as successful_records,
      COALESCE(SUM(uh.failed_records), 0) as failed_records,
      (SELECT COUNT(*) FROM muzakki WHERE uploader_id = u.id) as muzakki_count,
      (SELECT COUNT(*) FROM distribusi WHERE uploader_id = u.id) as distribusi_count,
      CASE 
        WHEN SUM(uh.total_records) > 0 
        THEN ROUND((SUM(uh.successful_records)::decimal / SUM(uh.total_records)) * 100, 1)
        ELSE 0 
      END as success_rate
    FROM uploaders u
    LEFT JOIN upload_history uh ON u.id = uh.uploader_id
    GROUP BY u.id, u.mitra_name
    HAVING COUNT(uh.id) > 0
  ) mitra_stats) as mitra_performance;

-- =====================================================
-- ACTIVITY FEED VIEW FOR REAL-TIME UPDATES
-- =====================================================

CREATE VIEW activity_feed AS
SELECT 
  'upload' as activity_type,
  uh.id::text as activity_id,
  u.mitra_name,
  CONCAT(u.mitra_name, ' mengupload ', uh.file_type, ' (', uh.successful_records, ' record berhasil', 
    CASE WHEN uh.failed_records > 0 THEN CONCAT(', ', uh.failed_records, ' gagal') ELSE '' END, ')') as description,
  uh.created_at,
  JSON_BUILD_OBJECT(
    'filename', uh.filename,
    'total_records', uh.total_records,
    'successful_records', uh.successful_records,
    'failed_records', uh.failed_records,
    'file_size_bytes', uh.file_size_bytes
  ) as metadata
FROM upload_history uh
JOIN uploaders u ON uh.uploader_id = u.id

UNION ALL

SELECT 
  'distribution' as activity_type,
  d.id::text as activity_id,
  u.mitra_name,
  CONCAT('Distribusi qurban di ', COALESCE(d.kabupaten, 'Unknown'), ', ', COALESCE(d.provinsi, 'Unknown'), ' kepada ', d.nama_penerima) as description,
  d.created_at,
  JSON_BUILD_OBJECT(
    'nama_penerima', d.nama_penerima,
    'kabupaten', d.kabupaten,
    'provinsi', d.provinsi,
    'status', COALESCE(d.status, 'Selesai'),
    'jenis_hewan', d.jenis_hewan,
    'jumlah_daging', d.jumlah_daging
  ) as metadata
FROM distribusi d
JOIN uploaders u ON d.uploader_id = u.id

ORDER BY created_at DESC; 