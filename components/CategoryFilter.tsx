'use client';

import React, { use, useTransition } from 'react';
import { useFilters } from '@/providers/FilterProvider';
import ToggleGroup from './ui/toggle-group/ToggleGroup';
import type { Category } from '@prisma/client';

type Props = {
  categoriesPromise: Promise<Record<string, Category>>;
};

export default function CategoryFilter({ categoriesPromise }: Props) {
  const categoriesMap = use(categoriesPromise);
  const { filters, updateFilters } = useFilters();
  const categories = filters.category || [];
  const [isPending, startTransition] = useTransition();

  return (
    <div data-pending={isPending ? '' : undefined}>
      <ToggleGroup
        options={Object.values(categoriesMap).map(category => {
          return {
            label: category.name,
            value: category.id.toString(),
          };
        })}
        selectedValues={categories}
        onToggle={newCategories => {
          startTransition(() => {
            updateFilters({
              category: newCategories,
            });
          });
        }}
      />
    </div>
  );
}
