import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, FileSpreadsheet, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
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
    
  // Advanced CSV Line Parser - Handles commas within data fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator (only when not in quotes)
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  // Advanced CSV Parser - Handles commas within data fields
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    console.log(`📝 CSV parsing started: ${lines.length} total lines`);
    
    // Parse headers
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    console.log('📊 CSV headers detected:', headers);
    
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        console.log(`⚠️ Skipping empty line ${i + 1}`);
        continue;
      }
      
      // Parse the CSV line properly
      const values = parseCSVLine(line);
      
      // Skip lines with no meaningful data
      if (values.length === 0 || (values.length === 1 && values[0] === '')) {
        console.log(`⚠️ Skipping line ${i + 1} - no data`);
        continue;
      }
      
      const record: any = {};
      
      // Map values to headers, handling different column counts
      headers.forEach((header, index) => {
        const value = index < values.length ? values[index] : null;
        record[header] = value !== null && value !== undefined && value !== '' ? value : null;
      });
      
      // Only add record if it has at least one meaningful field
      const hasRequiredData = (record.nama_muzakki && record.nama_muzakki.trim() !== '') || 
                              (record.nama_penerima && record.nama_penerima.trim() !== '');
      
      if (hasRequiredData) {
        records.push(record);
        console.log(`✅ CSV processed row ${i + 1} (${values.length} fields):`, {
          nama: record.nama_muzakki || record.nama_penerima,
          email: record.email,
          telepon: record.telepon,
          alamat: (record.alamat || record.alamat_penerima)?.substring(0, 50) + ((record.alamat || record.alamat_penerima)?.length > 50 ? '...' : '')
        });
      } else {
        console.log(`⚠️ Skipping row ${i + 1} - missing required data. Parsed ${values.length} fields:`, values.slice(0, 3));
      }
    }
    
    console.log(`📊 CSV parsing complete: ${records.length} valid records from ${lines.length - 1} total data rows`);
    return records;
  };

  // Excel Parser
  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: null 
          });
          
          if (jsonData.length < 2) {
            resolve([]);
            return;
          }
          
          // Get headers from first row
          const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
          console.log('📊 Excel headers detected:', headers);
          
          // Convert rows to objects
          const records: any[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            
            // Skip empty rows
            if (!row || row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
              console.log(`⚠️ Skipping empty row ${i + 1}`);
              continue;
            }
            
            const record: any = {};
            headers.forEach((header, index) => {
              const value = row[index];
              record[header] = value !== null && value !== undefined ? String(value).trim() : null;
            });
            
            // Only add record if it has at least one non-empty field
            const hasData = Object.values(record).some(value => value !== null && value !== '');
            if (hasData) {
              records.push(record);
              console.log(`✅ Processed row ${i + 1}:`, record);
            } else {
              console.log(`⚠️ Skipping row ${i + 1} - no data`);
            }
          }
          
          console.log(`📊 Excel parsing complete: ${records.length} valid records from ${jsonData.length - 1} total rows`);
          resolve(records);
        } catch (error) {
          console.error('Error parsing Excel:', error);
          reject(new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Excel date conversion utility
  const convertExcelDate = (excelDate: any): string | null => {
    if (!excelDate) return null;
    
    // If it's already a valid date string, return it
    if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(excelDate)) {
      return excelDate;
    }
    
    // If it's a number (Excel serial date)
    const serialNumber = parseFloat(excelDate);
    if (!isNaN(serialNumber) && serialNumber > 0) {
      // Excel epoch is January 1, 1900 (with leap year bug compensation)
      const excelEpoch = new Date(1900, 0, 1);
      // Subtract 2 days to account for Excel's leap year bug (1900 wasn't a leap year)
      const days = serialNumber - 2;
      const convertedDate = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      
      // Format as YYYY-MM-DD
      const year = convertedDate.getFullYear();
      const month = String(convertedDate.getMonth() + 1).padStart(2, '0');
      const day = String(convertedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log(`📅 Converted Excel date ${excelDate} -> ${dateString}`);
      return dateString;
    }
    
    // If it's a Date object
    if (excelDate instanceof Date) {
      const year = excelDate.getFullYear();
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const day = String(excelDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    console.warn(`⚠️ Could not convert date: ${excelDate} (type: ${typeof excelDate})`);
    return null;
  };

  // Validate jenis hewan
  const validateJenisHewan = (jenisHewan: string): 'Sapi' | 'Sapi 1/7' | 'Domba' => {
    const cleaned = String(jenisHewan || '').trim();
    const lowerCase = cleaned.toLowerCase();
    
    if (lowerCase.includes('sapi 1/7') || lowerCase.includes('sapi1/7')) {
      return 'Sapi 1/7';
    } else if (lowerCase.includes('sapi')) {
      return 'Sapi';
    } else if (lowerCase.includes('domba') || lowerCase.includes('kambing')) {
      return 'Domba';
    }
    
    // Default to Sapi if unknown
    console.warn(`⚠️ Unknown jenis_hewan: ${jenisHewan}, defaulting to Sapi`);
    return 'Sapi';
  };

  // Clean string data to prevent query issues
  const cleanString = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    
    const str = String(value).trim();
    if (str === '' || str === 'null' || str === 'undefined') return null;
    
    // Remove any special characters that might cause query issues
    return str.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  };

  // Process single file upload
  const processUpload = async (upload: UploadFile) => {
    if (!uploader || !upload.type) {
      updateUploadStatus(upload.id, 'error', 'Invalid file type or uploader');
      return;
    }
    
    updateUploadStatus(upload.id, 'uploading', undefined, 10);

    try {
      console.log(`📁 Processing file: ${upload.file.name} (${upload.file.size} bytes)`);
      
      let records: any[] = [];
      
      // Check file extension to determine parsing method
      const fileExtension = upload.file.name.toLowerCase().split('.').pop();
      
      if (fileExtension === 'xlsx') {
        console.log('📊 Parsing Excel file...');
        records = await parseExcel(upload.file);
      } else if (fileExtension === 'csv') {
        console.log('📝 Parsing CSV file...');
        // Read file as text for CSV
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read CSV file'));
          reader.readAsText(upload.file);
        });
        
        // First attempt with advanced CSV parser
        records = parseCSV(text);
        
        // If we get very few records compared to the total lines, try alternative approach
        const totalLines = text.split('\n').filter(line => line.trim() !== '').length - 1; // minus header
        const successRate = records.length / totalLines;
        
        if (successRate < 0.7 && totalLines > 10) {
          console.log(`⚠️ Low success rate (${(successRate * 100).toFixed(1)}%). Trying alternative CSV parsing...`);
          
          // Alternative approach: try to guess the correct number of columns and split more intelligently
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const headers = parseCSVLine(lines[0]);
          const expectedColumns = headers.length;
          
          console.log(`📊 Expected ${expectedColumns} columns. Attempting intelligent split...`);
          
          const alternativeRecords: any[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Try to split intelligently - if we get too many fields, try to merge some
            let fields = parseCSVLine(line);
            
            // If we have more fields than expected, try to merge excess fields into the last field (usually alamat)
            if (fields.length > expectedColumns) {
              const excess = fields.length - expectedColumns;
              console.log(`🔧 Row ${i + 1}: Merging ${excess} excess fields`);
              
              // Merge excess fields into the alamat field (usually the last text field before numbers)
              const mergedFields = fields.slice(0, expectedColumns - 1);
              const excessFields = fields.slice(expectedColumns - 1);
              mergedFields.push(excessFields.join(', '));
              fields = mergedFields;
            }
            
            // Create record
            const record: any = {};
            headers.forEach((header, index) => {
              const value = index < fields.length ? fields[index] : null;
              record[header] = value !== null && value !== undefined && value !== '' ? value : null;
            });
            
            if (record.nama_muzakki && record.nama_muzakki.trim() !== '') {
              alternativeRecords.push(record);
              console.log(`✅ Alternative parsing row ${i + 1}: ${record.nama_muzakki}`);
            } else if (record.nama_penerima && record.nama_penerima.trim() !== '') {
              alternativeRecords.push(record);
              console.log(`✅ Alternative parsing row ${i + 1}: ${record.nama_penerima}`);
            }
          }
          
          console.log(`📊 Alternative parsing result: ${alternativeRecords.length} records vs ${records.length} from standard parsing`);
          
          // Use alternative result if it's significantly better
          if (alternativeRecords.length > records.length * 1.5) {
            console.log('✅ Using alternative parsing results');
            records = alternativeRecords;
          }
        }
      } else {
        throw new Error('Unsupported file format. Please use .csv or .xlsx files.');
      }

      updateUploadStatus(upload.id, 'uploading', undefined, 30);

      console.log(`📊 Parsed ${records.length} records from ${upload.file.name}`);

      if (records.length === 0) {
        updateUploadStatus(upload.id, 'error', 'No valid records found in file. Please check the file format and content.');
        return;
      }

      updateUploadStatus(upload.id, 'uploading', undefined, 50);

      // Prepare data for database
      let result: { success: number; duplicates: number; errors: any[] };
      
      if (upload.type === 'muzakki') {
        console.log('🎯 Processing muzakki records...');
        const muzakkiRecords: Muzakki[] = records.map((record, index) => {
          // Validate required fields
          if (!record.nama_muzakki || record.nama_muzakki.trim() === '') {
            console.warn(`⚠️ Row ${index + 2}: Missing nama_muzakki`);
          }
          
          return {
            uploader_id: uploader.id,
            nama_muzakki: cleanString(record.nama_muzakki) || '',
            email: cleanString(record.email),
            telepon: cleanString(record.telepon),
            alamat: cleanString(record.alamat),
            provinsi: cleanString(record.provinsi),
            kabupaten: cleanString(record.kabupaten),
            jenis_hewan: validateJenisHewan(record.jenis_hewan),
            jumlah_hewan: parseInt(record.jumlah_hewan) || 1,
            nilai_qurban: parseFloat(record.nilai_qurban) || 0,
            tanggal_penyerahan: convertExcelDate(record.tanggal_penyerahan)
          };
        });

        console.log(`📊 Prepared ${muzakkiRecords.length} muzakki records for database insertion`);
        updateUploadStatus(upload.id, 'uploading', undefined, 70);
        result = await saveMuzakkiData(muzakkiRecords);
      } else {
        console.log('🎯 Processing distribusi records...');
        const distribusiRecords: Distribusi[] = records.map((record, index) => {
          // Validate required fields
          if (!record.nama_penerima || record.nama_penerima.trim() === '') {
            console.warn(`⚠️ Row ${index + 2}: Missing nama_penerima`);
          }
          
          // Clean and validate data
          const cleanRecord = {
            uploader_id: uploader.id,
            nama_penerima: cleanString(record.nama_penerima) || '',
            alamat_penerima: cleanString(record.alamat_penerima) || '',
            provinsi: cleanString(record.provinsi),
            kabupaten: cleanString(record.kabupaten),
            jenis_hewan: validateJenisHewan(record.jenis_hewan),
            jumlah_daging: record.jumlah_daging ? parseFloat(String(record.jumlah_daging)) : null,
            tanggal_distribusi: convertExcelDate(record.tanggal_distribusi) || new Date().toISOString().split('T')[0],
            foto_distribusi_url: cleanString(record.foto_distribusi_url),
            status: cleanString(record.status) || 'Selesai',
            catatan: cleanString(record.catatan)
          };
          
          // Log problematic records
          if (!cleanRecord.nama_penerima || !cleanRecord.alamat_penerima) {
            console.error(`❌ Row ${index + 2}: Invalid record`, cleanRecord);
          }
          
          console.log(`🔧 Cleaned record ${index + 2}:`, {
            nama: cleanRecord.nama_penerima,
            alamat: cleanRecord.alamat_penerima?.substring(0, 30) + '...',
            tanggal: cleanRecord.tanggal_distribusi,
            jenis_hewan: cleanRecord.jenis_hewan
          });
          
          return cleanRecord;
        }).filter(record => record.nama_penerima && record.alamat_penerima); // Filter out invalid records

        console.log(`📊 Prepared ${distribusiRecords.length} valid distribusi records for database insertion`);
        console.log('🔍 Sample record:', distribusiRecords[0]);
        updateUploadStatus(upload.id, 'uploading', undefined, 70);
        result = await saveDistribusiData(distribusiRecords);
      }

      updateUploadStatus(upload.id, 'uploading', undefined, 90);

      console.log(`💾 Database operation complete: ${result.success} success, ${result.duplicates} duplicates, ${result.errors.length} errors`);

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
      
      console.log(`✅ Upload complete for ${upload.file.name}: ${result.success}/${records.length} records processed`);
      
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
            <h3 className="font-semibold text-blue-900">Format File CSV & Excel</h3>
              </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
              <h4 className="font-medium text-blue-900 mb-2">📊 Data Muzakki (Penyumbang)</h4>
              <p className="text-blue-700 mb-2">Nama file harus mengandung kata "muzakki"</p>
              <p className="text-blue-700 mb-2">Format: .csv atau .xlsx (Excel)</p>
              <p className="text-blue-700">Kolom: nama_muzakki, email, telepon, alamat, provinsi, kabupaten, jenis_hewan, jumlah_hewan, nilai_qurban, tanggal_penyerahan</p>
                </div>
                <div>
              <h4 className="font-medium text-blue-900 mb-2">📦 Data Distribusi (Penerima)</h4>
              <p className="text-blue-700 mb-2">Nama file harus mengandung kata "distribusi"</p>
              <p className="text-blue-700 mb-2">Format: .csv atau .xlsx (Excel)</p>
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
              File CSV/Excel maksimal 10MB. Mendukung format .csv dan .xlsx
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
                  
                  {/* Upload Result */}
                  {upload.result && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Upload Berhasil</span>
                        <span className="text-green-600 font-bold">
                          {upload.result.success} dari {upload.result.total} record
                        </span>
                      </div>
                      
                      {upload.result.success > 0 && (
                        <div className="flex items-center text-green-600 mb-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>{upload.result.success} record berhasil disimpan</span>
                        </div>
                      )}
                      
                      {upload.result.duplicates > 0 && (
                        <div className="flex items-center text-orange-600 mb-1">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>{upload.result.duplicates} record duplikat dilewati</span>
                        </div>
                      )}
                      
                      {upload.result.errors.length > 0 && (
                        <div className="flex items-center text-red-600 mb-1">
                          <X className="w-4 h-4 mr-2" />
                          <span>{upload.result.errors.length} record gagal diproses</span>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        File: {upload.file.name} ({(upload.file.size / 1024).toFixed(1)} KB)
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
                <li>• Jenis hewan: Sapi, Sapi 1/7, atau Domba</li>
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