import React from 'react';

const QuoteStudio: React.FC = () => {
    return (
        <div className="min-h-[400px] bg-slate-900/40 p-6 rounded-lg border border-white/5">
            <h2 className="text-lg font-bold mb-3">Quote Studio</h2>
            <p className="text-sm text-slate-300 mb-4">A workspace for composing and previewing quotes. This is a placeholder scaffold.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-md border border-white/5">
                    <h3 className="font-semibold text-sm mb-2">Composer</h3>
                    <textarea className="w-full h-36 p-2 bg-transparent border border-white/5 rounded text-sm text-slate-200" placeholder="Enter quote text or import RFQ..." />
                </div>

                <div className="p-4 bg-slate-800/60 rounded-md border border-white/5">
                    <h3 className="font-semibold text-sm mb-2">Preview</h3>
                    <div className="h-36 overflow-auto text-sm text-slate-300">Quote preview will render here.</div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-500 rounded text-white">Generate</button>
                <button className="px-4 py-2 bg-white/5 rounded text-slate-200">Save Draft</button>
            </div>
        </div>
    );
};

export default QuoteStudio;
