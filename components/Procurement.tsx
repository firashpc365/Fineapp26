
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Truck, 
  Search, 
  Plus, 
  Package, 
  Trash2, 
  Receipt, 
  ScanLine, 
  Keyboard, 
  Download,
  Megaphone,
  FileQuestion,
  Wrench,
  Scale,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Loader2,
  Upload,
  X,
  Calendar,
  DollarSign,
  Paperclip,
  CloudUpload
} from "lucide-react";
import { PurchaseOrder } from "../types";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useRealtime } from "../hooks/useRealtime";
import { supabase } from "../lib/supabaseClient";
import ReceiptScanner from "./ReceiptScanner";

// --- TYPES ---
interface SupplierQuote {
  id: string;
  rfq_ref: string; // Grouping ID
  supplier_name: string;
  items: { desc: string; qty: number; unit_price: number }[];
  total_amount: number;
  delivery_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

// --- MOCK DATA ---
const INITIAL_POS: PurchaseOrder[] = [
  { id: "PO-8821", supplier: "Almarai Wholesale", items: "Milk, Laban, Yogurt (Bulk)", amount: 4500, status: "DELIVERED", date: "2024-10-25" },
  { id: "PO-9002", supplier: "Saco Hardware", items: "Generators, Cables", amount: 12500, status: "IN_TRANSIT", date: "2024-10-28" },
];

const MOCK_QUOTES: SupplierQuote[] = [
  {
    id: "Q-101",
    rfq_ref: "RFQ-2024-001: Catering Event A",
    supplier_name: "Tamimi Markets",
    items: [
        { desc: "Australian Lamb (Whole)", qty: 5, unit_price: 1200 },
        { desc: "Basmati Rice (40kg)", qty: 3, unit_price: 250 }
    ],
    total_amount: 6750,
    delivery_date: "2024-11-01",
    status: "PENDING"
  },
  {
    id: "Q-102",
    rfq_ref: "RFQ-2024-001: Catering Event A",
    supplier_name: "Al Sadhan",
    items: [
        { desc: "Australian Lamb (Whole)", qty: 5, unit_price: 1150 }, // Cheaper
        { desc: "Basmati Rice (40kg)", qty: 3, unit_price: 260 }
    ],
    total_amount: 6530, // Winner
    delivery_date: "2024-11-02",
    status: "PENDING"
  },
  {
    id: "Q-201",
    rfq_ref: "RFQ-2024-002: Packaging",
    supplier_name: "Napco National",
    items: [
        { desc: "Eco Boxes", qty: 500, unit_price: 2.5 }
    ],
    total_amount: 1250,
    delivery_date: "2024-11-05",
    status: "PENDING"
  }
];

interface ProcurementProps {
  initialTab?: 'RFQ' | 'QUOTES' | 'INVOICES' | 'MISC';
}

const Procurement: React.FC<ProcurementProps> = ({ initialTab = 'RFQ' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Data State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>(MOCK_QUOTES);
  
  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Drag state for manual entry
  
  // Manual Entry Form State
  const [manualForm, setManualForm] = useState({
    supplier: "",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    items: "",
    category: "Cost of Goods Sold",
    file: null as File | null
  });
  
  const { execute, isLoading: isProcessing } = useAsyncAction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // REALTIME SYNC
  useRealtime('supplier_quotes', () => {
    console.log("Realtime update received for Procurement module.");
  });

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleAddExpense = (tx: any) => {
    setIsScannerOpen(false);
    // Logic to add scanned expense would go here
  };

  const handleManualSubmit = async () => {
    if (!manualForm.supplier || !manualForm.amount) return;

    await execute(async () => {
      // Simulate Upload
      if (manualForm.file) {
        await new Promise(r => setTimeout(r, 1000)); // Upload delay
      }

      const newPO: PurchaseOrder = {
        id: `PO-MAN-${Date.now()}`,
        supplier: manualForm.supplier,
        items: manualForm.items || "Manual Entry",
        amount: parseFloat(manualForm.amount),
        status: "DELIVERED", // Manual entries usually imply completion
        date: manualForm.date,
        // In a real app, we would store the file URL here
        // attachmentUrl: manualForm.file ? URL.createObjectURL(manualForm.file) : undefined
      };

      setPurchaseOrders(prev => [newPO, ...prev]);
      setIsManualEntryOpen(false);
      setManualForm({
        supplier: "",
        date: new Date().toISOString().split('T')[0],
        amount: "",
        items: "",
        category: "Cost of Goods Sold",
        file: null
      });
    }, "Invoice logged and archived.");
  };

  // --- LOGIC: Comparison Engine ---
  const groupedQuotes = useMemo(() => {
    const groups: Record<string, SupplierQuote[]> = {};
    supplierQuotes.forEach(q => {
        if (!groups[q.rfq_ref]) groups[q.rfq_ref] = [];
        groups[q.rfq_ref].push(q);
    });
    return groups;
  }, [supplierQuotes]);

  const handleApproveQuote = async (quote: SupplierQuote) => {
    await execute(async () => {
        await new Promise(r => setTimeout(r, 1200));

        const updatedQuotes = supplierQuotes.map(q => {
            if (q.rfq_ref === quote.rfq_ref) {
                return q.id === quote.id 
                    ? { ...q, status: 'APPROVED' as const } 
                    : { ...q, status: 'REJECTED' as const };
            }
            return q;
        });
        setSupplierQuotes(updatedQuotes);

    }, "Purchase Order Issued & Ledger Updated");
  };

  // --- DRAG AND DROP HANDLERS ---
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      
      if (validTypes.includes(file.type)) {
        setManualForm({...manualForm, file});
      } else {
        alert("Unsupported file format. Please upload JPG, PNG, or PDF.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
             <Truck className="text-blue-500" size={32} /> Purchase Hub
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage Supply Chain & Vendor Relations</p>
        </div>
        
        {/* Navigation Pills */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 overflow-x-auto custom-scrollbar max-w-full">
            {[
                { id: 'RFQ', label: 'Requests', icon: Megaphone },
                { id: 'QUOTES', label: 'Comparison', icon: Scale },
                { id: 'INVOICES', label: 'Invoices', icon: Receipt },
                { id: 'MISC', label: 'Misc', icon: Wrench },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* --- SUPPLIER RFQs TAB --- */}
      {activeTab === "RFQ" && (
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
           <Megaphone size={64} className="text-slate-700 mb-6" />
           <h3 className="text-xl font-bold text-white mb-2">Supplier RFQ Central</h3>
           <p className="text-slate-500 max-w-md mx-auto mb-8">Initiate requests for quotation from your registered supplier network.</p>
           <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
             Create New RFQ
           </button>
        </div>
      )}

      {/* --- SUPPLIER QUOTES COMPARISON TAB --- */}
      {activeTab === "QUOTES" && (
        <div className="space-y-10">
           {Object.keys(groupedQuotes).map(rfqRef => {
               const quotes = groupedQuotes[rfqRef];
               // Find Best Price
               const minPrice = Math.min(...quotes.map(q => q.total_amount));
               const isSettled = quotes.some(q => q.status === 'APPROVED');

               return (
                   <div key={rfqRef} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                       {/* Header */}
                       <div className="flex justify-between items-center mb-8 relative z-10">
                           <div className="flex items-center gap-3">
                               <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                   <FileQuestion size={20} />
                               </div>
                               <div>
                                   <h3 className="text-lg font-bold text-white">{rfqRef}</h3>
                                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{quotes.length} Responses Received</p>
                               </div>
                           </div>
                           {isSettled && (
                               <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                                   <CheckCircle2 size={16} />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Procurement Completed</span>
                               </div>
                           )}
                       </div>

                       {/* Comparison Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                           {quotes.map(quote => {
                               const isBest = quote.total_amount === minPrice;
                               const isApproved = quote.status === 'APPROVED';
                               const isRejected = quote.status === 'REJECTED';

                               return (
                                   <motion.div 
                                     key={quote.id}
                                     layout
                                     className={`
                                        relative p-6 rounded-2xl border transition-all flex flex-col
                                        ${isApproved ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 
                                          isRejected ? 'bg-white/5 border-white/5 opacity-50 grayscale' : 
                                          isBest ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-teal-500/50 shadow-lg' : 'bg-black/20 border-white/10'}
                                     `}
                                   >
                                       {isBest && !isSettled && (
                                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                                               <TrendingDown size={10} /> Best Value
                                           </div>
                                       )}

                                       <div className="flex justify-between items-start mb-6">
                                           <div>
                                               <h4 className="text-white font-bold">{quote.supplier_name}</h4>
                                               <p className="text-[10px] text-slate-500 mt-1">Delivery: {quote.delivery_date}</p>
                                           </div>
                                           {isApproved ? (
                                               <CheckCircle2 className="text-emerald-500" size={24} />
                                           ) : (
                                               <div className="text-right">
                                                   <p className={`text-xl font-black tracking-tight ${isBest && !isSettled ? 'text-teal-400' : 'text-slate-300'}`}>
                                                       {quote.total_amount.toLocaleString()}
                                                   </p>
                                                   <p className="text-[9px] text-slate-500 font-bold uppercase">SAR Total</p>
                                               </div>
                                           )}
                                       </div>

                                       <div className="flex-1 space-y-2 mb-6">
                                           <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase border-b border-white/5 pb-2">
                                               <span>Item</span>
                                               <span>Qty</span>
                                           </div>
                                           {quote.items.map((item, idx) => (
                                               <div key={idx} className="flex justify-between text-xs text-slate-300">
                                                   <span>{item.desc}</span>
                                                   <span className="font-mono opacity-50">x{item.qty}</span>
                                               </div>
                                           ))}
                                       </div>

                                       {!isSettled ? (
                                           <button 
                                             onClick={() => handleApproveQuote(quote)}
                                             disabled={isProcessing}
                                             className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                                                ${isBest ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-slate-400'}
                                             `}
                                           >
                                               {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                               Approve Quote
                                           </button>
                                       ) : isApproved ? (
                                           <div className="w-full py-3 bg-emerald-500/20 rounded-xl text-center text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                                               Approved
                                           </div>
                                       ) : (
                                           <div className="w-full py-3 bg-transparent rounded-xl text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                               Archived
                                           </div>
                                       )}
                                   </motion.div>
                               );
                           })}
                       </div>
                   </div>
               );
           })}
           
           {Object.keys(groupedQuotes).length === 0 && (
               <div className="p-20 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                   <Scale className="mx-auto text-slate-700 mb-4" size={48} />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Active Quotes to Compare</p>
               </div>
           )}
        </div>
      )}

      {/* --- INVOICES TAB --- */}
      {activeTab === "INVOICES" && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setIsScannerOpen(true)}
                className="p-8 bg-purple-500/10 border border-purple-500/20 rounded-[2.5rem] hover:bg-purple-500/20 transition-all group text-left relative overflow-hidden"
              >
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-4">
                       <ScanLine size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white">Scan Invoice</h3>
                    <p className="text-xs text-purple-300 mt-1 font-medium">AI OCR Extraction</p>
                 </div>
              </button>
              <button 
                onClick={() => setIsManualEntryOpen(true)}
                className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] hover:bg-blue-500/20 transition-all group text-left"
              >
                 <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-4">
                    <Keyboard size={24} />
                 </div>
                 <h3 className="text-xl font-black text-white">Manual Upload</h3>
                 <p className="text-xs text-blue-300 mt-1 font-medium">Supplier Invoice & PO Entry</p>
              </button>
           </div>

           {/* List of Recent Invoices/POs */}
           {purchaseOrders.length > 0 && (
             <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8">
               <h3 className="text-lg font-bold text-white mb-6">Recent Procurement</h3>
               <div className="space-y-4">
                 {purchaseOrders.map(po => (
                   <div key={po.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                         <Receipt size={18} />
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-sm">{po.supplier}</p>
                            {/* Attachment Indicator */}
                            {(po as any).id.includes('PO-MAN') && (
                                <Paperclip size={12} className="text-emerald-400" />
                            )}
                         </div>
                         <p className="text-xs text-slate-500">{po.items}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-white font-mono font-bold">SAR {po.amount.toLocaleString()}</p>
                       <p className="text-[10px] text-emerald-400 uppercase tracking-widest">{po.status}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      {/* --- MISC TAB --- */}
      {activeTab === "MISC" && (
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
           <Wrench size={64} className="text-slate-700 mb-6" />
           <h3 className="text-xl font-bold text-white mb-2">Miscellaneous Procurement</h3>
           <p className="text-slate-500">Track petty cash and ad-hoc operational expenses.</p>
        </div>
      )}

      {/* SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md overflow-y-auto p-6">
           <div className="max-w-6xl mx-auto relative">
              <button onClick={() => setIsScannerOpen(false)} className="absolute -top-2 right-0 p-3 bg-white/10 rounded-full text-white">
                <Trash2 size={24} /> Close
              </button>
              <ReceiptScanner onAdd={handleAddExpense} />
           </div>
        </div>
      )}

      {/* MANUAL ENTRY MODAL */}
      <AnimatePresence>
        {isManualEntryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-4xl relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <CloudUpload size={24} className="text-blue-500" /> Supplier Invoice
                </h3>
                <button onClick={() => setIsManualEntryOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier Name</label>
                   <input 
                     autoFocus
                     value={manualForm.supplier}
                     onChange={(e) => setManualForm({ ...manualForm, supplier: e.target.value })}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-colors"
                     placeholder="e.g. Almarai, Tamimi Markets..."
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <DollarSign size={12} /> Total Amount (SAR)
                   </label>
                   <input 
                     type="number" 
                     value={manualForm.amount}
                     onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-blue-500/50 transition-colors"
                     placeholder="0.00"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                      <input 
                        type="date"
                        value={manualForm.date}
                        onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors appearance-none"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                      <select 
                        value={manualForm.category}
                        onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors appearance-none"
                      >
                        <option>Cost of Goods Sold</option>
                        <option>Operational Expense</option>
                        <option>Asset Purchase</option>
                        <option>Logistics</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Line Items / Notes</label>
                   <textarea
                     rows={2}
                     value={manualForm.items}
                     onChange={(e) => setManualForm({ ...manualForm, items: e.target.value })}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors resize-none"
                     placeholder="List main items (e.g. 50kg Rice, 10x Lamb)"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attach Proof</label>
                   <div 
                     onDragEnter={handleDragEnter}
                     onDragLeave={handleDragLeave}
                     onDragOver={handleDragOver}
                     onDrop={handleDrop}
                     onClick={() => fileInputRef.current?.click()}
                     className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${
                       isDragging 
                         ? 'border-blue-400 bg-blue-500/10 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                         : 'border-white/10 hover:bg-white/5 hover:border-blue-500/30'
                     }`}
                   >
                      {manualForm.file ? (
                        <div className="flex items-center gap-4 text-emerald-400 z-10">
                           <div className="p-3 bg-emerald-500/10 rounded-xl">
                             <FileText size={24} />
                           </div>
                           <div className="text-left">
                             <span className="text-sm font-bold block">{manualForm.file.name}</span>
                             <span className="text-[10px] opacity-70 uppercase font-black">Ready to Upload</span>
                           </div>
                        </div>
                      ) : (
                        <>
                           <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-blue-500/20 text-blue-400 animate-bounce' : 'bg-transparent text-slate-600 group-hover:text-blue-400'}`}>
                              <Upload size={32} />
                           </div>
                           <p className={`text-xs font-bold z-10 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`}>
                             {isDragging ? 'Drop file to attach' : <><span className="text-blue-400">Click to upload</span> invoice</>}
                           </p>
                           {!isDragging && <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1 z-10">or drag and drop PDF/JPG</p>}
                        </>
                      )}
                      
                      {/* Hover Effect Bg */}
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={(e) => e.target.files && setManualForm({...manualForm, file: e.target.files[0]})}
                     className="hidden" 
                     accept="image/*,application/pdf"
                   />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleManualSubmit}
                    disabled={isProcessing || !manualForm.supplier || !manualForm.amount}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Archiving..." : <><CheckCircle2 size={16} /> Confirm & Log Entry</>}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Procurement;
