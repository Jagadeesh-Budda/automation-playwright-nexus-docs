"use client";
import React from 'react';
import { useMasteryStore } from '../store/useMasteryStore';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const { isSidebarExpanded } = useMasteryStore();

  return (
    <div 
      id="main-wrapper" 
      className={`flex-1 min-h-screen flex flex-col transition-[margin-left] duration-300 ease-in-out ${
        isSidebarExpanded ? 'ml-[260px]' : 'ml-[70px]'
      }`}
    >
      {children}
    </div>
  );
}
