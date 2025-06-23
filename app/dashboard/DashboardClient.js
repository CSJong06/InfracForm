"use client"; // Mark this as a client-side component for browser interactivity
import { useState, useEffect } from 'react'; // Import React hooks for state management and side effects
import Sidebar from '../components/Sidebar'; // Import navigation sidebar component
import RecentInfractions from '../components/RecentInfractions'; // Import component to display recent infractions
import InfractionHistory from '../components/InfractionHistory'; // Import component to display infraction history charts
import FloatingActionButton from '../components/FloatingActionButton'; // Import floating action button for quick actions
import ReportFormModal from '../components/ReportFormModal'; // Import modal for creating/editing reports
import ClearDatabaseModal from '../components/ClearDatabaseModal'; // Import modal for database clearing confirmation
import { useReports } from '@/lib/hooks/useReports'; // Import custom hook for report data management
import { MagnifyingGlassIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // Import UI icons for dashboard actions

export default function DashboardClient({ session }) { // Main dashboard component that receives user session data
  const [modalOpen, setModalOpen] = useState(false); // Control report form modal visibility
  const [clearModalOpen, setClearModalOpen] = useState(false); // Control database clear confirmation modal visibility
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering reports by student name, number, or notes
  const [showFilters, setShowFilters] = useState(false); // Control advanced filter panel visibility
  const [filters, setFilters] = useState({ // Object containing all filter criteria
    status: '', // Filter by report status (RESOLVED/UNRESOLVED)
    interaction: '', // Filter by interaction type
    dateRange: 'all', // Filter by date range (today/week/month/custom)
    startDate: '', // Custom date range start date
    endDate: '' // Custom date range end date
  });
  const { reports, refresh } = useReports(); // Get reports data and refresh function from custom hook

  // Refresh reports when modal is closed
  useEffect(() => {
    if (!modalOpen) {
      refresh(); // Refresh reports data when modal closes to show latest changes
    }
  }, [modalOpen, refresh]);

  const handleClearDatabase = async () => { // Function to clear all data from the database
    try {
      const response = await fetch('/api/reset', { // Send POST request to reset API endpoint
        method: 'POST',
      });
      
      if (!response.ok) { // Check if the request was successful
        throw new Error('Failed to clear database');
      }
      
      await refresh(); // Refresh the reports data after successful database clear
    } catch (error) {
      throw new Error(error.message); // Re-throw error with message
    }
  };

  const handleFilterChange = (key, value) => { // Update specific filter value in the filters state object
    setFilters(prev => ({ ...prev, [key]: value })); // Spread previous filters and update the specified key
  };

  const clearFilters = () => { // Reset all filters to their default empty values
    setFilters({
      status: '', // Clear status filter
      interaction: '', // Clear interaction type filter
      dateRange: 'all', // Reset date range to 'all'
      startDate: '', // Clear custom start date
      endDate: '' // Clear custom end date
    });
  };

  const handleExport = async () => { // Function to export reports data as CSV file
    try {
      const response = await fetch('/api/reports/export', { // Send GET request to export API endpoint
        method: 'GET',
      });
      
      if (!response.ok) { // Check if the request was successful
        throw new Error('Failed to export reports');
      }
      
      const blob = await response.blob(); // Get the CSV data as a blob
      const url = window.URL.createObjectURL(blob); // Create a temporary URL for the blob
      const a = document.createElement('a'); // Create a temporary anchor element for download
      a.href = url; // Set the anchor's href to the blob URL
      a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`; // Set filename with current date
      document.body.appendChild(a); // Add anchor to DOM temporarily
      a.click(); // Trigger the download
      window.URL.revokeObjectURL(url); // Clean up the blob URL
      document.body.removeChild(a); // Remove the temporary anchor element
    } catch (error) {
      console.error('Export failed:', error); // Log error to console
      alert('Failed to export reports. Please try again.'); // Show user-friendly error message
    }
  };

  const filteredReports = reports.filter(report => { // Filter reports based on search term and filter criteria
    // Search term filter
    if (searchTerm) { // If search term exists, check if report matches
      const searchLower = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive comparison
      const studentName = report.studentName?.toLowerCase() || ''; // Get student name or empty string
      const studentNumber = report.studentNumber?.toLowerCase() || ''; // Get student number or empty string
      const notes = report.notes?.toLowerCase() || ''; // Get notes or empty string
      const reporter = report.reportedBy?.toLowerCase() || ''; // Get reporter name or empty string
      
      if (!studentName.includes(searchLower) && // Check if student name contains search term
          !studentNumber.includes(searchLower) && // Check if student number contains search term
          !notes.includes(searchLower) && // Check if notes contain search term
          !reporter.includes(searchLower)) { // Check if reporter name contains search term
        return false; // Exclude report if no field matches search term
      }
    }

    // Status filter
    if (filters.status && report.status !== filters.status) { // If status filter is set and report status doesn't match
      return false; // Exclude report
    }

    // Interaction type filter
    if (filters.interaction && report.interaction !== filters.interaction) { // If interaction filter is set and report interaction doesn't match
      return false; // Exclude report
    }

    // Date range filter
    if (filters.dateRange !== 'all') { // If date range filter is not set to 'all'
      const reportDate = new Date(report.interactionTimestamp); // Convert report timestamp to Date object
      const today = new Date(); // Get current date
      today.setHours(0, 0, 0, 0); // Set time to start of day for accurate comparison

      switch (filters.dateRange) { // Switch based on selected date range
        case 'today': // Filter for reports from today only
          const startOfDay = new Date(today); // Get start of current day
          if (reportDate < startOfDay) return false; // Exclude if report is before today
          break;
        case 'week': // Filter for reports from current week
          const startOfWeek = new Date(today); // Get current date
          startOfWeek.setDate(today.getDate() - today.getDay()); // Set to start of current week (Sunday)
          if (reportDate < startOfWeek) return false; // Exclude if report is before this week
          break;
        case 'month': // Filter for reports from current month
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Get first day of current month
          if (reportDate < startOfMonth) return false; // Exclude if report is before this month
          break;
        case 'custom': // Filter for reports within custom date range
          if (filters.startDate && new Date(report.interactionTimestamp) < new Date(filters.startDate)) { // Check if report is before start date
            return false; // Exclude report
          }
          if (filters.endDate && new Date(report.interactionTimestamp) > new Date(filters.endDate)) { // Check if report is after end date
            return false; // Exclude report
          }
          break;
      }
    }

    return true; // Include report if it passes all filters
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center gap-2 text-sm text-gray-700"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export CSV
              </button>
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
        
        <ReportFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <ClearDatabaseModal 
          open={clearModalOpen} 
          onClose={() => setClearModalOpen(false)} 
          onConfirm={handleClearDatabase}
        />
      </main>
    </div>
  );
} 