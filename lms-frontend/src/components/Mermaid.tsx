"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        // Generate a unique ID for the svg to avoid conflicts
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (error) {
        console.error("Mermaid parsing error:", error);
        if (isMounted) {
          setSvg(`<div class="text-red-500 font-mono text-sm p-4 bg-red-950/20 border border-red-900 rounded">Failed to render diagram. Check console for errors.</div>`);
        }
      }
    };

    if (chart) {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div 
      className="mermaid-container flex justify-center my-8 p-6 bg-slate-900/50 rounded-xl border border-slate-800 shadow-inner overflow-x-auto" 
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
