"use client";
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useReports } from '@/lib/hooks/useReports';
import FloatingActionButton from '../components/FloatingActionButton';
import ReportFormModal from '../components/ReportFormModal';
import ReportCard from '../components/ReportCard';

export default function ResolvedPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { reports, loading, error } = useReports('RESOLVED');

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            Error loading reports: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
        <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Resolved Reports</h2>
          {reports.length === 0 ? (
            <div className="text-gray-500">No resolved reports found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>
          )}
        </section>
      </main>
      <div onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8">
        <FloatingActionButton />
      </div>
      <ReportFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
} 