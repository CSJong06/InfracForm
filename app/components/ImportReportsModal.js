'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useReports } from '@/lib/hooks/useReports';

export default function ImportReportsModal({ open, onClose }) {
  const { refresh } = useReports();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setDebugInfo(null);
      
      // Preview the first few lines of the CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').slice(0, 3); // Get first 3 lines
        setDebugInfo({
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
          preview: lines.join('\n'),
          headers: lines[0]?.split(',').map(h => h.trim()) || []
        });
      };
      reader.readAsText(selectedFile);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
      setDebugInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Starting file upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await fetch('/api/reports/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import reports');
      }

      setSuccess(`Successfully imported ${data.imported} reports${data.errors ? ` with ${data.errors.length} errors` : ''}`);
      if (data.errors) {
        setDebugInfo(prev => ({
          ...prev,
          importErrors: data.errors
        }));
      }
      setFile(null);
      
      // Refresh the reports list
      await refresh();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Import Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-2 rounded-lg text-xs">
              {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              required
              onChange={handleFileChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs text-gray-900"
            />
            <div className="mt-1 text-xs text-gray-600">
              <p className="font-medium mb-0.5">Required columns:</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                <span>• studentnumber</span>
                <span>• entrytimestamp</span>
                <span>• submitteremail</span>
                <span>• interaction code</span>
                <span>• responses</span>
                <span>• notes</span>
                <span>• interactiontimestamp</span>
                <span>• entryidentifier</span>
                <span>• interactionid</span>
              </div>
            </div>
          </div>

          {debugInfo && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
              <h3 className="font-medium text-gray-900 mb-1">File Information:</h3>
              <div className="space-y-1 text-gray-600">
                <p>File: {debugInfo.fileName}</p>
                <p>Size: {debugInfo.fileSize}</p>
                <div>
                  <p className="font-medium mb-0.5">Headers found:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {debugInfo.headers.map((header, index) => (
                      <span key={index}>• {header}</span>
                    ))}
                  </div>
                </div>
                {debugInfo.preview && (
                  <div>
                    <p className="font-medium mb-0.5">Preview:</p>
                    <pre className="whitespace-pre-wrap bg-gray-100 p-1.5 rounded text-[10px] max-h-20 overflow-y-auto">
                      {debugInfo.preview}
                    </pre>
                  </div>
                )}
                {debugInfo.importErrors && (
                  <div>
                    <p className="font-medium mb-0.5 text-red-600">Import Errors:</p>
                    <div className="max-h-20 overflow-y-auto">
                      {debugInfo.importErrors.map((err, index) => (
                        <p key={index} className="text-red-600 text-[10px]">• {err}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? 'Importing...' : 'Import Reports'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 