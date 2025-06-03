import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, FileSpreadsheet, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';
import { 
  authenticateUploader, 
  saveMuzakkiData, 
  saveDistribusiData, 
  saveUploadHistory,
  type Uploader,
  type Muzakki,
  type Distribusi 
} from '../../lib/supabase';

interface UploadFile {
  id: string;
  file: File;
  type: 'muzakki' | 'distribusi' | null;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  result?: {
    success: number;
    total: number;
    duplicates: number;
    errors: string[];
  };
  error?: string;
}

const Upload = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploader, setUploader] = useState<Uploader | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Upload state
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Login handler
  const handleLogin = async (uploadKey: string) => {
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      const uploaderData = await authenticateUploader(uploadKey);
        
      if (uploaderData) {
        setIsAuthenticated(true);
        setUploader(uploaderData);
        console.log('✅ Authenticated as:', uploaderData.name, '(' + uploaderData.mitra_name + ')');
      } else {
        setLoginError('Kode akses tidak valid atau tidak aktif');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Terjadi kesalahan saat login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUploader(null);
    setUploadFiles([]);
    setLoginError('');
  };

  // File type detection
  const detectFileType = (filename: string): 'muzakki' | 'distribusi' | null => {
    const name = filename.toLowerCase();
    if (name.includes('muzakki')) return 'muzakki';
    if (name.includes('distribusi')) return 'distribusi';
    return null;
  };

  // File drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, []);

  // File processing
  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return extension === 'csv' || extension === 'xlsx';
    });
      
    const newUploads: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: detectFileType(file.name),
      status: 'pending',
      progress: 0
    }));

    setUploadFiles(prev => [...prev, ...newUploads]);
  };
    
  // CSV Parser
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || null;
        });
        records.push(record);
      }
    }

    return records;
  };

  // Process single file upload
  const processUpload = async (upload: UploadFile) => {
    if (!uploader || !upload.type) {
      updateUploadStatus(upload.id, 'error', 'Invalid file type or uploader');
      return;
    }
    
    updateUploadStatus(upload.id, 'uploading', undefined, 10);

    try {
      // Read file
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(upload.file);
      });

      updateUploadStatus(upload.id, 'uploading', undefined, 30);

      // Parse CSV
      const records = parseCSV(text);
      if (records.length === 0) {
        updateUploadStatus(upload.id, 'error', 'No valid records found in file');
      return;
    }

      updateUploadStatus(upload.id, 'uploading', undefined, 50);

      // Prepare data for database
      let result: { success: number; errors: any[] };
      
      if (upload.type === 'muzakki') {
        const muzakkiRecords: Muzakki[] = records.map(record => ({
          uploader_id: uploader.id,
          nama_muzakki: record.nama_muzakki || '',
          email: record.email || null,
          telepon: record.telepon || null,
          alamat: record.alamat || null,
          provinsi: record.provinsi || null,
          kabupaten: record.kabupaten || null,
          jenis_hewan: record.jenis_hewan as 'Sapi' | 'Kambing' | 'Domba',
          jumlah_hewan: parseInt(record.jumlah_hewan) || 1,
          nilai_qurban: parseFloat(record.nilai_qurban) || 0,
          tanggal_penyerahan: record.tanggal_penyerahan || null
        }));

        updateUploadStatus(upload.id, 'uploading', undefined, 70);
        result = await saveMuzakkiData(muzakkiRecords);
      } else {
        const distribusiRecords: Distribusi[] = records.map(record => ({
          uploader_id: uploader.id,
          nama_penerima: record.nama_penerima || '',
          alamat_penerima: record.alamat_penerima || '',
          provinsi: record.provinsi || null,
          kabupaten: record.kabupaten || null,
          jenis_hewan: record.jenis_hewan as 'Sapi' | 'Kambing' | 'Domba',
          jumlah_daging: parseFloat(record.jumlah_daging) || null,
          tanggal_distribusi: record.tanggal_distribusi || '',
          foto_distribusi_url: record.foto_distribusi_url || null,
          status: record.status || 'Selesai',
          catatan: record.catatan || null
        }));

        updateUploadStatus(upload.id, 'uploading', undefined, 70);
        result = await saveDistribusiData(distribusiRecords);
      }

      updateUploadStatus(upload.id, 'uploading', undefined, 90);

      // Save upload history
      await saveUploadHistory({
        uploader_id: uploader.id,
        filename: upload.file.name,
        file_type: upload.type,
        total_records: records.length,
        successful_records: result.success,
        failed_records: result.errors.length,
        file_size_bytes: upload.file.size,
        upload_status: 'completed'
      });

      // Update final status
      updateUploadStatus(upload.id, 'completed', undefined, 100, {
        success: result.success,
        total: records.length,
        duplicates: result.duplicates,
        errors: result.errors.map(e => e.message || 'Unknown error')
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      updateUploadStatus(upload.id, 'error', 
        error instanceof Error ? error.message : 'Upload failed'
      );
    }
  };
    
  // Update upload status helper
  const updateUploadStatus = (
    id: string, 
    status: UploadFile['status'], 
    error?: string, 
    progress?: number,
    result?: UploadFile['result']
  ) => {
    setUploadFiles(prev => prev.map(upload => 
      upload.id === id 
        ? { ...upload, status, error, progress: progress ?? upload.progress, result }
        : upload
    ));
  };

  // Remove upload
  const removeUpload = (id: string) => {
    setUploadFiles(prev => prev.filter(upload => upload.id !== id));
  };

  // Get status icon
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileSpreadsheet className="w-4 h-4 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  // Get status text
  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'uploading': return 'Mengupload...';
      case 'completed': return 'Selesai';
      case 'error': return 'Error';
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link 
              to="/service" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Layanan
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upload Data Qurban
            </h1>
            <p className="text-gray-600">
              Upload file CSV/Excel untuk data muzakki dan distribusi dengan mudah
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Masuk sebagai Mitra</h2>
              <p className="text-gray-600 mt-2">Masukkan kode akses mitra</p>
            </div>

            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget);
              const uploadKey = formData.get('uploadKey') as string;
              if (uploadKey?.trim()) {
                handleLogin(uploadKey);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Akses
                  </label>
                  <input
                    type="password"
                    name="uploadKey"
                    placeholder="Masukkan kode akses"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    disabled={isLoggingIn}
                  />
                  {loginError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{loginError}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Masuk</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main upload interface
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link 
              to="/service" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Layanan
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Masuk sebagai: <span className="font-semibold">{uploader?.name}</span>
                <span className="text-green-600 ml-1">({uploader?.mitra_name})</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 transition-colors text-sm"
              >
                Keluar
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Upload Data Qurban
            </h1>
            <p className="text-gray-600 mt-2">
              Upload file CSV/Excel dengan format sederhana. Sistem akan mendeteksi tipe file otomatis.
            </p>
          </div>
        </div>

        {/* Format Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-3 mb-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Format File CSV</h3>
              </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
              <h4 className="font-medium text-blue-900 mb-2">📊 Data Muzakki (Penyumbang)</h4>
              <p className="text-blue-700 mb-2">Nama file harus mengandung kata "muzakki"</p>
              <p className="text-blue-700">Kolom: nama_muzakki, email, telepon, alamat, provinsi, kabupaten, jenis_hewan, jumlah_hewan, nilai_qurban, tanggal_penyerahan</p>
                </div>
                <div>
              <h4 className="font-medium text-blue-900 mb-2">📦 Data Distribusi (Penerima)</h4>
              <p className="text-blue-700 mb-2">Nama file harus mengandung kata "distribusi"</p>
              <p className="text-blue-700">Kolom: nama_penerima, alamat_penerima, provinsi, kabupaten, jenis_hewan, jumlah_daging, tanggal_distribusi</p>
              <p className="text-blue-600 text-xs mt-1">* foto_distribusi_url, status, catatan bersifat opsional</p>
                </div>
              </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <UploadIcon className="w-5 h-5 mr-2 text-green-500" />
            Upload File CSV/Excel
          </h2>
          
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-green-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Seret file CSV/Excel ke sini
            </h3>
            <p className="text-gray-600 mb-4">
              atau klik untuk memilih file dari komputer
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".csv,.xlsx"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
                Pilih File
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              File CSV/Excel maksimal 10MB
            </p>
          </div>
        </div>

        {/* Upload Queue */}
        {uploadFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              File Upload ({uploadFiles.length})
            </h3>
            
            <div className="space-y-4">
              {uploadFiles.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <div className="font-medium text-gray-900">{upload.file.name}</div>
                        <div className="text-sm text-gray-500">
                          Type: {upload.type || 'Unknown'} • {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{getStatusText(upload.status)}</span>
                      {upload.status === 'pending' && (
                        <button
                          onClick={() => processUpload(upload)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Upload
                        </button>
                      )}
                      {upload.status === 'uploading' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {upload.progress}%
                        </span>
                      )}
                      {upload.status === 'completed' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                          ✅ Done
                        </span>
                      )}
                      {upload.status === 'error' && (
                        <button
                          onClick={() => processUpload(upload)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => removeUpload(upload.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {upload.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {upload.error && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {upload.error}
                    </div>
                  )}
                  
                  {/* Success Result */}
                  {upload.result && upload.status === 'completed' && (
                    <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                      <div className="font-medium text-green-800 mb-1">✅ Upload Berhasil</div>
                      <div className="text-green-700">
                        📊 {upload.result.success} dari {upload.result.total} record berhasil disimpan
                        {upload.result.duplicates > 0 && (
                          <div className="mt-1 text-orange-600">
                            🔄 {upload.result.duplicates} data duplikat dilewati
                          </div>
                        )}
                        {upload.result.errors.length > 0 && (
                          <div className="mt-1 text-red-600">
                            ⚠️ {upload.result.errors.length} error
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Bulk Actions */}
            <div className="mt-4 pt-4 border-t flex justify-between">
                <button
                  onClick={() => setUploadFiles([])}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear All
                </button>
              
              <button
                onClick={() => {
                  const pendingFiles = uploadFiles.filter(u => u.status === 'pending');
                  pendingFiles.forEach(processUpload);
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                disabled={!uploadFiles.some(u => u.status === 'pending')}
              >
                Upload All ({uploadFiles.filter(u => u.status === 'pending').length})
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Panduan Upload
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Sample Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Download sample data untuk melihat format yang benar
              </p>
              <div className="space-y-2">
                <a 
                  href="/docs/sample-data/sample_muzakki.csv" 
                  download
                  className="inline-block text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  📥 Download Sample Muzakki.csv
                </a>
                <br />
                <a 
                  href="/docs/sample-data/sample_distribusi.csv" 
                  download
                  className="inline-block text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  📥 Download Sample Distribusi.csv
                </a>
            </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Tips Upload
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pastikan nama file mengandung "muzakki" atau "distribusi"</li>
                <li>• Gunakan format tanggal: YYYY-MM-DD (2024-06-15)</li>
                <li>• Jenis hewan: Sapi, Kambing, atau Domba</li>
                <li>• Provinsi dan kabupaten menggunakan nama lengkap</li>
                <li>• Kolom opsional boleh dikosongkan</li>
              </ul>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Upload; 