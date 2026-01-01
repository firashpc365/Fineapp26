
import React, { useState, useEffect, useRef } from "react";
import { Plus, Tent, Coffee, Gift, Stamp, Package, Edit3, Trash2, Gamepad2, Layers, Zap, Loader2, X, Upload, FileText, CheckCircle2, ArrowRight, Save, AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";
import ServiceModal from "./services/ServiceModal";
import { ServiceItem, ServiceCategory } from "../types";
import { supabase } from "../lib/supabaseClient";
import FluidCard from "./ui/FluidCard";
import { CardSkeleton } from "./ui/Skeleton";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { SEED_SERVICES } from "../constants";
import { parseBulkServices } from "../services/geminiService";
import { AnimatePresence, motion } from "framer-motion";

const TABS: { id: ServiceCategory | 'ALL', label: string, icon: any }[] = [
    { id: 'ALL', label: 'All Services', icon: Layers },
    { id: 'TENT', label: 'Tents', icon: Tent },
    { id: 'CATERING', label: 'Catering', icon: Coffee },
    { id: 'ENTERTAINMENT', label: 'Fun & Games', icon: Gamepad2 },
    { id: 'BRANDING', label: 'Branding', icon: Stamp },
    { id: 'GIFT', label: 'Gifts', icon: Gift },
];

interface ServiceManagementProps {
  initialCategory?: ServiceCategory | 'ALL';
}

export default function ServiceManagement({ initialCategory = 'ALL' }: ServiceManagementProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'ALL'>(initialCategory);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  
  // Bulk Import State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [previewItems, setPreviewItems] = useState<ServiceItem[]>([]);
  const [isReviewStep, setIsReviewStep] = useState(false);
  
  const { execute, isLoading: isProcessing } = useAsyncAction();

  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Simulate Fetching Data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setServices(SEED_SERVICES);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredServices = services.filter(s => activeCategory === 'ALL' || s.category === activeCategory);

  const handleSuccess = (item?: ServiceItem) => {
    if (!item) return;
    if (editingItem) {
      setServices(prev => prev.map(s => s.id === item.id ? item : s));
    } else {
      setServices(prev => [item, ...prev]);
    }
  };

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Permanently remove this service from the catalog?")) return;
    
    await execute(async () => {
      // Simulate API Delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setServices(prev => prev.filter(s => s.id !== id));
    }, "Service record purged from catalog.");
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  // 1. Analyze and Preview
  const handleBulkAnalyze = async () => {
    if (!bulkText && bulkFiles.length === 0) return;

    await execute(async () => {
        let allNewItems: ServiceItem[] = [];

        // 1. Process Text Input
        if (bulkText.trim()) {
            const items = await parseBulkServices(bulkText);
            allNewItems = [...allNewItems, ...items];
        }

        // 2. Process Files
        for (const file of bulkFiles) {
            // Check for text-based files including CSV
            if (
              file.type === 'text/csv' || 
              file.type === 'application/vnd.ms-excel' || 
              file.type === 'text/plain' || 
              file.name.toLowerCase().endsWith('.csv') ||
              file.name.toLowerCase().endsWith('.txt')
            ) {
                 const textContent = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsText(file);
                 });
                 // Pass CSV text content directly to AI
                 const items = await parseBulkServices(textContent);
                 allNewItems = [...allNewItems, ...items];
            } else {
                // Handle Images/PDFs via Vision
                const reader = new FileReader();
                await new Promise<void>((resolve) => {
                    reader.onloadend = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        const items = await parseBulkServices({ data: base64, mimeType: file.type });
                        allNewItems = [...allNewItems, ...items];
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
        }

        // Add temp IDs for the preview list and respect extracted status
        const cleanItems = allNewItems.map(item => ({
            ...item,
            id: item.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: (item.status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'AVAILABLE') as 'AVAILABLE' | 'OUT_OF_STOCK'
        }));

        setPreviewItems(cleanItems);
        setIsReviewStep(true);

    }, "Analysis complete. Review extracted items.");
  };

  // 2. Commit to Catalog
  const handleFinalImport = async () => {
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate saving
      setServices(prev => [...previewItems, ...prev]);
      
      // Cleanup
      setIsBulkOpen(false);
      setPreviewItems([]);
      setBulkText("");
      setBulkFiles([]);
      setIsReviewStep(false);
    }, `Successfully imported ${previewItems.length} services to catalog.`);
  };

  // Helper to remove item from preview
  const removePreviewItem = (id: string | number) => {
    setPreviewItems(prev => prev.filter(item => item.id !== id));
  };

  // Helper to determine icon based on category
  const getIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'TENT': return Tent;
      case 'CATERING': return Coffee;
      case 'ENTERTAINMENT': return Gamepad2;
      case 'GIFT': return Gift;
      case 'BRANDING': return Stamp;
      default: return Package;
    }
  };

  // Helper to determine color based on category
  const getColor = (category: ServiceCategory) => {
    switch (category) {
      case 'TENT': return 'text-amber-400';
      case 'CATERING': return 'text-rose-400';
      case 'ENTERTAINMENT': return 'text-purple-400';
      case 'GIFT': return 'text-emerald-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 lg:pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
        <div className="max-w-2xl w-full">
           <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3 leading-tight">Services Catalog</h1>
           <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xl">
             Manage service packages, automated pricing logic, and profit margin targets across your inventory.
           </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <button 
                onClick={() => setIsBulkOpen(true)}
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Zap size={18} /> Bulk Import
            </button>
            <button 
                onClick={handleCreate} 
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Plus size={18} /> Add Service
            </button>
        </div>
      </div>

      {/* CATEGORY TABS (Sticky on Mobile) */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl md:bg-transparent md:static -mx-4 px-4 md:mx-0 md:px-0 py-3 md:py-0 mb-6 border-b border-white/5 md:border-none">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-4 custom-scrollbar snap-x snap-mandatory">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`
                  snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                  ${isActive 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                    : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"}
                `}
              >
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          // Skeleton Loading State
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => {
            const calculatedProfit = service.profit ?? (service.selling_price - service.cost_price);
            const margin = service.selling_price > 0 ? (calculatedProfit / service.selling_price) * 100 : 0;
            const costPct = service.selling_price > 0 ? (service.cost_price / service.selling_price) * 100 : 0;
            
            // Dynamic Color Logic for Profit Bar
            let barColor = "bg-emerald-500";
            let textColor = "text-emerald-500";
            
            if (margin < 0) {
                barColor = "bg-rose-500";
                textColor = "text-rose-500";
            } else if (margin < 15) {
                barColor = "bg-amber-500";
                textColor = "text-amber-500";
            } else if (margin > 40) {
                barColor = "bg-purple-500";
                textColor = "text-purple-400";
            }

            return (
            <FluidCard
              key={service.id}
              title={service.title}
              icon={getIcon(service.category)}
              color={getColor(service.category)}
              value={`SAR ${service.selling_price.toLocaleString()}`}
              sub={
                <span className={`text-[9px] font-black ${textColor} bg-slate-950/50 px-2 py-1 rounded inline-block border border-white/5 uppercase tracking-wider backdrop-blur-sm`}>
                  Profit: {calculatedProfit > 0 ? '+' : ''}{calculatedProfit.toLocaleString()}
                </span>
              }
              className="h-full"
            >
               {/* Smart Profit Margin Visual Indicator */}
               <div className="mb-5 group/bar cursor-default">
                  <div className="flex justify-between items-end mb-1.5">
                     <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Margin Analysis</span>
                     <span className={`flex items-center gap-1 text-[9px] font-black ${textColor}`}>
                       {margin >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                       {Math.round(margin)}%
                     </span>
                  </div>
                  
                  <div className="flex h-2 w-full bg-slate-950/50 rounded-full overflow-hidden relative shadow-inner border border-white/5">
                     {/* Cost Segment */}
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(costPct, 100)}%` }}
                       transition={{ duration: 1, delay: 0.2 }}
                       className="h-full bg-slate-700/40 relative border-r border-slate-950/50" 
                     />
                     {/* Margin Segment */}
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.max(margin, 0)}%` }}
                       transition={{ duration: 1, delay: 0.4 }}
                       className={`h-full ${barColor} relative shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                     />
                     
                     {/* Glass Effect Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>
                  
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-600 mt-1.5">
                     <span>Cost: {Math.round(costPct)}%</span>
                     <span>Profit</span>
                  </div>
               </div>

               {/* Specs Display */}
               {service.specifications && Object.keys(service.specifications).length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(service.specifications).slice(0, 3).map(([key, val]: any) => (
                      <span key={key} className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest truncate max-w-full">
                        {val}
                      </span>
                    ))}
                 </div>
               )}

               {/* Description */}
               {service.description && (
                 <div className="mb-4 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 italic">
                      "{service.description}"
                    </p>
                 </div>
               )}

               {/* Includes */}
               <div className="space-y-2 mb-6 min-h-[30px]">
                 {service.includes && Array.isArray(service.includes) && service.includes.length > 0 ? (
                   <>
                     {service.includes.slice(0, 2).map((item: string, i: number) => (
                       <div key={i} className="flex items-center gap-3 text-xs font-medium text-slate-400 truncate">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.8)] shrink-0" /> 
                         <span className="truncate">{item}</span>
                       </div>
                     ))}
                     {service.includes.length > 2 && (
                        <span className="text-[9px] text-slate-600 pl-4 block mt-1">+{service.includes.length - 2} more items</span>
                     )}
                   </>
                 ) : (
                   <span className="text-[10px] text-slate-600 italic">No included items listed.</span>
                 )}
               </div>

               {/* Action Buttons */}
               <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto opacity-100 lg:opacity-80 lg:group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); handleEdit(service); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Edit3 size={14} /> Edit Logic
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }} className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-colors border border-white/5 hover:border-red-500/20">
                    <Trash2 size={16}/>
                 </button>
               </div>
            </FluidCard>
          )})
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/5 flex flex-col items-center justify-center mx-4 md:mx-0">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
               <Package size={32} className="text-slate-600" />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">No services found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed px-4">
              Create a new service entry for the <span className="text-blue-400">{activeCategory}</span> category to populate your catalog.
            </p>
          </div>
        )}
      </div>

      <ServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleSuccess}
        existingItem={editingItem}
        initialCategory={activeCategory !== 'ALL' ? activeCategory : undefined}
      />

      {/* BULK IMPORT MODAL */}
      <AnimatePresence>
        {isBulkOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-4xl relative overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6 md:mb-8 shrink-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <Zap size={24} className="text-purple-500" /> Bulk Catalog Injector
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm font-medium mt-2">
                    {isReviewStep ? "Review and confirm extracted items." : "Parse bulk text or menus. Supports price extraction."}
                  </p>
                </div>
                <button onClick={() => { setIsBulkOpen(false); setIsReviewStep(false); setPreviewItems([]); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 pr-2">
                
                {!isReviewStep ? (
                  <>
                    {/* 1. Text Input */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <FileText size={14} /> Unstructured Data Stream
                      </div>
                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`e.g.\nTent 5x5 - 500 SAR\nLamb Mandi Platter - 1200 SAR\nSpeaker System - 200 SAR`}
                        className="w-full h-32 md:h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white font-mono placeholder:text-slate-600 focus:border-purple-500 outline-none resize-none transition-colors"
                      />
                    </div>

                    {/* 2. File Drop */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Upload size={14} /> Menu / Price List Assets
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload size={24} className="text-slate-500 mb-2 group-hover:text-purple-400 transition-colors" />
                          <p className="mb-1 text-xs text-slate-400 font-bold"><span className="text-purple-400">Click to upload</span> or drag and drop</p>
                          <p className="text-[10px] text-slate-600 uppercase tracking-widest">JPG, PNG, PDF, CSV</p>
                        </div>
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) setBulkFiles(Array.from(e.target.files));
                          }}
                        />
                      </label>
                      
                      {/* File Preview */}
                      {bulkFiles.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {bulkFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-xs text-slate-300 truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                     <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={16} /> 
                        Success! Found {previewItems.length} valid service items.
                     </div>
                     
                     <div className="space-y-2">
                        {previewItems.map((item) => (
                           <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className={`p-2 rounded-lg ${getColor(item.category)} bg-white/5 shrink-0`}>
                                    {(() => { const I = getIcon(item.category); return <I size={16}/> })()}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.category}</p>
                                      {item.status === 'OUT_OF_STOCK' && (
                                        <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Out of Stock</span>
                                      )}
                                    </div>
                                    {item.includes && item.includes.length > 0 && (
                                      <p className="text-[9px] text-slate-400 mt-1 italic truncate max-w-[200px] md:max-w-[300px]">
                                        Includes: {item.includes.join(', ')}
                                      </p>
                                    )}
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 md:gap-6 shrink-0">
                                 <div className="text-right hidden sm:block">
                                    <p className="text-sm font-mono font-bold text-white">{item.selling_price}</p>
                                    <p className="text-[9px] text-slate-500">Sell Price</p>
                                 </div>
                                 <button 
                                   onClick={() => removePreviewItem(item.id)}
                                   className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-6 md:pt-8 mt-6 md:mt-8 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 shrink-0">
                {!isReviewStep ? (
                  <>
                    <button 
                      onClick={() => setIsBulkOpen(false)}
                      className="w-full sm:w-auto px-6 py-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBulkAnalyze}
                      disabled={isProcessing || (!bulkText && bulkFiles.length === 0)}
                      className="w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                      {isProcessing ? "Analyzing..." : "Analyze & Preview"}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsReviewStep(false)}
                      className="w-full sm:w-auto px-6 py-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Back to Input
                    </button>
                    <button 
                      onClick={handleFinalImport}
                      disabled={isProcessing || previewItems.length === 0}
                      className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {isProcessing ? "Saving..." : `Import ${previewItems.length} Items`}
                    </button>
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
