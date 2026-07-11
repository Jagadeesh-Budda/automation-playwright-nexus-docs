"use client";
import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';

export default function AudioReader() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSynth(window.speechSynthesis);
    }
    
    // Stop reading if user navigates away or unmounts the component
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggle = () => {
    if (!synth) return;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    // Attempt to extract text from the main content container
    const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
    if (!mainContent) return;

    // Clone the node so we can manipulate it without visually affecting the page
    const clone = mainContent.cloneNode(true) as HTMLElement;

    // Remove noisy elements: code blocks, inputs, buttons, and interactive quizzes
    const elementsToRemove = clone.querySelectorAll('pre, code, button, .quiz-item, input, textarea, nav, footer, header');
    elementsToRemove.forEach(el => el.remove());

    // Extract text content and clean up excessive whitespace
    const textToRead = clone.textContent?.replace(/\s+/g, ' ').trim() || '';

    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Try to find a premium/natural English voice if available
    const voices = synth.getVoices();
    const goodVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (goodVoice) {
      utterance.voice = goodVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    // Cancel any existing speech before starting new
    synth.cancel();
    synth.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button 
      onClick={handleToggle}
      title={isPlaying ? "Stop Reading" : "Read Article Aloud"}
      className="flex items-center justify-center p-2 rounded-full hover:bg-[var(--sidebar-bg)] text-[var(--text-main)] transition-colors border-none bg-transparent cursor-pointer group relative"
    >
      {isPlaying ? (
        <Square className="w-5 h-5 text-red-400 fill-red-400 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5 text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
      )}
      {isPlaying && (
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}
