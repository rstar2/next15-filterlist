'use client';

import { useQueryState } from 'nuqs';
import React, { use, useTransition } from 'react';
import { searchParams } from '@/types/searchParams';
import ToggleGroup from './ui/ToggleGroup';
import type { Category } from '@prisma/client';

type Props = {
  categoriesPromise: Promise<Record<string, Category>>;
};

export default function CategoryFilter({ categoriesPromise }: Props) {
  const categoriesMap = use(categoriesPromise);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useQueryState(
    'category',
    searchParams.category.withOptions({
      shallow: false,
      startTransition,
    }),
  );

  return (
    <div data-pending={isPending ? '' : undefined}>
      <ToggleGroup
        toggleKey="category"
        options={Object.values(categoriesMap).map(category => {
          return {
            label: category.name,
            value: category.id.toString(),
          };
        })}
        selectedValues={categories}
        onToggle={newCategories => {
          setCategories(newCategories);
        }}
      />
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return <div className="w-fit rounded border border-gray px-4 py-2 opacity-50">Loading...</div>;
}
