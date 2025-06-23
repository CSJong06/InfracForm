import { useState, useEffect, useCallback } from 'react'; // Import React hooks for state management and side effects

export function useStudents() { // Custom hook for managing student data throughout the application
  const [students, setStudents] = useState([]); // State for storing array of student objects
  const [loading, setLoading] = useState(true); // State to track loading status of student data
  const [error, setError] = useState(null); // State to store any errors that occur during data fetching

  const fetchStudents = useCallback(async () => { // Async function to fetch student data from API
    try {
      setLoading(true); // Set loading state to true before starting fetch operation
      const response = await fetch('/api/students'); // Make API request to fetch all students
      if (!response.ok) { // Check if the API request was successful
        throw new Error('Failed to fetch students'); // Throw error if request failed
      }
      const data = await response.json(); // Parse JSON response to get student data
      setStudents(data); // Update students state with fetched data
      setError(null); // Clear any existing errors on successful fetch
    } catch (err) { // Catch any errors during the fetching process
      setError(err.message); // Store error message in state for component to display
    } finally { // Always execute this block regardless of success or failure
      setLoading(false); // Reset loading state to false
    }
  }, []); // Empty dependency array means this function is stable and won't be recreated

  useEffect(() => { // Effect to fetch students when component mounts
    fetchStudents(); // Call the fetch function to load student data
  }, [fetchStudents]); // Dependency on fetchStudents function

  return { // Return object with student data and utility functions
    students, // Array of student objects
    loading, // Boolean indicating if data is currently being fetched
    error, // String containing error message if fetch failed
    refresh: fetchStudents, // Function to manually refresh student data
    setStudents // Function to directly update students state (for optimistic updates)
  };
} 