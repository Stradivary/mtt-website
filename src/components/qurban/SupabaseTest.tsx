import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Wifi, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SupabaseTestProps {
  onClose?: () => void;
}

const SupabaseTest: React.FC<SupabaseTestProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState({
    connection: { status: 'testing', message: '', time: 0 },
    tables: { status: 'waiting', message: '', time: 0 },
    auth: { status: 'waiting', message: '', time: 0 },
    realtime: { status: 'waiting', message: '', time: 0 }
  });

  const [isRunning, setIsRunning] = useState(false);

  const testConnection = async () => {
    const start = Date.now();
    try {
      const { data, error } = await supabase.from('test').select('*').limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, but connection works
        return {
          status: 'success',
          message: 'Koneksi berhasil! Database accessible.',
          time: Date.now() - start
        };
      } else if (error) {
        return {
          status: 'error', 
          message: `Connection error: ${error.message}`,
          time: Date.now() - start
        };
      } else {
        return {
          status: 'success',
          message: 'Koneksi berhasil! Database connected.',
          time: Date.now() - start
        };
      }
    } catch (err: any) {
      return {
        status: 'error',
        message: `Network error: ${err.message}`,
        time: Date.now() - start
      };
    }
  };

  const testTables = async () => {
    const start = Date.now();
    try {
      // Test if expected tables exist
      const tableTests = [
        { name: 'muzakki', query: supabase.from('muzakki').select('*').limit(1) },
        { name: 'distribusi', query: supabase.from('distribusi').select('*').limit(1) },
        { name: 'upload_history', query: supabase.from('upload_history').select('*').limit(1) }
      ];

      const results = await Promise.all(
        tableTests.map(async (test) => {
          try {
            const { error } = await test.query;
            return {
              table: test.name,
              exists: !error || error.code === 'PGRST116' || error.code === 'PGRST103'
            };
          } catch {
            return { table: test.name, exists: false };
          }
        })
      );

      const existingTables = results.filter(r => r.exists).map(r => r.table);
      const missingTables = results.filter(r => !r.exists).map(r => r.table);

      if (existingTables.length === 0) {
        return {
          status: 'error',
          message: 'Tidak ada tabel yang ditemukan. Database mungkin belum dikonfigurasi.',
          time: Date.now() - start
        };
      } else if (missingTables.length > 0) {
        return {
          status: 'warning',
          message: `Tabel ditemukan: ${existingTables.join(', ')}. Missing: ${missingTables.join(', ')}`,
          time: Date.now() - start
        };
      } else {
        return {
          status: 'success',
          message: `Semua tabel tersedia: ${existingTables.join(', ')}`,
          time: Date.now() - start
        };
      }
    } catch (err: any) {
      return {
        status: 'error',
        message: `Table test error: ${err.message}`,
        time: Date.now() - start
      };
    }
  };

  const testAuth = async () => {
    const start = Date.now();
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return {
          status: 'warning',
          message: `Auth tersedia tapi tidak login: ${error.message}`,
          time: Date.now() - start
        };
      } else if (user) {
        return {
          status: 'success',
          message: `User authenticated: ${user.email || user.id}`,
          time: Date.now() - start
        };
      } else {
        return {
          status: 'warning',
          message: 'Auth service tersedia, tidak ada user login',
          time: Date.now() - start
        };
      }
    } catch (err: any) {
      return {
        status: 'error',
        message: `Auth error: ${err.message}`,
        time: Date.now() - start
      };
    }
  };

  const testRealtime = async () => {
    const start = Date.now();
    try {
      const channel = supabase.channel('test-channel');
      
      return new Promise<any>((resolve) => {
        const timeout = setTimeout(() => {
          channel.unsubscribe();
          resolve({
            status: 'warning',
            message: 'Realtime timeout (normal untuk test)',
            time: Date.now() - start
          });
        }, 3000);

        channel
          .on('presence', { event: 'sync' }, () => {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve({
              status: 'success',
              message: 'Realtime connection working',
              time: Date.now() - start
            });
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              // Successfully subscribed to realtime
              clearTimeout(timeout);
              channel.unsubscribe();
              resolve({
                status: 'success',
                message: 'Realtime service tersedia',
                time: Date.now() - start
              });
            }
          });
      });
    } catch (err: any) {
      return {
        status: 'error',
        message: `Realtime error: ${err.message}`,
        time: Date.now() - start
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Test connection
    setTestResults(prev => ({ ...prev, connection: { status: 'testing', message: 'Testing...', time: 0 } }));
    const connectionResult = await testConnection();
    setTestResults(prev => ({ ...prev, connection: connectionResult }));

    if (connectionResult.status === 'success') {
      // Test tables
      setTestResults(prev => ({ ...prev, tables: { status: 'testing', message: 'Testing...', time: 0 } }));
      const tablesResult = await testTables();
      setTestResults(prev => ({ ...prev, tables: tablesResult }));

      // Test auth
      setTestResults(prev => ({ ...prev, auth: { status: 'testing', message: 'Testing...', time: 0 } }));
      const authResult = await testAuth();
      setTestResults(prev => ({ ...prev, auth: authResult }));

      // Test realtime
      setTestResults(prev => ({ ...prev, realtime: { status: 'testing', message: 'Testing...', time: 0 } }));
      const realtimeResult = await testRealtime();
      setTestResults(prev => ({ ...prev, realtime: realtimeResult }));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'testing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Database className="w-6 h-6 mr-2 text-blue-500" />
            Supabase Connection Test
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Connection Test */}
          <div className={`border rounded-lg p-4 ${getStatusColor(testResults.connection.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIcon(testResults.connection.status)}
                <span className="font-medium">Database Connection</span>
              </div>
              <span className="text-sm text-gray-500">
                {testResults.connection.time > 0 ? `${testResults.connection.time}ms` : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700">{testResults.connection.message}</p>
          </div>

          {/* Tables Test */}
          <div className={`border rounded-lg p-4 ${getStatusColor(testResults.tables.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIcon(testResults.tables.status)}
                <span className="font-medium">Database Tables</span>
              </div>
              <span className="text-sm text-gray-500">
                {testResults.tables.time > 0 ? `${testResults.tables.time}ms` : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700">{testResults.tables.message}</p>
          </div>

          {/* Auth Test */}
          <div className={`border rounded-lg p-4 ${getStatusColor(testResults.auth.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIcon(testResults.auth.status)}
                <span className="font-medium">Authentication</span>
              </div>
              <span className="text-sm text-gray-500">
                {testResults.auth.time > 0 ? `${testResults.auth.time}ms` : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700">{testResults.auth.message}</p>
          </div>

          {/* Realtime Test */}
          <div className={`border rounded-lg p-4 ${getStatusColor(testResults.realtime.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIcon(testResults.realtime.status)}
                <span className="font-medium">Realtime Service</span>
              </div>
              <span className="text-sm text-gray-500">
                {testResults.realtime.time > 0 ? `${testResults.realtime.time}ms` : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700">{testResults.realtime.message}</p>
          </div>

          {/* Configuration Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Configuration Status</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Supabase URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
              <div>Supabase Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Wifi className="w-4 h-4" />
              <span>{isRunning ? 'Testing...' : 'Test Ulang'}</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest; 