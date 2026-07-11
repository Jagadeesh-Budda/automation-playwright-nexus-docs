import React, { useState } from 'react';
import { Timer, FileSearch, UserX, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DeterministicRaceCondition() {
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchUsers = () => {
    setIsLoading(true);
    setError('');
    setUsers([]);

    // Check localStorage attempt tracker
    let attempts = parseInt(localStorage.getItem('jira102_attempts') || '0', 10);
    attempts += 1;
    localStorage.setItem('jira102_attempts', attempts.toString());

    // Deterministic Failure: On the exactly 3rd attempt, we introduce a massive 6000ms delay.
    // This perfectly simulates a race condition that breaks Playwright's default 5000ms timeout.
    const isRaceConditionAttempt = attempts === 3;
    const delayMs = isRaceConditionAttempt ? 6000 : 500;

    setTimeout(() => {
      setIsLoading(false);
      setUsers([
        { id: 1, name: 'Alice Smith' },
        { id: 2, name: 'Bob Jones' },
        { id: 3, name: 'Charlie Brown' }
      ]);
      
      // Reset after hitting the 3rd attempt so they can try again if they refresh
      if (isRaceConditionAttempt) {
        localStorage.setItem('jira102_attempts', '0');
      }
    }, delayMs);
  };

  const resetAttempts = () => {
    localStorage.setItem('jira102_attempts', '0');
    setUsers([]);
    setError('');
  };

  return (
    <div data-testid="challenge-jira-102" className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* JIRA Ticket Header */}
      <div className="bg-amber-950/40 border-b border-amber-900/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-amber-400" />
            <h3 className="text-amber-100 font-bold text-lg m-0">JIRA-102: The Race Condition</h3>
          </div>
          <button 
            onClick={resetAttempts}
            className="text-xs bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 px-2 py-1 rounded transition-colors"
          >
            Reset Simulator
          </button>
        </div>
        <p className="text-amber-200/70 text-sm mt-2 mb-0">
          <strong>Incident Report:</strong> The "Load Users" feature is flaky. It works most of the time, but occasionally the API takes longer than 5 seconds to respond, causing the test suite to timeout and fail.
          <br/>
          <strong>Your Goal:</strong> Click the button 3 times. On the 3rd click, the API will artificially delay for 6000ms. Your Playwright test must handle this race condition gracefully without modifying the global 5000ms timeout. (Hint: use <code>expect.toPass</code> or explicit wait strategies).
        </p>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-300 font-bold">Admin Directory</h4>
              <button 
                onClick={handleFetchUsers}
                disabled={isLoading}
                data-testid="load-users-btn"
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileSearch className="w-4 h-4" />
                )}
                {isLoading ? 'Fetching...' : 'Load Users'}
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 min-h-[200px] p-4 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-3" />
                  <p className="text-sm">Connecting to database...</p>
                </div>
              ) : users.length > 0 ? (
                <ul className="space-y-2" data-testid="user-list">
                  {users.map(user => (
                    <li key={user.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-slate-300">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-slate-200">{user.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <UserX className="w-8 h-8 mb-3 opacity-50" />
                  <p className="text-sm">No users loaded.</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-64 bg-slate-800/50 rounded-lg border border-slate-700 p-4 self-start">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <ShieldAlert className="w-4 h-4" />
              <h5 className="font-bold text-sm">Attempt Tracker</h5>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              The mock API tracks how many times you've clicked the button.
            </p>
            <div className="bg-slate-900 rounded p-3 text-center border border-slate-700">
              <span className="text-2xl font-mono text-amber-400">
                {typeof window !== 'undefined' ? localStorage.getItem('jira102_attempts') || '0' : '0'} / 3
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center uppercase tracking-wider">
              Attempt 3 will timeout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
