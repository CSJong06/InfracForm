'use client';

import { useRouter } from 'next/navigation';

export default function ReportCard({ report, variant = 'default' }) {
  const router = useRouter();

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
    router.push(`/reports/${report._id}/edit`);
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
              {report.interaction === 'INFRACTION' ? 'Infraction' : 'Shout-out'}
            </p>
          </div>
          <span className={`px-1.5 py-0.5 ${textClasses[variant].subtitle} font-medium rounded-full ${statusColors[report.status]}`}>
            {report.status}
          </span>
        </div>
        <div className="h-px bg-gray-200 my-2"></div>
        <p className={`text-gray-600 line-clamp-2 ${textClasses[variant].content}`}>{report.notes}</p>
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
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 