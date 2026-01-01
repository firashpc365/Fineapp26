
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Subtle circuit pattern for the card background
const TECH_PATTERN = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`;

interface FluidCardProps {
  title: string;
  value: string | React.ReactNode;
  sub?: string | React.ReactNode;
  icon: any;
  color: string; // e.g. "text-blue-400"
  onClick?: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const FluidCard: React.FC<FluidCardProps> = ({ title, value, sub, icon: Icon, color, onClick, children, actions, className = "" }) => {
  // Extract base color name for dynamic background classes construction
  const colorBase = color.includes('blue') ? 'blue' : 
                    color.includes('emerald') ? 'emerald' : 
                    color.includes('purple') ? 'purple' : 
                    color.includes('amber') ? 'amber' : 'slate';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group overflow-hidden rounded-[2rem] bg-slate-950/40 backdrop-blur-xl border border-white/5 transition-all duration-500 hover:shadow-2xl cursor-pointer h-full flex flex-col ${className}`}
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.05)`, // default subtle ring
      }}
    >
      {/* Dynamic Colored Border Glow on Hover */}
      <div className={`absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-${colorBase}-500/30 transition-colors duration-500 pointer-events-none`} />

      {/* 1. TECH PATTERN (Background) */}
      <div 
        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none bg-repeat"
        style={{ backgroundImage: TECH_PATTERN }} 
      />

      {/* 2. LIQUID HOVER (Background Gradient) */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br from-${colorBase}-500 to-transparent z-0`} />

      {/* 3. GLOWING BLOB (Behind Icon) */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 bg-${colorBase}-500/20 rounded-full blur-[50px] group-hover:bg-${colorBase}-500/30 transition-all duration-500 group-hover:scale-150 z-0`} />

      {/* === 4. HOLOGRAPHIC SHIMMER OVERLAY === */}
      <div className="glass-shine z-[5]" />

      {/* 5. CONTENT */}
      <div className="relative z-10 p-8 flex flex-col h-full">
         <div className="flex justify-between items-start mb-6">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className={`p-3.5 rounded-xl bg-white/5 border border-white/5 ${color} group-hover:text-white group-hover:bg-${colorBase}-500 transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.2)]`}
            >
               <Icon size={24} />
            </motion.div>
            {actions ? actions : (
               <div className="text-right">
                  {typeof value === 'string' ? (
                    <p className="text-xl font-mono font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-right">{value}</p>
                  ) : value}
                  {sub && (
                    <div className="mt-1 flex justify-end">
                       {typeof sub === 'string' ? (
                         <p className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{sub}</p>
                       ) : sub}
                    </div>
                  )}
               </div>
            )}
         </div>

         <div className="mb-auto">
            <h3 className="text-lg font-black text-white tracking-tight leading-snug mb-2 group-hover:text-slate-100 transition-colors">{title}</h3>
         </div>
         
         {/* Inner Content Slot */}
         {children && <div className="mt-4 border-t border-white/5 pt-4 group-hover:border-white/10 transition-colors">{children}</div>}
      </div>
    </motion.div>
  );
};

export default FluidCard;
