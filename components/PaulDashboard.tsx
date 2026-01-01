import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  Briefcase,
  Wallet,
  Calculator,
  Percent,
  TrendingUp,
  ArrowRight,
  DollarSign,
  PieChart
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const MOCK_QUOTES = [
  { id: 1, project: "Aramco Maintenance", status: "PENDING", date: "2024-05-25", items: "100x Chicken Mandi", value: 15000 },
  { id: 2, project: "Site B Construction", status: "READY", date: "2024-05-24", value: 12500 },
];

const PaulDashboard: React.FC = () => {
  const { settings } = useSettings();
  const [rfqText, setRfqText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Simulator State
  const [simSellPrice, setSimSellPrice] = useState<number>(50000);
  const [simCostPrice, setSimCostPrice] = useState<number>(35000);

  const handleSendRFQ = () => {
    if (!rfqText.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setRfqText("");
      setIsSending(false);
      alert("RFQ Submitted to ElitePro Engine.");
    }, 1500);
  };

  // --- Financial Logic Engine ---
  const vatRate = settings.defaultTaxRate / 100;
  const invoiceFeeRate = settings.paulInvoiceFeeRate / 100; // e.g. 5%

  const vatAmount = simSellPrice * vatRate;
  const invoiceFee = simSellPrice * invoiceFeeRate;
  const grossProfit = simSellPrice - simCostPrice;
  const netProfit = grossProfit - invoiceFee; // Assuming Fee is deducted from Profit? Or simply Fee is a cost. Usually Fee is deducted from Total Payout.
  
  // Actually, usually:
  // Client Pays: Sell + VAT
  // Admin receives: Sell + VAT
  // Admin pays JAG/Proxy: VAT + Fee
  // Admin Net: Sell - Fee - Cost
  // Let's stick to simple breakdown for now.

  const totalEarnings = MOCK_QUOTES.reduce((acc, q) => acc + (q.value * (settings.paulCommissionRate / 100)), 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Partner Portal: Paul</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Submit Requests & Track Live Quotations</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                 <Wallet size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Projected Pipeline</p>
                 <p className="text-xl font-black text-white">SAR {totalEarnings.toLocaleString()}</p>
              </div>
           </div>
           <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
             <Briefcase size={28} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Actions & Simulator */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* RFQ Input */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                <PlusCircle className="text-blue-400" /> New Service Request
              </h3>
              
              <div className="space-y-6">
                <textarea
                  value={rfqText}
                  onChange={(e) => setRfqText(e.target.value)}
                  placeholder="Tell us what you need... e.g., 'Catering for 80 pax at Site 14, standard menu, delivery at 12:00 PM next Tuesday.'"
                  className="w-full px-8 py-8 bg-black/30 border border-white/5 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/20 text-white font-medium min-h-[180px] resize-none placeholder:opacity-20 backdrop-blur-sm"
                />
                
                <button
                  onClick={handleSendRFQ}
                  disabled={isSending || !rfqText.trim()}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] uppercase tracking-widest"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Send size={18} /> Transmit RFQ</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* DEAL SIMULATOR (ENHANCED) */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Calculator size={120} className="text-emerald-500" />
             </div>
             
             <div className="relative z-10">
                <h3 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
                   <TrendingUp className="text-emerald-400" size={24} /> Deal Simulator
                </h3>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selling Price</label>
                          <input 
                             type="number" 
                             value={simSellPrice}
                             onChange={(e) => setSimSellPrice(Number(e.target.value))}
                             className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-lg font-black text-emerald-400 outline-none focus:border-emerald-500/50"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Cost</label>
                          <input 
                             type="number" 
                             value={simCostPrice}
                             onChange={(e) => setSimCostPrice(Number(e.target.value))}
                             className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-lg font-black text-rose-400 outline-none focus:border-rose-500/50"
                          />
                       </div>
                   </div>

                   <div className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-4">
                      {/* Breakdown Rows */}
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Base Gross Profit</span>
                          <span className="font-mono text-white">SAR {grossProfit.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Invoice Fee ({settings.paulInvoiceFeeRate}%)</span>
                          <span className="font-mono text-amber-400">- SAR {invoiceFee.toLocaleString()}</span>
                      </div>

                      <div className="h-px bg-white/10 my-2" />

                      <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-white uppercase tracking-widest">Net Profit</span>
                          <span className={`text-xl font-black font-mono tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                             SAR {netProfit.toLocaleString()}
                          </span>
                      </div>
                   </div>

                   <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><PieChart size={14}/></div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">JAG Payable (VAT)</p>
                            <p className="text-xs text-slate-500">Pass-through tax</p>
                         </div>
                      </div>
                      <span className="text-lg font-black text-blue-400">SAR {vatAmount.toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Active List */}
        <div className="xl:col-span-7">
          <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl min-h-[600px] relative overflow-hidden">
            <div className="absolute -right-20 top-20 opacity-5 rotate-90">
               <Briefcase size={300} />
            </div>

            <h3 className="text-xl font-black text-white tracking-tight mb-8 relative z-10 flex items-center gap-3">
              <MessageSquare size={20} className="text-blue-400" /> Active Negotiations
            </h3>

            <div className="space-y-4 relative z-10">
              {MOCK_QUOTES.map((q) => {
                 return (
                  <div key={q.id} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white">{q.project}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-400">
                             <Clock size={12} /> {q.date}
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        q.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                       <p className="text-sm text-slate-300 font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                         {q.items}
                       </p>
                       
                       <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/50 border border-white/5 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Value</span>
                             <span className="text-lg font-bold text-slate-200">SAR {q.value.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaulDashboard;