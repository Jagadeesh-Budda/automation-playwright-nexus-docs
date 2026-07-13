"use client";
import React, { useEffect, useState } from 'react';
import { useMasteryStore } from '../store/useMasteryStore';
import { UserPlus, Sparkles, Key, Check, Loader2, X } from 'lucide-react';
import NavigationProgress from './NavigationProgress';
import { useSessionTracker } from '../hooks/useSessionTracker';
import { useCodeBlockCopy } from '../hooks/useCodeBlockCopy';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { 
    userName, userId, userProgress, initUser, setUser, 
    syncFromPayload, loading, isMobileSyncOpen, setMobileSyncOpen,
  } = useMasteryStore();

  useSessionTracker();
  useCodeBlockCopy();

  const [mounted, setMounted] = useState(false);
  
  // Setup modal local state
  const [nameInput, setNameInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initialize user profile & sync check
  useEffect(() => {
    setMounted(true);
    
    const checkSync = async () => {
      if (typeof window === 'undefined') return;
      let payloadStr = '';
      const hash = window.location.hash;
      if (hash.startsWith('#sync=')) {
        payloadStr = hash.substring(6);
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const syncQuery = searchParams.get('sync');
        if (syncQuery) payloadStr = syncQuery;
      }

      if (payloadStr) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(payloadStr))));
          if (decoded.userId && decoded.userName) {
            setSyncing(true);
            const success = await syncFromPayload(decoded);
            setSyncing(false);
            if (success) {
              // Clean URL
              window.location.hash = '';
              const url = new URL(window.location.href);
              url.searchParams.delete('sync');
              window.history.replaceState({}, '', url.pathname + url.search);
              showToast(`Successfully synced progress for ${decoded.userName}!`);
            } else {
              showToast('Failed to sync progress. Token or database issue.', 'error');
            }
          }
        } catch (e) {
          console.error("Failed to decode sync parameter:", e);
        }
      }
    };

    initUser().then(() => {
      checkSync();
    });
     
  }, [initUser, syncFromPayload]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    // Generate unique user ID
    const randomId = 'usr_' + Math.random().toString(36).substring(2, 11);
    await setUser(nameInput.trim(), randomId);
  };

  const handleTokenSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncError('');
    if (!tokenInput.trim()) return;

    try {
      let decodedPayload: any = null;
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(tokenInput.trim()))));
        if (decoded.userId && decoded.userName) {
          decodedPayload = decoded;
        }
      } catch (err) {
        // Not base64 json, treat as plain user ID
      }

      if (decodedPayload) {
        setSyncing(true);
        const success = await syncFromPayload(decodedPayload);
        setSyncing(false);
        if (success) {
          setShowTokenInput(false);
          setMobileSyncOpen(false);
          showToast('Progress successfully restored!', 'success');
        } else {
          setSyncError('Sync failed. Please verify the sync token.');
        }
      } else {
        const enteredId = tokenInput.trim();
        setSyncing(true);
        await setUser("Student", enteredId);
        setSyncing(false);
        setShowTokenInput(false);
        setMobileSyncOpen(false);
        showToast('Progress successfully restored!', 'success');
      }
    } catch (err: any) {
      setSyncError('Failed to parse token: ' + err.message);
    }
  };

  const handleCopySyncToken = () => {
    navigator.clipboard.writeText(syncPayload);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (!mounted) return null;

  // Render modal if user is not set and store is not loading anymore
  const showSetupModal = !loading && !userId;

  // Create base64 sync URL
  // We only need to sync the userId and userName; the client will fetch the actual progress from the DB
  const syncPayload = typeof window !== 'undefined' && userId ? btoa(
    unescape(encodeURIComponent(JSON.stringify({
      userId,
      userName,
      progress: []
    })))
  ) : '';

  const syncUrl = typeof window !== 'undefined' ? `${window.location.origin}/?sync=${syncPayload}` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(syncUrl)}`;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold transition-all animate-fade-in ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
            : 'bg-red-900/90 border-red-500/40 text-red-300'
        }`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.message}
        </div>
      )}
      {showSetupModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          {/* Glassmorphic card */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
            
            {/* Background decorative glow */}
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-[60px] pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-[60px] pointer-events-none" />

            <div className="relative text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Automation Nexus Setup</h3>
              <p className="text-xs text-slate-400 mt-1.5">Create your local profile to track code challenges and claim verified credentials.</p>
            </div>

            {syncing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm text-slate-300 mt-3 font-medium">Synchronizing learning profile...</p>
              </div>
            ) : !showTokenInput ? (
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!nameInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Initialize Profile
                </button>

                <div className="text-center pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTokenInput(true);
                      setSyncError('');
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer font-medium underline"
                  >
                    Restore from Sync Code or User ID
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleTokenSync} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                    Enter Sync Code / User ID
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste your base64 sync token or raw user ID here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-xs font-mono"
                  />
                </div>

                {syncError && (
                  <p className="text-xs text-red-400 font-medium m-0">{syncError}</p>
                )}

                <button
                  type="submit"
                  disabled={!tokenInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Verify & Import
                </button>

                <div className="text-center pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(false)}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer font-medium underline"
                  >
                    Back to Setup
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Mobile Sync QR Modal */}
      {isMobileSyncOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
            <button 
              onClick={() => setMobileSyncOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors cursor-pointer border-none flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-[60px] pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-[60px] pointer-events-none" />

            <h3 className="text-xl font-black text-white m-0 uppercase tracking-tight">Sync Progress to Mobile</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6">Scan the QR code on your phone or tablet to synchronize your learning progress instantly.</p>

            <div className="mx-auto bg-white p-4 rounded-xl border border-white/15 inline-block shadow-lg">
              {syncPayload ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrUrl} alt="Sync QR Code" className="w-[180px] h-[180px] display-block mx-auto" />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-500 text-xs text-center">
                  No profile loaded.<br />Create a profile first.
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-4 uppercase">Direct Sync Code</p>
            <div className="flex gap-2 max-w-sm mx-auto mt-1 mb-8">
              <input
                type="text"
                readOnly
                value={syncPayload}
                className="flex-1 px-3 py-2 bg-slate-950/60 border border-white/15 rounded-lg text-slate-400 font-mono text-[9px] focus:outline-none"
              />
              <button
                onClick={handleCopySyncToken}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-600 transition-colors cursor-pointer border-none flex items-center gap-1"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
              </button>
            </div>

            <div className="border-t border-white/10 pt-4 mt-6 mb-6">
              <h4 className="text-xs font-black text-white uppercase tracking-tight mb-2">Restore Previous Progress</h4>
              <p className="text-[10px] text-slate-400 mb-3">Paste your sync code or User ID below to overwrite this current session.</p>
              <form onSubmit={handleTokenSync} className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste sync code or User ID..."
                  className="flex-1 px-3 py-2 bg-slate-950/60 border border-white/15 rounded-lg text-white font-mono text-[9px] placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!tokenInput.trim() || syncing}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors cursor-pointer border-none flex items-center gap-1 disabled:opacity-50"
                >
                  {syncing ? '...' : 'Import'}
                </button>
              </form>
              {syncError && <p className="text-[10px] text-red-400 font-medium mt-2 mb-0">{syncError}</p>}
            </div>

            <button
              onClick={() => setMobileSyncOpen(false)}
              className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-750 cursor-pointer border-none"
            >
              Close Sync Tools
            </button>
          </div>
        </div>
      )}

      <NavigationProgress />
      {children}
    </>
  );
}
