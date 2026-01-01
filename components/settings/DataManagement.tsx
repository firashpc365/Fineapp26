
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Cloud, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  HardDrive,
  FileJson,
  CheckCircle2
} from 'lucide-react';
import { backupService } from '../../services/backupService';
import { AppSettings } from '../../types';

interface DataManagementProps {
  settings: AppSettings;
  appState: {
    wealth: any;
    customTabs: any;
  };
  onRestore: (data: any) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ settings, appState, onRestore }) => {
  const [loading, setLoading] = useState<"IDLE" | "BACKING_UP" | "RESTORING">("IDLE");
  const [status, setStatus] = useState<string | null>(null);

  const handleBackup = async () => {
    setLoading("BACKING_UP");
    setStatus(null);
    try {
      await backupService.createBackup({
        settings,
        wealth: appState.wealth,
        customTabs: appState.customTabs
      });
      setStatus("Protocol snapshot archived to Local Vault & ElitePro Cloud.");
      setTimeout(() => setStatus(null), 4500);
    } catch (e) {
      setStatus("Critical Error: Backup sequence interrupted.");
    } finally {
      setLoading("IDLE");
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = confirm(
      "RESTORE PROTOCOL: This will overwrite your current environment, wealth history, and active nodes. Are you sure?"
    );

    if (!confirmRestore) return;

    setLoading("RESTORING");
    setStatus(null);
    try {
      const restoredPayload = await backupService.restoreBackup(file);
      onRestore(restoredPayload);
      setStatus("System reconstructed. All operational parameters synced.");
      setTimeout(() => setStatus(null), 4500);
    } catch (e) {
      setStatus("Restore Failed: Signature verification mismatch.");
    } finally {
      setLoading("IDLE");
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Identity Strip */}
      <div className="flex items-center gap-3">
         <span className="h-[1px] flex-1 bg-gradient-to-r from-teal-500/40 to-transparent"></span>
         <span className="text-[9px] font-black font-mono text-teal-400 uppercase tracking-[0.5em] flex items-center gap-2">
           <Cloud size={10} /> Cloud Sync Active
         </span>
         <span className="h-[1px] flex-1 bg-gradient-to-l from-teal-500/40 to-transparent"></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Advanced Export */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
             <Cloud size={100} />
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl shadow-inner ring-1 ring-emerald-500/20">
              <Download size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Export Logic</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Snapshot</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 mb-10 leading-relaxed font-medium">
            Generates a signed <code>.json</code> vault containing all wealth history, catering nodes, and AI parameters. 
          </p>

          <div className="space-y-4">
             <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Action: Triggers download & Offsite Sync.</p>
             </div>
             <button 
                onClick={handleBackup}
                disabled={loading !== "IDLE"}
                className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all shadow-3xl active:scale-95"
              >
                {loading === "BACKING_UP" ? <Loader2 className="animate-spin" size={16} /> : <HardDrive size={18} />}
                {loading === "BACKING_UP" ? "Encrypting Vault..." : "Establish Backup"}
              </button>
          </div>
        </motion.div>

        {/* Card 2: Advanced Reconstruct */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
             <AlertTriangle size={100} />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl shadow-inner ring-1 ring-amber-500/20">
              <Upload size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Reconstruct</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Recovery</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 mb-10 leading-relaxed font-medium">
            Merge incoming logic shrapnel or fully restore an old operational state from a valid vault signature.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
               <AlertTriangle size={12} className="text-amber-500" />
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Risk: Overwrites current local state.</p>
            </div>
            <label className={`
              w-full py-5 rounded-2xl border border-dashed border-white/20 hover:border-amber-500 hover:bg-amber-500/10 
              text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all cursor-pointer
              ${loading !== "IDLE" ? "opacity-50 pointer-events-none" : "active:scale-95 shadow-3xl"}
            `}>
              {loading === "RESTORING" ? <Loader2 className="animate-spin text-amber-500" size={16} /> : <FileJson size={18} />}
              {loading === "RESTORING" ? "Verifying Signature..." : "Select Recovery Vault"}
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>
          </div>
        </motion.div>
      </div>

      {/* Global Sync Status Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 bg-slate-900/90 border border-teal-500/40 rounded-3xl flex items-center gap-5 shadow-4xl backdrop-blur-3xl"
          >
            <CheckCircle className="text-teal-400 shrink-0" size={28} />
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-teal-50">{status}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataManagement;
