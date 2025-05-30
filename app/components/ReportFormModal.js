import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';

const students = [
  'Student 1',
  'Student 2',
  'Student 3',
];

const interactionOptions = [
  { value: '', label: 'Select' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'infraction', label: 'Infraction' },
  { value: 'praise', label: 'Praise' },
];

const infractionOptions = [
  { value: '', label: 'Select' },
  { value: 'tardy', label: 'Tardy' },
  { value: 'dresscode', label: 'Dress Code' },
];

const interventionCheckboxes = [
  'Intervention 1',
  'Intervention 2',
  'Intervention 3',
];

export default function ReportFormModal({ open, onClose }) {
  const [page, setPage] = useState(1);
  const [interaction, setInteraction] = useState('');
  const [showInterventionDropdown, setShowInterventionDropdown] = useState(false);
  const [checkedInterventions, setCheckedInterventions] = useState([]);
  const dropdownRef = useRef(null);

  const handleInterventionCheck = (label) => {
    setCheckedInterventions((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      setPage(1);
      setInteraction('');
      setCheckedInterventions([]);
      setShowInterventionDropdown(false);
      onClose();
    }
  };

  useEffect(() => {
    if (!showInterventionDropdown) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowInterventionDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInterventionDropdown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10 flex flex-col gap-4">
        {page === 1 && (
          <>
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
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium" onClick={handleCancel}>Cancel</button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              </div>
              <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setPage(2)}>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
        {page === 2 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Report</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-4 border border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-gray-700 w-28">Interaction</label>
                <select
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={interaction}
                  onChange={e => setInteraction(e.target.value)}
                >
                  {interactionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {interaction === 'infraction' && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 w-28">Infraction</label>
                  <select
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {infractionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-gray-700">Notes</label>
                <textarea
                  className="border border-gray-300 rounded px-2 py-1 text-gray-700 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Add notes..."
                  disabled
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium" onClick={handleCancel}>Cancel</button>
                <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setPage(page - 1)}>
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              </div>
              <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setPage(3)}>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
        {page === 3 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Intervention</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-4 border border-gray-200">
              <div className="flex items-start gap-2 relative">
                <label className="text-gray-700 whitespace-nowrap pt-2">Attempted interventions</label>
                <div className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    className="flex items-center justify-between border border-gray-300 rounded px-2 py-1 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 w-full min-h-[2.25rem] text-left self-start"
                    onClick={() => setShowInterventionDropdown((v) => !v)}
                  >
                    <span className="flex flex-col">
                      {checkedInterventions.length > 0 ? checkedInterventions.map((i, idx) => (
                        <span key={i} className="leading-tight">{i}{idx < checkedInterventions.length - 1 ? ',' : ''}</span>
                      )) : 'Select'}
                    </span>
                    <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-400" />
                  </button>
                  {showInterventionDropdown && (
                    <div ref={dropdownRef} className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow z-30 p-2 flex flex-col gap-1 w-full">
                      {interventionCheckboxes.map((label) => (
                        <label key={label} className="flex items-center gap-2 text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-blue-600"
                            checked={checkedInterventions.includes(label)}
                            onChange={() => handleInterventionCheck(label)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-700">Additional comments</label>
                <textarea
                  className="border border-gray-300 rounded px-2 py-1 text-gray-700 min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Add comments..."
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-700">Suggested Actions</label>
                <button className="w-fit bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded font-medium flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-500" />
                  Generate
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium" onClick={handleCancel}>Cancel</button>
                <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setPage(page - 1)}>
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              </div>
              <button className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow">Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 