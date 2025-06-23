import { PlusIcon } from '@heroicons/react/24/outline'; // Import plus icon for the floating action button

export default function FloatingActionButton() { // Floating action button component for adding new items
  return ( // Return JSX for floating action button
    <div className="fixed bottom-8 right-8 group">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform group-hover:scale-110" // Styled circular button with hover effects
        aria-label="Add New" // Accessibility label for screen readers
      >
        <PlusIcon className="w-8 h-8" /> 
      </button>
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-lg">Add New</span>
    </div>
  );
} 