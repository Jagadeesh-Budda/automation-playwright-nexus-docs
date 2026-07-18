"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMasteryStore } from '../store/useMasteryStore';
import { 
  Volume2, Play, Pause, Square, SkipBack, SkipForward, RotateCcw, X, 
  HelpCircle, BookOpen, BookOpenCheck 
} from 'lucide-react';
import { createPortal } from 'react-dom';

export default function AudioReader() {
  const pathname = usePathname();
  const isCoursePage = pathname.startsWith('/courses/playwright/');
  const moduleId = isCoursePage ? pathname.split('/').pop() || '' : '';

  const { isReadingModeActive, setReadingModeActive } = useMasteryStore();

  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalParagraphs, setTotalParagraphs] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [mounted, setMounted] = useState(false);
  
  const [isQuizPromptOpen, setIsQuizPromptOpen] = useState(false);

  // Recursively collect all readable DOM elements from the MDX content container
  const getReadableElements = useCallback((): HTMLElement[] => {
    if (typeof document === 'undefined') return [];
    const root = document.querySelector('article') || document.querySelector('main') || document.body;
    const result: HTMLElement[] = [];
    
    function traverse(node: Node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        
        // Skip code, script elements, editor wrappers, button inputs
        if (['pre', 'code', 'button', 'input', 'textarea', 'select', 'svg', 'canvas', 'iframe', 'nav', 'footer', 'header', 'script', 'style'].includes(tagName)) {
          return;
        }
        
        // Skip quiz wrappers or trace challenge blocks
        if (el.classList.contains('quiz-item') || el.classList.contains('code-editor') || el.classList.contains('solution-gate') || el.id === 'breadcrumbs') {
          return;
        }
        
        // Collect standard text nodes
        if (['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tagName)) {
          result.push(el);
          return;
        }
      }
      node.childNodes.forEach(child => traverse(child));
    }
    
    traverse(root);
    return result;
  }, []);

  // Initialize SpeechSynthesis and load system voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = window.speechSynthesis;
    setSynth(s);

    const updateVoices = () => {
      const allVoices = s.getVoices();
      setVoices(allVoices);
      
      const savedVoice = localStorage.getItem('nexus_reader_voice');
      if (savedVoice && allVoices.some(v => v.name === savedVoice)) {
        setSelectedVoiceName(savedVoice);
      } else {
        const defaultVoice = allVoices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Microsoft'))) || allVoices[0];
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };

    updateVoices();
    s.onvoiceschanged = updateVoices;

    updateVoices();
    s.onvoiceschanged = updateVoices;

    const savedSpeed = localStorage.getItem('nexus_reader_speed');
    if (savedSpeed) {
      setSpeed(parseFloat(savedSpeed));
    }

    setMounted(true);

    return () => {
      s.cancel();
      s.onvoiceschanged = null;
    };
  }, []);

  // Sync index and count when opening the player
  useEffect(() => {
    if (isCoursePage && isPlayerOpen) {
      const elements = getReadableElements();
      setTotalParagraphs(elements.length);
      
      const savedIndex = localStorage.getItem(`nexus_read_index_${moduleId}`);
      if (savedIndex) {
        const idx = parseInt(savedIndex);
        if (idx >= 0 && idx < elements.length) {
          setCurrentIndex(idx);
        }
      }
    }
  }, [isCoursePage, isPlayerOpen, moduleId, getReadableElements]);

  // Speech core speaker execution
  const speakCurrentParagraph = (index: number) => {
    if (!synth) return;
    synth.cancel();

    // Small delay after cancel() — Chrome silently drops utterances if speak() is called immediately after cancel()
    setTimeout(() => {
      const elements = getReadableElements();
      setTotalParagraphs(elements.length);
      
      if (elements.length === 0) {
        console.warn('[AudioReader] No readable elements found in <article>. MDX content may not have loaded yet.');
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      if (index < 0 || index >= elements.length) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const targetEl = elements[index];
      const text = targetEl.textContent?.trim() || '';
      if (!text) {
        const nextIdx = index + 1;
        setCurrentIndex(nextIdx);
        speakCurrentParagraph(nextIdx);
        return;
      }

      // Highlight the active text element in the DOM
      elements.forEach((el, idx) => {
        if (idx === index) {
          el.classList.add('speech-active-highlight');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          el.classList.remove('speech-active-highlight');
        }
      });

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      
      const matchedVoice = voices.find(v => v.name === selectedVoiceName);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        targetEl.classList.remove('speech-active-highlight');
        
        const nextIdx = index + 1;
        if (nextIdx < elements.length) {
          // Look ahead: pause if next block is a Quiz Component
          const nextEl = elements[nextIdx];
          const isNextQuiz = nextEl.closest('.quiz-item') || nextEl.classList.contains('quiz-item') || nextEl.id === 'quiz-section' || nextEl.textContent?.includes('Quiz:');
          
          if (isNextQuiz) {
            setIsPaused(true);
            setIsPlaying(false);
            setIsQuizPromptOpen(true);
            setCurrentIndex(nextIdx);
          } else {
            setCurrentIndex(nextIdx);
            speakCurrentParagraph(nextIdx);
          }
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentIndex(0);
          localStorage.removeItem(`nexus_read_index_${moduleId}`);
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted') return; // Normal lifecycle cancel/skip trigger
        console.error('[AudioReader] Speech error:', e.error);
        setIsPlaying(false);
        setIsPaused(false);
      };

      synth.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
      localStorage.setItem(`nexus_read_index_${moduleId}`, index.toString());
    }, 50);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        synth?.resume();
        setIsPaused(false);
      } else {
        synth?.pause();
        setIsPaused(true);
      }
    } else {
      speakCurrentParagraph(currentIndex);
    }
  };

  const handleStop = () => {
    synth?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setIsQuizPromptOpen(false);
    
    const elements = getReadableElements();
    elements.forEach(el => el.classList.remove('speech-active-highlight'));
  };

  const handleSkipNext = () => {
    const elements = getReadableElements();
    const nextIdx = currentIndex + 1;
    if (nextIdx < elements.length) {
      setCurrentIndex(nextIdx);
      if (isPlaying || isPaused) {
        speakCurrentParagraph(nextIdx);
      }
    }
  };

  const handleSkipPrev = () => {
    const nextIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(nextIdx);
    if (isPlaying || isPaused) {
      speakCurrentParagraph(nextIdx);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    speakCurrentParagraph(0);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    localStorage.setItem('nexus_reader_speed', newSpeed.toString());
    if (isPlaying && !isPaused) {
      speakCurrentParagraph(currentIndex);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedVoiceName(name);
    localStorage.setItem('nexus_reader_voice', name);
    if (isPlaying && !isPaused) {
      speakCurrentParagraph(currentIndex);
    }
  };

  // Keyboard Hotkey Shortcuts listener
  useEffect(() => {
    if (!isCoursePage || !isPlayerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
      } else if (e.altKey && e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkipNext();
      } else if (e.altKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkipPrev();
      } else if (e.key === '+') {
        e.preventDefault();
        const next = Math.min(2.0, speed + 0.25);
        handleSpeedChange(next);
      } else if (e.key === '-') {
        e.preventDefault();
        const next = Math.max(0.75, speed - 0.25);
        handleSpeedChange(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCoursePage, isPlayerOpen, isPlaying, isPaused, currentIndex, speed, selectedVoiceName]);

  if (!isCoursePage) return null;

  return (
    <>
      {/* Header Activation Button */}
      <button 
        onClick={() => setIsPlayerOpen(!isPlayerOpen)}
        title="Smart Reader Controls"
        className={`flex items-center justify-center p-2 rounded-full hover:bg-[var(--sidebar-bg)] text-[var(--text-main)] transition-all duration-300 border-none bg-transparent cursor-pointer group relative ${
          isPlayerOpen ? 'bg-cyan-500/10 text-cyan-400' : ''
        }`}
      >
        <Volume2 className={`w-5 h-5 ${isPlayerOpen ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400 group-hover:text-[#38bdf8]'}`} />
        {isPlaying && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        )}
      </button>

      {isPlayerOpen && mounted && createPortal(
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-xl bg-slate-950/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-[9999] flex flex-col gap-3 font-sans transition-all duration-300 ease-in-out border-cyan-500/10">
          
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Reader Mode</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-1 font-mono">
                {currentIndex + 1} / {totalParagraphs || 1}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Reading Mode Toggle */}
              <button
                onClick={() => setReadingModeActive(!isReadingModeActive)}
                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all ${
                  isReadingModeActive 
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
                title="Toggle Reading Focus Mode"
              >
                {isReadingModeActive ? <BookOpenCheck className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Focus Mode</span>
              </button>
              
              <button 
                onClick={() => {
                  handleStop();
                  setIsPlayerOpen(false);
                }}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quiz Section Intercept Alert overlay */}
          {isQuizPromptOpen && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-center flex flex-col gap-2.5 animate-celebration-in">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                You've reached the quiz section!
              </div>
              <div className="text-[11px] text-slate-300 leading-normal">
                Would you like to continue listening, or pause the reader to solve the quiz question now?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsQuizPromptOpen(false);
                    setReadingModeActive(false);
                    // Scroll to first quiz item
                    document.querySelector('.quiz-item')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 border border-amber-500/30 cursor-pointer transition-colors"
                >
                  Answer Quiz
                </button>
                <button
                  onClick={() => {
                    setIsQuizPromptOpen(false);
                    speakCurrentParagraph(currentIndex);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
                >
                  Keep Listening
                </button>
              </div>
            </div>
          )}

          {/* Controls button panel */}
          {!isQuizPromptOpen && (
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleRestart}
                  title="Restart Lesson"
                  className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleSkipPrev}
                  title="Previous Paragraph"
                  className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Play Action */}
              <button 
                onClick={handlePlayToggle}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:scale-105 border-none cursor-pointer transition-transform"
              >
                {isPlaying && !isPaused ? <Pause className="w-5 h-5 fill-white text-white" /> : <Play className="w-5 h-5 fill-white text-white ml-0.5" />}
              </button>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleSkipNext}
                  title="Next Paragraph"
                  className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleStop}
                  title="Stop"
                  className="p-2 rounded-lg bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-900/50 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-red-400/10" />
                </button>
              </div>
            </div>
          )}

          {/* Settings Grid (Voice & Speed selectors) */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-2.5 text-left">
            {/* Voice Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Voice</label>
              <select 
                value={selectedVoiceName}
                onChange={handleVoiceChange}
                className="w-full bg-slate-900 text-slate-300 text-xs py-1.5 px-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {voices.length === 0 ? (
                  <option>Loading System Voices...</option>
                ) : (
                  voices.map((voice, idx) => (
                    <option key={`${voice.name}-${idx}`} value={voice.name}>
                      {voice.name.replace('Microsoft', 'MS').replace('Google', 'Google').substring(0, 24)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Speed selection pills */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reading Speed</label>
              <div className="flex gap-1">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all ${
                      speed === s 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold' 
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simple progress bar */}
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${totalParagraphs > 0 ? Math.round(((currentIndex + 1) / totalParagraphs) * 100) : 0}%` }}
            />
          </div>

        </div>,
        document.body
      )}
    </>
  );
}
