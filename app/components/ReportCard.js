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

export default function ReportCard({ report, variant = 'default' }) {
  const router = useRouter();
  const { refresh: refreshReports, deleteReport } = useReports();

  // Determine the size and layout based on variant
  const sizeClasses = {
    default: 'p-3',
    compact: 'p-2'
  };

  const textClasses = {
    default: {
      title: 'text-base',
      subtitle: 'text-xs',
      content: 'text-xs',
      footer: 'text-xs'
    },
    compact: {
      title: 'text-sm',
      subtitle: 'text-[10px]',
      content: 'text-[10px]',
      footer: 'text-[10px]'
    }
  };

  const statusColors = {
    RESOLVED: 'bg-green-100 text-green-800',
    UNRESOLVED: 'bg-yellow-100 text-yellow-800'
  };

  const handleEdit = (e) => {
    e.preventDefault();
    router.push(`/reports/${report.interactionID}/edit`);
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/reports/${report.interactionID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          status: 'UNRESOLVED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reopen report');
      }

      // Refresh the reports data
      await refreshReports();
    } catch (error) {
      console.error('Error reopening report:', error);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteReport(report.interactionID);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden"
    >
      <div className={sizeClasses[variant]}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`font-semibold text-gray-800 ${textClasses[variant].title}`}>
              {report.studentName}
            </h3>
            <p className={`text-gray-600 mt-0.5 ${textClasses[variant].subtitle}`}>
              {formatInteractionType(report.interaction)}
              {report.interaction === 'INFRACTION' && report.infraction && (
                <span className="ml-1 text-gray-500">
                  - {formatInfractionType(report.infraction)}
                </span>
              )}
            </p>
          </div>
          <span className={`px-1.5 py-0.5 ${textClasses[variant].subtitle} font-medium rounded-full ${statusColors[report.status]}`}>
            {formatStatus(report.status)}
          </span>
        </div>
        <div className="h-px bg-gray-200 my-2"></div>
        <div className={`text-gray-600 ${textClasses[variant].content}`}>
          <p className="line-clamp-2">{report.notes}</p>
          {report.intervention && report.intervention !== 'NONE' && (
            <p className="mt-1 text-gray-500">
              Intervention: {formatInterventionType(report.intervention)}
            </p>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className={`flex items-center justify-between text-gray-500 ${textClasses[variant].footer}`}>
            <span>{report.reportedBy}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Edit
              </button>
              {report.status === 'RESOLVED' && (
                <button 
                  onClick={handleReopen}
                  className="text-yellow-600 hover:text-yellow-800 hover:underline"
                >
                  Reopen
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 hover:underline"
                title="Delete report"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 