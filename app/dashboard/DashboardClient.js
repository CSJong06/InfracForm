"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RecentInfractions from '../components/RecentInfractions';
import InfractionHistory from '../components/InfractionHistory';
import FloatingActionButton from '../components/FloatingActionButton';
import ReportFormModal from '../components/ReportFormModal';
import ClearDatabaseModal from '../components/ClearDatabaseModal';
import { useReports } from '@/lib/hooks/useReports';
import { MagnifyingGlassIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function DashboardClient({ session }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    interaction: '',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });
  const { reports, refresh } = useReports();

  // Refresh reports when modal is closed
  useEffect(() => {
    if (!modalOpen) {
      refresh();
    }
  }, [modalOpen, refresh]);

  const handleClearDatabase = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear database');
      }
      
      await refresh();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      interaction: '',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    });
  };

  const filteredReports = reports.filter(report => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        report.studentName?.toLowerCase().includes(searchLower) ||
        report.studentNumber?.toLowerCase().includes(searchLower) ||
        report.notes?.toLowerCase().includes(searchLower) ||
        report.reportedBy?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && report.status !== filters.status) {
      return false;
    }

    // Interaction type filter
    if (filters.interaction && report.interaction !== filters.interaction) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const reportDate = new Date(report.interactionTimestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filters.dateRange) {
        case 'today':
          const startOfDay = new Date(today);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);
          if (reportDate < startOfDay || reportDate > endOfDay) return false;
          break;
        case 'week':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          if (reportDate < startOfWeek) return false;
          break;
        case 'month':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          if (reportDate < startOfMonth) return false;
          break;
        case 'custom':
          if (filters.startDate && new Date(report.interactionTimestamp) < new Date(filters.startDate)) {
            return false;
          }
          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (new Date(report.interactionTimestamp) > endDate) {
              return false;
            }
          }
          break;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-800 w-full sm:w-64"
                />
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <FunnelIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white/80 rounded-xl shadow-md p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">All Statuses</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="UNRESOLVED">Unresolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Interaction Type</label>
                  <select
                    value={filters.interaction}
                    onChange={(e) => handleFilterChange('interaction', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">All Types</option>
                    <option value="SHOUT_OUT">Shout-out</option>
                    <option value="CHECK_IN">Check-in</option>
                    <option value="INFRACTION">Infraction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                {filters.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-gray-800 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <div className="space-y-16">
            <RecentInfractions reports={filteredReports} />
            <InfractionHistory reports={filteredReports} />
          </div>
        </div>
        <div onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8">
          <FloatingActionButton />
        </div>
        
        <ClearDatabaseModal 
          open={clearModalOpen} 
          onClose={() => setClearModalOpen(false)} 
          onConfirm={handleClearDatabase}
        />
      </main>
    </div>
  );
} 