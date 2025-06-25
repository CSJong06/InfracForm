import { useState, useRef, useEffect } from 'react'; // Import React hooks for state management and side effects
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, SparklesIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline'; // Import UI icons for form elements
import { useTypes } from '@/lib/hooks/useTypes'; // Import custom hook for form type data (interactions, infractions, interventions)
import { useStudents } from '@/lib/hooks/useStudents'; // Import custom hook for student data management
import { useReports } from '@/lib/hooks/useReports'; // Import custom hook for report operations
import { DisplayToCodeMap, CodeToDisplayMap } from '@/lib/constants/interactionTypes'; // Import mapping constants for interaction type display
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation

export default function ReportFormModal({ open, onClose, report = null }) { // Main form modal component with props for visibility, close handler, and optional report for editing
  const { interactionTypes, infractionTypes, interventionTypes, loading: typesLoading, error: typesError } = useTypes(); // Get form type data with loading and error states
  const { students = [], loading: studentsLoading, error: studentsError } = useStudents(); // Get student data with loading and error states
  const { refresh: refreshReports, deleteReport } = useReports(); // Get report operations for refreshing and deleting
  const router = useRouter(); // Get Next.js router instance for navigation
  const [page, setPage] = useState(1); // Track current form page in multi-step form
  const [formData, setFormData] = useState({ // Main form state object with all form fields
    interaction: '', // Selected interaction type (e.g., 'INFRACTION', 'SHOUT_OUT')
    infraction: '', // Selected infraction type (only for infraction interactions)
    intervention: '', // Selected intervention type
    notes: '', // General notes about the interaction
    interventionNotes: '', // Specific notes about the intervention
    interactionTimestamp: new Date().toISOString().slice(0, 16), // When the interaction occurred (datetime-local format)
    resolved: false, // Whether the report should be marked as resolved
    showInterventionPrompt: false // Whether to show intervention selection prompt
  });
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of selected students for the report
  const [showInterventionDropdown, setShowInterventionDropdown] = useState(false); // Control intervention dropdown visibility
  const [checkedInterventions, setCheckedInterventions] = useState([]); // Track which interventions are selected
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering students
  const [showConfirmation, setShowConfirmation] = useState(false); // Control confirmation dialog visibility
  const dropdownRef = useRef(null); // Reference to dropdown element for click-outside detection
  const [additionalComments, setAdditionalComments] = useState(''); // Additional comments field
  const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state
  const [error, setError] = useState(null); // Store form validation and submission errors
  const [session, setSession] = useState(null); // Store current user session data
  const [summary, setSummary] = useState(null); // Store AI-generated summary
  const [summaryMessage, setSummaryMessage] = useState(''); // Message for AI summary generation
  const [isLoading, setIsLoading] = useState(false); // Track AI loading state
  const [aiResponse, setAiResponse] = useState(''); // Store AI response for summary generation

  useEffect(() => {
    // Fetch session data when component mounts
    const fetchSession = async () => { // Async function to fetch current user session data
      try {
        const response = await fetch('/api/auth/session'); // Make API request to get session information
        if (response.ok) { // Check if the session request was successful
          const data = await response.json(); // Parse the session data from JSON response
          setSession(data); // Store session data in component state
        }
      } catch (err) { // Catch any errors during session fetching
        console.error('Failed to fetch session:', err); // Log error for debugging
      }
    };
    fetchSession(); // Execute the session fetching function
  }, []); // Empty dependency array means this effect runs only once on mount

  // Initialize form data when editing an existing report
  useEffect(() => {
    // Only initialize if editing and formData.interaction is not set
    if ( // Check if we're editing an existing report and have the necessary data
      report && // Check if report prop exists (editing mode)
      !typesLoading && // Check if form types have finished loading
      interactionTypes.length > 0 && // Check if interaction types are available
      (!formData.interaction || formData.interaction === '') // Check if form hasn't been initialized yet
    ) {
      const interactionType = interactionTypes.find(t => t.name === report.interaction); // Find matching interaction type from loaded types
      const newFormData = { // Create new form data object with report values
        interaction: interactionType ? interactionType.name : '', // Set interaction type from report or empty string
        infraction: report.infraction || '', // Set infraction type from report or empty string
        intervention: report.intervention || '', // Set intervention type from report or empty string
        notes: report.notes || '', // Set notes from report or empty string
        interventionNotes: report.interventionNotes || '', // Set intervention notes from report or empty string
        interactionTimestamp: report.interactionTimestamp ? new Date(report.interactionTimestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16), // Convert timestamp to datetime-local format
        resolved: report.status === 'RESOLVED', // Set resolved flag based on report status
        showInterventionPrompt: false // Reset intervention prompt visibility
      };
      setFormData(newFormData); // Update form state with report data
      if (report.studentNumber) { // Check if report has a student number
        const student = students.find(s => s.studentId === report.studentNumber); // Find the student in the students array
        if (student) { // Check if student was found
          setSelectedStudents([student]); // Set the found student as selected
        }
      }
      if (report.intervention && report.intervention !== 'NONE') { // Check if report has a non-NONE intervention
        setCheckedInterventions([report.intervention]); // Set the intervention as checked
      }
    }
  }, [report, students, interactionTypes, typesLoading]); // Dependencies that trigger this effect when they change

  useEffect(() => {
    if (formData.interaction === 'INFRACTION') { // Check if selected interaction is an infraction
      setFormData(prev => ({ // Update form data to set default values for infractions
        ...prev, // Spread existing form data
        infraction: prev.infraction || 'NONE', // Set infraction to current value or 'NONE' as default
        intervention: prev.intervention || 'NONE' // Set intervention to current value or 'NONE' as default
      }));
    } else { // If interaction is not an infraction (positive interaction)
      setFormData(prev => ({ // Update form data to clear infraction-related fields
        ...prev, // Spread existing form data
        infraction: 'NONE', // Set infraction to 'NONE' for positive interactions
        intervention: 'NONE' // Set intervention to 'NONE' for positive interactions
      }));
    }
  }, [formData.interaction]); // Trigger effect when interaction type changes

  const handleChange = (e) => { // Handle form input changes for all form fields
    const { name, value } = e.target; // Extract field name and value from the event
    console.log('handleChange - name:', name, 'value:', value); // Debug log to track form changes
    setFormData(prev => { // Update form data state
      const newData = { // Create new form data object
        ...prev, // Spread existing form data
        [name]: value // Update the specific field with new value
      };
      console.log('Updated formData:', newData); // Debug log to show updated form data
      return newData; // Return the updated form data
    });
  };

  const handleStudentSelect = (student) => { // Handle student selection/deselection in multi-select
    setSelectedStudents(prev => // Update selected students array
      prev.includes(student) // Check if student is already selected
        ? prev.filter(s => s !== student) // Remove student if already selected (toggle off)
        : [...prev, student] // Add student if not selected (toggle on)
    );
  };

  const handleNextPage = () => { // Handle navigation to next page in multi-step form
    if (page === 1 && selectedStudents.length === 0) { // Check if on page 1 and no students selected
      setError('Please select at least one student'); // Set error message for validation
      return; // Stop navigation if validation fails
    }
    setError(null); // Clear any existing errors
    if (page === 2) { // Check if currently on page 2 (interaction details)
      if (formData.interaction === 'INFRACTION') { // Check if selected interaction is an infraction
        // If it's an infraction, go directly to intervention page
        setPage(3); // Skip intervention prompt and go to intervention page
      } else { // If interaction is not an infraction (positive interaction)
        // For non-infractions, show the intervention prompt
        setFormData(prev => ({ ...prev, showInterventionPrompt: true })); // Show intervention prompt for positive interactions
      }
    } else { // If not on page 2, proceed to next page normally
      setPage(page + 1); // Increment page number
    }
  };

  const handlePrevPage = () => { // Handle navigation to previous page in multi-step form
    setPage(prev => prev - 1); // Decrement page number
  };

  const handleSubmit = (e) => { // Handle form submission (pre-confirmation)
    e.preventDefault(); // Prevent default form submission behavior
    setFormData(prev => ({ ...prev, showInterventionPrompt: true })); // Show intervention prompt before final submission
  };

  const handleConfirmSubmit = async (isResolved) => { // Handle final form submission with resolution status
    try {
      setError(null); // Clear any existing errors
      setIsSubmitting(true); // Set submitting state to show loading indicator

      if (!selectedStudents || selectedStudents.length === 0) { // Validate that at least one student is selected
        throw new Error('No student selected'); // Throw error if no student selected
      }

      // Get the selected interaction type
      const selectedInteraction = interactionTypes.find(t => t.name === formData.interaction); // Find the selected interaction type object
      if (!selectedInteraction) { // Check if interaction type was found
        throw new Error('Invalid interaction type'); // Throw error if interaction type is invalid
      }

      // Prepare the report data
      const reportData = { // Create report data object for API submission
        studentNumber: selectedStudents[0].studentId, // Use first selected student's ID
        submitterEmail: session.email, // Use current user's email from session
        interaction: selectedInteraction.name, // Set interaction type name
        interactioncode: selectedInteraction.name, // Set interaction code (duplicate for consistency)
        notes: formData.notes, // Set general notes about the interaction
        interactionTimestamp: formData.interactionTimestamp, // Set when the interaction occurred
        status: isResolved ? 'RESOLVED' : 'UNRESOLVED', // Set status based on resolution parameter
        entryTimestamp: new Date().toISOString(), // Set current timestamp as entry time
        infraction: selectedInteraction.name === 'INFRACTION' ? (formData.infraction || 'NONE') : 'NONE', // Set infraction type only for infractions
        intervention: formData.intervention || 'NONE', // Set intervention type or default to 'NONE'
        interventionNotes: formData.interventionNotes || '' // Set intervention-specific notes
      };

      console.log('Debug - Final Report Data:', reportData); // Debug log to show final report data

      const response = await fetch('/api/reports', { // Make API request to create report
        method: 'POST', // Use POST method for report creation
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify(reportData), // Send report data as JSON string
      });

      if (!response.ok) { // Check if the API request was successful
        const errorData = await response.json(); // Parse error response from server
        console.error('Server response error:', errorData); // Log server error for debugging
        throw new Error(errorData.error || 'Failed to create report'); // Throw error with server message or default
      }

      const report = await response.json(); // Parse successful response to get created report data
      console.log('Report created successfully:', report); // Log successful report creation
      resetForm(); // Reset form to initial state after successful submission
      onClose(); // Close the modal after successful submission
      router.refresh(); // Refresh the page to show updated data
    } catch (err) { // Catch any errors during report creation
      console.error('Error creating report:', err); // Log error for debugging
      setError(err.message || 'Failed to create report. Please try again.'); // Set error message for user display
    } finally { // Always execute this block regardless of success or failure
      setIsSubmitting(false); // Reset submitting state to hide loading indicator
    }
  };

  const resetForm = () => { // Reset all form state to initial values
    setFormData({ // Reset main form data to default values
      interaction: '', // Clear interaction type selection
      infraction: '', // Clear infraction type selection
      intervention: '', // Clear intervention type selection
      notes: '', // Clear general notes
      interventionNotes: '', // Clear intervention-specific notes
      interactionTimestamp: new Date().toISOString().slice(0, 16), // Reset to current date/time
      resolved: false // Reset resolved status to false
    });
    setSelectedStudents([]); // Clear selected students array
    setError(null); // Clear any error messages
    setPage(1); // Reset to first page of multi-step form
    setShowConfirmation(false); // Hide confirmation dialog
    setSummary(null); // Clear AI-generated summary
  };

  const renderProgressDots = () => {
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
    if (!showInterventionDropdown) return; // Exit early if dropdown is not shown
    function handleClickOutside(event) { // Function to handle clicks outside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { // Check if click is outside dropdown element
        setShowInterventionDropdown(false); // Close dropdown if click is outside
      }
    }
    document.addEventListener('mousedown', handleClickOutside); // Add click listener to document
    return () => document.removeEventListener('mousedown', handleClickOutside); // Clean up listener on unmount
  }, [showInterventionDropdown]); // Re-run effect when dropdown visibility changes

  const formatDisplayText = (text) => { // Format text for display by converting codes to readable text
    if (!text) return ''; // Return empty string if text is falsy
    // Convert to lowercase and replace underscores with spaces
    return text.toLowerCase() // Convert text to lowercase
      .replace(/_/g, ' ') // Replace underscores with spaces
      // Capitalize first letter of each word
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  const formatInfractionText = (code) => { // Format infraction codes to readable display text
    const infractionMap = { // Map of infraction codes to display text
      'CUT_CLASS': 'Cut class or >15min late', // Map cut class code to display text
      'IMPROPER_LANGUAGE': 'Improper language or profanity', // Map improper language code to display text
      'FAILURE_TO_MEET_EXPECTATIONS': 'Failure to meet classroom expectations', // Map expectations code to display text
      'CELLPHONE': 'Cellphone', // Map cellphone code to display text
      'LEAVING_WITHOUT_PERMISSION': 'Leaving class without permission', // Map leaving code to display text
      'MISUSE_OF_HALLPASS': 'Misuse of hallpass', // Map hallpass code to display text
      'TARDINESS': 'Tardiness to class', // Map tardiness code to display text
      'MINOR_VANDALISM': 'Minor vandalism', // Map vandalism code to display text
      'NONE': 'None' // Map none code to display text
    };
    return infractionMap[code] || formatDisplayText(code); // Return mapped text or fallback to generic formatting
  };

  const formatInterventionText = (code) => { // Format intervention codes to readable display text
    return formatDisplayText(code); // Use generic formatting for intervention codes
  };

  const handleDelete = async () => { // Handle report deletion with confirmation
    if (!report?.interactionID) return; // Exit if no report ID available for deletion
    
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) { // Show confirmation dialog
      try {
        await deleteReport(report.interactionID); // Call delete function with report ID
        onClose(); // Close modal after successful deletion
      } catch (error) { // Catch any errors during deletion
        setError(error.message || 'Failed to delete report'); // Set error message for user display
      }
    }
  };

  const handleCancel = () => { // Handle form cancellation
    resetForm(); // Reset form to initial state
    onClose(); // Close the modal
  };

  const handleGenerate = async () => { // Handle AI report generation
    if (selectedStudents.length === 0) { // Check if a student is selected
      setError('Please select a student first.'); // Set error if no student selected
      return; // Exit early if no student selected
    }
    setIsLoading(true); // Set loading state for AI generation
    const studentId = selectedStudents[0].studentId; // Get the first selected student's ID
    try {
      // First get the student summary
      const response = await fetch(`/api/students/${studentId}/summary`); // Fetch student summary from API
      if (!response.ok) { // Check if summary request was successful
        throw new Error('Failed to fetch student summary'); // Throw error if summary fetch failed
      }
      const data = await response.json(); // Parse summary data from response
      setSummary(data); // Store summary data in component state
      const message = `You're writing a report about ${data.studentName}. This student has ${data.totalReports} reports made about them, and ${data.infractionCount} of them are infractions.${data.infractionCount > 0 ? ` These infractions consist of ${data.infractionTypes.join(', ')}.` : ''}`; // Create context message for AI
      setSummaryMessage(message); // Store context message in component state

      // Now send to AI for processing
      const aiResponse = await fetch('/api/ai/process', { // Send context to AI for processing
        method: 'POST', // Use POST method for AI processing
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify({ message }), // Send context message to AI
      });

      if (!aiResponse.ok) { // Check if AI request was successful
        throw new Error('Failed to get AI response'); // Throw error if AI request failed
      }

      const aiData = await aiResponse.json(); // Parse AI response data
      setAiResponse(aiData.response); // Store AI response in component state
    } catch (err) { // Catch any errors during AI generation
      setError(err.message); // Set error message for user display
    } finally { // Always execute this block
      setIsLoading(false); // Reset loading state regardless of success or failure
    }
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-auto p-6 z-10 flex flex-col gap-4 max-h-[90vh] min-h-[600px] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-4">
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
                        {formatDisplayText(type.displayName)}
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
                <div className="flex items-center gap-2">
                  <button 
                    className="w-fit text-white px-6 py-2 rounded font-semibold shadow text-sm flex items-center gap-2"
                    style={{ background: 'var(--primary-green)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--accent-green)'}
                    onMouseOut={e => e.currentTarget.style.background = 'var(--primary-green)'}
                    onClick={handleGenerate}
                  >
                    <SparklesIcon className="w-5 h-5" />
                    Generate
                  </button>
                  <button 
                    className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow text-sm"
                    onClick={() => setShowConfirmation(true)}
                  >
                    Submit
                  </button>
                </div>
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
                  className="px-6 py-2 rounded text-white font-medium text-sm min-w-[120px] disabled:opacity-50"
                  style={{ background: 'var(--primary-green)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--accent-green)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--primary-green)'}
                  onClick={() => handleConfirmSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Resolve'}
                </button>
                <button
                  className="px-6 py-2 rounded text-white font-medium text-sm min-w-[120px] disabled:opacity-50"
                  style={{ background: 'var(--primary-orange)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--accent-orange)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--primary-orange)'}
                  onClick={() => handleConfirmSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : summary && (
          <div className="mt-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
            <div className="p-4 bg-gray-100 rounded-lg h-full">
              <p className="text-gray-800">{summaryMessage}</p>
              {aiResponse && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">AI Analysis</h4>
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 