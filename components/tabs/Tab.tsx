import Link from 'next/link';
import type { TaskStatus } from '@/types/task';
import { cn } from '@/utils/cn';

type Props = {
  tabId: TaskStatus;
  children: React.ReactNode;
  activeTab: string;
  header: string;
};

export default function Tab({ tabId, children, activeTab, header }: Props) {
  return (
    <Link
      scroll={false}
      className={cn(
        activeTab === tabId ? 'border-primary bg-primary-light' : 'border-transparent bg-primary-lighter',
        'flex w-full min-w-fit flex-col gap-3 border-b-4 p-3 -outline-offset-2 hover:bg-primary-light focus:outline-2 focus:outline-primary sm:gap-6 sm:p-6',
      )}
      href={tabId}
    >
      <h3 className="text-lg font-semibold">{header}</h3>
      {children}
    </Link>
  );
}
