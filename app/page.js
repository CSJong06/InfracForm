import LoginForm from './components/LoginForm'; // Import the login form component
import Banner from './components/Banner'; // Import the banner component for header
import Footer from './components/Footer'; // Import the footer component
import { getSession } from '@/lib/auth'; // Import function to check user session
import { redirect } from 'next/navigation'; // Import Next.js redirect function

export default async function Home() { // Main home page component (server-side rendered)
  const session = await getSession(); // Get the current user session from cookies
  
  // If user is already logged in, redirect to dashboard
  if (session) { // Check if user has an active session
    redirect('/dashboard'); // Redirect authenticated users to dashboard
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-slate-100 to-blue-50"> // Main container with gradient background
      <Banner /> // Render the banner component at the top
      <div className="flex-1 flex items-center justify-center p-4 mt-32 mb-24"> // Center container for login form
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"> // Login form container with glass effect
          <LoginForm /> // Render the login form component
        </div>
      </div>
      <Footer /> // Render the footer component at the bottom
    </div>
  );
}
