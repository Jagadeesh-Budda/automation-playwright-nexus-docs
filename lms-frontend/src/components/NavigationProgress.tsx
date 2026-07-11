"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * NavigationProgress
 * A slim, animated progress bar at the top of the page that fires on every
 * route change — giving students instant visual feedback when navigating
 * between chapters (e.g. 1.1 → 12.1) so they know something is happening.
 *
 * Behaviour:
 *  - Pathname changes → bar fills 0→85% quickly (indeterminate simulation)
 *  - After a short settle delay → bar snaps to 100% and fades out
 *  - On the NEXT pathname change the cycle resets
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    // Ignore the very first render (page load already done)
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    clear();
    // Kick off the bar
    setProgress(0);
    setVisible(true);

    // Simulate indeterminate progress: fast early, then slows near 85%
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 12 * (1 - current / 90); // slows down near 90
      if (current >= 85) {
        current = 85;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setProgress(Math.min(current, 85));
    }, 100);

    // After the page likely settled, complete and fade
    timerRef.current = setTimeout(() => {
      clear();
      setProgress(100);
      // Fade out after the completion flash
      setTimeout(() => setVisible(false), 400);
    }, 700);

    return clear;
  }, [pathname]);

  if (!visible) return null;

  return (
    <>
      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: "3px",
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #22d3ee, #38bdf8, #6366f1)",
            boxShadow: "0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)",
            borderRadius: "0 2px 2px 0",
            transition: progress === 100
              ? "width 0.15s ease-out, opacity 0.4s 0.2s"
              : "width 0.1s linear",
            opacity: progress === 100 ? 0 : 1,
          }}
        />
      </div>

      {/* Subtle full-page loading overlay so student knows content is loading */}
      <div
        style={{
          position: "fixed",
          top: "60px", // below the header
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9000,
          backdropFilter: "blur(1px)",
          background: "rgba(1, 4, 10, 0.35)",
          pointerEvents: "none",
          opacity: progress >= 100 ? 0 : 1,
          transition: "opacity 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Central loading chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(6, 13, 26, 0.9)",
            border: "1px solid rgba(34, 211, 238, 0.3)",
            borderRadius: "12px",
            padding: "14px 24px",
            boxShadow: "0 0 30px rgba(34, 211, 238, 0.15)",
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "2px solid rgba(34, 211, 238, 0.2)",
              borderTopColor: "#22d3ee",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#94a3b8",
              letterSpacing: "0.5px",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Loading chapter...
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
