
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Search, Trash2, Key, Activity } from 'lucide-react';
import { UserRole } from '../types';
import { useToast } from './ui/Toast';

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  last_login: string;
}

const INITIAL_USERS: MockUser[] = [
  { id: '1', full_name: 'Firash Al-Qahtani', email: 'firash@elitepro.com', role: UserRole.ADMIN, last_login: '2m ago' },
  { id: '2', full_name: 'Paul Graham', email: 'paul@partner.com', role: UserRole.PAUL, last_login: '1h ago' },
  { id: '3', full_name: 'JAG Proxy Node', email: 'settlement@jag.sa', role: UserRole.JAG, last_login: '5h ago' },
  { id: '4', full_name: 'Ahmad Staff', email: 'ahmad@elitepro.com', role: UserRole.PAUL, last_login: '2d ago' },
];

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`Authority adjusted for ${users.find(u => u.id === userId)?.full_name}`, "SUCCESS");
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Identity Core</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage node authority and administrative protocols.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            placeholder="Query identities..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all shadow-inner backdrop-blur-sm placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-4xl relative group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <Shield size={500} />
        </div>

        <div className="relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">Identity Node</th>
                <th className="p-8">Access Level</th>
                <th className="p-8">Network Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-500 shadow-inner">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight">{user.full_name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8">
                    <select 
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                      className={`
                        bg-black/40 border border-white/10 text-xs font-black rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 cursor-pointer
                        ${user.role === UserRole.ADMIN ? 'text-emerald-400' : 'text-slate-300'}
                      `}
                    >
                      <option value={UserRole.ADMIN}>ADMIN (Root)</option>
                      <option value={UserRole.PAUL}>PAUL (Workflow)</option>
                      <option value={UserRole.JAG}>JAG (Settlement)</option>
                    </select>
                  </td>

                  <td className="p-8">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seen {user.last_login}</span>
                    </div>
                  </td>

                  <td className="p-8 text-right">
                    <button 
                      className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                      onClick={() => showToast("Purge protocol restricted in demo mode.", "INFO")}
                    >
                        <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] flex items-start gap-5 backdrop-blur-sm">
           <Shield className="text-emerald-500 shrink-0" size={24} />
           <div>
             <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">RBAC Enforcement</h4>
             <p className="text-xs text-slate-400 leading-relaxed">System-wide role-based access control is currently active. Adjusting access levels updates distributed permissions across all functional modules.</p>
           </div>
         </div>
         <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-start gap-5 backdrop-blur-sm">
           <Key className="text-blue-500 shrink-0" size={24} />
           <div>
             <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Credential Rotation</h4>
             <p className="text-xs text-slate-400 leading-relaxed">Password complexity and 2FA protocols are globally enforced for Root and Settlement nodes.</p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default UserManager;
