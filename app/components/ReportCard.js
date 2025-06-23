'use client';

import { useRouter } from 'next/navigation';
import { useReports } from '@/lib/hooks/useReports';
import { TrashIcon } from '@heroicons/react/24/outline';

// Format interaction types for display
const formatInteractionType = (type) => {
  const interactionMap = {
    'SHOUT_OUT': 'Shout-out',
    'CHECK_IN': 'Check-in',
    'PARENT_LIAISON_CHECK_IN': 'Parent Liaison Check-in',
    'ADMIN_CHECK_IN': 'Admin Check-in',
    'STUDENT_OF_THE_MONTH': 'Student of the Month',
    'ADVISORY_CHECK_IN_WITH_GUARDIAN': 'Advisory Check-in with Guardian',
    'CHECK_IN_WITH_GUARDIAN': 'Check-in with Guardian',
    'COUNSELOR_CHECK_IN': 'Counselor Check-in',
    'STUDIO_ONE_ON_ONE_CONFERENCE': 'Studio One-on-One Conference',
    'BSS_CHECK_IN': 'BSS Check-in',
    'ADVISORY_ONE_ON_ONE_CONFERENCE': 'Advisory One-on-One Conference',
    'DELETED_LOG': 'Deleted Log',
    'INFRACTION': 'Infraction',
    'ATTENDANCE_TRACKING': 'Attendance Tracking',
    'CHECK_IN_WITH_STUDENT': 'Check-in with Student',
    'INFORMATION_SHARING': 'Information Sharing'
  };
  return interactionMap[type] || type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Format infraction types for display
const formatInfractionType = (type) => {
  const infractionMap = {
    'CUT_CLASS': 'Cut Class or >15min Late',
    'IMPROPER_LANGUAGE': 'Improper Language or Profanity',
    'FAILURE_TO_MEET_EXPECTATIONS': 'Failure to Meet Classroom Expectations',
    'CELLPHONE': 'Cellphone Use',
    'LEAVING_WITHOUT_PERMISSION': 'Leaving Class Without Permission',
    'MISUSE_OF_HALLPASS': 'Misuse of Hallpass',
    'TARDINESS': 'Tardiness to Class',
    'MINOR_VANDALISM': 'Minor Vandalism',
    'NONE': 'None'
  };
  return infractionMap[type] || type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Format intervention types for display
const formatInterventionType = (type) => {
  const interventionMap = {
    'EMAILED_PARENT': 'Emailed Parent',
    'CALLED_HOME_LEFT_MESSAGE': 'Called Home - Left Message',
    'CALLED_HOME_SPOKE': 'Called Home - Spoke',
    'PARENT_MEETING': 'Parent Meeting',
    'CALLED_HOME_NO_ANSWER': 'Called Home - No Answer',
    'GROUP_RESTORATIVE_CIRCLE': 'Group Restorative Circle',
    'DOOR_CONVERSATIONS': 'Door Conversations',
    'CHECK_IN': 'Check-in',
    'TEACHER_STRATEGY': 'Teacher Strategy',
    'CALLED_HOME_DISCONNECTED': 'Called Home - Disconnected',
    'ADVISOR_COUNSELOR_REFERRAL': 'Advisor/Counselor Referral',
    'LETTER_SENT_HOME': 'Letter Sent Home',
    'SAP_REFERRAL': 'SAP Referral',
    'INDIVIDUAL_RESTORATIVE_CONFERENCE': 'Individual Restorative Conference',
    'HOME_VISIT': 'Home Visit',
    'GUIDANCE_COUNSELING': 'Guidance Counseling',
    'OUT_OF_CLASS_REFLECTION': 'Out of Class Reflection',
    'CAREER_COLLEGE_COUNSELING': 'Career/College Counseling',
    'NONE': 'None'
  };
  return interventionMap[type] || type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Format status for display
const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default function ReportCard({ report, variant = 'default' }) { // Main component for displaying individual report cards
  const router = useRouter(); // Get Next.js router instance for navigation
  const { refresh: refreshReports, deleteReport, updateReport } = useReports(); // Get report operations from custom hook

  // Determine the size and layout based on variant
  const sizeClasses = { // Object defining padding classes for different card sizes
    default: 'p-3', // Default padding for standard cards
    compact: 'p-2' // Reduced padding for compact cards
  };

  const textClasses = { // Object defining text size classes for different card variants
    default: { // Text classes for default variant
      title: 'text-base', // Title text size
      subtitle: 'text-xs', // Subtitle text size
      content: 'text-xs', // Content text size
      footer: 'text-xs' // Footer text size
    },
    compact: { // Text classes for compact variant
      title: 'text-sm', // Smaller title text
      subtitle: 'text-[10px]', // Very small subtitle text
      content: 'text-[10px]', // Very small content text
      footer: 'text-[10px]' // Very small footer text
    }
  };

  const statusColors = { // Object defining color classes for different status types
    RESOLVED: 'bg-green-100 text-green-800', // Green colors for resolved status
    UNRESOLVED: 'bg-yellow-100 text-yellow-800' // Yellow colors for unresolved status
  };

  const handleEdit = (e) => { // Event handler for edit button click
    e.preventDefault(); // Prevent default button behavior
    router.push(`/reports/${report.interactionID}/edit`); // Navigate to edit page for this report
  };

  const handleReopen = async (e) => { // Event handler for reopen button click
    e.preventDefault(); // Prevent default button behavior
    try {
      await updateReport(report.interactionID, { // Update report status to unresolved
        ...report, // Spread existing report data
        status: 'UNRESOLVED' // Change status to unresolved
      });
    } catch (error) { // Catch any errors during update
      console.error('Error reopening report:', error); // Log error for debugging
    }
  };

  const handleDelete = async (e) => { // Event handler for delete button click
    e.preventDefault(); // Prevent default button behavior
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) { // Show confirmation dialog
      try {
        await deleteReport(report.interactionID); // Delete the report from database
      } catch (error) { // Catch any errors during deletion
        console.error('Error deleting report:', error); // Log error for debugging
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${sizeClasses[variant]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={`font-semibold ${textClasses[variant].title} text-gray-900`}>
            {report.studentName || report.studentNumber || 'Unknown Student'}
          </h3>
          <p className={`${textClasses[variant].subtitle} text-gray-500`}>
            {report.studentNumber}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
          {report.status}
        </span>
      </div>
      
      <div className="mb-2">
        <p className={`${textClasses[variant].content} text-gray-700`}>
          <span className="font-medium">Type:</span> {formatInteractionType(report.interaction)}
        </p>
        {report.notes && (
          <p className={`${textClasses[variant].content} text-gray-700 mt-1 line-clamp-2`}>
            {report.notes}
          </p>
        )}
      </div>
      
      <div className={`flex justify-between items-center ${textClasses[variant].footer} text-gray-500`}>
        <div>
          <p>{new Date(report.interactionTimestamp).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          {report.status === 'RESOLVED' && (
            <button
              onClick={handleReopen}
              className="text-blue-600 hover:text-blue-800"
            >
              Reopen
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 