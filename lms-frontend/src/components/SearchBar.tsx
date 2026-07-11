"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { Search, X, Clock, BookOpen, ChevronRight } from "lucide-react";
import Fuse from "fuse.js";
import searchIndexData from "../data/search-index.json";

interface SearchEntry {
  id: string;
  title: string;
  group: string;
  url: string;
  type: string;
  time: string;
  outcome: string;
  keywords: string;
  content: string;
  snippet: string;
}

const fuse = new Fuse(searchIndexData as SearchEntry[], {
  keys: [
    { name: "title", weight: 3 },
    { name: "outcome", weight: 2 },
    { name: "keywords", weight: 2 },
    { name: "content", weight: 1 },
    { name: "snippet", weight: 1 },
  ],
  threshold: 0.35,
  includeMatches: true,
  minMatchCharLength: 2,
});

const TYPE_COLORS: Record<string, string> = {
  Concept: "#6366f1",
  Code: "#10b981",
  Execution: "#f59e0b",
  Debug: "#ef4444",
  Architecture: "#8b5cf6",
};

const RECENT_KEY = "lms_recent_searches";

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const recents = getRecent().filter((r) => r !== query);
  recents.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 5)));
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((r) => r.item).slice(0, 8);
  }, [query]);

  // Update recents when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecent());
    }
  }, [isOpen]);

  // Global keyboard shortcut: Ctrl+K or / to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = (url: string, title: string) => {
    saveRecent(title);
    setQuery("");
    setIsOpen(false);
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    const items = results.length > 0 ? results : [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && items[activeIndex]) {
      navigate(items[activeIndex].url, items[activeIndex].title);
    }
  };

  const showRecents = isOpen && !query && recentSearches.length > 0;
  const showResults = isOpen && query && results.length > 0;
  const showEmpty = isOpen && query && results.length === 0;
  const showDefault = isOpen && !query && recentSearches.length === 0;

  return (
    <div className="search-container" style={{ position: "relative", width: "380px" }}>
      {/* Search Input */}
      <div style={{ position: "relative" }}>
        <Search
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "16px",
            height: "16px",
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={`Search all ${searchIndexData.length} lessons…  Ctrl+K`}
          style={{
            width: "100%",
            padding: "10px 40px 10px 38px",
            borderRadius: "10px",
            border: "1.5px solid var(--border-color)",
            background: "var(--sidebar-bg)",
            color: "var(--text-main)",
            fontSize: "0.875rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLInputElement).style.borderColor = "var(--accent)")
          }
          onMouseLeave={(e) => {
            if (document.activeElement !== e.target)
              (e.target as HTMLInputElement).style.borderColor = "var(--border-color)";
          }}
          onFocusCapture={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlurCapture={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X style={{ width: "14px", height: "14px" }} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "var(--bg-color)",
            border: "1.5px solid var(--border-color)",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            zIndex: 9999,
            overflow: "hidden",
            maxHeight: "480px",
            overflowY: "auto",
          }}
        >
          {/* Recent Searches */}
          {showRecents && (
            <div>
              <div style={{ padding: "10px 16px 6px", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Recent Searches
              </div>
              {recentSearches.map((r) => (
                <button
                  key={r}
                  onClick={() => setQuery(r)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <Clock style={{ width: "14px", height: "14px", color: "var(--text-muted)", flexShrink: 0 }} />
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Default hint */}
          {showDefault && (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <BookOpen style={{ width: "32px", height: "32px", margin: "0 auto 8px", opacity: 0.4 }} />
              <div>Start typing to search across all {searchIndexData.length} Playwright lessons</div>
              <div style={{ marginTop: "6px", fontSize: "0.75rem", opacity: 0.6 }}>
                Press <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.7rem" }}>↑</kbd>{" "}
                <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.7rem" }}>↓</kbd> to navigate,{" "}
                <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.7rem" }}>↵</kbd> to open
              </div>
            </div>
          )}

          {/* Search Results */}
          {showResults && (
            <div>
              <div style={{ padding: "10px 16px 6px", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </div>
              {results.map((result, i) => (
                <button
                  key={result.id}
                  onClick={() => navigate(result.url, result.title)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 16px",
                    background: i === activeIndex ? "var(--sidebar-bg)" : "none",
                    border: "none",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                    borderBottom: i < results.length - 1 ? "1px solid var(--border-color)" : "none",
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {/* Type badge */}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      background: (TYPE_COLORS[result.type] || "#6366f1") + "22",
                      color: TYPE_COLORS[result.type] || "#6366f1",
                      flexShrink: 0,
                      marginTop: "2px",
                      minWidth: "60px",
                      textAlign: "center",
                    }}
                  >
                    {result.type}
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.3 }}>
                      {result.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {result.snippet || result.outcome}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "3px", opacity: 0.7 }}>
                      {result.group} · {result.time}
                    </div>
                  </div>

                  <ChevronRight style={{ width: "14px", height: "14px", color: "var(--text-muted)", flexShrink: 0, marginTop: "4px" }} />
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <Search style={{ width: "28px", height: "28px", margin: "0 auto 8px", opacity: 0.3 }} />
              <div>No lessons found for &ldquo;<strong>{query}</strong>&rdquo;</div>
              <div style={{ marginTop: "4px", fontSize: "0.75rem" }}>Try: locators, fixtures, assertions, e-sign, api...</div>
            </div>
          )}

          {/* Footer */}
          {showResults && (
            <div style={{
              padding: "8px 16px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              background: "var(--sidebar-bg)",
            }}>
              <span>{searchIndexData.length} lessons indexed</span>
              <span>Powered by Fuse.js</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
