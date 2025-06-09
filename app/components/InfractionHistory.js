'use client';

import { useRouter } from 'next/navigation';
import { useReports } from '@/lib/hooks/useReports';
import ReportCard from './ReportCard';

const formatValue = (value) => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function InfractionHistory({ reports: propReports, onImportClick }) {
  const { reports: contextReports, loading, error } = useReports();
  const reports = propReports || contextReports;
  const router = useRouter();

  const handleEdit = (reportId) => {
    router.push(`/reports/${reportId}/edit`);
  };

  if (loading) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Report History</h2>
          <button
            onClick={onImportClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Import Reports
          </button>
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
      <section className="bg-white/80 rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Report History</h2>
          <button
            onClick={onImportClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Import Reports
          </button>
        </div>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Error loading reports: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/80 rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Report History</h2>
        <button
          onClick={onImportClick}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Import Reports
        </button>
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