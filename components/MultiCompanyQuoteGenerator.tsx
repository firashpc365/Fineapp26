
import React, { useState, useRef, useMemo, useEffect, Suspense, lazy } from 'react';
import { COMPANY_CONFIG, CompanyId } from '../lib/companyConfig';
import { QuoteCard } from './quotes/QuoteCard';
import SearchForm from './quotes/SearchForm';
import { 
  Plus, 
  ChevronLeft, 
  CloudUpload, 
  Loader2, 
  Printer, 
  Layers, 
  Trash2,
  Check,
  Search,
  UserCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Percent,
  Wand2,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  Upload,
  MoveVertical
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { SEED_CLIENTS, SEED_SERVICES } from '../constants';
import { ServiceItem } from '../types';
import { extractQuoteData } from '../services/geminiService';
import { useToast } from './ui/Toast';

const QuotationTemplateLazy = lazy(() => import('./quotes/QuotationTemplate').then(mod => ({ default: mod.QuotationTemplate })));

interface QuotationRecord {
  id: string;
  companyId: CompanyId;
  clientName: string;
  amount: number;
  date: string;
  validity?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  clientAddress: string;
  clientVat?: string;
  clientCr?: string;
  items: any[];
  salesman?: string;
  commission?: number;
  commissionType?: 'PERCENT' | 'FIXED';
  terms?: string;
}

const INITIAL_RECORDS: QuotationRecord[] = [
  { id: 'QT-2024-882', companyId: 'ELITE', clientName: 'Aramco Logistics Hub', amount: 12500, date: '2024-05-20', validity: '15 Days', status: 'SENT', clientAddress: 'Dammam Industrial Area 2', items: [{id: 1, title: 'Catering Services', description: 'Standard Menu for 100 Pax', qty: 100, price: 125}], salesman: 'Paul', commission: 1500, commissionType: 'FIXED' },
];

const SALES_TEAM = ['Firash Al-Qahtani', 'Paul Graham', 'Ahmed Ali', 'Sarah Johnson'];

const LedgerSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2rem] h-[340px] animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[flow-loader_2s_infinite]" />
      </div>
    ))}
  </div>
);

interface MultiCompanyQuoteGeneratorProps {
  initialFilter?: string;
  initialData?: any;
}

const MultiCompanyQuoteGenerator: React.FC<MultiCompanyQuoteGeneratorProps> = ({ initialFilter, initialData }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [quotes, setQuotes] = useState<QuotationRecord[]>(INITIAL_RECORDS);
  const [selectedCompany, setSelectedCompany] = useState<CompanyId>('ELITE');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Custom Logo Override State
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(100); // Default size in px
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Suggestion States
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  
  // Smart Import State
  const [importInput, setImportInput] = useState("");
  const [importFile, setImportFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const quotationRef = useRef<HTMLDivElement>(null);
  const { isLoading: isSaving, execute } = useAsyncAction();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    id: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    date: new Date().toISOString().split('T')[0],
    validity: '15 Days',
    clientName: '',
    clientAddress: '',
    clientVat: '',
    clientCr: '',
    items: [{ id: 1, title: '', description: '', qty: 1, price: 0 }],
    salesman: 'Firash Al-Qahtani',
    commission: 0,
    commissionType: 'FIXED' as 'PERCENT' | 'FIXED',
    terms: "1. Quotation validity: 15 Days from issue date.\n2. Payment Terms: 50% Advance to confirm order, balance upon delivery.\n3. Please address all payments to the company bank account."
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  // Handle Initial RFQ Data
  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            clientName: initialData.clientName || prev.clientName,
            date: initialData.date || prev.date,
            items: initialData.items ? initialData.items.map((i:any) => ({...i, title: i.description || 'New Item', description: ''})) : prev.items
        }));
        setView('CREATE');
        setEditId(null);
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // --- FINANCIAL CALCULATIONS ---
  const subtotal = useMemo(() => {
    return formData.items.reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0);
  }, [formData.items]);

  const commissionValue = useMemo(() => {
    if (formData.commissionType === 'PERCENT') {
        return subtotal * (formData.commission / 100);
    }
    return Number(formData.commission);
  }, [subtotal, formData.commission, formData.commissionType]);

  const total = subtotal * 1.15; // VAT Included for Quote Total
  const netRevenue = subtotal - commissionValue;

  const handleCreateNew = () => {
    setEditId(null);
    setValidationErrors({});
    setFormData({
      id: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
      date: new Date().toISOString().split('T')[0],
      validity: '15 Days',
      clientName: '',
      clientAddress: '',
      clientVat: '',
      clientCr: '',
      items: [{ id: 1, title: '', description: '', qty: 1, price: 0 }],
      salesman: 'Firash Al-Qahtani',
      commission: 0,
      commissionType: 'FIXED',
      terms: "1. Quotation validity: 15 Days from issue date.\n2. Payment Terms: 50% Advance to confirm order, balance upon delivery.\n3. Please address all payments to the company bank account."
    });
    setImportInput("");
    setImportFile(null);
    setCustomLogo(null);
    setLogoSize(100);
    setView('CREATE');
  };

  const handleEdit = (id: string) => {
    const target = quotes.find(q => q.id === id);
    if (!target) return;
    setEditId(id);
    setValidationErrors({});
    setSelectedCompany(target.companyId);
    setCustomLogo(null); // Reset logo on edit, or load if stored
    setLogoSize(100);
    setFormData({
      id: target.id,
      date: target.date,
      validity: target.validity || '15 Days',
      clientName: target.clientName,
      clientAddress: target.clientAddress,
      clientVat: target.clientVat || '',
      clientCr: target.clientCr || '',
      items: target.items.length > 0 ? target.items.map(i => ({...i, title: i.title || i.description, description: i.title ? i.description : ''})) : [{ id: 1, title: '', description: '', qty: 1, price: 0 }],
      salesman: target.salesman || 'Firash Al-Qahtani',
      commission: target.commission || 0,
      commissionType: target.commissionType || 'FIXED',
      terms: target.terms || "1. Quotation validity: 15 Days from issue date.\n2. Payment Terms: 50% Advance to confirm order, balance upon delivery.\n3. Please address all payments to the company bank account."
    });
    setView('CREATE');
  };

  const handleDelete = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.clientName.trim()) errors.clientName = "Client Name is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.validity) errors.validity = "Validity period is required";
    
    if (formData.items.length === 0) {
      errors.items = "At least one line item is required";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.title.trim()) errors[`item_${index}_title`] = "Item name required";
        if (item.qty <= 0) errors[`item_${index}_qty`] = "Invalid quantity";
        if (item.price < 0) errors[`item_${index}_price`] = "Price cannot be negative";
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveToCloud = async () => {
    if (!validateForm()) {
        showToast("Validation failed. Please check fields.", "ERROR");
        return;
    }

    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingClient = SEED_CLIENTS.find(c => c.name.toLowerCase() === formData.clientName.toLowerCase());
      if (!existingClient) {
         console.log(`[Directory] Auto-adding new client entity: ${formData.clientName}`);
      }

      const newRecord: QuotationRecord = {
        id: formData.id,
        companyId: selectedCompany,
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientVat: formData.clientVat,
        clientCr: formData.clientCr,
        amount: total,
        date: formData.date,
        validity: formData.validity,
        status: editId ? (quotes.find(q => q.id === editId)?.status || 'DRAFT') : 'DRAFT',
        items: formData.items,
        salesman: formData.salesman,
        commission: formData.commission,
        commissionType: formData.commissionType,
        terms: formData.terms
      };

      if (editId) {
        setQuotes(prev => prev.map(q => q.id === editId ? newRecord : q));
      } else {
        setQuotes(prev => [newRecord, ...prev]);
      }
      setView('LIST');
    }, `Quote ${editId ? 'updated' : 'archived'} successfully.`);
  };

  const handleExport = async () => {
    if (!quotationRef.current) {
        showToast("Render Engine Error: Template not found in DOM.", "ERROR");
        return;
    }
    
    setIsExporting(true);
    showToast("Initializing PDF rendering engine...", "INFO");

    try {
      // Ensure all images are fully loaded before rendering
      const images = quotationRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map((img) => {
        const image = img as HTMLImageElement;
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.onload = () => resolve(true);
          image.onerror = () => resolve(true);
        });
      }));

      // Extra delay for font rendering and layout stability
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = quotationRef.current;
      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${selectedCompany}_Quote_${formData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // @ts-ignore
      const lib = html2pdf;
      const worker = typeof lib === 'function' ? lib() : (lib.default ? lib.default() : null);
      if (!worker) throw new Error("PDF Worker failed to initialize");

      await worker.set(opt).from(element).save();
      showToast("PDF Export Successful. Download started.", "SUCCESS");
    } catch (err: any) {
      console.error('Export failed:', err);
      showToast(`PDF Export Failed: ${err.message}`, "ERROR");
    } finally {
      setIsExporting(false);
    }
  };

  // --- LOGO UPLOAD ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- SMART IMPORT & AUTOCOMPLETE ---
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImportFile({ name: file.name, data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSmartAnalyze = async () => {
    if (!importInput.trim() && !importFile) return;
    setIsAnalyzing(true);
    
    try {
      const payload = importFile ? { data: importFile.data, mimeType: importFile.mimeType } : importInput;
      const result = await extractQuoteData(payload);
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          clientName: result.clientName || prev.clientName,
          clientAddress: result.clientAddress || prev.clientAddress,
          clientVat: result.clientVat || prev.clientVat,
          clientCr: result.clientCr || prev.clientCr,
          date: result.date || prev.date,
          validity: result.validity || prev.validity,
          terms: result.terms || prev.terms,
          items: result.items && result.items.length > 0 ? result.items.map((item: any) => ({
            id: Date.now() + Math.random(),
            title: item.description || "Imported Item",
            description: "", 
            qty: item.qty || 1,
            price: item.price || 0
          })) : prev.items
        }));
        showToast("Analysis complete. Form populated.", "SUCCESS");
      }
      setImportInput("");
      setImportFile(null);
    } catch (error) {
      console.error("Smart Import Failed", error);
      showToast("Failed to analyze input. Please try again.", "ERROR");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredClients = useMemo(() => {
    if (!formData.clientName) return SEED_CLIENTS;
    return SEED_CLIENTS.filter(c => c.name.toLowerCase().includes(formData.clientName.toLowerCase()));
  }, [formData.clientName]);

  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm) return SEED_SERVICES;
    return SEED_SERVICES.filter(s => 
      s.title.toLowerCase().includes(serviceSearchTerm.toLowerCase()) || 
      s.category.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [serviceSearchTerm]);

  const selectClient = (client: any) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientAddress: `${client.address ? client.address + '\n' : ''}${client.email}\n${client.contact || ''}`,
      clientVat: client.vat || '',
      // Add CR if available in client object (Seed doesn't have CR but real db might)
    }));
    setShowClientSuggestions(false);
  };

  const selectService = (service: ServiceItem, idx: number) => {
    const newItems = [...formData.items];
    if (newItems[idx]) {
        newItems[idx].title = service.title;
        newItems[idx].description = (service.includes || []).join(', ');
        newItems[idx].price = service.selling_price;
        setFormData({ ...formData, items: newItems });
    }
    setActiveItemIndex(null);
    setServiceSearchTerm("");
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           q.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, quotes, statusFilter]);

  const company = COMPANY_CONFIG[selectedCompany];

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-20">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {view === 'LIST' ? 'Quotation Ledger' : editId ? 'Modify Quote' : 'New Quote Architect'}
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">
            {view === 'LIST' ? 'Manage multi-entity corporate estimates.' : `Creating estimate for ${company.name}`}
          </p>
        </div>
        <div className="flex gap-4">
          {view === 'CREATE' ? (
            <button 
              onClick={() => setView('LIST')} 
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 border border-slate-800 transition-all"
            >
              <ChevronLeft size={18} /> Exit Architect
            </button>
          ) : (
            <button 
              onClick={handleCreateNew} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              <Plus size={18} /> Create New Quote
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total Exposure</p>
                <p className="text-3xl font-bold text-white tracking-tight">
                  SAR {quotes.reduce((acc, q) => acc + q.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Active Count</p>
                <p className="text-3xl font-bold text-blue-400 tracking-tight">{quotes.length} Quotes</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Approved Value</p>
                <p className="text-3xl font-bold text-emerald-400 tracking-tight">
                  SAR {quotes.filter(q => q.status === 'APPROVED').reduce((acc, q) => acc + q.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <SearchForm onSearch={setSearchQuery} />
              <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shrink-0 overflow-x-auto custom-scrollbar">
                {['ALL', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === status 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            {isInitialLoading ? (
              <LedgerSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredQuotes.map((quote) => (
                  <QuoteCard 
                    key={quote.id} 
                    quote={quote} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    onPrint={(id) => { handleEdit(id); setTimeout(handleExport, 600); }}
                  />
                ))}
                {filteredQuotes.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/50">
                    <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-xs">No records found.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="create" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* LEFT COLUMN - EDITOR */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                  <Layers size={20} className="text-blue-500" /> Identity Engine
                </h3>
                
                <div className="space-y-6">
                  {/* Company Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(COMPANY_CONFIG) as CompanyId[]).map((id) => (
                      <button 
                        key={id} 
                        onClick={() => setSelectedCompany(id)} 
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedCompany === id ? 'border-blue-600 bg-blue-600/10' : 'border-slate-800 bg-slate-950 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white">{COMPANY_CONFIG[id].name.split(' ')[0]}</p>
                        <p className="text-[8px] text-slate-500 uppercase mt-0.5">{id} Core</p>
                      </button>
                    ))}
                  </div>

                  {/* CUSTOM LOGO UPLOAD (TEMPLATE 2) */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logo Override (Template 2)</label>
                     </div>
                     
                     {customLogo ? (
                        <div className="relative group bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                           <img src={customLogo} alt="Custom Logo" className="h-16 object-contain" />
                           <button 
                             onClick={() => setCustomLogo(null)}
                             className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <X size={12} />
                           </button>
                           
                           {/* Logo Resizer Slider */}
                           <div className="w-full space-y-2">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                 <span className="flex items-center gap-1"><MoveVertical size={10} /> Resize</span>
                                 <span>{logoSize}px</span>
                              </div>
                              <input 
                                type="range" 
                                min="40" 
                                max="1000" 
                                value={logoSize}
                                onChange={(e) => setLogoSize(Number(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                           </div>
                        </div>
                     ) : (
                        <button 
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full py-6 border border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-400 transition-all"
                        >
                           <Upload size={14} /> Upload Custom Logo
                        </button>
                     )}
                     <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </div>

                  {/* SMART IMPORT BLOCK */}
                  {!editId && (
                    <div className="p-5 bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-blue-500/20 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">
                        <Wand2 size={60} />
                      </div>
                      
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                        <Wand2 size={12} /> Smart Import
                      </label>
                      
                      {importFile ? (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 mb-4">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-purple-400" />
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">{importFile.name}</span>
                          </div>
                          <button onClick={() => setImportFile(null)} className="p-1 text-slate-500 hover:text-white"><X size={14}/></button>
                        </div>
                      ) : (
                        <textarea
                          placeholder="Paste RFQ text or request details here..."
                          value={importInput}
                          onChange={(e) => setImportInput(e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 resize-none h-20 mb-3"
                        />
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={() => importFileInputRef.current?.click()}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-colors border border-white/5 flex items-center justify-center gap-2"
                        >
                          <ImageIcon size={14} /> Upload File
                        </button>
                        <input type="file" ref={importFileInputRef} onChange={handleImportFileChange} className="hidden" accept="image/*,application/pdf" />
                        
                        <button 
                          onClick={handleSmartAnalyze}
                          disabled={isAnalyzing || (!importInput && !importFile)}
                          className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : "Analyze & Fill"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Client Details */}
                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Client / Entity</label>
                      <input 
                        placeholder="Client Entity Name" 
                        className={`w-full px-5 py-4 bg-slate-950 border rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all ${validationErrors.clientName ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}
                        value={formData.clientName} 
                        onChange={(e) => {
                            setFormData({...formData, clientName: e.target.value});
                            if (validationErrors.clientName) setValidationErrors({...validationErrors, clientName: ""});
                        }}
                        onFocus={() => setShowClientSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                      />
                      {validationErrors.clientName && <p className="text-[9px] text-red-400 font-bold mt-1 px-2 uppercase tracking-wide flex items-center gap-1"><AlertCircle size={10} /> {validationErrors.clientName}</p>}
                      
                      <AnimatePresence>
                        {showClientSuggestions && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50">Suggested Entities</p>
                            {filteredClients.map(c => (
                              <button 
                                key={c.id} 
                                onMouseDown={() => selectClient(c)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex justify-between items-center group"
                              >
                                <span className="text-sm font-bold text-white">{c.name}</span>
                                <Check size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Issue Date</label>
                           <input 
                              type="date"
                              className={`w-full px-5 py-4 bg-slate-950 border rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all ${validationErrors.date ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}
                              value={formData.date}
                              onChange={(e) => {
                                  setFormData({...formData, date: e.target.value});
                                  if (validationErrors.date) setValidationErrors({...validationErrors, date: ""});
                              }} 
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Validity</label>
                           <input 
                              placeholder="e.g. 15 Days" 
                              className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all"
                              value={formData.validity} 
                              onChange={(e) => setFormData({...formData, validity: e.target.value})} 
                           />
                       </div>
                    </div>

                    <textarea 
                      placeholder="Billing Address (Optional)" 
                      rows={2} 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all resize-none" 
                      value={formData.clientAddress} 
                      onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} 
                    />

                    {/* Client VAT and CR Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Client VAT</label>
                           <input 
                              placeholder="VAT Number"
                              className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all text-xs"
                              value={formData.clientVat}
                              onChange={(e) => setFormData({...formData, clientVat: e.target.value})}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Client CR</label>
                           <input 
                              placeholder="CR Number"
                              className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all text-xs"
                              value={formData.clientCr}
                              onChange={(e) => setFormData({...formData, clientCr: e.target.value})}
                           />
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Terms & Conditions</label>
                        <textarea
                            placeholder="Quote Terms..."
                            rows={4}
                            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all text-xs resize-none"
                            value={formData.terms}
                            onChange={(e) => setFormData({...formData, terms: e.target.value})}
                        />
                    </div>
                  </div>

                  {/* SALES & COMMISSION SECTION */}
                  <div className="space-y-4 pt-6 border-t border-slate-800 bg-blue-500/5 -mx-8 px-8 py-6 border-b border-blue-500/10">
                     <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                       <Briefcase size={12} /> Sales Attribution
                     </h4>
                     <div className="space-y-3">
                        <div className="space-y-1">
                           <label className="text-[9px] font-bold text-slate-500 uppercase">Salesman Identity</label>
                           <select 
                             value={formData.salesman} 
                             onChange={(e) => setFormData({...formData, salesman: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs font-bold outline-none focus:border-blue-500 appearance-none"
                           >
                              {SALES_TEAM.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Commission Type</label>
                              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                                 <button 
                                   onClick={() => setFormData({...formData, commissionType: 'FIXED'})}
                                   className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.commissionType === 'FIXED' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                 >
                                   Fixed
                                 </button>
                                 <button 
                                   onClick={() => setFormData({...formData, commissionType: 'PERCENT'})}
                                   className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.commissionType === 'PERCENT' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                 >
                                   %
                                 </button>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Value</label>
                              <div className="relative">
                                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    {formData.commissionType === 'FIXED' ? <DollarSign size={12} /> : <Percent size={12} />}
                                 </div>
                                 <input 
                                   type="number"
                                   value={formData.commission}
                                   onChange={(e) => setFormData({...formData, commission: Number(e.target.value)})}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white text-xs font-bold outline-none focus:border-blue-500"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-4 pt-6">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Line Items</label>
                      <button 
                        onClick={() => setFormData({...formData, items: [...formData.items, {id: Date.now(), title: '', description: '', qty: 1, price: 0}]})} 
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-400"
                      >
                        + Add Line
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {formData.items.map((item, idx) => (
                        <div key={item.id} className={`p-4 bg-slate-950 border rounded-xl relative group ${validationErrors[`item_${idx}_title`] ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}>
                          <button 
                            onClick={() => formData.items.length > 1 && setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} 
                            className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <div className="relative mb-2 space-y-2">
                            {/* Title Input */}
                            <input 
                              placeholder="Item Name / Search Service..." 
                              className="w-full bg-transparent border-b border-slate-800 py-1 text-sm font-bold text-white outline-none focus:border-blue-500 placeholder:font-normal" 
                              value={activeItemIndex === idx ? serviceSearchTerm : item.title} 
                              onFocus={() => {
                                setActiveItemIndex(idx);
                                setServiceSearchTerm(item.title);
                              }}
                              onChange={(e) => {
                                setServiceSearchTerm(e.target.value);
                                const newItems = [...formData.items];
                                newItems[idx].title = e.target.value;
                                setFormData({...formData, items: newItems});
                              }} 
                            />
                            
                            {/* Description Input */}
                            <textarea 
                              placeholder="Detailed Description (Optional)" 
                              className="w-full bg-slate-900/50 rounded-lg p-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-blue-500/50 resize-none h-16 border border-transparent focus:border-blue-500/20"
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[idx].description = e.target.value;
                                setFormData({...formData, items: newItems});
                              }}
                            />

                            {/* Service Dropdown */}
                            {activeItemIndex === idx && (
                              <div className="absolute top-8 left-0 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto custom-scrollbar">
                                <p className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase bg-slate-900">Select Catalog Item</p>
                                {filteredServices.length > 0 ? filteredServices.map(s => (
                                  <button
                                    key={s.id}
                                    onMouseDown={() => selectService(s, idx)}
                                    className="w-full text-left px-3 py-2 hover:bg-white/5 text-xs text-slate-300 flex justify-between"
                                  >
                                    <span>{s.title}</span>
                                    <span className="font-mono opacity-50">{s.selling_price}</span>
                                  </button>
                                )) : (
                                  <div className="px-3 py-2 text-xs text-slate-500 italic">No matches found.</div>
                                )}
                                <div 
                                  className="px-3 py-2 text-[9px] font-bold text-blue-400 hover:bg-white/5 cursor-pointer border-t border-white/5"
                                  onMouseDown={() => {
                                    setActiveItemIndex(null); // Close dropdown
                                  }}
                                >
                                  Use Custom Name
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">Quantity</span>
                                <input type="number" className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white" value={item.qty} onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[idx].qty = parseInt(e.target.value) || 0;
                                  setFormData({...formData, items: newItems});
                                }} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">Unit Price</span>
                                <input type="number" className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white" value={item.price} onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[idx].price = parseFloat(e.target.value) || 0;
                                  setFormData({...formData, items: newItems});
                                }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-6">
                    <button 
                      onClick={handleSaveToCloud} 
                      disabled={isSaving} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />} 
                      Commit to Cloud
                    </button>
                    <button 
                      onClick={handleExport} 
                      disabled={isExporting} 
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />} 
                      Generate PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - PREVIEW */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* Internal Margin Analysis Box */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl grid grid-cols-3 gap-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross Subtotal</p>
                    <p className="text-2xl font-black text-white tracking-tight">SAR {subtotal.toLocaleString()}</p>
                 </div>
                 <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800"></div>
                    <div className="pl-6">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sales Comm.</p>
                       <p className="text-2xl font-black text-blue-400 tracking-tight">- {commissionValue.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800"></div>
                    <div className="pl-6">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Revenue</p>
                       <p className="text-2xl font-black text-emerald-400 tracking-tight">SAR {netRevenue.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-8 flex justify-center items-start overflow-hidden">
                <div className="scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.85] origin-top shadow-2xl">
                  <Suspense fallback={
                    <div className="w-[210mm] h-[297mm] bg-white flex flex-col items-center justify-center gap-4 text-slate-300">
                      <Loader2 className="animate-spin text-blue-500" size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">Assembling Template...</p>
                    </div>
                  }>
                    <QuotationTemplateLazy 
                      ref={quotationRef} 
                      company={company} 
                      customLogo={customLogo}
                      logoSize={logoSize}
                      data={{
                        ...formData,
                        commissionAmount: commissionValue
                      }} 
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiCompanyQuoteGenerator;
