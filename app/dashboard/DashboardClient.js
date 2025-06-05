"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RecentInfractions from '../components/RecentInfractions';
import InfractionHistory from '../components/InfractionHistory';
import FloatingActionButton from '../components/FloatingActionButton';
import ReportFormModal from '../components/ReportFormModal';
import ImportReportsModal from '../components/ImportReportsModal';
import ClearDatabaseModal from '../components/ClearDatabaseModal';
import { useReports } from '@/lib/hooks/useReports';
import { MagnifyingGlassIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function DashboardClient({ session }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
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
    if (!modalOpen && !importModalOpen) {
      refresh();
    }
  }, [modalOpen, importModalOpen, refresh]);

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
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      report.studentNumber?.toLowerCase().includes(searchLower) ||
      report.studentName?.toLowerCase().includes(searchLower) ||
      report.interaction?.toLowerCase().includes(searchLower) ||
      report.notes?.toLowerCase().includes(searchLower);

    const matchesStatus = !filters.status || report.status === filters.status;
    const matchesInteraction = !filters.interaction || report.interactioncode === filters.interaction;

    let matchesDate = true;
    if (filters.dateRange !== 'all') {
      const reportDate = new Date(report.interactionTimestamp);
      const today = new Date();
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      switch (filters.dateRange) {
        case 'today':
          matchesDate = reportDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          matchesDate = reportDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          matchesDate = reportDate >= monthAgo;
          break;
        case 'custom':
          matchesDate = (!startDate || reportDate >= startDate) && 
                       (!endDate || reportDate <= endDate);
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesInteraction && matchesDate;
  });

  const generateEditUrl = (report) => {
    // Generate a unique identifier for the report
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${report._id}_${timestamp}_${randomStr}`;
  };

  const formatDateForCSV = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0];
  };

  // Add these mappings at the top or near the export function
  const interactionTypes = {
    IS: 'Information Sharing',
    PLCI: 'Parent Liaison Check-In',
    '21CCI': '21st Century Check-In',
    ACI: 'Admin Check-In',
    SM: 'Student of the Month',
    ACG: 'Advisory Check-in with Guardian',
    CG: 'Check-in with Guardian',
    CC: 'Counselor Check-in',
    SOOC: 'Studio One-on-One Conference',
    BSSC: 'BSS Check-in',
    AOOC: 'Advisory One-on-One Conference',
    D: 'Deleted log',
    I: 'Infraction',
    AT: 'Attendance Tracking',
    CS: 'Check-in with Student',
    S: 'Shout-out',
  };
  const infractionTypes = {
    CUT_CLASS: 'Cut class or >15min late',
    IMPROPER_LANGUAGE: 'Improper language or profanity',
    FAILURE_TO_MEET_EXPECTATIONS: 'Failure to meet classroom expectations',
    CELLPHONE: 'Cellphone',
    LEAVING_WITHOUT_PERMISSION: 'Leaving class without permission',
    MISUSE_OF_HALLPASS: 'Misuse of hallpass',
    TARDINESS: 'Tardiness to class',
    MINOR_VANDALISM: 'Minor vandalism',
    NONE: '',
  };
  const interventionTypes = {
    NONE: '',
    VERBAL_WARNING: 'Verbal warning',
    WRITTEN_WARNING: 'Written warning',
    PARENT_CONTACT: 'Parent contact',
    ADMINISTRATIVE: 'Administrative',
  };

  function formatResponse(code, map) {
    if (!code) return '';
    // Handle comma-separated interventions
    if (code.includes(',')) {
      return code.split(',').map(c => map[c] || c).join('; ');
    }
    return map[code] || code;
  }

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'studentnumber',
      'entrytimestamp',
      'submitteremail',
      'interactioncode',
      'responses',
      'notes',
      'interactiontimestamp',
      'entryidentifier',
      'interactionid',
      'editurl',
    ];
    const csvRows = [headers.join(',')];
    filteredReports.forEach((report) => {
      csvRows.push([
        report.studentNumber,
        formatDateForCSV(report.entryTimestamp),
        report.submitterEmail,
        report.interactioncode || '',
        formatResponse(report.infraction, infractionTypes) || formatResponse(report.intervention, interventionTypes),
        report.notes ? `"${report.notes.replace(/"/g, '""')}"` : '',
        formatDateForCSV(report.interactionTimestamp),
        report.interactionID,
        report.interactionID,
        generateEditUrl(report.interactionID),
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="h-5 w-5 mr-2 text-gray-700" />
                Filters
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-700" />
                Export CSV
              </button>
              {session?.isAdmin && (
                <button
                  onClick={() => setClearModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Clear Database
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {Object.entries(interactionTypes).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
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
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
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
            <InfractionHistory reports={filteredReports} onImportClick={() => setImportModalOpen(true)} />
          </div>
        </div>
        <div onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8">
          <FloatingActionButton />
        </div>
        <ReportFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <ImportReportsModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
        <ClearDatabaseModal 
          open={clearModalOpen} 
          onClose={() => setClearModalOpen(false)} 
          onConfirm={handleClearDatabase}
        />
      </main>
    </div>
  );
} 