"use client";
import React, { useState } from 'react';

export function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  
  // Convert children to an array to map over them
  const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden my-8">
      <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
        {childrenArray.map((child, index) => {
          const tabChild = child as React.ReactElement<{ title: string }>;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === index 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              {tabChild.props.title}
            </button>
          );
        })}
      </div>
      <div className="p-6">
        {childrenArray[activeTab]}
      </div>
    </div>
  );
}

export function Tab({ children }: { children: React.ReactNode, title: string }) {
  return <div>{children}</div>;
}
