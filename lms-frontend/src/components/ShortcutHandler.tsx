"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMasteryStore } from '../store/useMasteryStore';
import modulesData from '../data/metadata.json';

export default function ShortcutHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    userProgress,
    bookmarkedResources,
    getFirstIncompleteModule,
    isCommandPaletteOpen,
    setCommandPaletteOpen
  } = useMasteryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Command Palette: Ctrl + K
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // 2. Focus Search: Ctrl + /
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 3. Revision Center: Ctrl + Shift + R
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        router.push('/revision-center');
        return;
      }

      // 4. Continue Learning: Ctrl + Shift + L
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        // Priority logic for Continue Learning:
        // 1. Unfinished lesson/exercise (score in userProgress is > 0 and < 80)
        let targetId = modulesData.find(m => userProgress[m.id] !== undefined && userProgress[m.id] > 0 && userProgress[m.id] < 80)?.id;
        
        // 2. Bookmarked lesson
        if (!targetId && bookmarkedResources.length > 0) {
          targetId = bookmarkedResources[0];
        }

        // 3. Next progression
        if (!targetId) {
          const nextIncomplete = getFirstIncompleteModule();
          if (nextIncomplete) {
            targetId = nextIncomplete.id;
          }
        }

        // Fallback to first lesson
        if (!targetId) {
          targetId = modulesData[0]?.id;
        }

        const match = modulesData.find(m => m.id === targetId);
        if (match) {
          router.push(`/courses/playwright/${match.slug}`);
        }
        return;
      }

      // Alt + Arrow keys for prev/next lesson (only inside course path)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (pathname?.includes('/courses/playwright/')) {
          e.preventDefault();
          const currentSlug = pathname.split('/').pop() || '';
          const currentIndex = modulesData.findIndex(m => m.slug === currentSlug);

          if (currentIndex !== -1) {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
              const prev = modulesData[currentIndex - 1];
              router.push(`/courses/playwright/${prev.slug}`);
            } else if (e.key === 'ArrowRight' && currentIndex < modulesData.length - 1) {
              const next = modulesData[currentIndex + 1];
              router.push(`/courses/playwright/${next.slug}`);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, userProgress, bookmarkedResources, getFirstIncompleteModule, isCommandPaletteOpen, setCommandPaletteOpen, router]);

  return null;
}
