import React, { useState } from 'react';
import { ProcessedUploadResult, DuplicateDetectionConfig } from '../utils/duplicateHandler';

interface DuplicateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ProcessedUploadResult;
  onConfirm: (config: DuplicateDetectionConfig) => void;
  type: 'muzakki' | 'distribusi';
}

export const DuplicateReviewModal: React.FC<DuplicateReviewModalProps> = ({
  isOpen,
  onClose,
  result,
  onConfirm,
  type
}) => {
  const [config, setConfig] = useState<DuplicateDetectionConfig>({
    strictMode: true,
    action: 'skip',
    tolerance: 0.8
  });

  const [selectedAction, setSelectedAction] = useState<{[key: string]: 'skip' | 'update' | 'merge'}>({});

  if (!isOpen) return null;

  const handleActionChange = (duplicateIndex: string, action: 'skip' | 'update' | 'merge') => {
    setSelectedAction(prev => ({
      ...prev,
      [duplicateIndex]: action
    }));
  };

  const getTotalDuplicates = () => {
    return result.duplicates.exact.length + 
           result.duplicates.fuzzy.length + 
           result.duplicates.partial.length;
  };

  const renderDuplicateRow = (duplicate: any, index: number, matchType: 'exact' | 'fuzzy' | 'partial') => {
    const key = `${matchType}-${index}`;
    const action = selectedAction[key] || 'skip';
    
    return (
      <div key={key} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              matchType === 'exact' ? 'bg-red-100 text-red-700' :
              matchType === 'fuzzy' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {matchType.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              Row {index + 1}
            </span>
          </div>
          
          <select 
            value={action}
            onChange={(e) => handleActionChange(key, e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="skip">Skip Duplicate</option>
            <option value="update">Update Existing</option>
            <option value="merge">Merge Data</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">📤 New Data</h4>
            <div className="text-sm space-y-1">
              {type === 'muzakki' ? (
                <>
                  <div><strong>Nama:</strong> {duplicate.new.nama_muzakki}</div>
                  <div><strong>Hewan:</strong> {duplicate.new.jenis_hewan}</div>
                  <div><strong>Nilai:</strong> Rp {parseInt(duplicate.new.nilai_qurban).toLocaleString()}</div>
                  <div><strong>Telepon:</strong> {duplicate.new.telepon || '-'}</div>
                </>
              ) : (
                <>
                  <div><strong>Penerima:</strong> {duplicate.new.nama_penerima}</div>
                  <div><strong>Alamat:</strong> {duplicate.new.alamat_penerima}</div>
                  <div><strong>Tanggal:</strong> {duplicate.new.tanggal_distribusi}</div>
                  <div><strong>Hewan:</strong> {duplicate.new.jenis_hewan}</div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">💾 Existing Data</h4>
            <div className="text-sm space-y-1">
              {type === 'muzakki' ? (
                <>
                  <div><strong>Nama:</strong> {duplicate.existing.nama_muzakki}</div>
                  <div><strong>Hewan:</strong> {duplicate.existing.jenis_hewan}</div>
                  <div><strong>Nilai:</strong> Rp {parseInt(duplicate.existing.nilai_qurban).toLocaleString()}</div>
                  <div><strong>Telepon:</strong> {duplicate.existing.telepon || '-'}</div>
                </>
              ) : (
                <>
                  <div><strong>Penerima:</strong> {duplicate.existing.nama_penerima}</div>
                  <div><strong>Alamat:</strong> {duplicate.existing.alamat_penerima}</div>
                  <div><strong>Tanggal:</strong> {duplicate.existing.tanggal_distribusi}</div>
                  <div><strong>Hewan:</strong> {duplicate.existing.jenis_hewan}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action explanation */}
        <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
          {action === 'skip' && '🚫 Will skip this duplicate record'}
          {action === 'update' && '🔄 Will replace existing record with new data'}
          {action === 'merge' && '🔀 Will merge new data into existing record (new data takes priority)'}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            🔍 Duplicate Records Detected
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Found {getTotalDuplicates()} potential duplicates in {result.stats.totalProcessed} records
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Settings Panel */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-3">⚙️ Detection Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Detection Mode
                </label>
                <select 
                  value={config.strictMode ? 'strict' : 'fuzzy'}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    strictMode: e.target.value === 'strict'
                  }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="strict">Strict (Exact Match)</option>
                  <option value="fuzzy">Fuzzy (Similar Names)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Action
                </label>
                <select 
                  value={config.action}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    action: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="skip">Skip Duplicates</option>
                  <option value="update">Update Existing</option>
                  <option value="merge">Merge Data</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Similarity Threshold ({Math.round(config.tolerance * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.1"
                  value={config.tolerance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    tolerance: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{result.stats.newAdded}</div>
              <div className="text-sm text-green-600">New Records</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{result.duplicates.exact.length}</div>
              <div className="text-sm text-red-600">Exact Matches</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{result.duplicates.fuzzy.length}</div>
              <div className="text-sm text-yellow-600">Fuzzy Matches</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{result.duplicates.partial.length}</div>
              <div className="text-sm text-blue-600">Partial Matches</div>
            </div>
          </div>

          {/* Duplicate Records */}
          <div className="space-y-4">
            {/* Exact Duplicates */}
            {result.duplicates.exact.length > 0 && (
              <div>
                <h3 className="font-medium text-red-700 mb-3">🎯 Exact Duplicates</h3>
                {result.duplicates.exact.map((duplicate, index) => 
                  renderDuplicateRow(duplicate, index, 'exact')
                )}
              </div>
            )}

            {/* Fuzzy Duplicates */}
            {result.duplicates.fuzzy.length > 0 && (
              <div>
                <h3 className="font-medium text-yellow-700 mb-3">🔍 Similar Records</h3>
                {result.duplicates.fuzzy.map((duplicate, index) => 
                  renderDuplicateRow(duplicate, index, 'fuzzy')
                )}
              </div>
            )}

            {/* Partial Duplicates */}
            {result.duplicates.partial.length > 0 && (
              <div>
                <h3 className="font-medium text-blue-700 mb-3">🔗 Partial Matches</h3>
                {result.duplicates.partial.map((duplicate, index) => 
                  renderDuplicateRow(duplicate, index, 'partial')
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          
          <div className="space-x-3">
            <button
              onClick={() => {
                // Apply actions and proceed
                const finalConfig = {
                  ...config,
                  selectedActions: selectedAction
                };
                onConfirm(finalConfig);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Actions & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 