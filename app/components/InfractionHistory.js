'use client';

import { useReports } from '@/lib/hooks/useReports';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const formatValue = (value) => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function InfractionHistory() {
  const { reports, loading, error } = useReports();
  const router = useRouter();

  const handleEdit = (reportId) => {
    router.push(`/reports/${reportId}/edit`);
  };

  if (loading) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Report History</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-36 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Report History</h2>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Error loading reports: {error}
        </div>
      </section>
    );
  }

  // Show all reports in the history section
  const historyReports = reports;

  return (
    <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Report History</h2>
      {historyReports.length === 0 ? (
        <div className="text-gray-500">No report history found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {historyReports.map((report) => (
            <div 
              key={report._id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden"
            >
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">
                      {report.studentName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {report.interaction === 'INFRACTION' ? 'Infraction' : 'Shout-out'}
                    </p>
                  </div>
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                    report.status === 'RESOLVED' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <p className="text-gray-600 text-xs line-clamp-2">{report.notes}</p>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{report.reportedBy}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(report._id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Edit
                      </button>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 