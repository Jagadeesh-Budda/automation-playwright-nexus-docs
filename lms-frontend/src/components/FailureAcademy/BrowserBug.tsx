import React, { useState, useEffect } from 'react';
import { Bug, Save, Eye, AlertOctagon } from 'lucide-react';

export default function BrowserBug() {
  const [isFirefox, setIsFirefox] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Detect Firefox user agent
    if (navigator.userAgent.toLowerCase().includes('firefox')) {
      setIsFirefox(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div data-testid="challenge-jira-103" className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden font-sans shadow-2xl relative">
      {/* JIRA Ticket Header */}
      <div className="bg-purple-950/40 border-b border-purple-900/50 p-4 relative z-20">
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-purple-400" />
          <h3 className="text-purple-100 font-bold text-lg m-0">JIRA-103: Firefox Layout Defect</h3>
        </div>
        <p className="text-purple-200/70 text-sm mt-2 mb-0">
          <strong>Incident Report:</strong> Customers using Firefox cannot update their profile. The "Save Changes" button is completely unclickable.
          <br/>
          <strong>Your Goal:</strong> Write a test that runs on multiple browsers. Observe the test passing in Chromium but failing in Firefox due to an overlapping element blocking pointer events.
        </p>
      </div>

      <div className="p-6 md:p-8 relative z-10">
        <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-6">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2">Profile Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                <input 
                  type="text" 
                  defaultValue="Jane"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                <input 
                  type="text" 
                  defaultValue="Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Theme Preference</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white outline-none">
                <option>Dark Mode (Default)</option>
                <option>Light Mode</option>
                <option>System Match</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {saved ? (
              <span className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" /> Changes applied
              </span>
            ) : (
              <span className="text-slate-500 text-sm">Unsaved changes</span>
            )}
            
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 relative z-0"
              data-testid="save-profile"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* 
        DETERMINISTIC FIREFOX BUG: 
        If Firefox is detected, we render an absolutely positioned div that overlaps the bottom half of the card,
        specifically sitting right on top of the "Save Changes" button and capturing pointer events.
        Chromium ignores this branch entirely.
      */}
      {isFirefox && (
        <div 
          className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-50 flex items-end justify-center pb-4"
          style={{ pointerEvents: 'auto' }} // Crucial: This intercepts the click
        >
          <div className="flex items-center gap-2 text-xs text-purple-400/50 uppercase tracking-widest font-bold">
            <AlertOctagon className="w-3 h-3" />
            <span>Invisible Cookie Banner (Intercepting Clicks)</span>
          </div>
        </div>
      )}
    </div>
  );
}
