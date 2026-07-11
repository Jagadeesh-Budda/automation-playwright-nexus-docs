import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ServerCrash, CreditCard } from 'lucide-react';

export default function FlakyCheckout() {
  const [isCI, setIsCI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Deterministic trigger: checking if ?env=ci is in the URL
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('env') === 'ci') {
      setIsCI(true);
    }
  }, []);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div data-testid="challenge-jira-101" className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* JIRA Ticket Header */}
      <div className="bg-rose-950/40 border-b border-rose-900/50 p-4">
        <div className="flex items-center gap-3">
          <ServerCrash className="w-5 h-5 text-rose-400" />
          <h3 className="text-rose-100 font-bold text-lg m-0">JIRA-101: Environment Drift</h3>
        </div>
        <p className="text-rose-200/70 text-sm mt-2 mb-0">
          <strong>Incident Report:</strong> The checkout flow works perfectly on local developer machines, but fails 100% of the time in GitHub Actions.
          <br/>
          <strong>Your Goal:</strong> Write a Playwright test that passes locally, but use the URL parameter <code>?env=ci</code> to reproduce the CI failure. Fix the brittle locator.
        </p>
      </div>

      <div className="p-6 md:p-8">
        {isSuccess ? (
          <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-emerald-100 text-xl font-bold mb-2">Order Confirmed!</h4>
            <p className="text-emerald-200/70">Thank you for your purchase.</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="mt-6 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition-colors text-sm font-semibold"
            >
              Place Another Order
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="max-w-md mx-auto space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 text-slate-300">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Total Amount</span>
                </div>
                {/* IN THE CI ENVIRONMENT, WE FORMAT THE PRICE DIFFERENTLY AND STRIP THE TEST ID */}
                {isCI ? (
                  <span className="text-xl font-bold text-white">$ 99 . 00 USD</span>
                ) : (
                  <span data-testid="checkout-total" className="text-xl font-bold text-white">$99.00</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Credit Card</label>
                <input 
                  type="text" 
                  required
                  placeholder="**** **** **** 4242"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              // IN THE CI ENVIRONMENT, WE RENDER A SPAN INSTEAD OF BUTTON TEXT
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isCI ? (
                <span>Confirm Purchase</span>
              ) : (
                "Complete Checkout"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
