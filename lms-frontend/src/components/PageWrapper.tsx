"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { useMasteryStore } from '../store/useMasteryStore';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/';
  const { isReadingModeActive } = useMasteryStore();

  if (isDashboard) {
    return (
      <div className="w-full h-full flex-1">
        {children}
      </div>
    );
  }

  // For course articles (reading mode)
  return (
    <div className={`w-full flex-1 mx-auto transition-all duration-500 ease-in-out ${
      isReadingModeActive ? 'max-w-[850px] p-4 md:p-8' : 'max-w-[1200px] px-4 py-4 md:p-10 lg:p-12'
    }`}>
      {!isReadingModeActive && (
        <div id="breadcrumbs" className="text-[0.9rem] text-[var(--text-muted)] mb-5 font-medium">
          Home &gt; Playwright Guide
        </div>
      )}
      <article className="prose max-w-none">
        {children}
      </article>
    </div>
  );
}
