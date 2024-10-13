'use client';

import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import React, { useTransition } from 'react';
import { searchParams } from '@/types/searchParams';
import type { TaskStatus } from '@/types/task';
import SearchStatus from './ui/SearchStatus';

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
