'use client'; // Mark component as client-side for Next.js

import { useState } from 'react'; // Import React useState hook for component state management
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import X mark icon for close button

export default function ClearDatabaseModal({ open, onClose, onConfirm }) { // Modal component for confirming database clearing
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status during clearing
  const [error, setError] = useState(null); // State to store error messages

  const handleConfirm = async () => { // Async function to handle database clearing confirmation
    try {
      setIsSubmitting(true); // Set submission state to true
      setError(null); // Clear any previous errors
      await onConfirm(); // Call the confirmation callback function
      onClose(); // Close the modal after successful clearing
    } catch (err) { // Catch any errors during clearing process
      setError(err.message); // Set error message in state
    } finally { // Always execute this block
      setIsSubmitting(false); // Reset submission state to false
    }
  };

  if (!open) return null; // Return null if modal is not open (don't render)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Clear Database</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Are you sure you want to clear all data from the database? This action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Clearing...' : 'Clear Database'}
          </button>
        </div>
      </div>
    </div>
  );
} 