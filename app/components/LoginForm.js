"use client"; // Mark component as client-side for Next.js
import { useState } from 'react'; // Import React useState hook for form state management
import { useRouter, useSearchParams } from 'next/navigation'; // Import Next.js navigation hooks

export default function LoginForm() { // Main login form component for user authentication
  const [email, setEmail] = useState(''); // State for email input value
  const [password, setPassword] = useState(''); // State for password input value
  const [error, setError] = useState(''); // State to store authentication error messages
  const [isLoading, setIsLoading] = useState(false); // State to track loading status during login
  const router = useRouter(); // Get Next.js router instance for navigation
  const searchParams = useSearchParams(); // Get URL search parameters for redirect handling
  const from = searchParams.get('from') || '/dashboard'; // Get redirect destination or default to dashboard

  const handleSubmit = async (e) => { // Async function to handle form submission
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any previous errors
    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch('/api/auth/login', { // Make login API request
        method: 'POST', // Use POST method for login
        headers: { // Set request headers
          'Content-Type': 'application/json', // Specify JSON content type
        },
        body: JSON.stringify({ email, password }), // Send credentials as JSON
      });

      const data = await response.json(); // Parse response JSON

      if (!response.ok) { // Check if login was successful
        throw new Error(data.error || 'Failed to login'); // Throw error with message from server or default
      }

      // Redirect to the original destination or dashboard
      router.push(from); // Navigate to intended destination after successful login
    } catch (error) { // Catch any errors during login process
      setError(error.message); // Set error message in state for display
    } finally { // Always execute this block
      setIsLoading(false); // Reset loading state to false
    }
  };

  const handleGoogleLogin = () => { // Function to handle Google OAuth login (placeholder)
    router.push('/dashboard'); // Navigate to dashboard (Google OAuth not implemented)
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center">
          {/* Removed Remember me toggle */}
        </div>

        <button
          type="submit"
          className="w-full text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--primary-cyan)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--accent-cyan)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--primary-cyan)'}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Removed Google login button and divider */}
      </form>
    </div>
  );
} 