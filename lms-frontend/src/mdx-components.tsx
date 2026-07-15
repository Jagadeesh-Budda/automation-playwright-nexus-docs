import type { MDXComponents } from 'mdx/types';
import Quiz from './components/Quiz';
import CodeEditor from './components/CodeEditor';
import CertificateClaim from './components/CertificateClaim';
import TraceChallenge from './components/TraceChallenge';
import PRReviewChallenge from './components/PRReviewChallenge';
import ArchitectureReviewChallenge from './components/ArchitectureReviewChallenge';
import { Tabs, Tab } from './components/Tabs';
import AlertBox from './components/AlertBox';
import SolutionGate from './components/SolutionGate';
import React from 'react';
import modulesData from './data/metadata.json';
import dynamic from 'next/dynamic';

const CodeExplainer = dynamic(() => import('./components/CodeExplainer'), {
  loading: () => <div className="h-20 bg-slate-900 animate-pulse rounded-xl border border-white/5" />
});

const extractText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node) && node.props && typeof node.props === 'object' && 'children' in node.props) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
};

const stripPrefix = (node: React.ReactNode, prefixToStrip: string): React.ReactNode => {
  if (typeof node === 'string') {
    const trimmed = node.trimStart();
    if (trimmed.startsWith(prefixToStrip)) {
      return trimmed.substring(prefixToStrip.length).trimStart();
    }
    return node;
  }
  if (Array.isArray(node)) {
    let stripped = false;
    return React.Children.map(node, child => {
      if (!stripped) {
        const textBefore = extractText(child).trimStart();
        if (textBefore.startsWith(prefixToStrip)) {
          stripped = true;
          return stripPrefix(child, prefixToStrip);
        }
      }
      return child;
    });
  }
  if (React.isValidElement(node) && node.props && typeof node.props === 'object' && 'children' in node.props) {
    const newChildren = stripPrefix((node.props as { children?: React.ReactNode }).children, prefixToStrip);
    if (newChildren !== (node.props as { children?: React.ReactNode }).children) {
      return React.cloneElement(node as React.ReactElement, {}, newChildren);
    }
  }
  return node;
};

const CustomBlockquote = ({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
  const childrenArray = React.Children.toArray(children);
  const fullText = extractText(childrenArray).trimStart();
  const match = fullText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
  
  if (match) {
    const type = match[1].toUpperCase();
    const prefixString = match[0]; // e.g. "[!CAUTION]"
    
    // Strip the prefix from the react tree
    const cleanChildren = stripPrefix(childrenArray, prefixString);
    
    return <AlertBox type={type}>{cleanChildren}</AlertBox>;
  }
  
  // Tailwind typography plugin applies automatic quotes to blockquotes.
  // We remove the italic and blockquote styles if it's not an alert, but maybe we should keep them.
  return (
    <blockquote className="border-l-4 border-cyan-500/30 pl-5 py-2 my-6 bg-slate-100 dark:bg-slate-900/40 rounded-r-lg text-slate-700 dark:text-slate-300" {...props}>
      {children}
    </blockquote>
  );
};

import Mermaid from './components/Mermaid';

const CustomPre = (props: React.HTMLAttributes<HTMLPreElement>) => {
  const child = React.Children.toArray(props.children)[0];
  if (
    React.isValidElement(child) &&
    child.type === 'code' &&
    (child.props as React.HTMLAttributes<HTMLElement>).className === 'language-mermaid'
  ) {
    const chart = extractText((child.props as { children?: React.ReactNode }).children);
    return <Mermaid chart={chart} />;
  }
  return <pre {...props} />;
};

const CustomH1 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  const fullText = extractText(React.Children.toArray(children));
  const match = fullText.match(/^([0-9]+\.[0-9]+:|\d+:)(.*)$/);

  // Attempt to find metadata in modules.json based on the exact title
  const moduleData = modulesData.find(m => m.title.trim() === fullText.trim() || m.title.replace(':', '') === fullText.replace(':', ''));

  const metaTags = moduleData && moduleData.meta ? (
    <div className="flex flex-wrap items-center gap-3 mt-5 mb-8 text-sm font-semibold tracking-normal">
      {moduleData.meta.time && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {moduleData.meta.time}
        </span>
      )}
      {moduleData.meta.type && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          {moduleData.meta.type}
        </span>
      )}
      {moduleData.hasTasks && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          Interactive Exercise
        </span>
      )}
    </div>
  ) : null;

  if (match) {
    const prefix = match[1];
    const rest = match[2];
    return (
      <div className="mb-10 pb-6 border-b border-slate-800/60">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight flex flex-col md:flex-row md:items-center gap-4" {...props}>
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-2xl md:text-3xl shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            {prefix.replace(':', '')}
          </span>
          <span className="bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            {rest.trim()}
          </span>
        </h1>
        {metaTags}
      </div>
    );
  }

  return (
    <div className="mb-10 pb-6 border-b border-slate-800/60">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent" {...props}>
        {children}
      </h1>
      {metaTags}
    </div>
  );
};

const CustomH2 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  const fullText = extractText(React.Children.toArray(children));
  const match = fullText.match(/^(\d+\.)(.*)$/);

  if (match) {
    const prefix = match[1];
    const rest = match[2];
    return (
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-16 mb-6 flex items-center gap-3 text-slate-800 dark:text-slate-100 border-b border-slate-300 dark:border-slate-800/40 pb-3" {...props}>
        <span className="text-cyan-600 dark:text-cyan-400 font-black">{prefix}</span>
        <span>{rest.trim()}</span>
      </h2>
    );
  }

  return (
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-16 mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-300 dark:border-slate-800/40 pb-3" {...props}>
      {children}
    </h2>
  );
};

const CustomTable = (props: React.TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="table-responsive-wrapper">
      <table {...props} />
    </div>
  );
};

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    CodeEditor,
    CertificateClaim,
    CodeExplainer,
    TraceChallenge,
    PRReviewChallenge,
    ArchitectureReviewChallenge,
    SolutionGate,
    Tabs,
    Tab,
    blockquote: CustomBlockquote,
    pre: CustomPre,
    h1: CustomH1,
    h2: CustomH2,
    table: CustomTable
  };
}
