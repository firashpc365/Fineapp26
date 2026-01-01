
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Printer, 
  Calendar, 
  User, 
  MoreVertical,
  ChevronRight,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { CompanyId, COMPANY_CONFIG } from '../../lib/companyConfig';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import RoleGuard from '../auth/RoleGuard';
import { UserRole } from '../../types';

interface QuoteCardProps {
  quote: {
    id: string;
    companyId: CompanyId;
    clientName: string;
    amount: number;
    date: string;
    status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
    created_at?: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPrint: (id: string) => void;
  currentRole?: UserRole; 
}

const STATUS_STYLES = {
  DRAFT: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  SENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onEdit, onDelete, onPrint, currentRole = UserRole.ADMIN }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const { execute, isLoading: isDeleting } = useAsyncAction();
  const company = COMPANY_CONFIG[quote.companyId];

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete quote ${quote.id}?`)) return;

    // PERFORMANCE: Optimistic Hide. We hide the element immediately via state to ensure "snap" feel.
    setIsHiding(true);

    const success = await execute(async () => {
      // Simulate Database latency
      await new Promise(resolve => setTimeout(resolve, 800));
      onDelete(quote.id);
      return true;
    }, "Record successfully removed.");

    // ROLLBACK: If server fails, restore the record
    if (!success) {
      setIsHiding(false);
    }
  };

  if (isHiding) return null;

  return (
    <motion.div
      layout
      id={`quote-card-${quote.id}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative bg-black/40 border border-white/10 hover:border-blue-500/30 backdrop-blur-md rounded-[2rem] p-8 transition-all hover:shadow-2xl gpu-accelerated overflow-hidden ${isDeleting ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 transition-transform group-hover:scale-110">
         <FileText size={180} />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${STATUS_STYLES[quote.status]}`}>
          {quote.status}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 text-slate-500 hover:text-white transition-all active:scale-90"
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-10 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden py-2"
                >
                  <button onClick={() => { onPrint(quote.id); setShowMenu(false); }} className="w-full px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-left hover:bg-white/5 flex items-center gap-3 text-slate-300">
                    <Printer size={14} className="text-blue-400" /> Export PDF
                  </button>
                  
                  <RoleGuard allowedRoles={[UserRole.ADMIN]} currentRole={currentRole}>
                    <button onClick={() => { onEdit(quote.id); setShowMenu(false); }} className="w-full px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-left hover:bg-white/5 flex items-center gap-3 text-blue-400">
                      <Edit3 size={14} /> Modify Logic
                    </button>
                    <div className="h-px bg-slate-800 my-1 mx-4" />
                    <button onClick={handleDelete} className="w-full px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400">
                      <Trash2 size={14} /> Purge Record
                    </button>
                  </RoleGuard>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
            <img src={company.logo} alt="" className="w-full h-full object-contain opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white tracking-tight truncate">{quote.clientName}</h3>
            <p className="text-[10px] font-mono text-slate-500 tracking-widest">{quote.id}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Final Valuation</p>
          <p className="text-2xl font-bold text-white tracking-tight">
            SAR {quote.amount.toLocaleString()}
          </p>
        </div>
        
        <button 
          onClick={() => onEdit(quote.id)}
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
