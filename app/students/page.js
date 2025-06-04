'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useStudents } from '@/lib/hooks/useStudents';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FloatingActionButton from '../components/FloatingActionButton';
import StudentFormModal from '../components/StudentFormModal';
import BulkImportModal from '../components/BulkImportModal';

export default function StudentsPage() {
  const { students, loading, error, refresh } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen && !bulkImportOpen) {
      refresh();
    }
  }, [modalOpen, bulkImportOpen, refresh]);

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || student.studentId.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
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
            Error loading students: {error}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Students</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setBulkImportOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Import CSV
              </button>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-800 placeholder-gray-500 bg-gray-50"
                />
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((student) => (
                <div 
                  key={student._id} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-gray-500 text-sm">
                        ID: {student.studentId}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <div onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8">
        <FloatingActionButton />
      </div>
      <StudentFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <BulkImportModal open={bulkImportOpen} onClose={() => setBulkImportOpen(false)} />
    </div>
  );
} 