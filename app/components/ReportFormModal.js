import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTypes } from '@/lib/hooks/useTypes';
import { useStudents } from '@/lib/hooks/useStudents';
import { useReports } from '@/lib/hooks/useReports';
import { DisplayToCodeMap } from '@/lib/constants/interactionTypes';

export default function ReportFormModal({ open, onClose }) {
  const { interactionTypes, infractionTypes, interventionTypes, loading: typesLoading, error: typesError } = useTypes();
  const { students = [], loading: studentsLoading, error: studentsError } = useStudents();
  const { refresh: refreshReports } = useReports();
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    interaction: '',
    infraction: '',
    intervention: '',
    notes: '',
    interventionNotes: '',
    interactionTimestamp: new Date().toISOString().slice(0, 16),
    resolved: false
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSelect = (student) => {
    setSelectedStudents(prev =>
      prev.includes(student)
        ? prev.filter(s => s !== student)
        : [...prev, student]
    );
  };

  const handleNextPage = () => {
    if (page === 1) {
      if (selectedStudents.length === 0) {
        setError('Please select at least one student');
        return;
      }
      setPage(2);
    } else if (page === 2) {
      if (isInfraction) {
        setPage(3);
      } else {
        setShowConfirmation(true);
      }
    }
  };

  const handlePrevPage = () => {
    setPage(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInfraction && page === 2) {
      setPage(3);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = async (resolved) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!session?.email) {
        throw new Error('User session not found');
      }

      if (selectedStudents.length === 0) {
        throw new Error('No student selected');
      }

      // Validate required fields for infractions
      if (formData.interaction === 'Infraction') {
        if (!formData.infraction) {
          throw new Error('Infraction type is required for infraction reports');
        }
        if (!formData.intervention) {
          throw new Error('Intervention is required for infraction reports');
        }
      }

      const reportData = {
        studentNumber: selectedStudents[0].studentId,
        submitterEmail: session.email,
        interaction: formData.interaction,
        interactioncode: formData.interaction === 'Infraction' ? 'I' : 'S',
        notes: formData.notes,
        interactionTimestamp: new Date(formData.interactionTimestamp).toISOString(),
        status: resolved ? 'RESOLVED' : 'UNRESOLVED',
        entryTimestamp: new Date().toISOString()
      };

      if (formData.interaction === 'Infraction') {
        reportData.infraction = formData.infraction;
        reportData.intervention = formData.intervention;
        reportData.interventionNotes = formData.interventionNotes || '';
      } else {
        reportData.infraction = 'NONE';
        reportData.intervention = 'NONE';
      }

      console.log('Submitting report data:', JSON.stringify(reportData, null, 2));

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      await refreshReports();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report');
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

  const isInfraction = formData.interaction === 'Infraction';

  const renderProgressDots = () => {
    return (
      <div className="flex justify-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${page === 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
        <div className={`w-2 h-2 rounded-full ${page === 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
        {isInfraction && (
          <div className={`w-2 h-2 rounded-full ${page === 3 ? 'bg-blue-500' : 'bg-gray-300'}`} />
        )}
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
    const intervention = interventionTypes.find(t => t.name === code);
    return intervention ? intervention.displayName : formatDisplayText(code);
  };

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
            <div className="flex items-center justify-between mt-auto">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={onClose}>Cancel</button>
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
                  value={formData.interaction}
                  onChange={(e) => handleChange({ target: { name: 'interaction', value: e.target.value } })}
                >
                  <option value="">Select</option>
                  {Object.entries(DisplayToCodeMap).map(([display, code]) => (
                    <option key={code} value={display}>{display}</option>
                  ))}
                </select>
              </div>
              {isInfraction && (
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-28 shrink-0 text-sm">Infraction</label>
                  <select
                    className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                    value={formData.infraction}
                    onChange={(e) => handleChange({ target: { name: 'infraction', value: e.target.value } })}
                  >
                    <option value="">Select</option>
                    <option value="CUT_CLASS">cut class or &gt;15min late</option>
                    <option value="IMPROPER_LANGUAGE">improper language or profanity</option>
                    <option value="FAILURE_TO_MEET_EXPECTATIONS">failure to meet classroom expectations</option>
                    <option value="CELLPHONE">cellphone</option>
                    <option value="LEAVING_WITHOUT_PERMISSION">leaving class without permission</option>
                    <option value="MISUSE_OF_HALLPASS">misuse of hallpass</option>
                    <option value="TARDINESS">tardiness to class</option>
                    <option value="MINOR_VANDALISM">minor vandalism</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm">Notes</label>
                <textarea
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Add notes about the interaction/infraction..."
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
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={onClose}>Cancel</button>
                <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handlePrevPage}>
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {renderProgressDots()}
              </div>
              {isInfraction ? (
                <button 
                  className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" 
                  onClick={handleNextPage}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow text-sm"
                  onClick={() => setShowConfirmation(true)}
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
              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-28 shrink-0 text-sm">Intervention</label>
                <select
                  className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                  value={formData.intervention}
                  onChange={(e) => handleChange({ target: { name: 'intervention', value: e.target.value } })}
                >
                  <option value="">Select</option>
                  {interventionTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 text-sm">Intervention Comments</label>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    onClick={() => {
                      // AI generation functionality will be added later
                      console.log('Generate AI comment');
                    }}
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Generate
                  </button>
                </div>
                <textarea
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Add comments about the intervention..."
                  value={formData.interventionNotes}
                  onChange={(e) => handleChange({ target: { name: 'interventionNotes', value: e.target.value } })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm" onClick={onClose}>Cancel</button>
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
          </>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmation(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Report</h3>
              <div className="space-y-2 mb-6">
                <p><strong className="text-gray-900">Interaction:</strong> <span className="text-gray-800">{formatDisplayText(formData.interaction)}</span></p>
                {isInfraction && (
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