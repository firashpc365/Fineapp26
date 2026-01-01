
import React from 'react';
import { Search } from 'lucide-react';

interface GlobalSearchProps {
  autoFocus?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ autoFocus = false }) => {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
      </div>
      <input
        type="text"
        autoFocus={autoFocus}
        className="block w-full pl-11 pr-4 py-2.5 border border-white/5 rounded-xl leading-5 bg-black/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 sm:text-sm backdrop-blur-md transition-all shadow-lg"
        placeholder="Search quotes, clients, or POs... (Cmd+K)"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-[10px] text-slate-600 font-black border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-tighter">⌘K</span>
      </div>
    </div>
  );
};

export default GlobalSearch;
