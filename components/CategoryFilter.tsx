'use client';

import { useQueryState } from 'nuqs';
import React, { use, useTransition } from 'react';
import { searchParams } from '@/types/searchParams';
import ToggleGroup from './ui/toggle-group/ToggleGroup';
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
    <div data-pending={isPending ? '' : undefined} className="flex flex-wrap gap-2">
      <ToggleGroup
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
