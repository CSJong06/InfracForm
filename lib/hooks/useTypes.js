import { useState, useEffect, useCallback } from 'react'; // Import React hooks for state management and side effects

export function useTypes() { // Custom hook for managing form type data (interactions, infractions, interventions)
  const [interactionTypes, setInteractionTypes] = useState([]); // State for interaction type data (e.g., SHOUT_OUT, INFRACTION)
  const [infractionTypes, setInfractionTypes] = useState([]); // State for infraction type data (e.g., CUT_CLASS, CELLPHONE)
  const [interventionTypes, setInterventionTypes] = useState([]); // State for intervention type data (e.g., EMAILED_PARENT, PARENT_MEETING)
  const [loading, setLoading] = useState(true); // State to track loading status of type data
  const [error, setError] = useState(null); // State to store any errors that occur during data fetching

  const fetchTypes = useCallback(async () => { // Async function to fetch all form types from API endpoints
    try {
      console.log('=== Fetching Types ==='); // Debug log to track when type fetching starts
      setLoading(true); // Set loading state to true before starting fetch operations
      const [interactionsRes, infractionsRes, interventionsRes] = await Promise.all([ // Fetch all three type categories concurrently
        fetch('/api/interaction-types'), // Fetch interaction types from API
        fetch('/api/infraction-types'), // Fetch infraction types from API
        fetch('/api/intervention-types') // Fetch intervention types from API
      ]);

      if (!interactionsRes.ok || !infractionsRes.ok || !interventionsRes.ok) { // Check if any of the API requests failed
        throw new Error('Failed to fetch types'); // Throw error if any request was unsuccessful
      }

      const [interactions, infractions, interventions] = await Promise.all([ // Parse JSON responses concurrently
        interactionsRes.json(), // Parse interaction types response
        infractionsRes.json(), // Parse infraction types response
        interventionsRes.json() // Parse intervention types response
      ]);

      console.log('Fetched interaction types:', interactions); // Debug log to show fetched interaction types
      setInteractionTypes(interactions); // Update interaction types state with fetched data
      setInfractionTypes(infractions); // Update infraction types state with fetched data
      setInterventionTypes(interventions); // Update intervention types state with fetched data
    } catch (err) { // Catch any errors during the fetching process
      console.error('Error fetching types:', err); // Log error for debugging
      setError(err.message); // Store error message in state for component to display
    } finally { // Always execute this block regardless of success or failure
      setLoading(false); // Reset loading state to false
    }
  }, []); // Empty dependency array means this function is stable and won't be recreated

  useEffect(() => { // Effect to fetch types when component mounts
    fetchTypes(); // Call the fetch function to load type data
  }, [fetchTypes]); // Dependency on fetchTypes function

  return { // Return object with all type data and utility functions
    interactionTypes, // Array of interaction type objects
    infractionTypes, // Array of infraction type objects
    interventionTypes, // Array of intervention type objects
    loading, // Boolean indicating if data is currently being fetched
    error, // String containing error message if fetch failed
    refresh: fetchTypes // Function to manually refresh type data
  };
} 