'use client';

import { useParams } from 'next/navigation';
import React, { use } from 'react';
import type { TaskStatus, TaskSummary } from '@/types/task';
import { cn } from '@/utils/cn';
import { getCategoryColor } from '@/utils/getCategoryColor';
import Skeleton from '../ui/Skeleton';
import Tab from './Tab';

type Props = {
  taskSummaryPromise: Promise<TaskSummary>;
};

export default function Tabs({ taskSummaryPromise }: Props) {
  const taskSummary = use(taskSummaryPromise);
  const activeTab = useParams().tab as TaskStatus;

  const mapTasks = (status: TaskStatus) => {
    return (
      <div className="flex flex-col gap-2">
        {Object.entries(taskSummary[status]).map(([id, category]) => {
          const color = getCategoryColor(Number(id));
          return (
            <div key={id} className="flex items-center gap-2">
              <span className={cn(color, 'size-4')} />
              {category.count} {category.name}
            </div>
          );
        })}
      </div>
    );
  };

  const getTaskCount = (status: TaskStatus) => {
    return Object.values(taskSummary[status]).reduce((acc, category) => {
      return acc + category.count;
    }, 0);
  };

  return (
    <div className="flex gap-6 overflow-auto">
      <Tab header={`TODO (${getTaskCount('todo')})`} activeTab={activeTab} tabId="todo">
        {mapTasks('todo')}
      </Tab>
      <Tab header={`IN PROGRESS (${getTaskCount('inprogress')})`} activeTab={activeTab} tabId="inprogress">
        {mapTasks('inprogress')}
      </Tab>
      <Tab header={`DONE (${getTaskCount('done')})`} activeTab={activeTab} tabId="done">
        {mapTasks('done')}
      </Tab>
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="flex gap-6 overflow-auto">
      <Skeleton className="h-[169px] sm:h-48" />
      <Skeleton className="h-[169px] sm:h-48" />
      <Skeleton className="h-[169px] sm:h-48" />
    </div>
  );
}
