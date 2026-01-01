
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { scanReceipt, categorizeTransaction } from '../services/geminiService';
import { OCRResult, Scope, TransactionResult } from '../types';
import { FileText, Upload, Trash2, CheckCircle, Search, ScanLine, AlertTriangle, Loader2, X, FileStack, ArrowRight, Check } from 'lucide-react';

interface ReceiptScannerProps {
  onAdd: (tx: { desc: string; amt: string; cat: string; scope: Scope; date: string }) => void;
}

type ScanStatus = 'QUEUED' | 'PROCESSING' | 'ANALYZED' | 'SAVING' | 'SAVED' | 'ERROR';

interface ScanItem {
  id: string;
  file: File;
  preview: string;
  status: ScanStatus;
  result?: OCRResult;
  errorMsg?: string;
  classification?: TransactionResult;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onAdd }) => {
  const [items, setItems] = useState<ScanItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queue Processing Effect
  useEffect(() => {
    const processNext = async () => {
      const nextItem = items.find(i => i.status === 'QUEUED');
      if (!nextItem) return;

      // Set status to processing
      setItems(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'PROCESSING' } : i));

      try {
        const base64 = nextItem.preview.split(',')[1];
        const data = await scanReceipt(base64, nextItem.file.type);
        
        if (!data || !data.vendor_name) {
          throw new Error('Structural mismatch in document analysis.');
        }

        setItems(prev => prev.map(i => i.id === nextItem.id ? { 
          ...i, 
          status: 'ANALYZED', 
          result: data 
        } : i));
      } catch (err: any) {
        console.error(err);
        setItems(prev => prev.map(i => i.id === nextItem.id ? { 
          ...i, 
          status: 'ERROR', 
          errorMsg: 'Analysis failed. Ensure document is legible.' 
        } : i));
      }
    };

    processNext();
  }, [items]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
      if (!validTypes.includes(file.type)) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setItems(prev => {
            const updated = [...prev, {
                id,
                file,
                preview: reader.result as string,
                status: 'QUEUED'
            }];
            // If it's the first item added and nothing is active, activate it
            if (!activeId && updated.length === 1) setActiveId(id);
            return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) e.target.value = ''; // Reset input
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const removeAll = () => {
    setItems([]);
    setActiveId(null);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => {
        const filtered = prev.filter(i => i.id !== id);
        if (activeId === id) {
            setActiveId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
    });
  };

  // Action: Save Transaction
  const handleSaveActive = async () => {
    const activeItem = items.find(i => i.id === activeId);
    if (!activeItem || !activeItem.result) return;

    setItems(prev => prev.map(i => i.id === activeId ? { ...i, status: 'SAVING' } : i));

    try {
      const summary = `Vendor: ${activeItem.result.vendor_name}, Total: ${activeItem.result.total} ${activeItem.result.currency}, Items: ${activeItem.result.items.map(i => i.desc).join(', ')}`;
      const categoryData = await categorizeTransaction(summary);
      
      // Artificial Delay for UX
      await new Promise(resolve => setTimeout(resolve, 600));

      onAdd({
        desc: categoryData.description || activeItem.result.vendor_name,
        amt: `-${activeItem.result.total}`,
        cat: categoryData.category,
        scope: categoryData.scope,
        date: 'Today'
      });

      setItems(prev => prev.map(i => i.id === activeId ? { ...i, status: 'SAVED', classification: categoryData } : i));
    } catch (err) {
      console.error(err);
      setItems(prev => prev.map(i => i.id === activeId ? { ...i, status: 'ANALYZED', errorMsg: 'Sync failed during ledger insertion.' } : i));
    }
  };

  const activeItem = items.find(i => i.id === activeId);
  const isPDF = (item: ScanItem) => item.file.type === 'application/pdf';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* LEFT COLUMN: UPLOAD & QUEUE */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full">
        {/* Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            shrink-0 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group
            ${isDragging 
              ? 'border-teal-400 bg-teal-500/10 shadow-[0_0_30px_rgba(45,212,191,0.15)] h-48' 
              : items.length === 0 ? 'h-full border-white/10 hover:border-teal-500/50 hover:bg-white/5' : 'h-40 border-white/10 hover:bg-white/5'
            }
          `}
        >
          {isDragging ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-30">
                <div className="bg-teal-500/20 p-4 rounded-full mb-2 animate-bounce border border-teal-500/30">
                  <Upload className="text-teal-400" size={24} />
                </div>
                <p className="text-sm font-black text-white tracking-tight">Drop Batch</p>
             </div>
          ) : (
            <div className="text-center p-6 pointer-events-none">
              <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                {items.length === 0 ? <ScanLine className="text-teal-500" size={24} /> : <Upload className="text-teal-500" size={24} />}
              </div>
              <p className="text-white font-black uppercase tracking-[0.2em] text-xs mb-1">
                {items.length === 0 ? "Start Scan" : "Add More"}
              </p>
              {items.length === 0 && <p className="text-slate-500 text-[10px] font-medium">Drop Multiple Files</p>}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/plain" multiple />
        </div>

        {/* Batch List */}
        {items.length > 0 && (
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col min-h-0">
             <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <FileStack size={14} className="text-blue-400" /> Batch Queue <span className="bg-white/10 px-1.5 rounded text-[9px] text-slate-300">{items.length}</span>
                </h3>
                <button onClick={removeAll} className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors">Clear All</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {items.map(item => (
                   <div 
                     key={item.id}
                     onClick={() => setActiveId(item.id)}
                     className={`
                       group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer relative
                       ${activeId === item.id 
                         ? 'bg-slate-800 border-teal-500/50 shadow-lg' 
                         : 'bg-black/20 border-white/5 hover:bg-white/5'
                       }
                     `}
                   >
                      {/* Status Indicator */}
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5">
                         {item.status === 'QUEUED' && <span className="w-2 h-2 bg-slate-500 rounded-full" />}
                         {item.status === 'PROCESSING' && <Loader2 size={16} className="text-blue-400 animate-spin" />}
                         {(item.status === 'ANALYZED' || item.status === 'SAVING') && <FileText size={16} className="text-slate-300" />}
                         {item.status === 'SAVED' && <CheckCircle size={16} className="text-emerald-500" />}
                         {item.status === 'ERROR' && <AlertTriangle size={16} className="text-red-500" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <p className={`text-xs font-bold truncate ${activeId === item.id ? 'text-white' : 'text-slate-300'}`}>
                            {item.file.name}
                         </p>
                         <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                            {item.status === 'ANALYZED' && item.result ? `SAR ${item.result.total}` : item.status}
                         </p>
                      </div>

                      <button onClick={(e) => removeItem(item.id, e)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <X size={14} />
                      </button>
                      
                      {item.status === 'SAVED' && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg">
                            <Check size={14} />
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DETAIL VIEW */}
      <div className="lg:col-span-8 h-full min-h-0">
        {activeItem ? (
          <div className="h-full bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-right-4 duration-500">
            
            {/* Top Bar */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
               <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                     activeItem.status === 'SAVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                     activeItem.status === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                     'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                     {activeItem.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-400 truncate max-w-[200px]">{activeItem.file.name}</span>
               </div>
               {activeItem.result && (
                  <span className="text-sm font-black text-white tracking-tight">
                     {activeItem.result.date}
                  </span>
               )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
               {/* Preview Image (Left half on large screens if needed, or toggle? Let's keep it simple split) */}
               <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-950/50 relative border-b md:border-b-0 md:border-r border-white/5">
                  {isPDF(activeItem) ? (
                     <div className="w-full h-full flex flex-col items-center justify-center p-10">
                        <FileText size={60} className="text-slate-600 mb-4" />
                        <p className="text-slate-500 text-xs text-center">PDF Preview Not Available</p>
                     </div>
                  ) : (
                     <img src={activeItem.preview} alt="Receipt" className="w-full h-full object-contain p-4" />
                  )}
               </div>

               {/* Data Extraction (Right half) */}
               <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-white/[0.02]">
                  {activeItem.status === 'PROCESSING' || activeItem.status === 'QUEUED' ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                        <Loader2 size={40} className="text-teal-500 animate-spin mb-4" />
                        <h4 className="text-white font-bold animate-pulse">Extracting Intelligence...</h4>
                        <p className="text-xs text-slate-500 mt-2">Neural engine is analyzing visual data.</p>
                     </div>
                  ) : activeItem.status === 'ERROR' ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                        <AlertTriangle size={40} className="text-red-500 mb-4" />
                        <h4 className="text-white font-bold">Extraction Failed</h4>
                        <p className="text-xs text-red-400 mt-2">{activeItem.errorMsg || "Unknown error occurred"}</p>
                     </div>
                  ) : activeItem.result ? (
                     <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-8 pb-4">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vendor</p>
                                 <h3 className="text-2xl font-black text-white tracking-tight">{activeItem.result.vendor_name}</h3>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                 <p className="text-2xl font-black text-teal-400 tracking-tight">
                                    {activeItem.result.total.toLocaleString()} <span className="text-sm font-normal text-slate-500">{activeItem.result.currency}</span>
                                 </p>
                              </div>
                           </div>
                           
                           <div className="flex gap-4 mb-6">
                              <div className="px-3 py-2 bg-slate-900 rounded-xl border border-white/5 flex-1">
                                 <p className="text-[8px] font-bold text-slate-500 uppercase">Tax Amount</p>
                                 <p className="text-sm font-mono font-bold text-slate-300">{activeItem.result.tax_amount.toLocaleString()}</p>
                              </div>
                              <div className="px-3 py-2 bg-slate-900 rounded-xl border border-white/5 flex-1">
                                 <p className="text-[8px] font-bold text-slate-500 uppercase">Category</p>
                                 <p className="text-sm font-bold text-slate-300">
                                    {activeItem.classification?.category || (activeItem.result.is_catering_supply ? 'Catering' : 'General')}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-4">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Line Items</p>
                           <div className="space-y-3">
                              {activeItem.result.items.map((item, idx) => (
                                 <div key={idx} className="flex justify-between text-xs group hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
                                    <span className="text-slate-300 font-medium">
                                       <span className="font-bold text-teal-500/70 mr-2">{item.qty}x</span> 
                                       {item.desc}
                                    </span>
                                    <span className="font-mono text-slate-400">{item.price.toLocaleString()}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                           {activeItem.status === 'SAVED' ? (
                              <button disabled className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-default">
                                 <CheckCircle size={16} /> Transaction Synced
                              </button>
                           ) : (
                              <button 
                                onClick={handleSaveActive}
                                disabled={activeItem.status === 'SAVING'}
                                className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                              >
                                 {activeItem.status === 'SAVING' ? (
                                    <><Loader2 className="animate-spin" size={16} /> Syncing...</>
                                 ) : (
                                    <>Execute Ledger Logic <ArrowRight size={16} /></>
                                 )}
                              </button>
                           )}
                        </div>
                     </div>
                  ) : null}
               </div>
            </div>
          </div>
        ) : (
          /* Empty State for Right Column */
          <div className="h-full flex flex-col items-center justify-center p-20 text-center rounded-[3.5rem] border-2 border-dashed border-white/5 bg-white/5">
             <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white/5">
                <FileStack size={40} className="text-slate-700" />
             </div>
             <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-2">Neural Buffer Empty</h3>
             <p className="text-slate-500 text-xs font-medium max-w-xs leading-relaxed">
               Select a receipt from the batch queue to inspect extracted data and execute ledger synchronization.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
