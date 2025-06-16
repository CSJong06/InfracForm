import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TypeFormModal({ 
  open, 
  onClose, 
  type = null, 
  typeCategory, // 'interaction', 'infraction', or 'intervention'
  onSave 
}) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    shorthandCode: '', // Added for intervention types
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name,
        displayName: type.displayName,
        shorthandCode: type.shorthandCode || '', // Added for intervention types
        isActive: type.isActive !== false
      });
    } else {
      setFormData({
        name: '',
        displayName: '',
        shorthandCode: '', // Added for intervention types
        isActive: true
      });
    }
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = `/api/form-types/${typeCategory}-types`;
      const method = type ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save type');
      }

      const savedType = await response.json();
      onSave(savedType);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save type');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {type ? 'Edit' : 'Add'} {typeCategory.charAt(0).toUpperCase() + typeCategory.slice(1)} Type
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Name (Internal)
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder-gray-500"
              placeholder="e.g., NEW_TYPE"
              disabled={!!type} // Can't change name after creation
            />
            <p className="mt-1 text-xs text-gray-500">
              This is the internal identifier. Use uppercase with underscores.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder-gray-500"
              placeholder="e.g., New Type"
            />
          </div>

          {typeCategory === 'intervention' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Shorthand Code
              </label>
              <input
                type="text"
                required
                value={formData.shorthandCode}
                onChange={(e) => setFormData({ ...formData, shorthandCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder-gray-500"
                placeholder="e.g., ABC"
                maxLength={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                A short code (max 3 characters) used to identify this intervention type.
              </p>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 