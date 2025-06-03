import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, FileSpreadsheet, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { DuplicateReviewModal } from '../../components/DuplicateReviewModal';
import { UploadProcessor, DuplicateDetectionConfig, ProcessedUploadResult } from '../../utils/duplicateHandler';

interface FileUpload {
  id: string;
  file: File;
  type: 'muzakki' | 'distribusi' | null;
  progress: number;
  status: 'pending' | 'uploading' | 'detecting_duplicates' | 'reviewing_duplicates' | 'processing' | 'completed' | 'error';
  error?: string;
  result?: ProcessedUploadResult;
}

const Upload = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploader, setUploader] = useState<any>(null);
  const [uploadFiles, setUploadFiles] = useState<FileUpload[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Duplicate handling states
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<FileUpload | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<ProcessedUploadResult | null>(null);

  const handleLogin = async (uploadKey: string) => {
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      // Demo mode for testing - only for actual demo keys
      const demoKeys = ['demo', 'test'];
      const isDemoMode = demoKeys.some(key => uploadKey.toLowerCase().startsWith(key.toLowerCase()));
      
      if (isDemoMode) {
        // Demo authentication - create mock uploader
        const demoUploader = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'demo@mtt.org',
          name: 'Demo User',
          mitra_name: 'Demo Mitra',
          upload_key: uploadKey,
          is_active: true
        };
        
        setIsAuthenticated(true);
        setUploader(demoUploader);
        console.log('✅ Demo mode authenticated as:', demoUploader.name, '(' + demoUploader.mitra_name + ')');
        return;
      }
      
      // Try real authentication for all non-demo keys
      try {
        const { supabaseAdmin, TABLES } = await import('../../lib/supabase');
        
        // Test connection first
        const connectionTest = await supabaseAdmin
          .from('uploaders')
          .select('id')
          .limit(1);
          
        if (connectionTest.error) {
          console.warn('⚠️ Supabase connection failed:', connectionTest.error);
          throw new Error('Connection failed');
        }
        
        console.log('🔧 Supabase connection successful, attempting authentication...');
        
        // Query the uploaders table for the provided upload key
        const { data: uploaderData, error } = await supabaseAdmin
          .from(TABLES.UPLOADERS)
          .select('*')
          .eq('upload_key', uploadKey.trim())
          .eq('is_active', true)
          .single();
        
        if (error || !uploaderData) {
          console.error('Authentication failed:', error);
          setLoginError('Kode akses tidak valid atau tidak aktif. Hubungi admin untuk bantuan.');
          return;
        }
        
        // Successful authentication
        setIsAuthenticated(true);
        setUploader(uploaderData);
        console.log('✅ Authenticated as:', uploaderData.name, '(' + uploaderData.mitra_name + ')');
        
      } catch (dbError) {
        console.error('Database authentication failed:', dbError);
        setLoginError('Koneksi database gagal. Pastikan koneksi internet stabil dan coba lagi.');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUploader(null);
    setUploadFiles([]);
    setLoginError('');
  };

  // File detection logic
  const detectFileType = (filename: string): 'muzakki' | 'distribusi' | null => {
    const normalizedName = filename.toLowerCase();
    if (normalizedName.includes('muzakki')) return 'muzakki';
    if (normalizedName.includes('distribusi')) return 'distribusi';
    return null;
  };

  // File upload handlers
  const handleFilesDrop = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return extension === 'csv' || extension === 'xlsx';
    });

    const newUploads: FileUpload[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: detectFileType(file.name),
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newUploads]);
  }, []);

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
    handleFilesDrop(e.dataTransfer.files);
  }, [handleFilesDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesDrop(e.target.files);
    }
  }, [handleFilesDrop]);

  // Upload processing with duplicate detection
  const processUpload = async (upload: FileUpload) => {
    if (!upload.type) {
      updateUploadStatus(upload.id, 'error', 'Cannot determine file type from filename');
      return;
    }

    try {
      // Step 1: Parse file data
      updateUploadStatus(upload.id, 'uploading', undefined, 25);
      const fileData = await parseFileData(upload.file);
      
      // Step 2: Fetch existing data from database
      updateUploadStatus(upload.id, 'uploading', undefined, 50);
      const existingData = await fetchExistingData(upload.type);
      
      // Step 3: Detect duplicates
      updateUploadStatus(upload.id, 'detecting_duplicates', undefined, 75);
      const processor = new UploadProcessor();
      const config: DuplicateDetectionConfig = {
        strictMode: false, // Enable fuzzy matching
        action: 'prompt', // Always prompt for user decision
        tolerance: 0.8
      };

      let result: ProcessedUploadResult;
      if (upload.type === 'muzakki') {
        result = await processor.processMuzakkiUpload(fileData, existingData, config);
      } else {
        result = await processor.processDistribusiUpload(fileData, existingData, config);
      }

      // Step 4: Check if duplicates found
      const totalDuplicates = result.duplicates.exact.length + 
                             result.duplicates.fuzzy.length + 
                             result.duplicates.partial.length;

      if (totalDuplicates > 0) {
        // Show duplicate review modal
        setCurrentProcessingFile(upload);
        setDuplicateResult(result);
        updateUploadStatus(upload.id, 'reviewing_duplicates', undefined, 100);
        setShowDuplicateModal(true);
      } else {
        // No duplicates, proceed directly
        await finalizeUpload(upload, result);
      }

    } catch (error) {
      updateUploadStatus(upload.id, 'error', error instanceof Error ? error.message : 'Upload failed');
    }
  };

  // Handle duplicate review completion
  const handleDuplicateReviewComplete = async (finalConfig: DuplicateDetectionConfig) => {
    if (!currentProcessingFile || !duplicateResult) return;

    try {
      setShowDuplicateModal(false);
      updateUploadStatus(currentProcessingFile.id, 'processing');

      // Reprocess with final configuration
      const processor = new UploadProcessor();
      const existingData = await fetchExistingData(currentProcessingFile.type!);
      const fileData = await parseFileData(currentProcessingFile.file);

      let finalResult: ProcessedUploadResult;
      if (currentProcessingFile.type === 'muzakki') {
        finalResult = await processor.processMuzakkiUpload(fileData, existingData, finalConfig);
      } else {
        finalResult = await processor.processDistribusiUpload(fileData, existingData, finalConfig);
      }

      await finalizeUpload(currentProcessingFile, finalResult);
      
      setCurrentProcessingFile(null);
      setDuplicateResult(null);
    } catch (error) {
      updateUploadStatus(
        currentProcessingFile.id, 
        'error', 
        error instanceof Error ? error.message : 'Failed to process duplicates'
      );
    }
  };

  // Finalize upload to database
  const finalizeUpload = async (upload: FileUpload, result: ProcessedUploadResult) => {
    try {
      // Save processed data to database
      await saveToDatabase(upload.type!, result.newRecords);
      
      // Save upload history
      await saveUploadHistory(upload, result);
      
      updateUploadStatus(upload.id, 'completed', undefined, 100, result);
    } catch (error) {
      updateUploadStatus(upload.id, 'error', error instanceof Error ? error.message : 'Failed to save to database');
    }
  };

  // Helper functions
  const updateUploadStatus = (
    id: string, 
    status: FileUpload['status'], 
    error?: string, 
    progress?: number,
    result?: ProcessedUploadResult
  ) => {
    setUploadFiles(prev => prev.map(upload => 
      upload.id === id 
        ? { ...upload, status, error, progress: progress ?? upload.progress, result }
        : upload
    ));
  };

  const removeUpload = (id: string) => {
    setUploadFiles(prev => prev.filter(upload => upload.id !== id));
  };

  // Mock functions (to be replaced with real implementations)
  const parseFileData = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length < 2) {
            resolve([]);
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const records: any[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length === headers.length) {
              const record: any = {};
              headers.forEach((header, index) => {
                record[header] = values[index];
              });
              records.push(record);
            }
          }
          
          console.log(`Parsed ${records.length} records from ${file.name}`);
          resolve(records);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          reject(new Error('Failed to parse CSV file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const fetchExistingData = async (type: 'muzakki' | 'distribusi'): Promise<any[]> => {
    try {
      // Check if we're in actual demo mode (Demo Mitra)
      if (uploader?.mitra_name === 'Demo Mitra') {
        console.log('🎭 Demo mode: Returning empty existing data...');
        return [];
      }

      // Real database operations for authenticated users
      const { supabaseAdmin, TABLES } = await import('../../lib/supabase');
      
      if (type === 'muzakki') {
        const { data, error } = await supabaseAdmin
          .from(TABLES.MUZAKKI)
          .select('*');
        
        if (error) {
          console.error('Error fetching muzakki data:', error);
          throw new Error(`Failed to fetch muzakki data: ${error.message}`);
        }
        
        console.log(`✅ Fetched ${data?.length || 0} existing muzakki records`);
        return data || [];
      } else {
        const { data, error } = await supabaseAdmin
          .from(TABLES.DISTRIBUSI)
          .select('*');
        
        if (error) {
          console.error('Error fetching distribusi data:', error);
          throw new Error(`Failed to fetch distribusi data: ${error.message}`);
        }
        
        console.log(`✅ Fetched ${data?.length || 0} existing distribusi records`);
        return data || [];
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  };

  const saveToDatabase = async (type: string, records: any[]): Promise<void> => {
    try {
      if (records.length === 0) {
        console.log('No records to save');
        return;
      }

      // Check if we're in actual demo mode (Demo Mitra)
      if (uploader?.mitra_name === 'Demo Mitra') {
        console.log('🎭 Demo mode: Simulating database save...');
        console.log(`📊 Would save ${records.length} ${type} records to database`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Demo: Database save completed successfully');
        return;
      }

      // Real database operations for authenticated users
      const { supabaseAdmin, TABLES } = await import('../../lib/supabase');
      
      // Step 1: Normalize location data to handle variations
      console.log(`🔧 Normalizing ${records.length} ${type} records...`);
      const normalizedRecords = normalizeLocationData(records);
      
      // Step 2: Ensure reference data exists
      console.log('🔧 Ensuring reference data exists...');
      await ensureReferenceData(normalizedRecords);
      
      // Step 3: Add uploader_id to all records
      const recordsWithUploader = normalizedRecords.map(record => ({
        ...record,
        uploader_id: uploader?.id
      }));
      
      // Step 4: Save to appropriate table
      console.log(`💾 Saving ${recordsWithUploader.length} ${type} records to database...`);
      
      if (type === 'muzakki') {
        const { error } = await supabaseAdmin
          .from(TABLES.MUZAKKI)
          .insert(recordsWithUploader);
        
        if (error) {
          console.error('Error saving muzakki data:', error);
          throw new Error(`Failed to save muzakki data: ${error.message}`);
        }
      } else if (type === 'distribusi') {
        const { error } = await supabaseAdmin
          .from(TABLES.DISTRIBUSI)
          .insert(recordsWithUploader);
        
        if (error) {
          console.error('Error saving distribusi data:', error);
          throw new Error(`Failed to save distribusi data: ${error.message}`);
        }
      }
      
      console.log(`✅ Successfully saved ${recordsWithUploader.length} ${type} records to database`);
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  };

  // Enhanced function to ensure reference data exists with proper error handling
  const ensureReferenceData = async (records: any[]): Promise<void> => {
    try {
      const { supabaseAdmin, TABLES } = await import('../../lib/supabase');
      
      // Extract unique province and kabupaten codes from records (filter out empty values)
      const uniqueProvinsi = [...new Set(records.map(r => r.kode_provinsi).filter(Boolean))];
      const uniqueKabupaten = [...new Set(records.map(r => r.kode_kabupaten).filter(Boolean))];
      
      if (uniqueProvinsi.length === 0 && uniqueKabupaten.length === 0) {
        console.log('No reference data codes found in records');
        return;
      }
      
      // Handle provinces with proper error handling
      if (uniqueProvinsi.length > 0) {
        try {
          // Check existing provinces
          const { data: existingProvinsi } = await supabaseAdmin
            .from(TABLES.REF_PROVINSI)
            .select('kode_provinsi')
            .in('kode_provinsi', uniqueProvinsi);
          
          const existingProvinsiCodes = new Set(existingProvinsi?.map(p => p.kode_provinsi) || []);
          const missingProvinsi = uniqueProvinsi.filter(code => !existingProvinsiCodes.has(code));
          
          // Insert missing provinces one by one to handle conflicts gracefully
          for (const code of missingProvinsi) {
            try {
              const provinsiData = {
                kode_provinsi: code,
                nama_provinsi: getProvinsiName(code) || `Provinsi ${code}`
              };
              
              const { error: provinsiError } = await supabaseAdmin
                .from(TABLES.REF_PROVINSI)
                .insert([provinsiData]);
              
              if (provinsiError) {
                // If it's a duplicate key error, it means someone else inserted it, which is fine
                if (provinsiError.code === '23505') {
                  console.log(`✅ Provinsi ${code} already exists (concurrent insert)`);
                } else {
                  console.error(`Error inserting provinsi ${code}:`, provinsiError);
                }
              } else {
                console.log(`✅ Inserted provinsi: ${code} - ${getProvinsiName(code)}`);
              }
            } catch (insertError) {
              console.warn(`Failed to insert provinsi ${code}:`, insertError);
            }
          }
        } catch (error) {
          console.error('Error handling provinces:', error);
        }
      }
      
      // Handle kabupaten with proper error handling
      if (uniqueKabupaten.length > 0) {
        try {
          // Check existing kabupaten
          const { data: existingKabupaten } = await supabaseAdmin
            .from(TABLES.REF_KABUPATEN)
            .select('kode_kabupaten')
            .in('kode_kabupaten', uniqueKabupaten);
          
          const existingKabupatenCodes = new Set(existingKabupaten?.map(k => k.kode_kabupaten) || []);
          const missingKabupaten = uniqueKabupaten.filter(code => !existingKabupatenCodes.has(code));
          
          // Insert missing kabupaten one by one to handle conflicts gracefully
          for (const code of missingKabupaten) {
            try {
              const provinsiCode = records.find(r => r.kode_kabupaten === code)?.kode_provinsi;
              const kabupatenData = {
                kode_kabupaten: code,
                nama_kabupaten: getKabupatenName(code) || `Kabupaten ${code}`,
                kode_provinsi: provinsiCode || uniqueProvinsi[0] || '35'
              };
              
              const { error: kabupatenError } = await supabaseAdmin
                .from(TABLES.REF_KABUPATEN)
                .insert([kabupatenData]);
              
              if (kabupatenError) {
                // If it's a duplicate key error, it means someone else inserted it, which is fine
                if (kabupatenError.code === '23505') {
                  console.log(`✅ Kabupaten ${code} already exists (concurrent insert)`);
                } else {
                  console.error(`Error inserting kabupaten ${code}:`, kabupatenError);
                }
              } else {
                console.log(`✅ Inserted kabupaten: ${code} - ${getKabupatenName(code)}`);
              }
            } catch (insertError) {
              console.warn(`Failed to insert kabupaten ${code}:`, insertError);
            }
          }
        } catch (error) {
          console.error('Error handling kabupaten:', error);
        }
      }
      
      console.log('✅ Reference data validation completed');
      
    } catch (error) {
      console.error('Error ensuring reference data:', error);
      // Don't throw here, let the main insert continue
    }
  };

  // Enhanced function to normalize and validate location data
  const normalizeLocationData = (records: any[]): any[] => {
    return records.map(record => {
      const normalized = { ...record };
      
      // Normalize province name variations
      if (normalized.nama_provinsi) {
        const provinsi = normalized.nama_provinsi.toLowerCase().trim();
        
        if (provinsi.includes('jakarta') || provinsi.includes('dki')) {
          normalized.kode_provinsi = '31';
          normalized.nama_provinsi = 'DKI Jakarta';
        } else if (provinsi.includes('jawa timur') || provinsi.includes('jatim')) {
          normalized.kode_provinsi = '35';
          normalized.nama_provinsi = 'Jawa Timur';
        } else if (provinsi.includes('jawa barat') || provinsi.includes('jabar')) {
          normalized.kode_provinsi = '32';
          normalized.nama_provinsi = 'Jawa Barat';
        } else if (provinsi.includes('jawa tengah') || provinsi.includes('jateng')) {
          normalized.kode_provinsi = '33';
          normalized.nama_provinsi = 'Jawa Tengah';
        } else if (provinsi.includes('yogyakarta') || provinsi.includes('jogja')) {
          normalized.kode_provinsi = '34';
          normalized.nama_provinsi = 'DI Yogyakarta';
        }
      }
      
      // Normalize kabupaten/kota name variations
      if (normalized.nama_kabupaten || normalized.alamat) {
        const location = (normalized.nama_kabupaten || normalized.alamat || '').toLowerCase().trim();
        
        // Jakarta variations
        if (location.includes('jakarta selatan') || location.includes('jaksel')) {
          normalized.kode_kabupaten = '3171';
          normalized.nama_kabupaten = 'Jakarta Selatan';
          normalized.kode_provinsi = '31';
        } else if (location.includes('jakarta timur') || location.includes('jaktim')) {
          normalized.kode_kabupaten = '3172';
          normalized.nama_kabupaten = 'Jakarta Timur';
          normalized.kode_provinsi = '31';
        } else if (location.includes('jakarta pusat') || location.includes('jakpus')) {
          normalized.kode_kabupaten = '3173';
          normalized.nama_kabupaten = 'Jakarta Pusat';
          normalized.kode_provinsi = '31';
        } else if (location.includes('jakarta barat') || location.includes('jakbar')) {
          normalized.kode_kabupaten = '3174';
          normalized.nama_kabupaten = 'Jakarta Barat';
          normalized.kode_provinsi = '31';
        } else if (location.includes('jakarta utara') || location.includes('jakut')) {
          normalized.kode_kabupaten = '3175';
          normalized.nama_kabupaten = 'Jakarta Utara';
          normalized.kode_provinsi = '31';
        
        // Jawa Timur variations
        } else if (location.includes('surabaya') || location.includes('sby')) {
          normalized.kode_kabupaten = '3578';
          normalized.nama_kabupaten = 'Kota Surabaya';
          normalized.kode_provinsi = '35';
        } else if (location.includes('gresik')) {
          normalized.kode_kabupaten = '3525';
          normalized.nama_kabupaten = 'Kabupaten Gresik';
          normalized.kode_provinsi = '35';
        } else if (location.includes('sidoarjo')) {
          normalized.kode_kabupaten = '3515';
          normalized.nama_kabupaten = 'Kabupaten Sidoarjo';
          normalized.kode_provinsi = '35';
        } else if (location.includes('malang') && (location.includes('kota') || location.includes('kab'))) {
          if (location.includes('kota')) {
            normalized.kode_kabupaten = '3573';
            normalized.nama_kabupaten = 'Kota Malang';
          } else {
            normalized.kode_kabupaten = '3507';
            normalized.nama_kabupaten = 'Kabupaten Malang';
          }
          normalized.kode_provinsi = '35';
        
        // Jawa Barat variations
        } else if (location.includes('bogor')) {
          if (location.includes('kota')) {
            normalized.kode_kabupaten = '3271';
            normalized.nama_kabupaten = 'Kota Bogor';
          } else {
            normalized.kode_kabupaten = '3201';
            normalized.nama_kabupaten = 'Kabupaten Bogor';
          }
          normalized.kode_provinsi = '32';
        } else if (location.includes('bandung')) {
          if (location.includes('kota')) {
            normalized.kode_kabupaten = '3273';
            normalized.nama_kabupaten = 'Kota Bandung';
          } else if (location.includes('barat')) {
            normalized.kode_kabupaten = '3217';
            normalized.nama_kabupaten = 'Kabupaten Bandung Barat';
          } else {
            normalized.kode_kabupaten = '3204';
            normalized.nama_kabupaten = 'Kabupaten Bandung';
          }
          normalized.kode_provinsi = '32';
        } else if (location.includes('depok')) {
          normalized.kode_kabupaten = '3276';
          normalized.nama_kabupaten = 'Kota Depok';
          normalized.kode_provinsi = '32';
        } else if (location.includes('bekasi')) {
          if (location.includes('kota')) {
            normalized.kode_kabupaten = '3275';
            normalized.nama_kabupaten = 'Kota Bekasi';
          } else {
            normalized.kode_kabupaten = '3216';
            normalized.nama_kabupaten = 'Kabupaten Bekasi';
          }
          normalized.kode_provinsi = '32';
        
        // Jawa Tengah variations
        } else if (location.includes('semarang')) {
          if (location.includes('kota')) {
            normalized.kode_kabupaten = '3374';
            normalized.nama_kabupaten = 'Kota Semarang';
          } else {
            normalized.kode_kabupaten = '3304';
            normalized.nama_kabupaten = 'Kabupaten Semarang';
          }
          normalized.kode_provinsi = '33';
        } else if (location.includes('solo') || location.includes('surakarta')) {
          normalized.kode_kabupaten = '3372';
          normalized.nama_kabupaten = 'Kota Surakarta';
          normalized.kode_provinsi = '33';
        
        // Yogyakarta variations
        } else if (location.includes('yogyakarta') || location.includes('jogja') || location.includes('yogya')) {
          if (location.includes('kota') || !location.includes('kabupaten')) {
            normalized.kode_kabupaten = '3471';
            normalized.nama_kabupaten = 'Kota Yogyakarta';
          }
          normalized.kode_provinsi = '34';
        } else if (location.includes('bantul')) {
          normalized.kode_kabupaten = '3402';
          normalized.nama_kabupaten = 'Kabupaten Bantul';
          normalized.kode_provinsi = '34';
        } else if (location.includes('sleman')) {
          normalized.kode_kabupaten = '3404';
          normalized.nama_kabupaten = 'Kabupaten Sleman';
          normalized.kode_provinsi = '34';
        }
      }
      
      return normalized;
    });
  };

  // Helper functions to get proper names
  const getProvinsiName = (code: string): string | null => {
    const provinsiMap: Record<string, string> = {
      '35': 'Jawa Timur',
      '31': 'DKI Jakarta',
      '32': 'Jawa Barat',
      '33': 'Jawa Tengah',
      '34': 'DI Yogyakarta',
      '36': 'Banten',
      '12': 'Sumatra Utara',
      '13': 'Sumatra Barat',
      '14': 'Riau',
      '15': 'Jambi',
      '16': 'Sumatra Selatan',
      '17': 'Bengkulu',
      '18': 'Lampung',
      '19': 'Kepulauan Bangka Belitung',
      '21': 'Kepulauan Riau',
      '51': 'Bali',
      '52': 'Nusa Tenggara Barat',
      '53': 'Nusa Tenggara Timur',
      '61': 'Kalimantan Barat',
      '62': 'Kalimantan Tengah',
      '63': 'Kalimantan Selatan',
      '64': 'Kalimantan Timur',
      '65': 'Kalimantan Utara',
      '71': 'Sulawesi Utara',
      '72': 'Sulawesi Tengah',
      '73': 'Sulawesi Selatan',
      '74': 'Sulawesi Tenggara',
      '75': 'Gorontalo',
      '76': 'Sulawesi Barat',
      '81': 'Maluku',
      '82': 'Maluku Utara',
      '91': 'Papua Barat',
      '94': 'Papua'
    };
    return provinsiMap[code] || null;
  };

  const getKabupatenName = (code: string): string | null => {
    const kabupatenMap: Record<string, string> = {
      // Jawa Timur
      '3578': 'Kota Surabaya',
      '3525': 'Kabupaten Gresik',
      '3515': 'Kabupaten Sidoarjo',
      '3573': 'Kota Malang',
      '3507': 'Kabupaten Malang',
      '3576': 'Kota Mojokerto',
      '3517': 'Kabupaten Mojokerto',
      
      // DKI Jakarta
      '3171': 'Jakarta Selatan',
      '3172': 'Jakarta Timur',
      '3173': 'Jakarta Pusat',
      '3174': 'Jakarta Barat',
      '3175': 'Jakarta Utara',
      '3101': 'Kepulauan Seribu',
      
      // Jawa Barat
      '3201': 'Kabupaten Bogor',
      '3271': 'Kota Bogor',
      '3273': 'Kota Bandung',
      '3204': 'Kabupaten Bandung',
      '3217': 'Kabupaten Bandung Barat',
      '3276': 'Kota Depok',
      '3275': 'Kota Bekasi',
      '3216': 'Kabupaten Bekasi',
      
      // Jawa Tengah
      '3304': 'Kabupaten Semarang',
      '3374': 'Kota Semarang',
      '3372': 'Kota Surakarta',
      '3313': 'Kabupaten Sukoharjo',
      
      // DI Yogyakarta
      '3471': 'Kota Yogyakarta',
      '3401': 'Kabupaten Kulon Progo',
      '3402': 'Kabupaten Bantul',
      '3403': 'Kabupaten Gunung Kidul',
      '3404': 'Kabupaten Sleman'
    };
    return kabupatenMap[code] || null;
  };

  const saveUploadHistory = async (upload: FileUpload, result: ProcessedUploadResult): Promise<void> => {
    try {
      // Check if we're in actual demo mode (Demo Mitra)
      if (uploader?.mitra_name === 'Demo Mitra') {
        console.log('🎭 Demo mode: Simulating upload history save...');
        console.log(`📊 Would save upload history for ${upload.file.name}`);
        return;
      }

      // Real database operations for authenticated users
      const { supabaseAdmin, TABLES } = await import('../../lib/supabase');
      
      const uploadHistory = {
        uploader_id: uploader?.id,
        filename: upload.file.name,
        file_type: upload.type!,
        total_records: result.totalRecords,
        successful_records: result.newRecords.length,
        failed_records: result.errors.length,
        file_size_bytes: upload.file.size,
        processing_time_ms: Date.now() - new Date().getTime(), // Approximate
        error_details: result.errors.length > 0 ? { errors: result.errors } : null,
        upload_status: 'completed',
        completed_at: new Date().toISOString()
      };
      
      const { error } = await supabaseAdmin
        .from(TABLES.UPLOAD_HISTORY)
        .insert([uploadHistory]);
      
      if (error) {
        console.error('Error saving upload history:', error);
        throw new Error(`Failed to save upload history: ${error.message}`);
      } else {
        console.log('✅ Upload history saved successfully');
      }
    } catch (error) {
      console.error('Error saving upload history:', error);
      // Don't throw error here as the main upload was successful
    }
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'pending':
        return <FileSpreadsheet className="w-4 h-4 text-gray-400" />;
      case 'uploading':
      case 'detecting_duplicates':
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'reviewing_duplicates':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: FileUpload['status']) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'uploading': return 'Mengupload...';
      case 'detecting_duplicates': return 'Mendeteksi duplikat...';
      case 'reviewing_duplicates': return 'Menunggu review duplikat';
      case 'processing': return 'Memproses...';
      case 'completed': return 'Selesai';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
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
                    Kode Akses Mitra
                  </label>
                  <input
                    type="password"
                    name="uploadKey"
                    placeholder="Masukkan kode akses mitra Anda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
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
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Hanya mitra resmi yang dapat mengakses:</p>
                      <ul className="text-xs space-y-1">
                        <li>• BMM (Badan Musyawarah Masjid)</li>
                        <li>• LAZIS Muhammadiyah</li>
                        <li>• LAZIS Nahdlatul Ulama</li>
                        <li>• BAZNAS Pusat</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
              Upload file CSV/Excel untuk data muzakki dan distribusi qurban dengan deteksi duplikat otomatis
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Format File CSV/Excel</h3>
                <p className="text-blue-700 text-sm">
                  Sistem akan mendeteksi duplikat otomatis dan memberikan opsi penanganan
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
                  <h4 className="font-semibold text-blue-900 mb-2">✅ Data Muzakki</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Format: {uploader?.mitra_name}_LOKASI_MUZAKKI_YYYYMMDD_HHMM.csv</li>
                    <li>• Duplikat: nama + jenis_hewan + nilai_qurban</li>
                    <li>• Fuzzy: kemiripan nama ≥80%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">✅ Data Distribusi</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Format: {uploader?.mitra_name}_LOKASI_DISTRIBUSI_YYYYMMDD_HHMM.csv</li>
                    <li>• Duplikat: nama_penerima + alamat + tanggal</li>
                    <li>• Fuzzy: kemiripan alamat ≥80%</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <UploadIcon className="w-5 h-5 mr-2 text-purple-500" />
            Upload File CSV/Excel
          </h2>
          
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Seret file CSV/Excel ke sini
            </h3>
            <p className="text-gray-600 mb-4">
              atau klik untuk memilih file dari komputer Anda
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".csv,.xlsx"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
                Pilih File
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Maksimal 5 file, ukuran per file maksimal 10MB (CSV/XLSX)
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
                          {upload.type ? `Type: ${upload.type}` : 'Type: Unknown'} • {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{getStatusText(upload.status)}</span>
                      {upload.status === 'pending' && (
                        <button
                          onClick={() => processUpload(upload)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Upload
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
                  {upload.progress > 0 && upload.status !== 'completed' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                        📊 {upload.result.stats.newAdded} record baru, 
                        🚫 {upload.result.stats.duplicatesSkipped} duplikat dilewati,
                        🔀 {upload.result.stats.duplicatesMerged} record digabung
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
                  uploadFiles
                    .filter(u => u.status === 'pending')
                    .forEach(u => processUpload(u));
                }}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                disabled={!uploadFiles.some(u => u.status === 'pending')}
              >
                Upload All Pending ({uploadFiles.filter(u => u.status === 'pending').length})
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Butuh Bantuan?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Template CSV/Excel</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download template yang sudah sesuai format sistem
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Download Template
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Panduan Duplikat</h3>
              <p className="text-sm text-gray-600 mb-3">
                Cara menangani duplikat data saat upload
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

      {/* Duplicate Review Modal */}
      {showDuplicateModal && duplicateResult && currentProcessingFile && (
        <DuplicateReviewModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          result={duplicateResult}
          onConfirm={handleDuplicateReviewComplete}
          type={currentProcessingFile.type!}
        />
      )}
    </div>
  );
};

export default Upload; 