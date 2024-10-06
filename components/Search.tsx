'use client';

import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import React, { useTransition } from 'react';
import { searchParams } from '@/searchParams';
import type { TaskStatus } from '@/types/task';
import { SearchIcon } from './ui/icons/SearchIcon';
import { SpinnerIcon } from './ui/icons/SpinnerIcon';

function SearchStatus({ searching }: { searching: boolean }) {
  return (
    <div aria-hidden className="absolute left-4 top-[41px]">
      {searching ? (
        <div className="h-fit w-fit animate-spin">
          <SpinnerIcon width={16} height={16} className="text-gray" />
        </div>
      ) : (
        <SearchIcon width={16} height={16} className="text-gray" />
      )}
    </div>
  );
}

export default function Search() {
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useQueryState(
    'q',
    searchParams.q.withOptions({
      shallow: false,
      startTransition,
    }),
  );
  const params = useParams();

  return (
    <form className="relative flex w-full flex-col gap-1 sm:w-fit" key={params.tab as TaskStatus}>
      <label className="font-semibold uppercase" htmlFor="search">
        Search
      </label>
      <input
        id="search"
        onChange={e => {
          setQ(e.target.value);
        }}
        defaultValue={q}
        className="w-full pl-10 sm:w-96"
        name="q"
        placeholder="Search in task title or description..."
        type="search"
      />
      <SearchStatus searching={isPending} />
    </form>
  );
}

export function SearchSkeleton() {
  return <input className="mt-7 w-full sm:w-96" placeholder="Loading..." disabled />;
}
