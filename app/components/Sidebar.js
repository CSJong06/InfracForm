"use client";
import { ClockIcon, ExclamationCircleIcon, CheckCircleIcon, UserGroupIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navLinks = [
  { name: 'History', icon: ClockIcon, href: '/dashboard' },
  { name: 'Unresolved', icon: ExclamationCircleIcon, href: '/unresolved' },
  { name: 'Resolved', icon: CheckCircleIcon, href: '/resolved' },
  { name: 'Users', icon: UserGroupIcon, href: '/users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = (e) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <aside className="w-56 bg-white/90 border-r flex flex-col py-8 px-4 gap-2 shadow-lg z-10">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="inline-block w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">S</span>
        <span className="text-xl font-bold tracking-tight text-gray-800">Dashboard</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {navLinks.map((link) => {
          const isActive =
            (link.href === '/' && pathname === '/') ||
            (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-base font-medium ${
                isActive
                  ? 'bg-blue-100 text-blue-700 shadow'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 text-gray-400 py-2 px-3 rounded-lg hover:bg-gray-100 hover:text-red-500 transition-colors font-medium"
      >
        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
} 