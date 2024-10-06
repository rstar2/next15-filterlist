'use client';

import { useQueryState } from 'nuqs';
import React, { use, useTransition } from 'react';
import { searchParams } from '@/searchParams';
import ToggleButton from './ui/ToggleButton';
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
      {Object.values(categoriesMap).map(category => {
        return (
          <ToggleButton
            onClick={() => {
              const categoryId = category.id.toString();
              const newCategories = categories.includes(categoryId)
                ? categories.filter(id => {
                    return id !== categoryId;
                  })
                : [...categories, categoryId];
              setCategories(newCategories);
            }}
            key={category.id}
            active={categories.includes(category.id.toString())}
          >
            {category.name}
          </ToggleButton>
        );
      })}
    </div>
  );
}
