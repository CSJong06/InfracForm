import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function InfractionHistory() {
  return (
    <section className="bg-white/80 rounded-2xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Infraction history</h2>
        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2 rounded-lg font-medium shadow transition">Filter</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-tr from-slate-100 to-slate-50 rounded-xl shadow flex items-center justify-between p-5 hover:shadow-lg transition">
          <div>
            <div className="text-base font-semibold text-gray-700">Unresolved: Phone in class</div>
            <div className="text-gray-400 text-xs">Alex Lee - 10:30 AM</div>
          </div>
          <ExclamationCircleIcon className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="bg-gradient-to-tr from-green-100 to-green-50 rounded-xl shadow flex items-center justify-between p-5 hover:shadow-lg transition">
          <div>
            <div className="text-base font-semibold text-gray-700">Resolved: Disrespect</div>
            <div className="text-gray-400 text-xs">Sam Brown - 9:15 AM</div>
          </div>
          <CheckCircleIcon className="w-7 h-7 text-green-400" />
        </div>
      </div>
    </section>
  );
} 