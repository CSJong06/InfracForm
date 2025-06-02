'use client';

import { useReports } from '@/lib/hooks/useReports';
import { format } from 'date-fns';

const formatValue = (value) => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function InfractionHistory() {
  const { reports, loading, error } = useReports();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Infraction History</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Infraction History</h2>
        <div className="text-red-600">Error loading history: {error}</div>
      </div>
    );
  }

  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.entryTimestamp) - new Date(a.entryTimestamp)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Infraction History</h2>
      {sortedReports.length === 0 ? (
        <p className="text-gray-700">No reports found</p>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report) => (
            <div key={report._id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900">
                    {report.studentName || `Student #${report.studentNumber}`}
                  </span>
                  <span className="text-gray-600 text-sm ml-2">
                    {format(new Date(report.entryTimestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    report.interaction === 'INFRACTION' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {formatValue(report.interaction)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'RESOLVED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formatValue(report.status)}
                  </span>
                </div>
              </div>
              {report.interaction === 'INFRACTION' && (
                <div className="mb-2">
                  <span className="text-sm text-red-700 font-medium">{formatValue(report.infraction)}</span>
                  <span className="text-sm text-gray-700 ml-2">- {formatValue(report.intervention)}</span>
                </div>
              )}
              <p className="text-gray-800 text-sm">{report.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 