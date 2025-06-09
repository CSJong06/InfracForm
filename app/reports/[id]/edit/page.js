'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTypes } from '@/lib/hooks/useTypes';
import { useStudents } from '@/lib/hooks/useStudents';
import { useReports } from '@/lib/hooks/useReports';
import { DisplayToCodeMap } from '@/lib/constants/interactionTypes';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function EditReportPage({ params }) {
  const router = useRouter();
  const reportId = use(params).id;
  const { interactionTypes, infractionTypes, interventionTypes } = useTypes();
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    studentId: '',
    interaction: '',
    infraction: '',
    intervention: '',
    notes: '',
    interventionNotes: '',
    interactionTimestamp: new Date().toISOString().slice(0, 16),
    resolved: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { refresh: refreshReports } = useReports();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        const data = await response.json();
        console.log('Fetched report data:', JSON.stringify(data, null, 2));
        setReport(data);

        // Initialize form data with report data
        const formData = {
          studentId: data.studentNumber,
          interaction: data.interaction,
          infraction: data.infraction || '',
          intervention: data.intervention || '',
          notes: data.notes || '',
          interventionNotes: data.interventionNotes || '',
          interactionTimestamp: new Date(data.interactionTimestamp).toISOString().slice(0, 16),
          resolved: data.status === 'RESOLVED'
        };
        console.log('Initialized form data:', JSON.stringify(formData, null, 2));
        setFormData(formData);

        // Fetch student data
        if (data.studentNumber) {
          const studentResponse = await fetch(`/api/students/${data.studentNumber}`);
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            console.log('Fetched student data:', JSON.stringify(studentData, null, 2));
            setSelectedStudent(studentData);
          }
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      studentId: student.studentId
    }));
  };

  const filteredStudents = students?.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields for infractions
      if (formData.interaction === 'Infraction') {
        if (!formData.infraction) {
          throw new Error('Infraction type is required for infraction reports');
        }
        if (!formData.intervention) {
          throw new Error('Intervention is required for infraction reports');
        }
      }

      const updateData = {
        studentNumber: selectedStudent.studentId,
        interaction: formData.interaction,
        interactioncode: formData.interaction === 'Infraction' ? 'I' : 'S',
        notes: formData.notes,
        interactionTimestamp: new Date(formData.interactionTimestamp).toISOString(),
        status: formData.resolved ? 'RESOLVED' : 'UNRESOLVED'
      };

      // Only include infraction and intervention data if it's an infraction
      if (formData.interaction === 'Infraction') {
        updateData.infraction = formData.infraction;
        updateData.intervention = formData.intervention;
        updateData.interventionNotes = formData.interventionNotes || '';
      } else {
        updateData.infraction = 'NONE';
        updateData.intervention = 'NONE';
      }

      console.log('Submitting update data:', JSON.stringify(updateData, null, 2));

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update report');
      }

      await refreshReports();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating report:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Report</h1>
            <p className="text-gray-700 mt-2">Update the details of this report</p>
          </div>

          {/* Page 1: Student Selection */}
          {currentPage === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Search Students
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-900"
                    placeholder="Search by name or ID..."
                  />
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : studentsError ? (
                  <div className="text-red-600 text-center py-4">
                    Error loading students. Please try again.
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-gray-700 text-center py-4">
                    {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <label key={student._id} className="flex items-center gap-2 text-gray-900 text-sm hover:bg-gray-100 p-1.5 rounded">
                      <input
                        type="checkbox"
                        className="accent-blue-600 w-3.5 h-3.5"
                        checked={selectedStudent?.studentId === student.studentId}
                        onChange={() => handleStudentSelect(student)}
                      />
                      <span className="flex-1">{student.firstName} {student.lastName}</span>
                      <span className="text-gray-700 text-xs">{student.studentId}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Page 2: Interaction and Intervention */}
          {currentPage === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <label className="text-gray-900 w-28 shrink-0 text-sm font-medium">Interaction</label>
                <select
                  className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                  value={formData.interaction}
                  onChange={(e) => setFormData(prev => ({ ...prev, interaction: e.target.value }))}
                >
                  <option value="">Select</option>
                  {Object.entries(DisplayToCodeMap).map(([display, code]) => (
                    <option key={code} value={display}>{display}</option>
                  ))}
                </select>
              </div>

              {formData.interaction === 'Infraction' && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-900 w-28 shrink-0 text-sm font-medium">Infraction</label>
                    <select
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                      value={formData.infraction}
                      onChange={(e) => setFormData(prev => ({ ...prev, infraction: e.target.value }))}
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

                  <div className="flex items-center gap-3">
                    <label className="text-gray-900 w-28 shrink-0 text-sm font-medium">Intervention</label>
                    <select
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 text-sm"
                      value={formData.intervention}
                      onChange={(e) => setFormData(prev => ({ ...prev, intervention: e.target.value }))}
                    >
                      <option value="">Select</option>
                      {interventionTypes?.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-900 text-sm font-medium">Notes</label>
                <textarea
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Add notes about the interaction/infraction..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              {formData.interaction === 'Infraction' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-900 text-sm font-medium">Intervention Notes</label>
                  <textarea
                    className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                    placeholder="Add notes about the intervention..."
                    value={formData.interventionNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, interventionNotes: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-900 text-sm font-medium">Timestamp</label>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  value={formData.interactionTimestamp}
                  onChange={(e) => setFormData(prev => ({ ...prev, interactionTimestamp: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-900 text-sm font-medium">Status</label>
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded font-medium text-sm border transition-colors duration-150 ${formData.resolved ? 'bg-gray-100 text-gray-900 border-gray-400' : 'bg-green-600 text-white border-green-600 hover:bg-green-700'}`}
                    onClick={() => setFormData(prev => ({ ...prev, resolved: false }))}
                  >
                    Unresolved
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded font-medium text-sm border transition-colors duration-150 ${formData.resolved ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-gray-100 text-gray-900 border-gray-400'}`}
                    onClick={() => setFormData(prev => ({ ...prev, resolved: true }))}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentPage > 1 ? (
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                if (currentPage < 2) {
                  setCurrentPage(prev => prev + 1);
                } else {
                  handleConfirmSubmit();
                }
              }}
              disabled={isSubmitting || (currentPage === 1 && !formData.studentId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : currentPage === 2 ? 'Save Changes' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 