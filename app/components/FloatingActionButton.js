import { PencilIcon } from '@heroicons/react/24/outline';

export default function FloatingActionButton() {
  return (
    <div className="fixed bottom-8 right-8 group">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform group-hover:scale-110"
        aria-label="Write Up Report"
      >
        <PencilIcon className="w-8 h-8" />
      </button>
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-lg">Write Up Report</span>
    </div>
  );
} 