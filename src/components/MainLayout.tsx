
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  FileText,
  Settings,
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  X,
  Package,
  BrainCircuit,
  Truck,
  ChevronRight,
  Bell,
  FolderKanban
} from 'lucide-react';
import { AppMode, UserRole, AppSettings } from '../../types';
import ThemeSwitcher from '../../components/layout/ThemeSwitcher';
import GlobalSearch from '../../components/layout/GlobalSearch';
import { useSidebar } from '../../context/SidebarContext';

// Navigation Structure Definition
type MainTab = 'DASHBOARD' | 'SALES' | 'PURCHASE' | 'DIRECTORY';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subTab?: string;
  roles: UserRole[];
}

const NAV_STRUCTURE: Record<MainTab, NavItem[]> = {
  DASHBOARD: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.JAG, UserRole.PAUL] },
    { id: 'financials', label: 'Financials', icon: PieChart, roles: [UserRole.ADMIN] },
  ],
  SALES: [
    { id: 'quotes', label: 'Quotations', icon: FileText, roles: [UserRole.ADMIN, UserRole.PAUL] },
    { id: 'rfq', label: 'RFQ Intelligence', icon: BrainCircuit, roles: [UserRole.ADMIN, UserRole.PAUL] },
    { id: 'services', label: 'Service Catalog', icon: Package, roles: [UserRole.ADMIN] },
    { id: 'projects', label: 'Active Projects', icon: FolderKanban, roles: [UserRole.ADMIN, UserRole.PAUL] },
  ],
  PURCHASE: [
    { id: 'expenses', label: 'Procurement', icon: Truck, roles: [UserRole.ADMIN] }
  ],
  DIRECTORY: [
    { id: 'contacts', label: 'Network', icon: Users, roles: [UserRole.ADMIN, UserRole.PAUL] }
  ]
};

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string, subTab?: string) => void;
  children: React.ReactNode;
  appMode: AppMode;
  toggleAppMode: () => void;
  customTabs: any[];
  addCustomTab: (label: string) => void;
  deleteCustomTab: (id: string) => void;
  userRole: UserRole;
  settings: AppSettings;
  onLogout: () => void;
}

interface NavButtonProps {
  item: NavItem;
  isMobile?: boolean;
  activeTab: string;
  setActiveTab: (tab: string, subTab?: string) => void;
  isCollapsed: boolean;
  closeMobileMenu: () => void;
  userRole: UserRole;
}

const NavButton: React.FC<NavButtonProps> = ({
  item,
  isMobile = false,
  activeTab,
  setActiveTab,
  isCollapsed,
  closeMobileMenu,
  userRole
}) => {
  if (!item.roles.includes(userRole)) return null;

  const isActive = activeTab === item.id;

  return (
    <button
      onClick={() => {
        setActiveTab(item.id, item.subTab);
        if (isMobile) closeMobileMenu();
      }}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-r-xl transition-all relative group mb-1
        ${isActive
          ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.1)]'
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-2 border-transparent'}
        ${isCollapsed && !isMobile ? 'justify-center px-2 border-l-0 rounded-xl' : ''}
      `}
    >
      <div className={`relative ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
        <item.icon size={20} className={isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-500 group-hover:text-slate-200 transition-colors'} />
      </div>

      {(!isCollapsed || isMobile) && (
        <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-blue-100' : ''}`}>{item.label}</span>
      )}

      {/* Smart Tooltip for Collapsed State */}
      {isCollapsed && !isMobile && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl translate-x-2 group-hover:translate-x-0">
          {item.label}
          {/* Arrow */}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-900" />
        </div>
      )}

      {/* Mobile Active Indicator */}
      {isActive && isMobile && (
        <motion.div layoutId="mobileActiveIndicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      )}
    </button>
  );
};

const MainLayout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
  appMode,
  toggleAppMode,
  userRole,
  settings,
  onLogout
}) => {
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobileMenu, closeMobileMenu } = useSidebar();

  // Determine active category for Bottom Nav Highlighting
  const getActiveCategory = () => {
    for (const [category, items] of Object.entries(NAV_STRUCTURE)) {
      if (items.some(item => item.id === activeTab)) return category;
    }
    return null;
  };
  const activeCategory = getActiveCategory();

  const handleLogout = () => {
    onLogout();
  };

  return (
    // Main Container - Increased transparency for background visibility
    <div className="flex h-screen overflow-hidden bg-slate-950/20 backdrop-blur-xl text-slate-200">

      {/* --- DESKTOP SIDEBAR --- */}
      <motion.div
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col border-r border-white/5 bg-slate-950/60 relative z-50 h-full backdrop-blur-md group shadow-2xl"
      >
        {/* Logo Area */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-[88px]`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
                EP
              </div>
              <div>
                <span className="font-black tracking-tight text-white text-lg block leading-none">ElitePro</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fin.OS v4.0</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
              EP
            </div>
          )}
          {!isCollapsed && (
            <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
              <ChevronRight size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-0 py-4 space-y-8 custom-scrollbar">
          {Object.entries(NAV_STRUCTURE).map(([section, items]) => (
            <div key={section} className="space-y-1">
              {!isCollapsed && (
                <p className="px-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{section}</p>
              )}
              {isCollapsed && (
                <div className="h-px w-8 bg-white/5 mx-auto my-4" />
              )}
              {items.map(item => (
                <NavButton
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isCollapsed={isCollapsed}
                  closeMobileMenu={closeMobileMenu}
                  userRole={userRole}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Desktop Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          {!isCollapsed ? (
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Settings size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group"
              >
                <LogOut size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Terminate</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-3 rounded-xl transition-all relative group ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <Settings size={20} />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl translate-x-2 group-hover:translate-x-0">
                  Settings
                </div>
              </button>

              <button
                onClick={toggleSidebar}
                className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <ChevronRight size={20} />
              </button>

              <button onClick={handleLogout} className="p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all relative group">
                <LogOut size={20} />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-rose-950 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 border border-rose-900 shadow-xl translate-x-2 group-hover:translate-x-0">
                  Terminate
                </div>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- MOBILE DRAWER (SECONDARY OPTIONS) --- */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 z-[70] flex flex-col lg:hidden shadow-4xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
                    EP
                  </div>
                  <span className="font-black tracking-tight text-white text-lg">ElitePro</span>
                </div>
                <button onClick={closeMobileMenu} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Nav (Full Tree) */}
              <div className="flex-1 overflow-y-auto px-0 py-4 space-y-8 custom-scrollbar">
                {Object.entries(NAV_STRUCTURE).map(([section, items]) => (
                  <div key={section} className="space-y-1">
                    <p className="px-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{section}</p>
                    {items.map(item => (
                      <NavButton
                        key={item.id}
                        item={item}
                        isMobile={true}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isCollapsed={false}
                        closeMobileMenu={closeMobileMenu}
                        userRole={userRole}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-900/50">
                <button
                  onClick={() => { setActiveTab('settings'); closeMobileMenu(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <Settings size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                >
                  <LogOut size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">

        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
              EP
            </div>
            <span className="font-black text-white tracking-tight text-lg">ElitePro</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Global Toolbar (Desktop) */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/10 backdrop-blur-sm z-30">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${appMode === AppMode.BUSINESS ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{appMode} Mode Active</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-xs font-medium opacity-60">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-64">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <button className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all relative border border-white/5">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </button>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">{userRole === UserRole.ADMIN ? 'Firash Al-Qahtani' : userRole}</p>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">System Root</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-white font-bold shadow-inner ring-1 ring-white/5">
                  {userRole.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Scroll Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-10 relative z-10 scroll-smooth pb-24 lg:pb-20">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between items-center z-50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors active:scale-95 ${activeCategory === 'DASHBOARD' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeCategory === 'DASHBOARD' ? 'bg-blue-500/10' : 'bg-transparent'}`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide">Dash</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex flex-col items-center gap-1 transition-colors active:scale-95 ${activeCategory === 'SALES' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeCategory === 'SALES' ? 'bg-blue-500/10' : 'bg-transparent'}`}>
              <FileText size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide">Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center gap-1 transition-colors active:scale-95 ${activeCategory === 'PURCHASE' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeCategory === 'PURCHASE' ? 'bg-blue-500/10' : 'bg-transparent'}`}>
              <Truck size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide">Buy</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center gap-1 transition-colors active:scale-95 ${activeCategory === 'DIRECTORY' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeCategory === 'DIRECTORY' ? 'bg-blue-500/10' : 'bg-transparent'}`}>
              <Users size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide">Team</span>
          </button>

          <button
            onClick={toggleMobileMenu}
            className={`flex flex-col items-center gap-1 transition-colors active:scale-95 ${isMobileOpen ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isMobileOpen ? 'bg-white/10' : 'bg-transparent'}`}>
              <Menu size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide">Menu</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default MainLayout;
