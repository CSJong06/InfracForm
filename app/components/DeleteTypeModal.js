import { useState } from 'react'; // Import React useState hook for component state management
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import X mark icon for close button

export default function DeleteTypeModal({ // Modal component for confirming deletion of form types
  open, // Boolean prop to control modal visibility
  onClose, // Function prop to close the modal
  type = null, // Object containing type data to be deleted
  typeCategory, // String indicating category of type (interaction, infraction, intervention)
  onDelete // Function prop to call after successful deletion
}) {
  const [isLoading, setIsLoading] = useState(false); // State to track loading status during deletion
  const [error, setError] = useState(''); // State to store error messages

  const handleDelete = async () => { // Async function to handle type deletion
    setIsLoading(true); // Set loading state to true
    setError(''); // Clear any previous errors

    try {
      const endpoint = `/api/form-types/${typeCategory}-types?name=${encodeURIComponent(type.name)}`; // Construct API endpoint with type name parameter
      const response = await fetch(endpoint, { // Make DELETE request to API
        method: 'DELETE', // Use DELETE HTTP method
      });

      if (!response.ok) { // Check if request was successful
        const data = await response.json(); // Parse error response
        throw new Error(data.error || 'Failed to delete type'); // Throw error with message from server or default
      }

      onDelete(); // Call success callback function
      onClose(); // Close the modal
    } catch (err) { // Catch any errors during deletion process
      setError(err.message || 'Failed to delete type'); // Set error message in state
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
            Delete {typeCategory.charAt(0).toUpperCase() + typeCategory.slice(1)} Type
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

        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete &ldquo;{type.displayName}&rdquo;? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
} 