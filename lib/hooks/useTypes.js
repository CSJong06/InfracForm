import { useState, useEffect } from 'react';

export function useTypes() {
  const [interactionTypes, setInteractionTypes] = useState([]);
  const [infractionTypes, setInfractionTypes] = useState([]);
  const [interventionTypes, setInterventionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
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

        setInteractionTypes(interactions);
        setInfractionTypes(infractions);
        setInterventionTypes(interventions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return {
    interactionTypes,
    infractionTypes,
    interventionTypes,
    loading,
    error
  };
} 