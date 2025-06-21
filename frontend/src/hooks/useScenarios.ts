// src/hooks/useScenarios.ts
import { useState } from 'react';

export const useScenarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    error,
    scenarios: [],
    results: [],
    runScenario: (params: any) => {
      setLoading(true);
      // Mock implementation
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    loadScenarios: () => {
      setLoading(true);
      // Mock implementation
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
  };
};