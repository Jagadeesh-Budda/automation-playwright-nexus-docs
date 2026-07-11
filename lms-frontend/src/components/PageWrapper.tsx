"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/';

  if (isDashboard) {
    return (
      <div className="w-full h-full flex-1">
        {children}
      </div>
    );
  }

  // For course articles (reading mode)
  return (
    <div className="w-full flex-1 max-w-[1200px] mx-auto p-6 md:p-10 lg:p-12">
      <div id="breadcrumbs" className="text-[0.9rem] text-[var(--text-muted)] mb-5 font-medium">
        Home &gt; Playwright Guide
      </div>
      <article className="prose max-w-none">
        {children}
      </article>
    </div>
  );
}
