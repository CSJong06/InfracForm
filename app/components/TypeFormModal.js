import { useState, useEffect } from 'react'; // Import React hooks for state management and side effects
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import X mark icon for close button

export default function TypeFormModal({ // Modal component for creating/editing form types (interactions, infractions, interventions)
  open, // Boolean prop to control modal visibility
  onClose, // Function prop to close the modal
  type = null, // Object containing existing type data for editing (null for new types)
  typeCategory, // String indicating category of type (interaction, infraction, or intervention)
  onSave // Function prop to call after successful save
}) {
  const [formData, setFormData] = useState({ // State for form input data
    name: '', // Internal name used in system (uppercase with underscores)
    displayName: '', // User-friendly name shown in interface
    shorthandCode: '', // Short code for interaction types (max 3 characters)
    isActive: true // Boolean flag for active/inactive status
  });
  const [isLoading, setIsLoading] = useState(false); // State to track loading status during save
  const [error, setError] = useState(''); // State to store error messages

  useEffect(() => { // Effect to populate form when editing existing type
    if (type) { // If type object exists (editing mode)
      setFormData({ // Set form data with existing type values
        name: type.name, // Use existing name
        displayName: type.displayName, // Use existing display name
        shorthandCode: type.shorthandCode || '', // Use existing shorthand code or empty string
        isActive: type.isActive !== false // Use existing active status (default to true if undefined)
      });
    } else { // If no type object (creating new)
      setFormData({ // Reset form data to default values
        name: '', // Empty name
        displayName: '', // Empty display name
        shorthandCode: '', // Empty shorthand code
        isActive: true // Default to active
      });
    }
  }, [type]); // Dependency on type prop

  const handleSubmit = async (e) => { // Async function to handle form submission
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true); // Set loading state to true
    setError(''); // Clear any previous errors

    try {
      const endpoint = `/api/form-types/${typeCategory}-types`; // Construct API endpoint based on type category
      const method = type ? 'PUT' : 'POST'; // Use PUT for editing, POST for creating
      
      const response = await fetch(endpoint, { // Make API request
        method, // Use determined HTTP method
        headers: { // Set request headers
          'Content-Type': 'application/json', // Specify JSON content type
        },
        body: JSON.stringify(formData), // Send form data as JSON
      });

      if (!response.ok) { // Check if request was successful
        const data = await response.json(); // Parse error response
        throw new Error(data.error || 'Failed to save type'); // Throw error with message from server or default
      }

      const savedType = await response.json(); // Parse successful response
      onSave(savedType); // Call success callback with saved type data
      onClose(); // Close the modal
    } catch (err) { // Catch any errors during save process
      setError(err.message || 'Failed to save type'); // Set error message in state
    } finally { // Always execute this block
      setIsLoading(false); // Reset loading state to false
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
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder-gray-500"
              placeholder="e.g., CHECK_IN_WITH_GUARDIAN"
            />
            <p className="mt-1 text-xs text-gray-500">
              Internal name used in the system (uppercase with underscores)
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
              placeholder="e.g., Check-in with Guardian"
            />
            <p className="mt-1 text-xs text-gray-500">
              Name shown to users in the interface
            </p>
          </div>

          {typeCategory === 'interaction' && (
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
                placeholder="e.g., CG"
                maxLength={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                A short code (max 3 characters) used to identify this interaction type in exports.
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