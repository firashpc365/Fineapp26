import React, { useState } from 'react';
import { FileText, Zap, Save, Upload, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const QuoteStudio: React.FC = () => {
    const [quoteText, setQuoteText] = useState('');
    const [activePreview, setActivePreview] = useState<'live' | 'pdf'>('live');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <FileText size={28} className="text-blue-400" />
                        </div>
                        Quote Studio
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">Compose, preview, and generate professional quotations</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Composer Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap size={16} className="text-blue-400" /> Composer
                        </h3>
                        <textarea
                            value={quoteText}
                            onChange={(e) => setQuoteText(e.target.value)}
                            placeholder="Paste RFQ data, client details, or manual quote text…"
                            className="w-full h-64 p-4 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-colors resize-none"
                        />
                        <div className="mt-4 text-[11px] text-slate-500 space-y-1">
                            <p>• Paste text or upload document</p>
                            <p>• System will parse and structure</p>
                            <p>• Live preview on the right</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                            <Upload size={16} /> Import RFQ
                        </button>
                        <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} className="text-teal-400" /> Live Preview
                            </h3>
                            <div className="flex gap-2 bg-slate-800/60 p-1 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setActivePreview('live')}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${activePreview === 'live' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'
                                        }`}
                                >
                                    Live
                                </button>
                                <button
                                    onClick={() => setActivePreview('pdf')}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${activePreview === 'pdf' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'
                                        }`}
                                >
                                    PDF
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="bg-slate-950/50 border border-white/5 rounded-xl p-6 h-96 overflow-auto">
                            {quoteText ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-slate-300 text-sm leading-relaxed">
                                    {activePreview === 'live' ? (
                                        <div>
                                            <div className="font-bold text-white mb-2">Parsed Content:</div>
                                            <p className="whitespace-pre-wrap">{quoteText}</p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 italic">PDF export preview will appear here…</div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 text-center">
                                    <div>
                                        <FileText size={48} className="mx-auto opacity-20 mb-3" />
                                        <p className="text-sm">Enter quote data to see preview</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generation Controls */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                                <Zap size={16} /> Generate Quote
                            </button>
                            <button className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
                                <Save size={16} /> Save Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteStudio;
