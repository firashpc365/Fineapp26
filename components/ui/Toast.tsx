import React, { useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

type ToastType = "SUCCESS" | "ERROR" | "INFO";

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((msg: string, type: ToastType = "INFO") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-8 right-8 z-[10001] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`
                pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-[1.5rem] shadow-4xl border backdrop-blur-2xl min-w-[320px] max-w-[420px]
                ${t.type === "SUCCESS" ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-50" : ""}
                ${t.type === "ERROR" ? "bg-red-950/80 border-red-500/30 text-red-50" : ""}
                ${t.type === "INFO" ? "bg-slate-900/80 border-white/10 text-slate-50" : ""}
              `}
            >
              <div className="shrink-0">
                {t.type === "SUCCESS" && <CheckCircle size={20} className="text-emerald-400" />}
                {t.type === "ERROR" && <AlertCircle size={20} className="text-red-400" />}
                {t.type === "INFO" && <Info size={20} className="text-blue-400" />}
              </div>
              
              <p className="text-[13px] font-bold leading-relaxed flex-1 tracking-tight">{t.msg}</p>
              
              <button 
                onClick={() => removeToast(t.id)} 
                className="text-white/20 hover:text-white transition-colors active:scale-90"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};