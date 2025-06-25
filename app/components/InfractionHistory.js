'use client'; // Mark component as client-side for Next.js

import { useRouter } from 'next/navigation'; // Import Next.js router for navigation
import { useReports } from '@/lib/hooks/useReports'; // Import custom hook for report operations
import ReportCard from './ReportCard'; // Import ReportCard component for displaying individual reports

const formatValue = (value) => { // Utility function to format enum values for display
  return value
    .split('_') // Split string by underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
    .join(' '); // Join words with spaces
};

export default function InfractionHistory({ reports: propReports }) { // Component for displaying report history with optional prop override
  const { reports: contextReports, loading, error } = useReports(); // Get reports data from context hook
  const reports = propReports || contextReports; // Use prop reports if provided, otherwise use context reports
  const router = useRouter(); // Get Next.js router instance for navigation

  const handleEdit = (reportId) => { // Event handler for edit button clicks
    router.push(`/reports/${reportId}/edit`); // Navigate to edit page for specific report
  };

  if (loading) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6" style={{ color: 'var(--primary-gray)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Report History</h2>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6" style={{ color: 'var(--primary-gray)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Report History</h2>
        </div>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Error loading reports: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/80 rounded-2xl shadow-md p-6" style={{ color: 'var(--primary-gray)' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Report History</h2>
      </div>
      {reports.length === 0 ? (
        <div className="text-gray-500">No reports found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard 
              key={report._id} 
              report={report} 
              onEdit={() => handleEdit(report._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
} 