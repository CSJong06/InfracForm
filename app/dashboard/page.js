"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RecentInfractions from '../components/RecentInfractions';
import InfractionHistory from '../components/InfractionHistory';
import FloatingActionButton from '../components/FloatingActionButton';
import ReportFormModal from '../components/ReportFormModal';
import { useReports } from '@/lib/hooks/useReports';

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { refresh } = useReports();

  // Refresh reports when modal is closed
  useEffect(() => {
    if (!modalOpen) {
      refresh();
    }
  }, [modalOpen, refresh]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-10 space-y-10 pb-20">
          <RecentInfractions />
          <InfractionHistory />
        </div>
        <div onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8">
          <FloatingActionButton />
        </div>
        <ReportFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
} 