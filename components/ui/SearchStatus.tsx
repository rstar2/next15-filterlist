import React from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

export default function SearchStatus({ searching }: { searching: boolean }) {
  return (
    <div
      aria-label={searching ? 'Searching...' : 'Search'}
      aria-live="polite"
      aria-busy={searching}
      className="absolute left-4 top-[41px]"
    >
      {searching ? (
        <div className="h-fit w-fit animate-spin">
          <SpinnerIcon aria-hidden="true" width={16} height={16} className="text-gray" />
        </div>
      ) : (
        <SearchIcon aria-hidden="true" width={16} height={16} className="text-gray" />
      )}
    </div>
  );
}
