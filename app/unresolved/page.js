import Sidebar from '../components/Sidebar';

export default function UnresolvedPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-10 relative overflow-x-auto">
        <section className="bg-white/80 rounded-2xl shadow-md p-6 mb-2">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Unresolved Infractions</h2>
          <div className="text-gray-500">This is the unresolved infractions page. (Add content here.)</div>
        </section>
      </main>
    </div>
  );
} 