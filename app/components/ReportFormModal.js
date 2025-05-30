import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const students = [
  'Student 1',
  'Student 2',
  'Student 3',
];

export default function ReportFormModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Student(s) involved</h2>
          <button className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-200 text-sm font-medium">Filter</button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-2 border border-gray-200">
          {students.map((student, idx) => (
            <label key={student} className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="accent-blue-600" disabled />
              {student}
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium" onClick={onClose}>Cancel</button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
          </div>
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium">&gt;</button>
        </div>
      </div>
    </div>
  );
} 