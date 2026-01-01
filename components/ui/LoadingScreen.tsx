
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-28 h-28 mb-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-500 rounded-3xl shadow-2xl shadow-blue-900/40 rotate-3" />
          <div className="absolute inset-0 bg-slate-900 rounded-3xl border border-white/10 flex items-center justify-center text-white text-5xl font-black -rotate-3 z-10">
            F
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">FinanceFlow</h2>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-blue-400">
              <ShieldCheck size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                System Handshake
              </p>
            </div>
            
            <div className="w-64 h-[2px] bg-slate-900 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute h-full bg-gradient-to-r from-blue-500 to-teal-400 shadow-[0_0_15px_rgba(59,130,246,1)]"
              />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
              className="text-[9px] font-bold text-slate-500 uppercase tracking-widest"
            >
              Loading Assets...
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
