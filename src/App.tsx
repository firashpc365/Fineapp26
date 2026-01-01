
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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
import UserManager from './components/UserManager';
import ServiceManagement from './components/ServiceManagement';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorDisplay from './components/ui/ErrorDisplay';
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
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derived state from URL to maintain compatibility with Layout props
  const activeTab = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
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
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
    showToast("Session Terminated Securely", "INFO");
  };

  // Maps legacy string tabs to routes
  const handleNavigate = (tab: string, subTab?: string) => {
    if (tab === 'dashboard') navigate('/dashboard');
    else navigate(`/${tab}`, { state: { subTab } });
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
          <Routes>
            <Route path="*" element={<Login key="login-portal" onLogin={handleLogin} />} />
          </Routes>
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
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<JagDashboard wealth={wealth} setWealth={setWealth} onAddTransaction={() => {}} />} />
              <Route path="/financials" element={<FinancialsView />} />
              <Route path="/quotes" element={<MultiCompanyQuoteGenerator initialFilter={location.state?.subTab} initialData={quoteDraft} />} />
              <Route path="/rfq" element={<RFQAnalyzer isBusiness={true} onGenerateQuote={handleQuoteFromRFQ} />} />
              <Route path="/services" element={<ServiceManagement initialCategory={'ALL'} />} />
              <Route path="/projects" element={<WorkflowBoard userRole={userRole} />} />
              <Route path="/expenses" element={<Procurement initialTab={location.state?.subTab} />} />
              <Route path="/contacts" element={<CRMManagement initialTab={location.state?.subTab} />} />
              <Route path="/settings" element={<Settings settings={settings} setSettings={setSettings} appState={{ wealth, customTabs: [] }} onRestore={handleRestore} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
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
