
import React, { useState, useRef, useMemo } from 'react';
import { generateQuote } from '../services/geminiService';
import { QuoteResult, QuoteItem } from '../types';
import { SEED_CLIENTS, CLIENTS } from '../constants';
import { Download, Plus, Trash2, Rocket, FileText, BarChart3, Globe2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const QuoteGenerator: React.FC = () => {
  const [client, setClient] = useState(CLIENTS[0]);
  const [items, setItems] = useState<QuoteItem[]>([{ name: '', base_cost: 0 }]);
  const [commission, setCommission] = useState(15);
  const [margin, setMargin] = useState(20);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [touched, setTouched] = useState(false);
  const quotationRef = useRef<HTMLDivElement>(null);

  const addItem = () => {
    setItems([...items, { name: '', base_cost: 0 }]);
    setTouched(false);
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx: number, field: keyof QuoteItem, val: any) => {
    const newItems = [...items];
    if (field === 'base_cost') {
      const numericVal = val === '' ? 0 : parseFloat(val);
      newItems[idx][field] = isNaN(numericVal) ? 0 : numericVal;
    } else {
      newItems[idx][field] = val;
    }
    setItems(newItems);
  };

  // Input Validation Logic
  const validationErrors = useMemo(() => {
    return items.map(item => ({
      name: item.name.trim() === '',
      cost: isNaN(item.base_cost) || item.base_cost <= 0
    }));
  }, [items]);

  const hasAnyErrors = useMemo(() => {
    return validationErrors.some(e => e.name || e.cost);
  }, [validationErrors]);

  const handleGenerate = async () => {
    setTouched(true);
    if (hasAnyErrors) return;
    
    setLoading(true);
    setResult(null);
    try {
      // Lookup Client Details for Rich Context
      const fullClient = SEED_CLIENTS.find(c => c.name === client);
      const clientContext = fullClient 
        ? `Client: ${fullClient.name}, Location: ${fullClient.address || 'Unknown'}, Industry Context: Corporate/Industrial, VAT: ${fullClient.vat}` 
        : `Client: ${client}`;

      const data = await generateQuote(clientContext, items, commission, margin, deepAnalysis);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Estimation engine error. Please check your connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!quotationRef.current || !result) return;
    
    setIsExporting(true);
    try {
      const element = quotationRef.current;
      const opt = {
        margin: 10,
        filename: `ElitePro_Quotation_${client}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const totalValue = result?.calculated_items.reduce((sum, i) => sum + i.suggested_sell_price, 0) || 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 shadow-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400">
              <Rocket size={24} /> 
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Intelligence Estimator</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pricing Strategy Node</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client Target</label>
              <select 
                value={client} 
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 ring-teal-500/20 appearance-none cursor-pointer"
              >
                {CLIENTS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Comm (%)</label>
                <input type="number" value={commission} onChange={(e) => setCommission(Number(e.target.value))} className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none text-white font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Profit (%)</label>
                <input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none text-white font-bold" />
              </div>
            </div>

            {/* Deep Analysis Toggle */}
            <div 
              className={`p-6 border rounded-3xl flex items-center justify-between group cursor-pointer transition-all duration-300 ${
                deepAnalysis 
                  ? 'bg-purple-500/10 border-purple-500/30' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`} 
              onClick={() => setDeepAnalysis(!deepAnalysis)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-all ${deepAnalysis ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <BarChart3 size={18} />
                </div>
                <div>
                  <p className={`text-sm font-black leading-tight ${deepAnalysis ? 'text-purple-200' : 'text-slate-400'}`}>Deep Market Analysis</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Competitor Benchmarking</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative flex items-center transition-all px-1 ${deepAnalysis ? 'bg-purple-500' : 'bg-slate-700'}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all shadow-md ${deepAnalysis ? 'translate-x-4.5' : 'translate-x-0'}`} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Service Inventory</label>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className={`p-5 bg-black/20 rounded-3xl border space-y-4 relative group transition-all ${
                    touched && (validationErrors[idx].name || validationErrors[idx].cost) 
                      ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                      : 'border-white/5 hover:border-white/10'
                  }`}>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400"><Trash2 size={16} /></button>
                    )}
                    
                    <div className="space-y-1">
                      <input 
                        placeholder="Item name (e.g. Lamb Mandi Platter)" 
                        value={item.name} 
                        onChange={(e) => updateItem(idx, 'name', e.target.value)} 
                        className={`w-full bg-transparent border-b outline-none py-2 text-sm font-bold placeholder:text-slate-600 transition-colors ${
                          touched && validationErrors[idx].name 
                            ? 'border-red-500 text-red-200' 
                            : 'border-white/10 text-white focus:border-teal-500'
                        }`} 
                      />
                      {touched && validationErrors[idx].name && (
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-wide">Required</p>
                      )}
                    </div>

                    <div className="space-y-1">
                       <input 
                        type="number" 
                        placeholder="Base Cost" 
                        value={item.base_cost || ''} 
                        onChange={(e) => updateItem(idx, 'base_cost', e.target.value)} 
                        className={`w-full bg-black/40 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                          touched && validationErrors[idx].cost
                            ? 'border-red-500 text-red-200 placeholder:text-red-500/50'
                            : 'border-white/5 text-white focus:border-teal-500'
                        }`} 
                      />
                      {touched && validationErrors[idx].cost && (
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-wide">Must be > 0</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addItem} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-teal-400 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || (touched && hasAnyErrors)}
              className={`w-full py-6 font-black rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] ${
                touched && hasAnyErrors 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                  : (deepAnalysis ? 'bg-purple-600 shadow-purple-900/40 hover:bg-purple-500' : 'bg-teal-500 shadow-teal-900/40 hover:bg-teal-400') + ' text-white active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {deepAnalysis ? 'Analyzing Markets...' : 'Computing...'}</>
              ) : (
                <><FileText size={18} /> {deepAnalysis ? 'Run Deep Analysis' : 'Run AI Valuation'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-8">
        {result ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Validated Output</p>
                </div>
                {deepAnalysis && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full animate-in fade-in zoom-in">
                    <Globe2 size={12} className="text-purple-400" />
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Market Insights Applied</p>
                  </div>
                )}
              </div>
              <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-colors">
                {isExporting ? '...' : <Download size={14} />} Export PDF
              </button>
            </div>

            <div ref={quotationRef} className="bg-white text-slate-900 p-12 md:p-20 rounded-[4rem] shadow-4xl relative overflow-hidden">
              <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
                <h1 className="text-5xl font-black tracking-tighter">QUOTATION</h1>
                <div className="text-right">
                  <p className="text-lg font-black">#EP-{Date.now().toString().slice(-6)}</p>
                  <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Quoted For</p>
                <h2 className="text-3xl font-black">{client}</h2>
              </div>

              <div className="space-y-10">
                {result.calculated_items.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-8 last:border-0 break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-4">
                      <h3 className="text-xl font-black text-slate-900">{item.item}</h3>
                      <div className="text-right">
                         <p className="text-2xl font-black">SAR {item.suggested_sell_price.toLocaleString()}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Cost: {item.base_cost}</p>
                      </div>
                    </div>
                    <div className={`p-6 rounded-2xl border ${deepAnalysis ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
                      {deepAnalysis && <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2">AI Reasoning</p>}
                      <p className="text-sm text-slate-600 font-medium italic leading-relaxed">{item.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t-4 border-slate-900 break-inside-avoid">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                  <div className="flex-1 w-full">
                    <p className="text-[10px] font-black text-teal-600 uppercase mb-4">Scope of Work</p>
                    <textarea 
                      value={result.scope_of_work_text} 
                      onChange={(e) => setResult({...result, scope_of_work_text: e.target.value})}
                      className="w-full bg-transparent text-sm text-slate-700 leading-relaxed font-medium resize-none outline-none h-60 border border-transparent focus:border-slate-200 rounded-xl p-2 transition-colors"
                    />
                  </div>
                  <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] min-w-[280px] text-center shadow-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Valuation</p>
                    <p className="text-5xl font-black text-teal-400 tracking-tighter">SAR {totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px] border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center p-20 text-center bg-white/5 backdrop-blur-3xl">
            <FileText size={64} className="text-slate-700 mb-6" />
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">Neural Buffer Empty</h4>
            <p className="text-xs text-slate-600 mt-2">Define your requirements on the left to generate an AI-powered proposal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteGenerator;
