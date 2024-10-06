import React from 'react';
import { cn } from '@/utils/cn';

export type Props = {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  active?: boolean;
  className?: string;
};

export default function ToggleButton({
  children,
  type,
  active,
  ...otherProps
}: Props & React.HTMLProps<HTMLButtonElement>) {
  const inactiveClass = 'outline-primary focus:outline-2 bg-white text-black hover:bg-gray-light';
  const activeClass = 'outline-white focus:outline focus:-outline-offset-4 hover:bg-primary-dark bg-primary text-white';

  return (
    <button
      {...otherProps}
      type={type}
      className={cn(
        active ? activeClass : inactiveClass,
        'disabled:border-gray w-fit rounded border border-primary px-4 py-2 disabled:opacity-50',
      )}
    >
      {children}
    </button>
  );
}
