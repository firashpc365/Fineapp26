
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Save, 
  X, 
  Target, 
  Truck, 
  Briefcase, 
  Contact, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  Building2,
  Search,
  CheckCircle2,
  Zap,
  FileText,
  Upload,
  Loader2
} from "lucide-react";
import { ClientItem } from "../types";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { SEED_CLIENTS } from "../constants";
import { useToast } from "./ui/Toast";
import { parseBulkClients } from "../services/geminiService";

type DirectoryType = 'CLIENT' | 'SUPPLIER' | 'SALESMAN' | 'MANPOWER';

// --- MOCK DATA EXTENSIONS ---
const INITIAL_SUPPLIERS = [
  { id: 1, name: 'Almarai', type: 'Food & Beverage', contact: '+966 50 000 0000', rating: 5, location: 'Riyadh' },
  { id: 2, name: 'Saco', type: 'Hardware', contact: '+966 50 111 1111', rating: 4, location: 'Dammam' },
  { id: 3, name: 'Bin Zagr', type: 'Wholesale', contact: '+966 50 222 2222', rating: 3, location: 'Jeddah' },
];

const INITIAL_SALESMEN = [
  { id: 1, name: 'Firash Al-Qahtani', role: 'Senior Sales', contact: 'firash@elite.com', commission: 15, active_deals: 4 },
  { id: 2, name: 'Ahmed Ali', role: 'Sales Exec', contact: 'ahmed@elite.com', commission: 10, active_deals: 2 },
  { id: 3, name: 'Sarah Johnson', role: 'BDM', contact: 'sarah@elite.com', commission: 12, active_deals: 5 },
];

const INITIAL_MANPOWER = [
  { id: 1, name: 'Mohammed Ahmed', role: 'Driver (Heavy)', rate: '2500 SAR/mo', availability: 'Available' },
  { id: 2, name: 'John Doe', role: 'Chef', rate: '3500 SAR/mo', availability: 'On Site' },
  { id: 3, name: 'Team Alpha', role: 'Labor Crew (5 Pax)', rate: '800 SAR/day', availability: 'Booked' },
];

interface CRMManagementProps {
  initialTab?: DirectoryType;
}

const CRMManagement: React.FC<CRMManagementProps> = ({ initialTab = 'CLIENT' }) => {
  const { execute, isLoading: isSaving } = useAsyncAction();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DirectoryType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [clients, setClients] = useState<ClientItem[]>(SEED_CLIENTS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [salesmen, setSalesmen] = useState(INITIAL_SALESMEN);
  const [manpower, setManpower] = useState(INITIAL_MANPOWER);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Bulk Import State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [previewClients, setPreviewClients] = useState<ClientItem[]>([]);
  const [isReviewStep, setIsReviewStep] = useState(false);
  
  // Dynamic Form State
  const [formData, setFormData] = useState<any>({});

  // -- Actions --

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this record permanently?")) return;
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (activeTab === 'CLIENT') setClients(prev => prev.filter(i => i.id !== id));
      if (activeTab === 'SUPPLIER') setSuppliers(prev => prev.filter(i => i.id !== id));
      if (activeTab === 'SALESMAN') setSalesmen(prev => prev.filter(i => i.id !== id));
      if (activeTab === 'MANPOWER') setManpower(prev => prev.filter(i => i.id !== id));
    }, "Record deleted.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Logic
    if (!formData.name) {
        showToast("Entity Name is required.", "ERROR");
        return;
    }
    
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      
      const newId = editingId || Date.now();
      const newItem = { ...formData, id: newId };

      if (activeTab === 'CLIENT') {
          setClients(prev => editingId ? prev.map(i => i.id === newId ? newItem : i) : [newItem, ...prev]);
      } else if (activeTab === 'SUPPLIER') {
          setSuppliers(prev => editingId ? prev.map(i => i.id === newId ? newItem : i) : [newItem, ...prev]);
      } else if (activeTab === 'SALESMAN') {
          setSalesmen(prev => editingId ? prev.map(i => i.id === newId ? newItem : i) : [newItem, ...prev]);
      } else if (activeTab === 'MANPOWER') {
          setManpower(prev => editingId ? prev.map(i => i.id === newId ? newItem : i) : [newItem, ...prev]);
      }

      closeModal();
    }, `Successfully saved to ${activeTab} directory.`);
  };

  const handleBulkAnalyze = async () => {
    if (!bulkText && bulkFiles.length === 0) return;

    await execute(async () => {
        let allNewItems: ClientItem[] = [];

        // 1. Process Text Input
        if (bulkText.trim()) {
            const items = await parseBulkClients(bulkText);
            allNewItems = [...allNewItems, ...items];
        }

        // 2. Process Files
        for (const file of bulkFiles) {
            if (
              file.type === 'text/csv' || 
              file.type === 'application/vnd.ms-excel' || 
              file.type === 'text/plain' || 
              file.name.toLowerCase().endsWith('.csv') ||
              file.name.toLowerCase().endsWith('.txt')
            ) {
                 const textContent = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsText(file);
                 });
                 const items = await parseBulkClients(textContent);
                 allNewItems = [...allNewItems, ...items];
            } else {
                // Handle Images/PDFs via Vision
                const reader = new FileReader();
                await new Promise<void>((resolve) => {
                    reader.onloadend = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        const items = await parseBulkClients({ data: base64, mimeType: file.type });
                        allNewItems = [...allNewItems, ...items];
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
        }

        setPreviewClients(allNewItems);
        setIsReviewStep(true);

    }, "Analysis complete. Review extracted clients.");
  };

  const handleFinalImport = async () => {
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setClients(prev => [...previewClients, ...prev]);
      
      // Cleanup
      setIsBulkOpen(false);
      setPreviewClients([]);
      setBulkText("");
      setBulkFiles([]);
      setIsReviewStep(false);
    }, `Successfully imported ${previewClients.length} clients.`);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({}); // Reset form
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  // --- Filtering ---
  const filteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'CLIENT': return clients.filter(c => c.name.toLowerCase().includes(query) || c.email?.toLowerCase().includes(query));
      case 'SUPPLIER': return suppliers.filter(s => s.name.toLowerCase().includes(query) || s.type.toLowerCase().includes(query));
      case 'SALESMAN': return salesmen.filter(s => s.name.toLowerCase().includes(query));
      case 'MANPOWER': return manpower.filter(m => m.name.toLowerCase().includes(query));
      default: return [];
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
             <Users className="text-blue-500" size={32} /> Network Directory
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage external partners, client base, and internal workforce.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           {/* Navigation Pills */}
           <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 overflow-x-auto custom-scrollbar flex-1 md:flex-none">
              {[
                  { id: 'CLIENT', label: 'Clients', icon: Target },
                  { id: 'SUPPLIER', label: 'Suppliers', icon: Truck },
                  { id: 'SALESMAN', label: 'Sales Team', icon: Briefcase },
                  { id: 'MANPOWER', label: 'Manpower', icon: Contact },
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setSearchQuery(""); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                      }`}
                  >
                      <tab.icon size={14} /> {tab.label}
                  </button>
              ))}
           </div>
           
           {activeTab === 'CLIENT' && (
             <button 
               onClick={() => setIsBulkOpen(true)}
               className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-95"
               title="Bulk Import Clients"
             >
               <Zap size={20} />
             </button>
           )}

           <button 
             onClick={openCreateModal}
             className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
           >
             <Plus size={20} />
           </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
         <input 
           type="text" 
           placeholder={`Search ${activeTab.toLowerCase()}s...`}
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white font-medium outline-none focus:border-blue-500/50 transition-all"
         />
      </div>

      {/* TABLE DISPLAY */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                  {activeTab === 'CLIENT' && (
                    <tr className="bg-white/5 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em] border-b border-white/5">
                      <th className="p-8">Identity & Location</th>
                      <th className="p-8">Contact Channels</th>
                      <th className="p-8">Fiscal Data</th>
                      <th className="p-8 text-right">Actions</th>
                    </tr>
                  )}
                  {activeTab === 'SUPPLIER' && (
                    <tr className="bg-white/5 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em] border-b border-white/5">
                      <th className="p-8">Supplier Profile</th>
                      <th className="p-8">Type & Rating</th>
                      <th className="p-8">Contact</th>
                      <th className="p-8 text-right">Actions</th>
                    </tr>
                  )}
                  {(activeTab === 'SALESMAN' || activeTab === 'MANPOWER') && (
                    <tr className="bg-white/5 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em] border-b border-white/5">
                      <th className="p-8">Name & Role</th>
                      <th className="p-8">{activeTab === 'SALESMAN' ? 'Performance' : 'Rate'}</th>
                      <th className="p-8">Status</th>
                      <th className="p-8 text-right">Actions</th>
                    </tr>
                  )}
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredData().map((item: any) => (
                     <tr key={item.id} className="group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openEditModal(item)}>
                        
                        {/* CLIENT COLUMNS */}
                        {activeTab === 'CLIENT' && (
                           <>
                             <td className="p-8">
                                <div className="flex items-start gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-lg border border-blue-500/20">
                                      {item.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-black text-white text-base tracking-tight">{item.name}</p>
                                      {item.address && (
                                          <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                              <MapPin size={10} />
                                              <p className="text-[10px] uppercase tracking-wide truncate max-w-[200px]">{item.address}</p>
                                          </div>
                                      )}
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="space-y-1.5">
                                   <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                      <Mail size={12} className="text-slate-600" /> {item.email || 'N/A'}
                                   </div>
                                   <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                      <Phone size={12} className="text-slate-600" /> {item.contact}
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="flex flex-col gap-2 items-start">
                                   {item.vat ? (
                                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                        <Hash size={12} className="text-emerald-500" />
                                        <span className="font-mono text-[10px] font-bold text-emerald-400">{item.vat}</span>
                                        <span className="text-[8px] text-emerald-600 font-black uppercase ml-1">VAT</span>
                                     </div>
                                   ) : <span className="text-[10px] text-slate-600 italic px-2">No VAT Rec.</span>}
                                   
                                   {item.cr && (
                                       <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                          <Building2 size={12} className="text-blue-500" />
                                          <span className="font-mono text-[10px] font-bold text-blue-400">{item.cr}</span>
                                          <span className="text-[8px] text-blue-600 font-black uppercase ml-1">CR</span>
                                       </div>
                                   )}
                                </div>
                             </td>
                           </>
                        )}

                        {/* SUPPLIER COLUMNS */}
                        {activeTab === 'SUPPLIER' && (
                           <>
                             <td className="p-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold border border-orange-500/20">
                                      <Truck size={18} />
                                   </div>
                                   <div>
                                      <p className="font-black text-white text-sm">{item.name}</p>
                                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={10}/> {item.location}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <span className="text-xs font-bold text-white block mb-1">{item.type}</span>
                                <div className="flex gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={10} className={`${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                   ))}
                                </div>
                             </td>
                             <td className="p-8 text-xs font-mono text-slate-300">{item.contact}</td>
                           </>
                        )}

                        {/* WORKFORCE COLUMNS */}
                        {(activeTab === 'SALESMAN' || activeTab === 'MANPOWER') && (
                           <>
                             <td className="p-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                                      <Contact size={18} />
                                   </div>
                                   <div>
                                      <p className="font-black text-white text-sm">{item.name}</p>
                                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.role}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                {activeTab === 'SALESMAN' ? (
                                   <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">
                                      {item.commission}% Comm.
                                   </span>
                                ) : (
                                   <span className="text-xs font-mono font-bold text-slate-300">{item.rate}</span>
                                )}
                             </td>
                             <td className="p-8">
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${item.active_deals > 0 || item.availability === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">
                                      {activeTab === 'SALESMAN' ? `${item.active_deals} Active Deals` : item.availability}
                                   </span>
                                </div>
                             </td>
                           </>
                        )}

                        <td className="p-8 text-right">
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                             className="p-3 text-slate-600 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 size={18} />
                           </button>
                        </td>
                     </tr>
                  ))}
                  {filteredData().length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-12 text-center">
                           <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No records found</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-4xl overflow-hidden flex flex-col"
             >
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-white/5">
                   <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                      {editingId ? <Edit3 size={20} className="text-blue-500"/> : <Plus size={20} className="text-emerald-500"/>}
                      {editingId ? `Edit ${activeTab}` : `New ${activeTab}`}
                   </h3>
                   <button onClick={closeModal} className="p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                   
                   {/* COMMON FIELDS */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name / Company</label>
                      <input 
                        autoFocus
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all placeholder:text-slate-700"
                        placeholder="e.g. Aramco Systems"
                      />
                   </div>

                   {/* CLIENT SPECIFIC */}
                   {activeTab === 'CLIENT' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                              <input 
                                type="email"
                                value={formData.email || ''}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                                placeholder="contact@domain.com"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</label>
                              <input 
                                value={formData.contact || ''}
                                onChange={e => setFormData({...formData, contact: e.target.value})}
                                className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                                placeholder="+966..."
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Address</label>
                           <textarea 
                             value={formData.address || ''}
                             onChange={e => setFormData({...formData, address: e.target.value})}
                             className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-medium outline-none focus:border-blue-500/50 transition-all resize-none h-20"
                             placeholder="Street, City, Postal Code"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                 <Hash size={10} /> VAT Number
                              </label>
                              <input 
                                value={formData.vat || ''}
                                onChange={e => setFormData({...formData, vat: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-mono text-xs font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-emerald-400/20"
                                placeholder="3000..."
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                 <Building2 size={10} /> CR Number
                              </label>
                              <input 
                                value={formData.cr || ''}
                                onChange={e => setFormData({...formData, cr: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-blue-400 font-mono text-xs font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-blue-400/20"
                                placeholder="700..."
                              />
                           </div>
                        </div>
                      </>
                   )}

                   {/* SUPPLIER SPECIFIC */}
                   {activeTab === 'SUPPLIER' && (
                      <>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type / Category</label>
                           <input 
                             value={formData.type || ''}
                             onChange={e => setFormData({...formData, type: e.target.value})}
                             className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                             placeholder="e.g. Wholesale Food"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</label>
                              <input 
                                value={formData.location || ''}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                                placeholder="City"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</label>
                              <input 
                                value={formData.contact || ''}
                                onChange={e => setFormData({...formData, contact: e.target.value})}
                                className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                                placeholder="Phone"
                              />
                           </div>
                        </div>
                      </>
                   )}

                   {/* SALESMAN & MANPOWER SPECIFIC */}
                   {(activeTab === 'SALESMAN' || activeTab === 'MANPOWER') && (
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role / Position</label>
                            <input 
                              value={formData.role || ''}
                              onChange={e => setFormData({...formData, role: e.target.value})}
                              className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                              placeholder="e.g. Sales Exec / Driver"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                               {activeTab === 'SALESMAN' ? 'Commission %' : 'Rate (SAR)'}
                            </label>
                            <input 
                              type={activeTab === 'SALESMAN' ? 'number' : 'text'}
                              value={activeTab === 'SALESMAN' ? (formData.commission || '') : (formData.rate || '')}
                              onChange={e => {
                                  const val = e.target.value;
                                  if (activeTab === 'SALESMAN') setFormData({...formData, commission: val});
                                  else setFormData({...formData, rate: val});
                              }}
                              className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                              placeholder={activeTab === 'SALESMAN' ? "15" : "2500 / Month"}
                           />
                         </div>
                      </div>
                   )}

                   <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                      >
                         {isSaving ? "Saving..." : <><Save size={16} /> Save Record</>}
                      </button>
                   </div>

                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK IMPORT MODAL */}
      <AnimatePresence>
        {isBulkOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[3rem] p-10 shadow-4xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <Zap size={24} className="text-purple-500" /> Bulk Client Injector
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-2">
                    {isReviewStep ? "Review and confirm extracted clients." : "Parse bulk text or CSV files. Supports auto-extraction."}
                  </p>
                </div>
                <button onClick={() => { setIsBulkOpen(false); setIsReviewStep(false); setPreviewClients([]); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
                
                {!isReviewStep ? (
                  <>
                    {/* 1. Text Input */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <FileText size={14} /> Unstructured Data Stream
                      </div>
                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`e.g.\nAramco - 0501234567 - Dammam\nSABIC, Riyadh, info@sabic.com\nRed Sea Global - Jeddah`}
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white font-mono placeholder:text-slate-600 focus:border-purple-500 outline-none resize-none transition-colors"
                      />
                    </div>

                    {/* 2. File Drop */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Upload size={14} /> CSV / Excel Assets
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload size={24} className="text-slate-500 mb-2 group-hover:text-purple-400 transition-colors" />
                          <p className="mb-1 text-xs text-slate-400 font-bold"><span className="text-purple-400">Click to upload</span> or drag and drop</p>
                          <p className="text-[10px] text-slate-600 uppercase tracking-widest">CSV, TXT, PDF, IMAGE</p>
                        </div>
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) setBulkFiles(Array.from(e.target.files));
                          }}
                        />
                      </label>
                      
                      {/* File Preview */}
                      {bulkFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {bulkFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-xs text-slate-300 truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                     <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={16} /> 
                        Success! Found {previewClients.length} valid client entities.
                     </div>
                     
                     <div className="space-y-2">
                        {previewClients.map((item) => (
                           <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                                    {item.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                      {item.email && <span>{item.email}</span>}
                                      {item.contact && <span>• {item.contact}</span>}
                                    </div>
                                 </div>
                              </div>
                              <button 
                                onClick={() => setPreviewClients(prev => prev.filter(c => c.id !== item.id))}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-8 mt-8 border-t border-white/10 flex justify-end gap-4">
                {!isReviewStep ? (
                  <>
                    <button 
                      onClick={() => setIsBulkOpen(false)}
                      className="px-6 py-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBulkAnalyze}
                      disabled={isSaving || (!bulkText && bulkFiles.length === 0)}
                      className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                      {isSaving ? "Analyzing..." : "Analyze & Preview"}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsReviewStep(false)}
                      className="px-6 py-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Back to Input
                    </button>
                    <button 
                      onClick={handleFinalImport}
                      disabled={isSaving || previewClients.length === 0}
                      className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {isSaving ? "Saving..." : `Import ${previewClients.length} Clients`}
                    </button>
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CRMManagement;
