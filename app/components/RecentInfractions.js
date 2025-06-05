'use client';

import { useReports } from '@/lib/hooks/useReports';
import ReportCard from './ReportCard';

export default function RecentInfractions({ reports: propReports }) {
  const { reports: contextReports, loading, error } = useReports();
  const reports = propReports || contextReports;

  if (loading) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Recent Reports</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Recent Reports</h2>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Error loading reports: {error}
        </div>
      </section>
    );
  }

  // Get the 5 most recent reports
  const recentReports = reports.slice(0, 5);

  return (
    <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Recent Reports</h2>
      {recentReports.length === 0 ? (
        <div className="text-gray-500">No recent reports found.</div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {recentReports.map((report) => (
            <ReportCard key={report._id} report={report} variant="compact" />
          ))}
        </div>
      )}
    </section>
  );
} 