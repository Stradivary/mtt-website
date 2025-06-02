import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';

const Upload = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploader, setUploader] = useState<any>(null);
  const [uploadFiles, setUploadFiles] = useState<any[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleLogin = (credentials: any) => {
    // Mock authentication - will be replaced with real auth
    setIsAuthenticated(true);
    setUploader({
      name: 'Admin LAZIS',
      mitra_name: 'LAZIS_TELKOMSEL',
      id: '1'
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUploader(null);
  };

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
              Area khusus untuk mitra MTT mengupload data muzakki dan distribusi
            </p>
          </div>

          {/* Authentication Form */}
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Masuk sebagai Mitra</h2>
              <p className="text-gray-600 mt-2">Masukkan kode akses yang diberikan admin</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin({}); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Akses
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan kode akses (contoh: baznas2025)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors font-medium"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
                <span className="text-blue-600 ml-1">({uploader?.mitra_name})</span>
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
              Upload file Excel untuk data muzakki dan distribusi qurban
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Format File Excel</h3>
                <p className="text-blue-700 text-sm">
                  Pastikan file sesuai template dan format penamaan yang benar
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showInstructions ? 'Sembunyikan' : 'Lihat Panduan'}
            </button>
          </div>
          
          {showInstructions && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Template A: Data Muzakki</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Format: {uploader?.mitra_name}_LOKASI_MUZAKKI_YYYYMMDD_HHMM.xlsx</li>
                    <li>• Kolom: nama_muzakki, nomor_telepon, jenis_hewan, dll</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Template B: Data Distribusi</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Format: {uploader?.mitra_name}_LOKASI_DISTRIBUSI_YYYYMMDD_HHMM.xlsx</li>
                    <li>• Kolom: tanggal_distribusi, kabupaten, lokasi_detail, dll</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <UploadIcon className="w-5 h-5 mr-2 text-purple-500" />
            Upload File Excel
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Seret file Excel ke sini
            </h3>
            <p className="text-gray-600 mb-4">
              atau klik untuk memilih file dari komputer Anda
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
              Pilih File
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Maksimal 5 file, ukuran per file maksimal 10MB
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Butuh Bantuan?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Template Excel</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download template Excel yang sudah sesuai format
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Download Template
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Panduan Upload</h3>
              <p className="text-sm text-gray-600 mb-3">
                Lihat panduan lengkap cara upload data
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Lihat Panduan
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kontak Support</h3>
              <p className="text-sm text-gray-600 mb-3">
                Hubungi tim support jika ada masalah
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Hubungi Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload; 