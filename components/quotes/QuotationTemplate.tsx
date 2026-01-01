
import React from 'react';
// @ts-ignore
import Barcode from 'react-barcode';
import { Building, User, Hash, Briefcase, MapPin, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { CompanyProfile } from '../../lib/companyConfig';

interface InvoiceItem {
  id: number;
  title: string;
  description: string;
  qty: number;
  price: number;
}

interface QuotationProps {
  company: CompanyProfile;
  customLogo?: string | null;
  logoSize?: number;
  data: {
    id: string;
    date: string;
    validity: string;
    clientName: string;
    clientAddress: string;
    clientVat?: string;
    clientCr?: string;
    items: InvoiceItem[];
    salesman?: string;
    commissionAmount?: number;
    terms?: string;
  };
}

export const QuotationTemplate = React.forwardRef<HTMLDivElement, QuotationProps>(
  ({ company, customLogo, logoSize = 120, data }, ref) => {
    
    const subtotal = data.items.reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0);
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat;

    const logoSource = customLogo || company.logo;

    return (
      <div 
        ref={ref} 
        className="w-[210mm] min-h-[297mm] bg-white text-black mx-auto shadow-2xl relative flex flex-col z-0 overflow-hidden font-sans selection:bg-none"
        style={{ fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' }}
      >
        {/* --- HEADER --- */}
        <div className="flex h-[180px] relative">
           {/* Left: Branding */}
           <div className="w-[60%] p-10 flex flex-col justify-between relative z-50">
              <div className="flex-1 flex items-start">
                {/* Logo Container - Elevated Z-Index to prevent cropping */}
                <div className="relative z-50 inline-block">
                  <img 
                    src={logoSource} 
                    alt={company.name} 
                    style={{ height: `${logoSize}px`, maxHeight: '120px', width: 'auto' }}
                    className="object-contain object-left block" 
                  />
                </div>
              </div>
              <div className="space-y-1 relative z-40 mt-4">
                 <h2 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                    <Building size={14} className="text-black" />
                    {company.name}
                 </h2>
                 <div className="text-[10px] text-black font-bold space-y-0.5 pl-6 border-l-2 border-black">
                    <p>{company.contact.address}</p>
                    <p className="flex gap-3">
                       {company.contact.vat && <span>VAT: {company.contact.vat}</span>}
                       {company.contact.cr && <span>CR: {company.contact.cr}</span>}
                    </p>
                 </div>
              </div>
           </div>

           {/* Right: Context & Dates */}
           <div className={`w-[40%] relative ${company.color.primary} text-white p-10 flex flex-col justify-between overflow-hidden`}>
              {/* Decorative Pattern - Low Opacity */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="absolute -left-4 -bottom-10 w-20 h-[120%] bg-white transform rotate-12 z-10" />

              <div className="relative z-20 text-right">
                 <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Quotation</h1>
                 <p className="text-sm font-mono font-bold opacity-90 tracking-widest">{data.id}</p>
              </div>

              <div className="relative z-20 grid grid-cols-2 gap-4 text-right">
                 <div>
                    <p className="text-[9px] uppercase tracking-widest opacity-80 mb-1 font-bold">Date Issued</p>
                    <p className="text-sm font-black">{data.date}</p>
                 </div>
                 <div>
                    <p className="text-[9px] uppercase tracking-widest opacity-80 mb-1 font-bold">Valid Until</p>
                    <p className="text-sm font-black">{data.validity}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* --- CLIENT & PROJECT INFO --- */}
        <div className="px-10 py-10 grid grid-cols-2 gap-16 relative z-10">
           {/* Bill To */}
           <div>
              <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                 <MapPin size={16} className="text-black" />
                 <span className="text-[11px] font-black text-black uppercase tracking-widest">Bill To</span>
              </div>
              <div className="pl-2">
                 <h3 className="text-xl font-black text-black mb-2 leading-tight">{data.clientName}</h3>
                 <p className="text-xs text-black font-bold whitespace-pre-line leading-relaxed mb-4">
                    {data.clientAddress || "Address not provided"}
                 </p>
                 <div className="flex flex-wrap gap-3">
                    {data.clientVat && (
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-black">
                          <Hash size={12} /> VAT: {data.clientVat}
                       </span>
                    )}
                    {data.clientCr && (
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-black">
                          <ShieldCheck size={12} /> CR: {data.clientCr}
                       </span>
                    )}
                 </div>
              </div>
           </div>
           
           {/* Project / Sales Rep */}
           <div className="flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                    <Briefcase size={16} className="text-black" />
                    <span className="text-[11px] font-black text-black uppercase tracking-widest">Project Details</span>
                 </div>
                 <div className="pl-2">
                    <p className="text-sm font-bold text-black">Service Proposal & Cost Estimation</p>
                    <p className="text-[11px] text-black font-bold mt-1">Ref: {data.id}</p>
                 </div>
              </div>

              {/* Salesman Block */}
              <div className="bg-gray-50 rounded-xl p-4 border border-black mt-auto">
                 <p className="text-[9px] font-black uppercase tracking-widest text-black mb-2">Representative</p>
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${company.color.primary} print:bg-black print:text-white`}>
                       <User size={14} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-black">{data.salesman || 'Admin'}</p>
                       <p className="text-[10px] text-black font-bold">{company.contact.email}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- TABLE --- */}
        <div className="flex-1 px-10 mt-4 relative z-10">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b-2 border-black">
                    <th className="py-3 text-[10px] font-black text-black uppercase tracking-widest w-[50%] pl-2">Description</th>
                    <th className="py-3 text-[10px] font-black text-black uppercase tracking-widest text-center w-[15%]">Qty</th>
                    <th className="py-3 text-[10px] font-black text-black uppercase tracking-widest text-right w-[15%]">Unit Price</th>
                    <th className="py-3 text-[10px] font-black text-black uppercase tracking-widest text-right w-[20%] pr-2">Total</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                 {data.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-300 last:border-0">
                       <td className="py-4 pl-2 pr-4 align-top">
                          <p className="font-bold text-black text-sm mb-1">{item.title}</p>
                          {item.description && (
                             <p className="text-black text-xs leading-relaxed font-bold opacity-90">{item.description}</p>
                          )}
                       </td>
                       <td className="py-4 text-center font-bold text-black align-top">{item.qty}</td>
                       <td className="py-4 text-right font-mono font-bold text-black align-top">{item.price.toLocaleString()}</td>
                       <td className="py-4 text-right font-mono font-black text-black align-top pr-2">{(item.qty * item.price).toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* --- TOTALS --- */}
        <div className="px-10 mt-8 mb-12 flex justify-end relative z-10">
           <div className="w-[45%] bg-gray-50 rounded-2xl p-8 border border-black relative overflow-hidden">
              <div className="space-y-4">
                 <div className="flex justify-between text-xs font-bold text-black">
                    <span>Subtotal</span>
                    <span className="font-mono">SAR {subtotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-black">
                    <span>VAT (15%)</span>
                    <span className="font-mono">SAR {vat.toLocaleString()}</span>
                 </div>
                 <div className="h-px bg-black my-2" />
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-black uppercase tracking-tight">Grand Total</span>
                    <span className="text-3xl font-black tracking-tighter text-black">
                       <span className="text-lg align-top opacity-100 mr-1">SAR</span>
                       {total.toLocaleString()}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-auto bg-gray-50 border-t-2 border-black relative z-10">
           {/* Terms */}
           {data.terms && (
              <div className="px-10 py-8 border-b border-gray-300">
                 <p className="text-[10px] font-black text-black uppercase tracking-widest mb-3">Terms & Conditions</p>
                 <p className="text-[10px] text-black font-bold whitespace-pre-line leading-relaxed max-w-3xl columns-2 gap-8">
                    {data.terms}
                 </p>
              </div>
           )}

           {/* Bank Info & Admin Footer */}
           <div className="px-10 py-8 flex justify-between items-end">
              <div className="flex items-center gap-5">
                 <div className={`p-3 rounded-xl text-white ${company.color.primary} print:bg-black`}>
                    <Building size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black opacity-100 uppercase tracking-widest mb-1 text-black">Bank Details</p>
                    <div className="text-xs text-black">
                       <p className="font-bold">{company.bank?.name}</p>
                       <p className="font-mono font-bold text-[10px] tracking-wide mt-0.5">{company.bank?.iban}</p>
                    </div>
                 </div>
              </div>
              
              <div className="text-right flex flex-col items-end">
                 {/* Barcode line color set to Black #000000 */}
                 <Barcode value={data.id} width={1} height={30} displayValue={false} background="transparent" lineColor="#000000" />
                 
                 {/* Internal Reference Line */}
                 <div className="mt-2 pt-2 border-t border-black flex gap-4 text-[9px] text-black font-mono font-bold uppercase tracking-widest">
                    <span>Auth: {data.salesman?.split(' ')[0]}</span>
                    {data.commissionAmount ? (
                       <span>Ref: {data.commissionAmount}</span>
                    ) : <span>Ref: 0</span>}
                 </div>
              </div>
           </div>

           {/* Brand Strip */}
           <div className={`h-3 w-full ${company.color.primary} print:bg-black`} />
        </div>
      </div>
    );
  }
);

export default QuotationTemplate;
