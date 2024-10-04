'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useOptimistic, useTransition } from 'react';

type Filters = {
  category: string[];
  q: string | undefined;
};

type FilterContextType = {
  filters: Filters;
  isPending: boolean;
  updateFilters: (_updates: Partial<Filters>) => void;
};

export const FilterContext = createContext<FilterContextType | undefined>(undefined);

export default function FilterProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    category: searchParams.getAll('category'),
    q: searchParams.get('q') || undefined,
  });

  function updateFilters(updates: Partial<typeof optimisticFilters>) {
    const newState = { ...optimisticFilters, ...updates };
    const newSearchParams = new URLSearchParams();

    Object.entries(newState).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          return newSearchParams.append(key, v);
        });
      } else if (value) {
        newSearchParams.set(key, value);
      }
    });

    startTransition(() => {
      setOptimisticFilters(newState);
      router.push(`?${newSearchParams}`);
    });
  }

  return (
    <FilterContext.Provider value={{ filters: optimisticFilters, isPending, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = React.useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
