"use client"; // Mark component as client-side for Next.js
import { ClockIcon, ExclamationCircleIcon, CheckCircleIcon, UserGroupIcon, ArrowLeftOnRectangleIcon, AcademicCapIcon, UsersIcon } from '@heroicons/react/24/outline'; // Import navigation icons
import Link from 'next/link'; // Import Next.js Link component for navigation
import { usePathname, useRouter } from 'next/navigation'; // Import Next.js navigation hooks
import { useState, useEffect } from 'react'; // Import React hooks for state management and side effects

export default function Sidebar() { // Main sidebar navigation component
  const pathname = usePathname(); // Get current route pathname for active link highlighting
  const router = useRouter(); // Get Next.js router instance for programmatic navigation
  const [isAdmin, setIsAdmin] = useState(false); // State to track user admin status

  useEffect(() => { // Effect to check user admin status on component mount
    const checkAdminStatus = async () => { // Async function to fetch admin status from API
      try {
        const response = await fetch('/api/auth/session'); // Make API request to get session data
        const data = await response.json(); // Parse response JSON
        setIsAdmin(data?.isAdmin || false); // Set admin status from response or default to false
      } catch (error) { // Catch any errors during API request
        console.error('Error checking admin status:', error); // Log error for debugging
        setIsAdmin(false); // Default to non-admin on error
      }
    };
    checkAdminStatus(); // Call the admin status check function
  }, []); // Empty dependency array means this runs once on mount

  const navLinks = [ // Array of navigation links with conditional admin-only items
    { name: 'History', icon: ClockIcon, href: '/dashboard' }, // Dashboard/history link
    { name: 'Unresolved', icon: ExclamationCircleIcon, href: '/unresolved' }, // Unresolved reports link
    { name: 'Resolved', icon: CheckCircleIcon, href: '/resolved' }, // Resolved reports link
    { name: 'Students', icon: AcademicCapIcon, href: '/students' }, // Students management link
    { name: 'Users', icon: UsersIcon, href: '/users' }, // Users management link
  ];

  const handleLogout = async (e) => { // Async function to handle user logout
    e.preventDefault(); // Prevent default button behavior
    try {
      const response = await fetch('/api/auth/logout', { // Make logout API request
        method: 'POST', // Use POST method for logout
      });
      
      if (response.ok) { // Check if logout was successful
        router.push('/'); // Navigate to home page after successful logout
      }
    } catch (error) { // Catch any errors during logout
      console.error('Logout failed:', error); // Log error for debugging
    }
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