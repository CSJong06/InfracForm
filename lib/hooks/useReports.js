import { useState, useEffect } from 'react';

export function useReports(status = null) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
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
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [status]);

  return { reports, loading, error };
} 