'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Create a context for reports
const ReportsContext = createContext(null);

// Provider component
export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (status = null) => {
    try {
      setLoading(true);
      const url = status ? `/api/reports?status=${status}` : '/api/reports';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      
      // Fetch student information for each report
      const reportsWithStudents = await Promise.all(
        data.map(async (report) => {
          try {
            const studentResponse = await fetch(`/api/students/${report.studentNumber}`);
            if (studentResponse.ok) {
              const student = await studentResponse.json();
              return {
                ...report,
                studentName: student ? `${student.firstName} ${student.lastName}` : null
              };
            }
            return report;
          } catch (err) {
            console.error('Error fetching student:', err);
            return report;
          }
        })
      );

      setReports(reportsWithStudents);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <ReportsContext.Provider value={{ reports, loading, error, refresh: fetchReports }}>
      {children}
    </ReportsContext.Provider>
  );
}

// Hook to use reports
export function useReports(status = null) {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }

  // Filter reports by status if provided
  const filteredReports = status 
    ? context.reports.filter(report => report.status === status)
    : context.reports;

  return {
    reports: filteredReports,
    loading: context.loading,
    error: context.error,
    refresh: context.refresh
  };
} 