
import React from 'react';
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { Droplets, Cpu, Crown, Snowflake, Sun, Trees, Moon, Flame, Zap } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'ocean', icon: Droplets, color: 'bg-blue-500', label: 'Ocean' },
    { id: 'nebula', icon: Cpu, color: 'bg-fuchsia-500', label: 'Nebula' },
    { id: 'gold', icon: Crown, color: 'bg-amber-500', label: 'Gold' },
    { id: 'arctic', icon: Snowflake, color: 'bg-sky-400', label: 'Arctic' },
    { id: 'sunset', icon: Sun, color: 'bg-orange-500', label: 'Sunset' },
    { id: 'forest', icon: Trees, color: 'bg-emerald-500', label: 'Forest' },
    { id: 'midnight', icon: Moon, color: 'bg-indigo-500', label: 'Midnight' },
    { id: 'crimson', icon: Flame, color: 'bg-red-500', label: 'Crimson' },
    { id: 'neon', icon: Zap, color: 'bg-lime-500', label: 'Neon' },
  ];

  return (
    <div className="flex bg-slate-900/50 backdrop-blur-md p-1.5 rounded-full border border-slate-800 gap-1.5 shadow-xl overflow-x-auto custom-scrollbar max-w-[200px] md:max-w-none">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`
              p-2.5 rounded-full transition-all relative flex items-center justify-center group outline-none shrink-0
              ${isActive ? "text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-white/20" : "text-slate-500 hover:text-white hover:bg-white/5"}
            `}
          >
            {/* Active Indicator Background */}
            {isActive && (
              <motion.div 
                layoutId="activeTheme"
                className={`absolute inset-0 rounded-full ${t.color} opacity-20`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* Icon */}
            <t.icon size={16} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />

            {/* Hover Tooltip */}
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[9px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-20 shadow-lg uppercase tracking-widest">
              {t.label}
              {/* Arrow */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-l border-t border-white/10" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
