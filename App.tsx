import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/MainLayout';
import MultiCompanyQuoteGenerator from './components/MultiCompanyQuoteGenerator';
import RFQAnalyzer from './components/RFQAnalyzer';
import CRMManagement from './components/CRMManagement';
import Procurement from './components/Procurement';
import FinancialsView from './components/FinancialsView';
import Settings from './components/Settings';
import SmartBackground from './components/SmartBackground';
import JagDashboard from './components/JagDashboard';
import PaulDashboard from './components/PaulDashboard';
import WorkflowBoard from './components/WorkflowBoard';
import Login from './components/Login';
import ServiceManagement from './components/ServiceManagement';
import LoadingScreen from './components/ui/LoadingScreen';
import { ToastProvider, useToast } from './components/ui/Toast';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppMode, UserRole } from './types';

const AppContent: React.FC = () => {
  const { settings, setSettings, appMode, setAppMode } = useSettings();
  const { showToast } = useToast();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);
  
  const [quoteDraft, setQuoteDraft] = useState<any>(null);
  const [wealth, setWealth] = useState({
    bank: 45000,
    cash: 2300,
    jag_pending: 12000, 
    paul_debt: 2500,    
    credit_card: 1200
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: UserRole, startMode?: AppMode) => {
    setUserRole(role);
    setIsLoggedIn(true);
    if (startMode) setAppMode(startMode);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast("Session Terminated Securely", "INFO");
  };

  const handleNavigate = (tab: string, subTab?: string) => {
    setActiveTab(tab);
    setActiveSubTab(subTab);
  };

  const handleQuoteFromRFQ = (data: any) => {
    setQuoteDraft(data);
    handleNavigate('quotes');
    showToast("RFQ Data loaded into Quote Engine.", "INFO");
  };

  const handleRestore = (data: any) => {
    if (data.settings) setSettings(data.settings);
    if (data.wealth) setWealth(data.wealth);
    showToast("System state successfully restored from vault.", "SUCCESS");
  };

  return (
    <div className="min-h-screen relative font-sans overflow-hidden text-slate-200">
      <AnimatePresence>{isInitialLoad && <LoadingScreen />}</AnimatePresence>
      <div className="fixed inset-0 z-background"><SmartBackground mode={appMode} /></div>

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <Login key="login-portal" onLogin={handleLogin} />
        ) : (
          <Layout 
            key="dashboard-layout"
            activeTab={activeTab} 
            setActiveTab={handleNavigate} 
            appMode={appMode} 
            toggleAppMode={() => setAppMode(appMode === AppMode.BUSINESS ? AppMode.PERSONAL : AppMode.BUSINESS)}
            customTabs={[]} 
            addCustomTab={() => {}}
            deleteCustomTab={() => {}}
            userRole={userRole} 
            settings={settings}
            onLogout={handleLogout}
          >
            {activeTab === 'dashboard' && <JagDashboard wealth={wealth} setWealth={setWealth} onAddTransaction={() => {}} />}
            {activeTab === 'financials' && <FinancialsView />}
            
            {activeTab === 'quotes' && <MultiCompanyQuoteGenerator initialFilter={activeSubTab} initialData={quoteDraft} />}
            {activeTab === 'rfq' && <RFQAnalyzer isBusiness={true} onGenerateQuote={handleQuoteFromRFQ} />}
            {activeTab === 'services' && <ServiceManagement initialCategory={'ALL'} />}
            {activeTab === 'projects' && <WorkflowBoard userRole={userRole} />}
            
            {activeTab === 'expenses' && <Procurement initialTab={activeSubTab as any} />}
            
            {activeTab === 'contacts' && <CRMManagement initialTab={activeSubTab as any} />}
            
            {activeTab === 'settings' && <Settings settings={settings} setSettings={setSettings} appState={{ wealth, customTabs: [] }} onRestore={handleRestore} />}
          </Layout>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <ThemeProvider>
      <SidebarProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  </SettingsProvider>
);

export default App;
