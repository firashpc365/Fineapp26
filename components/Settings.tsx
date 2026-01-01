
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings } from '../types';
import DataManagement from './settings/DataManagement';
import { useTheme } from '../context/ThemeContext';
import { 
  Palette, 
  Coins,
  Globe,
  Briefcase,
  Percent,
  Building2,
  User,
  Scale,
  Check,
  RefreshCw,
  Droplets, Cpu, Crown, Snowflake, Sun, Trees, Moon, Flame, Zap,
  Database,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from './ui/Toast';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  appState: {
    wealth: any;
    customTabs: any;
  };
  onRestore: (data: any) => void;
}

const WALLPAPERS = [
  { id: 'default', label: 'Oceanic', url: "https://images.unsplash.com/photo-1552083974-186346191183?q=80&w=2070&auto=format&fit=crop" },
  { id: 'onyx', label: 'Onyx Void', url: "https://images.unsplash.com/photo-1534234828563-02511c59b52a?q=80&w=2000&auto=format&fit=crop" },
  { id: 'royal', label: 'Royal Amber', url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop" },
  { id: 'corporate', label: 'Glass Structure', url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=3840&auto=format&fit=crop" },
  { id: 'desert', label: 'Dune Sands', url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=3840&auto=format&fit=crop" },
  { id: 'circuit', label: 'Tech Grid', url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3840&auto=format&fit=crop" }
];

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, appState, onRestore }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'APPEARANCE' | 'FINANCE' | 'DATA'>('FINANCE');

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">System Configuration</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Global Parameters & Protocol Controls</p>
        </div>
        
        <div className="bg-slate-900 p-1 rounded-xl border border-white/5 flex gap-1">
           <button 
             onClick={() => setActiveTab('APPEARANCE')}
             className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'APPEARANCE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Palette size={14} /> UI Layer
           </button>
           <button 
             onClick={() => setActiveTab('FINANCE')}
             className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'FINANCE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Coins size={14} /> Financials
           </button>
           <button 
             onClick={() => setActiveTab('DATA')}
             className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'DATA' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Database size={14} /> Data Vault
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- APPEARANCE TAB --- */}
        {activeTab === 'APPEARANCE' && (
          <motion.div 
            key="appearance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             {/* Wallpaper Selection */}
             <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                   <ImageIcon className="text-blue-400" size={20} /> Immersive Backgrounds
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                   {WALLPAPERS.map(wp => (
                      <button
                        key={wp.id}
                        onClick={() => updateSetting('activeWallpaper', wp.id)}
                        className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all group ${settings.activeWallpaper === wp.id ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-transparent hover:border-white/20'}`}
                      >
                         <img src={wp.url} alt={wp.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{wp.label}</span>
                         </div>
                         {settings.activeWallpaper === wp.id && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                               <Check size={10} />
                            </div>
                         )}
                      </button>
                   ))}
                </div>
             </div>

             {/* UI Toggles */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem]">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-200 text-sm">Glassmorphism</h4>
                      <Zap size={16} className="text-slate-500" />
                   </div>
                   <div className="flex gap-2">
                      {['low', 'medium', 'high'].map((level) => (
                         <button
                           key={level}
                           onClick={() => updateSetting('glassIntensity', level as any)}
                           className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border ${settings.glassIntensity === level ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-slate-600 hover:bg-white/5'}`}
                         >
                           {level}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem]">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-200 text-sm">Noise Overlay</h4>
                      <div className={`w-3 h-3 rounded-full ${settings.enableNoise ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                   </div>
                   <button 
                     onClick={() => updateSetting('enableNoise', !settings.enableNoise)}
                     className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${settings.enableNoise ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                   >
                     {settings.enableNoise ? 'Enabled' : 'Disabled'}
                   </button>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem]">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-200 text-sm">Compact Nav</h4>
                      <Layout size={16} className="text-slate-500" />
                   </div>
                   <button 
                     onClick={() => updateSetting('compactSidebar', !settings.compactSidebar)}
                     className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${settings.compactSidebar ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                   >
                     {settings.compactSidebar ? 'Active' : 'Standard'}
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {/* --- FINANCIAL PROTOCOLS TAB --- */}
        {activeTab === 'FINANCE' && (
          <motion.div 
            key="finance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                   <Coins className="text-emerald-400" size={20} /> Financial Protocols
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   
                   {/* Global Tax */}
                   <div className="space-y-6">
                      <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5">
                         <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global VAT Rate</label>
                            <Scale size={16} className="text-slate-600" />
                         </div>
                         <div className="relative">
                            <input 
                              type="number" 
                              value={settings.defaultTaxRate}
                              onChange={(e) => updateSetting('defaultTaxRate', Number(e.target.value))}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold text-lg focus:border-emerald-500 outline-none transition-colors"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</div>
                         </div>
                      </div>

                      <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5">
                         <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paul Commission</label>
                            <User size={16} className="text-slate-600" />
                         </div>
                         <div className="relative">
                            <input 
                              type="number" 
                              value={settings.paulCommissionRate}
                              onChange={(e) => updateSetting('paulCommissionRate', Number(e.target.value))}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold text-lg focus:border-emerald-500 outline-none transition-colors"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</div>
                         </div>
                      </div>
                   </div>

                   {/* Invoice Fee Matrix */}
                   <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Invoice Fee Matrix</h4>
                      
                      <div className="space-y-4">
                         {/* JAG CARD */}
                         <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-blue-500/20 shadow-lg">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                               <Building2 size={24} />
                            </div>
                            <div className="flex-1">
                               <p className="text-xs font-bold text-white">JAG Arabia (Proxy)</p>
                               <p className="text-[9px] text-slate-500 uppercase tracking-wider">Service Fee %</p>
                            </div>
                            <div className="w-24 relative">
                               <input 
                                 type="number" 
                                 value={settings.jagInvoiceFeeRate}
                                 onChange={(e) => updateSetting('jagInvoiceFeeRate', Number(e.target.value))}
                                 className="w-full bg-black/40 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-white font-bold text-right outline-none focus:border-blue-500"
                               />
                               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">%</span>
                            </div>
                         </div>

                         {/* PAUL CARD */}
                         <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-amber-500/20 shadow-lg">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                               <User size={24} />
                            </div>
                            <div className="flex-1">
                               <p className="text-xs font-bold text-white">Paul (Partner)</p>
                               <p className="text-[9px] text-slate-500 uppercase tracking-wider">Service Fee %</p>
                            </div>
                            <div className="w-24 relative">
                               <input 
                                 type="number" 
                                 value={settings.paulInvoiceFeeRate}
                                 onChange={(e) => updateSetting('paulInvoiceFeeRate', Number(e.target.value))}
                                 className="w-full bg-black/40 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-white font-bold text-right outline-none focus:border-amber-500"
                               />
                               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">%</span>
                            </div>
                         </div>
                      </div>
                   </div>

                </div>
             </div>
          </motion.div>
        )}

        {/* --- DATA MANAGEMENT TAB --- */}
        {activeTab === 'DATA' && (
          <motion.div 
            key="data"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
             <DataManagement settings={settings} appState={appState} onRestore={onRestore} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Settings;
