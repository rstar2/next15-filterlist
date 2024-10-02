'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { TodoStatus } from '@/types/todo';
import { cn } from '@/utils/cn';

type Props = {
  tabId: TodoStatus;
  children: React.ReactNode;
  activeTab: string;
  header: string;
  setOptimisticTab: (_tabId: string) => void;
};

export default function Tab({ tabId, children, activeTab, header, setOptimisticTab }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Link
      data-pending={isPending ? '' : undefined}
      className={cn(
        activeTab === tabId
          ? 'border-primary bg-primary-light'
          : isPending
            ? 'bg-primary-light'
            : 'border-transparent bg-primary-lighter',
        'flex w-full min-w-fit flex-col gap-3 border-b-4 p-3 -outline-offset-2 hover:bg-primary-light focus:outline-2 focus:outline-primary sm:gap-6 sm:p-6',
      )}
      onClick={e => {
        e.preventDefault();
        startTransition(() => {
          setOptimisticTab(tabId);
          router.push('/' + tabId);
        });
      }}
      href={tabId}
    >
      <h3 className="text-lg font-semibold">{header}</h3>
      {children}
    </Link>
  );
}