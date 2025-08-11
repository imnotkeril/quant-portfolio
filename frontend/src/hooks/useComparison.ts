// src/hooks/useComparison.ts
import { useState } from 'react';

export const useComparison = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    error,
    results: null,
    comparePortfolios: (params: any) => {
      setLoading(true);
      // Mock implementation
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    clearComparison: () => {
      // Mock implementation
    },
  };
};