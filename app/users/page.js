"use client";
import Sidebar from '../components/Sidebar';

const users = [
  { name: 'John Doe', role: 'Teacher' },
  { name: 'Jane Smith', role: 'Counselor' },
  { name: 'Alex Lee', role: 'Principal' },
  { name: 'Sam Brown', role: 'Staff' },
  { name: 'Emily White', role: 'Teacher' },
  { name: 'Chris Green', role: 'Staff' },
  { name: 'Pat Black', role: 'Teacher' },
  { name: 'Taylor Blue', role: 'Counselor' },
  { name: 'Jordan Red', role: 'Staff' },
  { name: 'Morgan Yellow', role: 'Teacher' },
];

export default function UsersPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
        <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Users</h2>
          <div className="max-h-96 overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200">
              {users.map((user, idx) => (
                <li key={user.name} className="flex items-center gap-4 py-4">
                  <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg`}>{user.name[0]}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-gray-500 text-sm">{user.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
} 