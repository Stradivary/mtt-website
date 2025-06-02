// Database Types
export interface Uploader {
  id: string;
  email: string;
  name: string;
  mitra_name: string;
  upload_key: string;
  is_active: boolean;
  created_at: string;
}

export interface Muzakki {
  id: string;
  unique_key: string;
  nama_muzakki: string;
  nomor_telepon: string;
  alamat_muzakki?: string;
  jenis_hewan: 'Sapi' | 'Kambing' | 'Domba';
  jumlah_bagian: number;
  nilai_qurban: number;
  tanggal_setor: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Distribusi {
  id: string;
  unique_key: string;
  tanggal_distribusi: string;
  kabupaten_standard: string;
  kecamatan?: string;
  desa_kelurahan?: string;
  lokasi_detail: string;
  jenis_hewan: 'Sapi' | 'Kambing' | 'Domba';
  estimasi_berat_kg?: number;
  jumlah_penerima: number;
  nama_penerima_sample?: string;
  petugas_lapangan: string;
  mitra_pelaksana: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadHistory {
  id: string;
  filename: string;
  uploader_id: string;
  detected_mitra: string;
  upload_type: 'muzakki' | 'distribusi';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_results?: any;
  created_at: string;
  updated_at: string;
}

export interface RefProvinsi {
  id: string;
  name: string;
  aliases: string[];
}

export interface RefKabupaten {
  id: string;
  provinsi_id: string;
  name: string;
  aliases: string[];
}

// Dashboard Types
export interface DashboardStats {
  total_muzakki: number;
  total_hewan: number;
  total_penerima: number;
  kabupaten_coverage: number;
  total_nilai_qurban: number;
}

export interface KabupatenData {
  kabupaten: string;
  total_penerima: number;
  total_hewan: number;
  active_mitra: string[];
  latest_distribution: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'distribution' | 'registration';
  description: string;
  timestamp: string;
  mitra: string;
}

// Upload Types
export interface UploadFile {
  file: File;
  type: 'muzakki' | 'distribusi';
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ProcessingResult {
  total_rows: number;
  successful_inserts: number;
  failed_inserts: number;
  duplicates_found: number;
  errors: string[];
  warnings: string[];
} 