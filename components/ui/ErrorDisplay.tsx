
import React, { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorDisplay({
  error,
  reset,
}: {
  error?: Error | null;
  reset?: () => void;
}) {
  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-950 p-6 text-center">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] max-w-md relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20 shadow-inner">
          <AlertTriangle size={40} />
        </div>
        
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">System Malfunction</h2>
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
          The liquid interface encountered critical resistance. 
          <br/>
          <span className="font-mono text-[10px] text-red-400/70 mt-3 block bg-black/40 p-3 rounded-xl border border-red-500/10">
            {error?.message || "Unknown Core Exception"}
          </span>
        </p>

        <button
          onClick={reset || (() => window.location.reload())}
          className="w-full px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-900/30"
        >
          <RefreshCcw size={16} /> Reboot System
        </button>
      </motion.div>
    </div>
  );
}
