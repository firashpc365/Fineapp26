import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Mail,
  Loader2,
  UserCircle,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { UserRole, AppMode } from '../types';
import { useToast } from './ui/Toast';
import MotionParticles from './ui/MotionParticles';

interface LoginProps {
  onLogin: (role: UserRole, startMode?: AppMode) => void;
}

const IS_DEV_MODE = true; 

const DEV_USERS = [
  { name: "Firash (Admin)", email: "admin@financeflow.com", role: UserRole.ADMIN, desc: "Full System Access" },
  { name: "Paul (Partner)", email: "paul@partner.com", role: UserRole.PAUL, desc: "RFQ & Project Portal" },
  { name: "JAG (Proxy)", email: "jag@financeflow.com", role: UserRole.JAG, desc: "Settlement & Holding" },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState(DEV_USERS[0]);
  const { showToast } = useToast();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    // Instant Access - Removed artificial delays for speed
    const role = IS_DEV_MODE ? selectedUser.role : UserRole.ADMIN;
    
    // Minimal delay just for button feedback animation
    setTimeout(() => {
        onLogin(role);
        showToast(`Session Established: ${selectedUser.name.split(' ')[0]}`, "SUCCESS");
    }, 150);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <MotionParticles />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#020617] to-slate-950 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-screen">
        
        {/* Left Column: Brand Hero */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">System Ready</span>
            </div>
            
            <h1 className="text-6xl font-black text-white tracking-tighter leading-[1.1]">
              ElitePro <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Financial Core</span>
            </h1>
            
            <p className="text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
              Orchestrate multi-entity finances, automate procurement logic, and leverage neural AI for predictive estimation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <Cpu className="text-blue-400 mb-2" size={24} />
                <p className="font-bold text-white text-sm">Neural Engine</p>
                <p className="text-xs text-slate-500">Gemini 1.5 Pro</p>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <ShieldCheck className="text-emerald-400 mb-2" size={24} />
                <p className="font-bold text-white text-sm">Secure Vault</p>
                <p className="text-xs text-slate-500">Local-First Encrypted</p>
             </div>
          </div>
        </motion.div>

        {/* Right Column: Auth Module */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-4xl relative overflow-hidden">
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-white tracking-tight">Identity Access</h2>
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">F</div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {IS_DEV_MODE ? (
                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Select User Node</p>
                     {DEV_USERS.map((u) => (
                       <button
                         key={u.email}
                         type="button"
                         onClick={() => setSelectedUser(u)}
                         className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                           selectedUser.email === u.email 
                             ? "bg-blue-600/10 border-blue-500 text-white shadow-inner" 
                             : "bg-slate-950 border-white/5 text-slate-400 hover:bg-white/5"
                         }`}
                       >
                         <div className={`p-2 rounded-xl ${selectedUser.email === u.email ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                            <UserCircle size={18} />
                         </div>
                         <div className="text-left flex-1">
                            <p className="text-xs font-bold leading-none">{u.name}</p>
                            <p className="text-[9px] opacity-60 mt-1">{u.desc}</p>
                         </div>
                         {selectedUser.email === u.email && <ArrowRight size={14} className="text-blue-400" />}
                       </button>
                     ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email" 
                        placeholder="Identity"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        placeholder="Security Key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-white text-slate-900 font-black py-5 rounded-2xl shadow-xl hover:bg-slate-100 transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  {loading ? "Authenticating..." : "Initialize Session"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;