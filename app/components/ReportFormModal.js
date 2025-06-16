import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, SparklesIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTypes } from '@/lib/hooks/useTypes';
import { useStudents } from '@/lib/hooks/useStudents';
import { useReports } from '@/lib/hooks/useReports';
import { DisplayToCodeMap, CodeToDisplayMap } from '@/lib/constants/interactionTypes';
import { useRouter } from 'next/navigation';

export default function ReportFormModal({ open, onClose, report = null }) {
  const { interactionTypes, infractionTypes, interventionTypes, loading: typesLoading, error: typesError } = useTypes();
  const { students = [], loading: studentsLoading, error: studentsError } = useStudents();
  const { refresh: refreshReports, deleteReport } = useReports();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    interaction: '',
    infraction: '',
    intervention: '',
    notes: '',
    interventionNotes: '',
    interactionTimestamp: new Date().toISOString().slice(0, 16),
    resolved: false,
    showInterventionPrompt: false
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showInterventionDropdown, setShowInterventionDropdown] = useState(false);
  const [checkedInterventions, setCheckedInterventions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dropdownRef = useRef(null);
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Fetch session data when component mounts
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    };
    fetchSession();
  }, []);

  // Initialize form data when editing an existing report
  useEffect(() => {
    // Only initialize if editing and formData.interaction is not set
    if (
      report &&
      !typesLoading &&
      interactionTypes.length > 0 &&
      (!formData.interaction || formData.interaction === '')
    ) {
      const interactionType = interactionTypes.find(t => t.name === report.interaction);
      const newFormData = {
        interaction: interactionType ? interactionType.name : '',
        infraction: report.infraction || '',
        intervention: report.intervention || '',
        notes: report.notes || '',
        interventionNotes: report.interventionNotes || '',
        interactionTimestamp: report.interactionTimestamp ? new Date(report.interactionTimestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        resolved: report.status === 'RESOLVED',
        showInterventionPrompt: false
      };
      setFormData(newFormData);
      if (report.studentNumber) {
        const student = students.find(s => s.studentId === report.studentNumber);
        if (student) {
          setSelectedStudents([student]);
        }
      }
      if (report.intervention && report.intervention !== 'NONE') {
        setCheckedInterventions([report.intervention]);
      }
    }
  }, [report, students, interactionTypes, typesLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange - name:', name, 'value:', value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated formData:', newData);
      return newData;
    });
  };

  const handleStudentSelect = (student) => {
    setSelectedStudents(prev =>
      prev.includes(student)
        ? prev.filter(s => s !== student)
        : [...prev, student]
    );
  };

  const handleNextPage = () => {
    if (page === 1 && selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }
    setError(null);
    if (page === 2) {
      if (formData.interaction === 'INFRACTION') {
        // If it's an infraction, go directly to intervention page
        setPage(3);
      } else {
        // For non-infractions, show the intervention prompt
        setFormData(prev => ({ ...prev, showInterventionPrompt: true }));
      }
    } else {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    setPage(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, showInterventionPrompt: true }));
  };

  const handleConfirmSubmit = async (isResolved) => {
    try {
      setError(null);
      setIsSubmitting(true);

      if (!selectedStudents || selectedStudents.length === 0) {
        throw new Error('No student selected');
      }

      // Get the selected interaction type
      const selectedInteraction = interactionTypes.find(t => t.name === formData.interaction);
      if (!selectedInteraction) {
        throw new Error('Invalid interaction type');
      }

      // Prepare the report data
      const reportData = {
        studentNumber: selectedStudents[0].studentId,
        submitterEmail: session.email,
        interaction: selectedInteraction.name,
        interactioncode: selectedInteraction.name,
        notes: formData.notes,
        interactionTimestamp: formData.interactionTimestamp,
        status: isResolved ? 'RESOLVED' : 'UNRESOLVED',
        entryTimestamp: new Date().toISOString(),
        infraction: selectedInteraction.name === 'INFRACTION' ? (formData.infraction || 'NONE') : 'NONE',
        intervention: formData.intervention || 'NONE',
        interventionNotes: formData.interventionNotes || ''
      };

      console.log('Debug - Final Report Data:', reportData);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response error:', errorData);
        throw new Error(errorData.error || 'Failed to create report');
      }

      const report = await response.json();
      console.log('Report created successfully:', report);
      onClose();
      router.refresh();
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err.message || 'Failed to create report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      interaction: '',
      infraction: '',
      intervention: '',
      notes: '',
      interventionNotes: '',
      interactionTimestamp: new Date().toISOString().slice(0, 16),
      resolved: false
    });
    setSelectedStudents([]);
    setError(null);
    setPage(1);
    setShowConfirmation(false);
  };

  const renderProgressDots = () => {
    // Show 3 dots if we're on intervention page or if it's an infraction
    const totalDots = (page === 3 || formData.interaction === 'INFRACTION') ? 3 : 2;
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalDots }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              page === index + 1 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
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

  const formatDisplayText = (text) => {
    if (!text) return '';
    // Convert to lowercase and replace underscores with spaces
    return text.toLowerCase()
      .replace(/_/g, ' ')
      // Capitalize first letter of each word
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatInfractionText = (code) => {
    const infractionMap = {
      'CUT_CLASS': 'Cut class or >15min late',
      'IMPROPER_LANGUAGE': 'Improper language or profanity',
      'FAILURE_TO_MEET_EXPECTATIONS': 'Failure to meet classroom expectations',
      'CELLPHONE': 'Cellphone',
      'LEAVING_WITHOUT_PERMISSION': 'Leaving class without permission',
      'MISUSE_OF_HALLPASS': 'Misuse of hallpass',
      'TARDINESS': 'Tardiness to class',
      'MINOR_VANDALISM': 'Minor vandalism',
      'NONE': 'None'
    };
    return infractionMap[code] || formatDisplayText(code);
  };

  const formatInterventionText = (code) => {
    return formatDisplayText(code);
  };

  const handleDelete = async () => {
    if (!report?.interactionID) return;
    
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteReport(report.interactionID);
        onClose();
      } catch (error) {
        setError(error.message || 'Failed to delete report');
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Debug useEffect for dropdown value
  useEffect(() => {
    if (page === 2) {
      console.log('--- DEBUG: Dropdown Render ---');
      console.log('formData.interaction:', formData.interaction, typeof formData.interaction);
      console.log('interactionTypes:', interactionTypes.map(t => t.name));
      interactionTypes.forEach(type => {
        console.log(`Option: ${type.name} (${typeof type.name}) === ${formData.interaction} (${typeof formData.interaction}) =>`, type.name === formData.interaction);
      });
    }
  }, [formData.interaction, interactionTypes, page]);

  if (!open) return null;
  if (studentsLoading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
  if (studentsError) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6">
        <div className="text-red-500">Error loading students: {studentsError}</div>
      </div>
    </div>
  );

  const filteredStudents = students.filter(student => {
    if (!student) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.studentNumber?.toLowerCase().includes(searchLower) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-auto p-6 z-10 flex flex-col gap-4 min-h-[28rem]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {report ? 'Edit Report' : 'New Report'}
          </h2>
          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete report"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
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
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : studentsError ? (
                <div className="text-red-500 text-center py-4">
                  Error loading students. Please try again.
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <label key={student._id} className="flex items-center gap-2 text-gray-700 text-sm hover:bg-gray-100 p-1.5 rounded">
                    <input
                      type="checkbox"
                      className="accent-blue-600 w-3.5 h-3.5"
                      checked={selectedStudents.includes(student)}
                      onChange={() => handleStudentSelect(student)}
                    />
                    <span className="flex-1">{student.firstName} {student.lastName}</span>
                    <span className="text-gray-500 text-xs">{student.studentNumber}</span>
                  </label>
                ))
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Report Details</h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-28 shrink-0 text-sm">Interaction</label>
                <div>
                  <select
                    name="interaction"
                    value={formData.interaction || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                    required
                  >
                    <option value="">Select an interaction type</option>
                    {interactionTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.interaction === 'INFRACTION' && (
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-28 shrink-0 text-sm">Infraction</label>
                  <select
                    name="infraction"
                    value={formData.infraction}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                    required
                  >
                    <option value="">Select an infraction type</option>
                    {infractionTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm">Notes</label>
                <textarea
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Add notes about the interaction..."
                  value={formData.notes}
                  onChange={(e) => handleChange({ target: { name: 'notes', value: e.target.value } })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm">Timestamp</label>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  value={formData.interactionTimestamp}
                  onChange={(e) => handleChange({ target: { name: 'interactionTimestamp', value: e.target.value } })}
                />
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={handleCancel}>Cancel</button>
                  <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handlePrevPage}>
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {renderProgressDots()}
                </div>
                <button 
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow text-sm"
                  onClick={handleNextPage}
                >
                  Next
                </button>
              </div>
            </form>
          </>
        )}

        {page === 3 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Intervention</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-28 shrink-0 text-sm">Intervention</label>
                <select
                  className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                  value={formData.intervention}
                  onChange={(e) => handleChange({ target: { name: 'intervention', value: e.target.value } })}
                >
                  <option value="NONE">No Intervention</option>
                  {interventionTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {formData.intervention && formData.intervention !== 'NONE' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 text-sm">Intervention Notes</label>
                  <textarea
                    className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                    placeholder="Add notes about the intervention..."
                    value={formData.interventionNotes}
                    onChange={(e) => handleChange({ target: { name: 'interventionNotes', value: e.target.value } })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={handleCancel}>Cancel</button>
                  <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handlePrevPage}>
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {renderProgressDots()}
                </div>
                <button 
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow text-sm"
                  onClick={() => setShowConfirmation(true)}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )}

        {formData.showInterventionPrompt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFormData(prev => ({ ...prev, showInterventionPrompt: false }))} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Intervention?</h3>
              <p className="text-gray-700 mb-6">Would you like to add an intervention for this report? This is optional but can be helpful for tracking student support.</p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, showInterventionPrompt: false }));
                    setShowConfirmation(true);
                  }}
                >
                  Skip
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, showInterventionPrompt: false }));
                    setPage(3);
                  }}
                >
                  Add Intervention
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmation(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Report</h3>
              <div className="space-y-2 mb-6">
                <p><strong className="text-gray-900">Interaction:</strong> <span className="text-gray-800">{formatDisplayText(formData.interaction)}</span></p>
                {formData.interaction === 'I' && (
                  <>
                    <p><strong className="text-gray-900">Infraction:</strong> <span className="text-gray-800">{formatInfractionText(formData.infraction)}</span></p>
                    <p><strong className="text-gray-900">Intervention:</strong> <span className="text-gray-800">{formatInterventionText(formData.intervention)}</span></p>
                    <p><strong className="text-gray-900">Intervention comments:</strong> <span className="text-gray-800">{formData.interventionNotes}</span></p>
                  </>
                )}
                <p><strong className="text-gray-900">Notes:</strong> <span className="text-gray-800">{formData.notes}</span></p>
                <p><strong className="text-gray-900">Timestamp:</strong> <span className="text-gray-800">{new Date(formData.interactionTimestamp).toLocaleString()}</span></p>
                <p><strong className="text-gray-900">Selected students:</strong> <span className="text-gray-800">{selectedStudents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}</span></p>
              </div>
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
                  className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium text-sm min-w-[120px] disabled:opacity-50"
                  onClick={() => handleConfirmSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Resolve'}
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
    </div>
  );
} 