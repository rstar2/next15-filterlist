import './globals.css';

// eslint-disable-next-line import/no-unresolved
import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import LoadTimeTracker from '@/components/LoadTimeTracker';
import ProjectInfo from '@/components/ProjectInfo';
import Search, { SearchSkeleton } from '@/components/Search';
import Tabs, { TabsSkeleton } from '@/components/tabs/Tabs';
import ToggleButton from '@/components/ui/ToggleButton';
import { getCategoriesMap } from '@/data/services/category';
import { getTaskSummary } from '@/data/services/task';
import FilterProvider from '@/providers/FilterProvider';
import { cn } from '@/utils/cn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Next.js 15 Filter List',
  title: 'Next.js 15 filtering list example using modern React features',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategoriesMap();
  const taskSummary = getTaskSummary();

  return (
    <html lang="en">
      <body className={cn(GeistSans.className, 'flex flex-col px-4 py-16 sm:px-16 xl:px-48 2xl:px-96')}>
        <div className="group flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h1>Project information</h1>
            <ProjectInfo />
          </div>
          <div className="flex flex-col gap-6">
            <h2>Task list</h2>
            <Suspense fallback={<TabsSkeleton />}>
              <Tabs taskSummaryPromise={taskSummary} />
            </Suspense>
          </div>
          <div className="h-[1px] bg-primary" />
          <Suspense>
            <FilterProvider>
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
              <Suspense fallback={<ToggleButton disabled>Loading...</ToggleButton>}>
                <CategoryFilter categoriesPromise={categories} />
              </Suspense>
            </FilterProvider>
          </Suspense>
          {children}
        </div>
        <LoadTimeTracker />
      </body>
    </html>
  );
}
