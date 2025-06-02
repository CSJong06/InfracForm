'use client';

import { useReports } from '@/lib/hooks/useReports';
import { format } from 'date-fns';

const formatValue = (value) => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function RecentInfractions() {
  const { reports, loading, error } = useReports('UNRESOLVED');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Infractions</h2>
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
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Infractions</h2>
        <div className="text-red-600">Error loading infractions: {error}</div>
      </div>
    );
  }

  const infractions = reports.filter(report => report.interaction === 'INFRACTION');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Infractions</h2>
      {infractions.length === 0 ? (
        <p className="text-gray-700">No recent infractions</p>
      ) : (
        <div className="space-y-4">
          {infractions.map((report) => (
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
                <span className="text-sm text-red-700 font-medium">{formatValue(report.infraction)}</span>
              </div>
              <p className="text-gray-800 text-sm">{report.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 