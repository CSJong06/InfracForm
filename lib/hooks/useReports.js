'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

// Create a context for reports
const REPORTS_QUERY_KEY = 'reports';

async function fetchReportsWithStudents(status = null) {
  const url = status ? `/api/reports?status=${status}` : '/api/reports';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  const reports = await response.json();
  
  // Get unique student numbers
  const studentNumbers = [...new Set(reports.map(report => report.studentNumber))];
  
  // Fetch all students in one request
  const studentsResponse = await fetch('/api/students/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ studentNumbers }),
  });
  
  if (!studentsResponse.ok) {
    throw new Error('Failed to fetch students');
  }
  
  const students = await studentsResponse.json();
  const studentMap = new Map(students.map(student => [student.studentId, student]));
  
  // Combine reports with student information
  return reports.map(report => ({
    ...report,
    studentName: studentMap.get(report.studentNumber) 
      ? `${studentMap.get(report.studentNumber).firstName} ${studentMap.get(report.studentNumber).lastName}`
      : null
  }));
}

export function useReports(status = null) {
  const queryClient = useQueryClient();
  
  const { data: reports = [], isLoading, error, refetch } = useQuery({
    queryKey: [REPORTS_QUERY_KEY, status],
    queryFn: () => fetchReportsWithStudents(status),
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    cacheTime: 1000 * 60 * 5, // Keep data in cache for 5 minutes
  });

  // Filter reports by status if provided
  const filteredReports = status 
    ? reports.filter(report => report.status === status)
    : reports;

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete report');
      }

      // Invalidate and refetch reports
      await queryClient.invalidateQueries([REPORTS_QUERY_KEY]);
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  };

  return {
    reports: filteredReports,
    loading: isLoading,
    error: error?.message,
    refresh: refetch,
    deleteReport
  };
}

// Provider component is no longer needed as React Query handles the caching
export function ReportsProvider({ children }) {
  return children;
} 