import React, { useState, useEffect } from 'react';
import { Database, Search, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function DataPollution() {
  const [isFriday, setIsFriday] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Deterministic Data Pollution
    // Simulate a massive database growth on Fridays or via ?day=friday URL param
    const today = new Date().getDay();
    const searchParams = new URLSearchParams(window.location.search);
    const isActuallyFriday = today === 5;
    const isForcedFriday = searchParams.get('day') === 'friday';
    
    const fridayMode = isActuallyFriday || isForcedFriday;
    setIsFriday(fridayMode);

    setTimeout(() => {
      // Mock data generation
      const totalOrders = fridayMode ? 2500 : 25;
      const mockDb = Array.from({ length: totalOrders }).map((_, i) => ({
        id: `ORD-${1000 + i}`,
        status: i === 12 ? 'Processing' : 'Delivered', // Order ORD-1012 is the target
        date: '2023-10-15'
      }));
      
      setOrders(mockDb);
      setIsLoading(false);
    }, 600);

  }, []);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div data-testid="challenge-jira-104" className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* JIRA Ticket Header */}
      <div className="bg-teal-950/40 border-b border-teal-900/50 p-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-teal-400" />
          <h3 className="text-teal-100 font-bold text-lg m-0">JIRA-104: Friday Data Pollution</h3>
        </div>
        <p className="text-teal-200/70 text-sm mt-2 mb-0">
          <strong>Incident Report:</strong> The test verifying "ORD-1012" status passes perfectly from Monday to Thursday. But every Friday, the test fails with a locator timeout.
          <br/>
          <strong>Your Goal:</strong> Use the <code>?day=friday</code> URL parameter. You will notice the database size explodes to 2500 records and pagination kicks in. Your test must handle this data shift and locate the target order regardless of what day it is.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold text-slate-200">Order Management</h4>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded">
              TOTAL_RECORDS: {isLoading ? '...' : orders.length}
            </span>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="bg-slate-800 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors w-48"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                    Loading database...
                  </td>
                </tr>
              ) : (
                currentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors" data-testid={`order-row-${order.id}`}>
                    <td className="px-4 py-3 font-mono text-teal-400">{order.id}</td>
                    <td className="px-4 py-3 text-slate-400">{order.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Processing' 
                          ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, orders.length)} of {orders.length} entries
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs text-slate-200 rounded transition-colors"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs text-slate-200 rounded transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {isFriday && (
          <div className="mt-4 flex items-start gap-2 text-xs text-teal-500/70 bg-teal-950/20 p-3 rounded border border-teal-900/30">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="m-0">
              <strong>Friday Mode Active:</strong> 2475 synthetic records have been injected into the mock database to simulate a high-volume trading day. Pagination is active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
