import { ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function RecentInfractions() {
  return (
    <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Recent Infractions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-tr from-blue-100 to-blue-50 rounded-xl shadow flex items-center justify-between p-5 hover:shadow-lg transition">
          <div>
            <div className="text-lg font-semibold text-blue-800">Tardy</div>
            <div className="text-gray-500 text-sm">John Doe - 5 mins late</div>
          </div>
          <ClockIcon className="w-8 h-8 text-blue-400" />
        </div>
        <div className="bg-gradient-to-tr from-pink-100 to-pink-50 rounded-xl shadow flex items-center justify-between p-5 hover:shadow-lg transition">
          <div>
            <div className="text-lg font-semibold text-pink-800">Dress Code</div>
            <div className="text-gray-500 text-sm">Jane Smith - Hoodie</div>
          </div>
          <ExclamationCircleIcon className="w-8 h-8 text-pink-400" />
        </div>
      </div>
    </section>
  );
} 