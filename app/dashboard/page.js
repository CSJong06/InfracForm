"use client";
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import RecentInfractions from '../components/RecentInfractions';
import InfractionHistory from '../components/InfractionHistory';
import FloatingActionButton from '../components/FloatingActionButton';
import ReportFormModal from '../components/ReportFormModal';

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 relative">
        <div className="h-full overflow-y-auto pr-2">
          <div className="space-y-10 pb-20">
            <RecentInfractions />
            <InfractionHistory />
          </div>
        </div>
        <div onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8">
          <FloatingActionButton />
        </div>
        <ReportFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
} 