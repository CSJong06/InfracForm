import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTypes } from '@/lib/hooks/useTypes';
import { useStudents } from '@/lib/hooks/useStudents';
import { useReports } from '@/lib/hooks/useReports';

export default function ReportFormModal({ open, onClose }) {
  const { interactionTypes, infractionTypes, interventionTypes, loading: typesLoading, error: typesError } = useTypes();
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const { refresh: refreshReports } = useReports();
  const [page, setPage] = useState(1);
  const [interaction, setInteraction] = useState('');
  const [infraction, setInfraction] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showInterventionDropdown, setShowInterventionDropdown] = useState(false);
  const [checkedInterventions, setCheckedInterventions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dropdownRef = useRef(null);
  const [notes, setNotes] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || student.studentId.includes(searchLower);
  });

  const handleInterventionCheck = (interventionId) => {
    setCheckedInterventions((prev) =>
      prev.includes(interventionId)
        ? prev.filter((id) => id !== interventionId)
        : [...prev, interventionId]
    );
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      setPage(1);
      setInteraction('');
      setInfraction('');
      setSelectedStudents([]);
      setCheckedInterventions([]);
      setShowInterventionDropdown(false);
      onClose();
    }
  };

  const handleNextPage = () => {
    if (page === 1) {
      setPage(2);
    } else if (page === 2) {
      if (interaction !== 'INFRACTION') {
        handleSubmit();
      } else {
        setPage(3);
      }
    }
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async (resolve = false) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get the current user's email (you'll need to implement this)
      const submitterEmail = 'user@example.com'; // TODO: Replace with actual user email

      // Create reports for each selected student
      const reportPromises = selectedStudents.map(async (studentId) => {
        const student = students.find(s => s._id === studentId);
        if (!student) throw new Error('Student not found');

        const reportData = {
          studentNumber: student.studentId,
          submitterEmail,
          interaction,
          infraction: interaction === 'INFRACTION' ? infraction : 'NONE',
          intervention: interaction === 'INFRACTION' ? checkedInterventions.join(',') : 'NONE',
          notes: notes,
          interactionTimestamp: new Date().toISOString(),
          status: resolve ? 'RESOLVED' : 'UNRESOLVED'
        };

        console.log('Submitting report data:', reportData); // Debug log

        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.details || 
            result.error || 
            'Failed to create report'
          );
        }

        return result;
      });

      await Promise.all(reportPromises);
      
      // Refresh reports data immediately after successful submission
      await refreshReports();
      
      // Reset all form state
      setPage(1);
      setInteraction('');
      setInfraction('');
      setSelectedStudents([]);
      setCheckedInterventions([]);
      setShowInterventionDropdown(false);
      setNotes('');
      setAdditionalComments('');
      setSearchTerm('');
      setShowConfirmation(false);
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressDots = () => {
    if (interaction !== 'INFRACTION') {
      return (
        <>
          <span className={`w-2.5 h-2.5 rounded-full ${page === 1 ? 'bg-gray-400' : 'bg-gray-300'} inline-block`} />
          <span className={`w-2.5 h-2.5 rounded-full ${page === 2 ? 'bg-gray-400' : 'bg-gray-300'} inline-block`} />
        </>
      );
    }
    return (
      <>
        <span className={`w-2.5 h-2.5 rounded-full ${page === 1 ? 'bg-gray-400' : 'bg-gray-300'} inline-block`} />
        <span className={`w-2.5 h-2.5 rounded-full ${page === 2 ? 'bg-gray-400' : 'bg-gray-300'} inline-block`} />
        <span className={`w-2.5 h-2.5 rounded-full ${page === 3 ? 'bg-gray-400' : 'bg-gray-300'} inline-block`} />
      </>
    );
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
  if (typesLoading || studentsLoading) return <div>Loading...</div>;
  if (typesError) return <div>Error loading types: {typesError}</div>;
  if (studentsError) return <div>Error loading students: {studentsError}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-auto p-6 z-10 flex flex-col gap-4 min-h-[28rem]">
        {page === 1 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Student(s) involved</h2>
            </div>
            <div className="relative mb-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-800"
                />
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex flex-col gap-1.5 border border-gray-200 max-h-[350px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <label key={student._id} className="flex items-center gap-2 text-gray-700 text-sm hover:bg-gray-100 p-1.5 rounded">
                  <input
                    type="checkbox"
                    className="accent-blue-600 w-3.5 h-3.5"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => handleStudentSelect(student._id)}
                  />
                  <span className="flex-1">{student.firstName} {student.lastName}</span>
                  <span className="text-gray-500 text-xs">{student.studentId}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between mt-auto">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={handleCancel}>Cancel</button>
              <div className="flex items-center gap-2">
                {renderProgressDots()}
              </div>
              <button 
                className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleNextPage}
                disabled={selectedStudents.length === 0}
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
        
        {page === 2 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Report</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-28 shrink-0 text-sm">Interaction</label>
                <select
                  className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                  value={interaction}
                  onChange={e => setInteraction(e.target.value)}
                >
                  <option value="">Select</option>
                  {interactionTypes.map(type => (
                    <option key={type.name} value={type.name}>{type.displayName}</option>
                  ))}
                </select>
              </div>
              {interaction === 'INFRACTION' && (
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-28 shrink-0 text-sm">Infraction</label>
                  <select
                    className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                    value={infraction}
                    onChange={e => setInfraction(e.target.value)}
                  >
                    <option value="">Select</option>
                    {infractionTypes.map(type => (
                      <option key={type.name} value={type.name}>{type.displayName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm">Notes</label>
                <textarea
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Add notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={handleCancel}>Cancel</button>
                <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setPage(page - 1)}>
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {renderProgressDots()}
              </div>
              {interaction === 'INFRACTION' ? (
                <button 
                  className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" 
                  onClick={handleNextPage}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow text-sm"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </>
        )}
        
        {page === 3 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Intervention</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-4 border border-gray-200">
              <div className="flex items-start gap-3 relative">
                <label className="text-gray-700 whitespace-nowrap pt-1.5 text-sm">Attempted interventions</label>
                <div className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    className="flex items-center justify-between border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 w-full min-h-[2rem] text-left self-start text-sm"
                    onClick={() => setShowInterventionDropdown((v) => !v)}
                  >
                    <span className="flex flex-col">
                      {checkedInterventions.length > 0 ? checkedInterventions.map((id, idx) => {
                        const intervention = interventionTypes.find(t => t.name === id);
                        return (
                          <span key={id} className="leading-tight">
                            {intervention?.displayName}
                            {idx < checkedInterventions.length - 1 ? ',' : ''}
                          </span>
                        );
                      }) : 'Select'}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-400" />
                  </button>
                  
                  {showInterventionDropdown && (
                    <div ref={dropdownRef} className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow z-30 p-2 flex flex-col gap-1.5 w-full max-h-[250px] overflow-y-auto">
                      {interventionTypes.map((type) => (
                        <label key={type.name} className="flex items-start gap-2 text-gray-700 text-sm hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            className="accent-blue-600 w-3.5 h-3.5 mt-0.5"
                            checked={checkedInterventions.includes(type.name)}
                            onChange={() => handleInterventionCheck(type.name)}
                          />
                          <span className="leading-snug">{type.displayName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm">Additional comments</label>
                <textarea
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Add comments..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Suggested Actions</label>
                <button className="w-fit bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded font-medium flex items-center gap-2 text-sm">
                  <SparklesIcon className="w-4 h-4 text-blue-500" />
                  Generate
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={handleCancel}>Cancel</button>
                <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setPage(page - 1)}>
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {renderProgressDots()}
              </div>
              <button 
                className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow text-sm"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmation(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Submit Report</h3>
            <p className="text-gray-600 mb-6">Would you like to mark this report as resolved or continue with it unresolved?</p>
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button 
                className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm min-w-[120px] disabled:opacity-50"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm min-w-[120px] disabled:opacity-50"
                onClick={() => handleConfirmSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resolving...' : 'Resolve'}
              </button>
              <button 
                className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm min-w-[120px] disabled:opacity-50"
                onClick={() => handleConfirmSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 