import { useState, useEffect, useCallback } from 'react';

export function useTypes() {
  const [interactionTypes, setInteractionTypes] = useState([]);
  const [infractionTypes, setInfractionTypes] = useState([]);
  const [interventionTypes, setInterventionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTypes = useCallback(async () => {
    try {
      console.log('=== Fetching Types ===');
      setLoading(true);
      const [interactionsRes, infractionsRes, interventionsRes] = await Promise.all([
        fetch('/api/interaction-types'),
        fetch('/api/infraction-types'),
        fetch('/api/intervention-types')
      ]);

      if (!interactionsRes.ok || !infractionsRes.ok || !interventionsRes.ok) {
        throw new Error('Failed to fetch types');
      }

      const [interactions, infractions, interventions] = await Promise.all([
        interactionsRes.json(),
        infractionsRes.json(),
        interventionsRes.json()
      ]);

      console.log('Fetched interaction types:', interactions);
      setInteractionTypes(interactions);
      setInfractionTypes(infractions);
      setInterventionTypes(interventions);
    } catch (err) {
      console.error('Error fetching types:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    interactionTypes,
    infractionTypes,
    interventionTypes,
    loading,
    error,
    refresh: fetchTypes
  };
} 