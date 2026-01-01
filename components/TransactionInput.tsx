
import React, { useState, useRef } from 'react';
import { categorizeTransaction } from '../services/geminiService';
import { TransactionResult, Scope } from '../types';
import { Paperclip, File, X, Zap } from 'lucide-react';

interface TransactionInputProps {
  onAdd: (tx: { desc: string; amt: string; cat: string; scope: Scope; date: string }) => void;
}

const TransactionInput: React.FC<TransactionInputProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [stagedFile, setStagedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setStagedFile({ name: file.name, data: base64, mimeType: file.mimeType || file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !stagedFile) return;
    
    setLoading(true);
    setResult(null);
    try {
      const payload = stagedFile ? { data: stagedFile.data, mimeType: stagedFile.mimeType } : input;
      const data = await categorizeTransaction(payload);
      setResult(data);
      
      if (data.confidence_score > 0.8) {
        onAdd({
          desc: data.description,
          amt: `${data.type === 'EXPENSE' ? '-' : '+'}${data.amount || 0}`,
          cat: data.category,
          scope: data.scope,
          date: 'Just now'
        });
      }
      setStagedFile(null);
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-10">
          {loading && (
            <div className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 w-full animate-progress-indefinite"></div>
          )}
        </div>

        <div className="absolute -right-8 -bottom-8 text-teal-500/10 rotate-12 transition-transform group-hover:scale-105 pointer-events-none">
          <Zap size={180} />
        </div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-teal-400">⚡</span> Smart Categorizer
          </h3>
          {loading && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 animate-pulse">
              Reasoning Engine Online
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4 z-10">
          {stagedFile && (
            <div className="flex items-center gap-3 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                <File size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">{stagedFile.name}</p>
                <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Document Staged</p>
              </div>
              <button 
                type="button"
                onClick={() => setStagedFile(null)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={stagedFile ? "Analyzing document..." : "Type request or attach PDF/Image..."}
              className="w-full px-8 py-6 bg-black/20 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all text-white placeholder:text-slate-600 font-medium pr-32 shadow-inner backdrop-blur-sm"
            />
            <div className="absolute right-3 top-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-3 bg-white/5 text-slate-400 hover:text-teal-400 hover:bg-white/10 rounded-xl transition-all"
                title="Attach Document"
              >
                <Paperclip size={20} />
              </button>
              <button
                type="submit"
                disabled={loading || (!input.trim() && !stagedFile)}
                className="h-full px-6 bg-teal-500 text-white font-black rounded-xl hover:bg-teal-400 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Run'
                )}
              </button>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf,text/plain" 
          />
        </form>
      </div>

      {result && (
        <div className={`rounded-[2.5rem] border p-8 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-3xl relative overflow-hidden group ${
          result.scope === Scope.BUSINESS ? 'bg-teal-500/5 border-teal-500/20' : 
          result.scope === Scope.PERSONAL ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="space-y-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                result.scope === Scope.BUSINESS ? 'bg-teal-400/20 text-teal-400' : 
                result.scope === Scope.PERSONAL ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {result.scope} Intelligence
              </span>
              <h4 className="text-3xl font-black text-white tracking-tight leading-none">{result.description}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{result.type}</p>
              <p className={`text-4xl font-black tracking-tighter ${result.type === 'INCOME' ? 'text-green-400' : 'text-white'}`}>
                {result.amount ? `${result.amount.toLocaleString()}` : '—'} <span className="text-sm font-normal opacity-40">{result.currency}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5 relative z-10">
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Classification</p>
              <p className="text-sm font-bold text-slate-200">{result.category}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Context</p>
              <p className="text-sm font-bold text-slate-200">{result.project_hint || 'Ambient Transaction'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Accuracy Matrix</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full shadow-[0_0_12px_rgba(20,184,166,0.6)] transition-all duration-1000" style={{ width: `${result.confidence_score * 100}%` }}></div>
                </div>
                <span className="text-[10px] font-mono font-bold text-teal-400">{(result.confidence_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionInput;
