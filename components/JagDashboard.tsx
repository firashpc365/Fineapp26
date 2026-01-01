
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  DollarSign, 
  ArrowRightLeft, 
  AlertCircle,
  X,
  Loader2,
  Check,
  ExternalLink,
  History,
  Building2,
  Wallet,
  ArrowDownCircle,
  User,
  Clock,
  Truck,
  Paperclip,
  Percent
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

interface JagDashboardProps {
  wealth: {
    bank: number;
    cash: number;
    jag_pending: number;
    paul_debt: number;
    credit_card: number;
  };
  setWealth: React.Dispatch<React.SetStateAction<{
    bank: number;
    cash: number;
    jag_pending: number;
    paul_debt: number;
    credit_card: number;
  }>>;
  onAddTransaction: (tx: any) => void;
}

const MOCK_INVOICE_REQUESTS = [
  { id: 1, date: "2024-05-20", client: "Paul (Aramco Site)", amount: 15000, status: "PENDING_ISSUE", description: "Catering Services - May Batch", pdfUrl: null, vatAmount: 2250, purchaseBillUrl: null },
  { id: 2, date: "2024-05-22", client: "Red Sea Global", amount: 4500, status: "ISSUED", description: "Logistics Support", pdfUrl: "invoice_102.pdf", vatAmount: 675, purchaseBillUrl: "bill_102.pdf" },
];

const MOCK_HOLDINGS = [
  { id: 101, client: "Paul (Aramco Site)", amount: 12000, received_date: "2024-05-18", status: "HELD_BY_JAG" },
];

interface HistoryItem {
  id: string;
  desc: string;
  amount: number;
  date: string;
}

const JagDashboard: React.FC<JagDashboardProps> = ({ wealth, setWealth, onAddTransaction }) => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "SETTLEMENTS">("REQUESTS");
  const [isLoading, setIsLoading] = useState(true);
  
  // Local Data State
  const [requests, setRequests] = useState(MOCK_INVOICE_REQUESTS);
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);
  const [settlementHistory, setSettlementHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Upload Logic State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const purchaseBillRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadType, setUploadType] = useState<'FINAL_INVOICE' | 'PURCHASE_BILL'>('FINAL_INVOICE');

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean, holdingId: number | null, amount: number, fee: number }>({ isOpen: false, holdingId: null, amount: 0, fee: 0 });
  const [transferRef, setTransferRef] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- Upload Handlers ---
  const triggerUpload = (id: number, type: 'FINAL_INVOICE' | 'PURCHASE_BILL') => {
    setActiveUploadId(id);
    setUploadType(type);
    if (type === 'FINAL_INVOICE') {
        fileInputRef.current?.click();
    } else {
        purchaseBillRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadId === null) return;

    setUploadingId(activeUploadId);
    
    // Simulate Upload
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update Request State
    setRequests(prev => prev.map(req => {
      if (req.id === activeUploadId) {
        if (uploadType === 'FINAL_INVOICE') {
            return { ...req, status: "ISSUED", pdfUrl: `supa_storage/v1/invoices/${file.name}` };
        } else {
            return { ...req, purchaseBillUrl: `supa_storage/v1/bills/${file.name}` };
        }
      }
      return req;
    }));

    setUploadingId(null);
    setActiveUploadId(null);
    if (e.target) e.target.value = '';
  };

  // --- Transfer Handlers ---
  const openTransferModal = (holding: typeof MOCK_HOLDINGS[0]) => {
    const fee = holding.amount * (settings.jagInvoiceFeeRate / 100);
    setTransferModal({ isOpen: true, holdingId: holding.id, amount: holding.amount, fee });
    setTransferRef(`TRX-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
  };

  const confirmTransfer = async () => {
    if (!transferRef.trim()) return;

    setIsTransferring(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const netSettlement = transferModal.amount - transferModal.fee;

    // 1. Update Global Wealth (Only adding the Net Settlement to Bank)
    setWealth(prev => ({
      ...prev,
      jag_pending: prev.jag_pending - transferModal.amount, // Remove full holding
      bank: prev.bank + netSettlement // Add net amount
    }));

    // 2. Record Transaction
    onAddTransaction({
      desc: `Settlement from JAG (${transferRef})`,
      amt: `+${netSettlement}`,
      cat: "JAG Settlement",
      scope: "BUSINESS",
      date: "Just now"
    });

    // 3. Update Local Holdings & History
    setSettlementHistory(prev => [{
        id: transferRef,
        desc: `Settlement: ${transferRef} (Less ${settings.jagInvoiceFeeRate}% Fee)`,
        amount: netSettlement,
        date: new Date().toLocaleDateString()
    }, ...prev]);

    setHoldings(prev => prev.filter(h => h.id !== transferModal.holdingId));

    setIsTransferring(false);
    setTransferModal({ isOpen: false, holdingId: null, amount: 0, fee: 0 });
  };

  // --- Overview Calculations ---
  const cashInHand = wealth.bank + wealth.cash;
  const receivables = requests.reduce((acc, r) => acc + r.amount, 0) + 12000;

  const metrics = [
    { 
      label: "Total Cash in Hand", 
      amount: cashInHand, 
      icon: Wallet, 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    { 
      label: "JAG Balance (Held)", 
      amount: wealth.jag_pending, 
      icon: Building2, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    { 
      label: "Pending Invoices", 
      amount: receivables, 
      icon: Clock, 
      color: "text-purple-400", 
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      sub: "Receivables"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="application/pdf" 
      />
      <input 
        type="file" 
        ref={purchaseBillRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="application/pdf,image/*" 
      />

      {/* Header & Title */}
      <div>
        <h2 className="text-4xl font-black text-slate-200 tracking-tighter">Executive Dashboard</h2>
        <p className="text-slate-400 font-medium text-sm mt-1">Real-time Financial Overview & Operations</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className={`p-6 rounded-[2rem] border backdrop-blur-md relative overflow-hidden group hover:bg-white/5 transition-all ${metric.bg} ${metric.border}`}>
             <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color} shadow-inner`}>
                   <metric.icon size={24} />
                </div>
                {metric.sub && <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-60">{metric.sub}</span>}
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
                <p className={`text-3xl font-black tracking-tighter ${metric.color}`}>
                   <span className="text-sm opacity-50 mr-1 font-normal text-slate-400">SAR</span>
                   {metric.amount.toLocaleString()}
                </p>
             </div>
             <metric.icon size={120} className={`absolute -right-6 -bottom-6 opacity-5 rotate-12 ${metric.color}`} />
          </div>
        ))}
      </div>

      {/* Main Panel - JAG Operations */}
      <div className="bg-black/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] overflow-hidden min-h-[600px] shadow-3xl relative group mt-8">
        <div className="flex items-center gap-4 p-8 pb-0">
           <div className="p-3 bg-slate-800 rounded-xl text-slate-200">
              <Building2 size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-200">JAG Arabia Operations</h3>
              <p className="text-xs text-slate-500">Proxy Invoice Management & Settlements</p>
           </div>
        </div>

        <div className="p-8">
          <div className="flex border-b border-slate-800 bg-white/5 rounded-t-2xl overflow-hidden relative z-10">
            <button
              onClick={() => setActiveTab("REQUESTS")}
              className={`flex-1 p-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative
                ${activeTab === "REQUESTS" ? "text-teal-400 bg-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}
              `}
            >
              <FileText size={16} /> Invoice Requests
              {activeTab === "REQUESTS" && <motion.div layoutId="jagTabLine" className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,1)]" />}
            </button>
            <button
              onClick={() => setActiveTab("SETTLEMENTS")}
              className={`flex-1 p-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative
                ${activeTab === "SETTLEMENTS" ? "text-emerald-400 bg-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}
              `}
            >
              <ArrowRightLeft size={16} /> Fund Settlements
              {activeTab === "SETTLEMENTS" && <motion.div layoutId="jagTabLine" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />}
            </button>
          </div>

          <div className="bg-white/5 rounded-b-2xl p-8 border-x border-b border-slate-800 relative z-10 min-h-[400px]">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-3xl w-full" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "REQUESTS" ? (
                  <motion.div
                    key="requests"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {requests.map((req) => (
                      <div key={req.id} className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 transition-all rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-sm">
                        <div className="flex items-start gap-6">
                          <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center shadow-inner">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-200 tracking-tight">{req.client}</h3>
                            <p className="text-sm text-slate-400 font-medium mb-3">{req.description}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{req.date}</span>
                              <span className="text-[10px] font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Total: SAR {req.amount.toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-slate-500">VAT: {req.vatAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 items-end w-full md:w-auto">
                           {/* Purchase Bill Attachment */}
                           <button 
                             onClick={() => triggerUpload(req.id, 'PURCHASE_BILL')}
                             disabled={uploadingId === req.id}
                             className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${req.purchaseBillUrl ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200'}`}
                           >
                             <Paperclip size={12} /> {req.purchaseBillUrl ? "Purchase Bill Attached" : "Attach Purchase Bill"}
                           </button>

                           {req.status === "PENDING_ISSUE" ? (
                             <button 
                               onClick={() => triggerUpload(req.id, 'FINAL_INVOICE')}
                               disabled={uploadingId === req.id}
                               className="w-full md:w-auto flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-teal-500/20 disabled:opacity-50"
                             >
                               {uploadingId === req.id ? (
                                 <><Loader2 className="animate-spin" size={16} /> Uploading...</>
                               ) : (
                                 <><Upload size={16} /> Upload Official Invoice</>
                               )}
                             </button>
                           ) : (
                             <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                 <CheckCircle size={16} /> Invoice Issued
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="settlements"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {!showHistory ? (
                      <>
                        <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-start gap-5 mb-10 backdrop-blur-sm">
                           <AlertCircle className="text-amber-500 shrink-0" size={24} />
                           <p className="text-sm text-amber-200 font-medium leading-relaxed">
                             You are currently holding <strong className="text-white">SAR {wealth.jag_pending.toLocaleString()}</strong> in trust. Settlement transfers will automatically deduct the <strong className="text-white">{settings.jagInvoiceFeeRate}%</strong> service fee.
                           </p>
                        </div>

                        {holdings.map((item) => (
                          <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 backdrop-blur-sm">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                                <DollarSign size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-200 tracking-tight">Receipt from {item.client}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Acquired on {item.received_date}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-10">
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross Amount</p>
                                <p className="text-3xl font-black text-slate-200 tracking-tighter">{item.amount.toLocaleString()} <span className="text-sm font-normal opacity-30">SAR</span></p>
                              </div>
                              <button 
                                onClick={() => openTransferModal(item)}
                                className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/30 transition-all hover:translate-y-[-4px] active:scale-[0.98]"
                              >
                                Settle <ArrowRightLeft size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold text-slate-200">Transfer History</h3>
                              <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white text-xs font-bold uppercase">Close History</button>
                          </div>
                          {settlementHistory.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-slate-800">
                                  <div>
                                      <p className="text-white font-bold text-sm">{item.desc}</p>
                                      <p className="text-[10px] text-slate-500 font-mono mt-1">{item.date}</p>
                                  </div>
                                  <span className="text-emerald-400 font-black">SAR {item.amount.toLocaleString()}</span>
                              </div>
                          ))}
                      </div>
                    )}

                    <div className="mt-10 pt-10 border-t border-slate-800">
                      <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        <History size={14} /> {showHistory ? "Hide Settlement History" : "View Settlement History"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Confirmation Modal */}
      <AnimatePresence>
        {transferModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-w-lg shadow-4xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-slate-200 tracking-tight">Settlement Protocol</h3>
                 <button onClick={() => setTransferModal({ ...transferModal, isOpen: false })} className="text-slate-500 hover:text-white">
                   <X size={24} />
                 </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                   <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                      <span>Gross Holding</span>
                      <span>{transferModal.amount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-xs text-rose-400 font-bold uppercase">
                      <span>Service Fee ({settings.jagInvoiceFeeRate}%)</span>
                      <span>- {transferModal.fee.toLocaleString()}</span>
                   </div>
                   <div className="h-px bg-slate-600 my-2" />
                   <div className="flex justify-between text-xl text-emerald-400 font-black uppercase tracking-tight">
                      <span>Net Transfer</span>
                      <span>SAR {(transferModal.amount - transferModal.fee).toLocaleString()}</span>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Bank Reference ID</label>
                   <input 
                      autoFocus
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      className="w-full px-6 py-4 bg-black/40 border border-slate-800 rounded-2xl text-white font-mono outline-none focus:ring-2 ring-emerald-500/30"
                      placeholder="e.g. 98210332..."
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTransferModal({ ...transferModal, isOpen: false })}
                    className="py-5 bg-white/5 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmTransfer}
                    disabled={isTransferring}
                    className="py-5 bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isTransferring ? (
                      <><Loader2 className="animate-spin" size={16} /> Ledgering...</>
                    ) : (
                      <><Check size={16} /> Execute Payout</>
                    )}
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

export default JagDashboard;
