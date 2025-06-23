'use client'; // Mark this file as a client-side component

import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import React Query hooks for data fetching and caching

// Create a context for reports
const REPORTS_QUERY_KEY = 'reports'; // Define the query key for caching reports data

async function fetchReportsWithStudents(status = null) { // Function to fetch reports and enrich them with student data
  const url = status ? `/api/reports?status=${status}` : '/api/reports'; // Build URL with optional status filter
  const response = await fetch(url); // Make HTTP request to fetch reports
  if (!response.ok) { // Check if the response was successful
    throw new Error('Failed to fetch reports'); // Throw error if request failed
  }
  const reports = await response.json(); // Parse the JSON response to get reports array
  
  // Get unique student numbers
  const studentNumbers = [...new Set(reports.map(report => report.studentNumber))]; // Extract unique student numbers from reports
  
  // Fetch all students in one request
  const studentsResponse = await fetch('/api/students/bulk', { // Make HTTP request to fetch student data
    method: 'POST', // Use POST method for bulk student lookup
    headers: {
      'Content-Type': 'application/json', // Set content type to JSON
    },
    body: JSON.stringify({ studentNumbers }), // Send student numbers in request body
  });
  
  if (!studentsResponse.ok) { // Check if the student response was successful
    throw new Error('Failed to fetch students'); // Throw error if student request failed
  }
  
  const students = await studentsResponse.json(); // Parse the JSON response to get students array
  const studentMap = new Map(students.map(student => [student.studentId, student])); // Create a map for quick student lookup
  
  // Combine reports with student information
  return reports.map(report => ({ // Transform each report to include student name
    ...report, // Spread all existing report properties to maintain original data
    studentName: studentMap.get(report.studentNumber) // Look up student by student number in the map
      ? `${studentMap.get(report.studentNumber).firstName} ${studentMap.get(report.studentNumber).lastName}` // Create full name by concatenating first and last name
      : null // Set student name to null if student not found in database
  }));
}

export function useReports(status = null) { // Custom hook that accepts optional status filter parameter
  const queryClient = useQueryClient(); // Get React Query client for cache invalidation
  
  const { data: reports = [], isLoading, error, refetch } = useQuery({ // Use React Query for data fetching with caching
    queryKey: [REPORTS_QUERY_KEY, status], // Cache key includes status for separate caching of filtered data
    queryFn: () => fetchReportsWithStudents(status), // Function to fetch and transform data
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes to avoid unnecessary refetches
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes even when not actively used
    refetchOnWindowFocus: false, // Don't refetch when window regains focus to avoid excessive requests
    refetchOnMount: false, // Don't refetch when component mounts if data is still fresh
  });

  // Filter reports by status if provided
  const filteredReports = status // Apply additional status filtering if status parameter is provided
    ? reports.filter(report => report.status === status) // Filter reports to match the specified status
    : reports; // Return all reports if no status filter is applied

  const deleteReport = async (reportId) => { // Function to delete a report by ID
    try {
      const response = await fetch(`/api/reports/${reportId}`, { // Send DELETE request to reports API
        method: 'DELETE', // Use DELETE HTTP method for report removal
      });

      if (!response.ok) { // Check if the delete request was successful
        const error = await response.json(); // Parse error response from server
        throw new Error(error.message || 'Failed to delete report'); // Throw error with server message or default
      }

      // Invalidate and refetch reports
      await queryClient.invalidateQueries([REPORTS_QUERY_KEY]); // Clear cache and trigger refetch of reports data
      return true; // Return success indicator
    } catch (error) { // Catch any errors during delete operation
      console.error('Error deleting report:', error); // Log error for debugging
      throw error; // Re-throw error for component to handle
    }
  };

  const updateReport = async (reportId, updates) => { // Function to update a report with new data
    try {
      const response = await fetch(`/api/reports/${reportId}`, { // Send PATCH request to reports API
        method: 'PATCH', // Use PATCH HTTP method for partial updates
        headers: {
          'Content-Type': 'application/json', // Specify JSON content type
        },
        body: JSON.stringify(updates), // Send update data as JSON string
      });

      if (!response.ok) { // Check if the update request was successful
        const error = await response.json(); // Parse error response from server
        throw new Error(error.message || 'Failed to update report'); // Throw error with server message or default
      }

      // Invalidate and refetch reports
      await queryClient.invalidateQueries([REPORTS_QUERY_KEY]); // Clear cache and trigger refetch of reports data
      return true; // Return success indicator
    } catch (error) { // Catch any errors during update operation
      console.error('Error updating report:', error); // Log error for debugging
      throw error; // Re-throw error for component to handle
    }
  };

  return {
    reports: filteredReports,
    loading: isLoading,
    error: error?.message,
    refresh: refetch,
    deleteReport,
    updateReport
  };
}

// Provider component is no longer needed as React Query handles the caching
export function ReportsProvider({ children }) {
  return children;
} 