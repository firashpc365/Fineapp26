
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  ArrowUpRight,
  Clock,
  History,
  Target,
  Plus, 
  FileText, 
  X, 
  Zap, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Tag, 
  AlignLeft, 
  Save, 
  AlertTriangle, 
  Upload, 
  CheckCircle2,
  RefreshCcw,
  Link,
  Unlink,
  CreditCard,
  Landmark,
  Loader2
} from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { reconcileTransactions } from '../services/geminiService';

// --- TYPES ---
interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number; // Negative for expense
  type: 'CREDIT' | 'DEBIT';
  category?: string;
  linkedBankId?: string; // If matched manually or via AI
}

interface MatchResult {
  bankTxId: string;
  ledgerTxId: string;
  confidence: number;
  reason: string;
}

// --- MOCK DATA ---
const MOCK_BANK_FEED: Transaction[] = [
  { id: 'b1', date: '2024-05-20', desc: 'UBER TRIP HELP.UBER.COM', amount: -45.00, type: 'DEBIT' },
  { id: 'b2', date: '2024-05-21', desc: 'SACO HARDWARE RIYADH', amount: -1250.00, type: 'DEBIT' },
  { id: 'b3', date: '2024-05-22', desc: 'TRANSFER IN FROM PAUL', amount: 15000.00, type: 'CREDIT' },
  { id: 'b4', date: '2024-05-23', desc: 'ALMARAI CO.', amount: -230.50, type: 'DEBIT' },
  { id: 'b5', date: '2024-05-24', desc: 'STC PAY *TOPUP', amount: -500.00, type: 'DEBIT' },
];

const MOCK_LEDGER: Transaction[] = [
  { id: 'l1', date: '2024-05-20', desc: 'Site Visit Transport', amount: -45.00, type: 'DEBIT', category: 'Transport' },
  { id: 'l2', date: '2024-05-22', desc: 'Equipment Purchase', amount: -1250.00, type: 'DEBIT', category: 'Assets' }, // Note date mismatch
  { id: 'l3', date: '2024-05-22', desc: 'Project A Advance', amount: 15000.00, type: 'CREDIT', category: 'Income' },
  { id: 'l4', date: '2024-05-25', desc: 'Staff Lunch', amount: -150.00, type: 'DEBIT', category: 'Meals' },
];

export default function FinancialsView() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RECONCILIATION' | 'REPORTS'>('OVERVIEW');
  const [bankFeed, setBankFeed] = useState(MOCK_BANK_FEED);
  const [ledger, setLedger] = useState(MOCK_LEDGER);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const { execute, isLoading: isMatching } = useAsyncAction();

  // --- RECONCILIATION LOGIC ---
  const runAutoMatch = async () => {
    // Filter out already linked items
    const unlinkedBank = bankFeed.filter(b => !b.linkedBankId && !matches.find(m => m.bankTxId === b.id));
    const unlinkedLedger = ledger.filter(l => !l.linkedBankId && !matches.find(m => m.ledgerTxId === l.id));

    if (unlinkedBank.length === 0 || unlinkedLedger.length === 0) return;

    await execute(async () => {
      const results = await reconcileTransactions(unlinkedBank, unlinkedLedger);
      
      // Update matches state
      // Merge with existing matches (avoid duplicates)
      setMatches(prev => {
        const newMatches = results.filter(r => !prev.find(p => p.bankTxId === r.bankTxId));
        return [...prev, ...newMatches];
      });
    }, "Neural Analysis Complete: High confidence matches identified.");
  };

  const confirmMatch = (match: MatchResult) => {
    // 1. Mark Ledger Entry as linked
    setLedger(prev => prev.map(l => l.id === match.ledgerTxId ? { ...l, linkedBankId: match.bankTxId } : l));
    // 2. Mark Bank Entry as linked (Optional, visual state)
    setBankFeed(prev => prev.map(b => b.id === match.bankTxId ? { ...b, linkedBankId: match.ledgerTxId } : b));
    // 3. Remove from matches list
    setMatches(prev => prev.filter(m => m.bankTxId !== match.bankTxId));
  };

  const dismissMatch = (match: MatchResult) => {
    setMatches(prev => prev.filter(m => m.bankTxId !== match.bankTxId));
  };

  // Helper to check if item is matched
  const getMatch = (id: string, source: 'BANK' | 'LEDGER') => {
    if (source === 'BANK') return matches.find(m => m.bankTxId === id);
    return matches.find(m => m.ledgerTxId === id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp size={24} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Revenue</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter">SAR 145,200</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500">
                  <ArrowUpRight size={14} /> +12% vs last month
                </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><TrendingDown size={24} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Expenses</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter">SAR 62,450</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-500">
                  <ArrowUpRight size={14} /> +5% vs last month
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><PieChart size={24} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Margin</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter">57.0%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[57%]" />
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center h-[400px]">
                  <PieChart size={64} className="text-slate-700 mb-6" />
                  <h3 className="text-white font-bold mb-2">Category Breakdown</h3>
                  <p className="text-slate-500 text-sm max-w-xs">Expense categorization visualization coming soon.</p>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center h-[400px]">
                  <History size={64} className="text-slate-700 mb-6" />
                  <h3 className="text-white font-bold mb-2">Cashflow Timeline</h3>
                  <p className="text-slate-500 text-sm max-w-xs">Historical trend analysis coming soon.</p>
               </div>
            </div>
          </div>
        );

      case 'RECONCILIATION':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
               <div>
                  <h3 className="text-xl font-black text-white tracking-tight">AI Reconciliation Engine</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Match external bank feed with internal ledger entries.</p>
               </div>
               <button 
                 onClick={runAutoMatch} 
                 disabled={isMatching}
                 className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isMatching ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                 Run Auto-Match
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
               {/* LEFT: BANK FEED */}
               <div className="bg-slate-950/30 border border-white/5 rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-3 mb-6 px-2">
                     <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Landmark size={18} /></div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Bank Feed</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                     {bankFeed.map(tx => {
                        const match = getMatch(tx.id, 'BANK');
                        const isLinked = !!tx.linkedBankId;
                        
                        if (isLinked) return null; // Hide already reconciled

                        return (
                           <div key={tx.id} className={`p-4 rounded-2xl border transition-all ${match ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900 border-white/5 hover:border-white/10'}`}>
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-mono text-slate-500">{tx.date}</span>
                                 <span className={`text-sm font-bold font-mono ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.amount < 0 ? '-' : ''}SAR {Math.abs(tx.amount).toLocaleString()}
                                 </span>
                              </div>
                              <p className="text-xs font-bold text-slate-300 truncate">{tx.desc}</p>
                              
                              {match && (
                                 <div className="mt-3 pt-3 border-t border-purple-500/20">
                                    <div className="flex justify-between items-center mb-2">
                                       <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                                          <Zap size={10} /> Suggested Match ({Math.round(match.confidence * 100)}%)
                                       </span>
                                       <div className="flex gap-2">
                                          <button onClick={() => dismissMatch(match)} className="p-1 text-slate-500 hover:text-white bg-slate-900 rounded"><X size={12}/></button>
                                          <button onClick={() => confirmMatch(match)} className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 rounded"><CheckCircle2 size={12}/></button>
                                       </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">{match.reason}</p>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* RIGHT: LEDGER */}
               <div className="bg-slate-950/30 border border-white/5 rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-3 mb-6 px-2">
                     <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><FileText size={18} /></div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Internal Ledger</span>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                     {ledger.map(tx => {
                        const match = getMatch(tx.id, 'LEDGER');
                        const isLinked = !!tx.linkedBankId;

                        return (
                           <div key={tx.id} className={`p-4 rounded-2xl border transition-all ${
                              isLinked ? 'opacity-50 grayscale bg-slate-900 border-white/5' : 
                              match ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900 border-white/5 hover:border-white/10'
                           }`}>
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-mono text-slate-500">{tx.date}</span>
                                 <span className={`text-sm font-bold font-mono ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.amount < 0 ? '-' : ''}SAR {Math.abs(tx.amount).toLocaleString()}
                                 </span>
                              </div>
                              <p className="text-xs font-bold text-slate-300 truncate">{tx.desc}</p>
                              {tx.category && <span className="text-[9px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">{tx.category}</span>}
                              
                              {isLinked && (
                                 <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-emerald-500">
                                    <Link size={10} /> Reconciled
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
          </div>
        );

      case 'REPORTS':
        return (
          <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 animate-in fade-in zoom-in">
             <FileText size={64} className="text-slate-700 mb-6" />
             <h3 className="text-xl font-bold text-white mb-2">Financial Reporting</h3>
             <p className="text-slate-500 text-sm">Detailed PDF exports and tax filing reports coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
             <DollarSign className="text-emerald-500" size={32} /> Financial Core
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Cashflow monitoring, reconciliation, and profit analysis.</p>
        </div>
        
        {/* Navigation */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
            {['OVERVIEW', 'RECONCILIATION', 'REPORTS'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
         {renderTabContent()}
      </AnimatePresence>
    </div>
  );
}
