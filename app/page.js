"use client";
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import RecentInfractions from './components/RecentInfractions';
import InfractionHistory from './components/InfractionHistory';
import FloatingActionButton from './components/FloatingActionButton';
import ReportFormModal from './components/ReportFormModal';

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
        <RecentInfractions />
        <InfractionHistory />
        <div onClick={() => setModalOpen(true)}>
          <FloatingActionButton />
        </div>
        <ReportFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
}
