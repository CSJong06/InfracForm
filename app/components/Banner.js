export default function Banner() {
  return (
    <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden" style={{ background: 'linear-gradient(90deg, var(--primary-cyan), var(--primary-orange), var(--primary-green))' }}>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 via-blue-600/50 to-blue-600/0"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'white' }}>Building21 Allentown</h1>
          <p className="mt-2 text-blue-100">Manage and track student infractions efficiently</p>
        </div>
      </div>
    </div>
  );
} 