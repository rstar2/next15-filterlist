import 'server-only';

import { unstable_noStore } from 'next/cache';
import { cache } from 'react';
import { prisma } from '@/db';
import { slow } from '@/utils/slow';

export const getCategoriesMap = cache(async () => {
  console.log('getCategoriesMap');

  unstable_noStore();
  await slow(1000);

  const categories = await prisma.category.findMany();

  return categories.reduce(
    (acc, category) => {
      acc[category.id] = category;
      return acc;
    },
    {} as Record<string, (typeof categories)[0]>,
  );
});
