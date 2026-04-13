import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#F1F1F1] bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-base font-bold text-[#030E18]">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[#6F6F6F]">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
    </header>
  );
}
