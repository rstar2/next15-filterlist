import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function NavTabs({ children }: Props) {
  return (
    <div role="tablist" className="flex gap-6 overflow-auto">
      {children}
    </div>
  );
}
