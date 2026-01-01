
import React from 'react';
// @ts-ignore
import Barcode from 'react-barcode';
import { Building, User, Hash, Briefcase, MapPin, Mail, Phone, Calendar, ShieldCheck, Globe, CreditCard } from 'lucide-react';
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
        className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto shadow-2xl relative flex flex-col overflow-hidden"
        style={{ fontFamily: '"Inter", sans-serif' }}
      >
        {/* --- HEADER --- */}
        <div className="flex flex-col relative">
           {/* Top Color Bar */}
           <div className={`h-3 w-full ${company.color.primary}`} />
           
           <div className="px-12 py-10 flex justify-between items-start">
              {/* Left: Logo & Company Name */}
              <div className="w-[50%] flex flex-col gap-4">
                 <img 
                    src={logoSource} 
                    alt={company.name} 
                    style={{ height: `${logoSize}px`, maxHeight: '100px', width: 'auto' }}
                    className="object-contain object-left" 
                 />
                 <div className="space-y-1">
                    <h1 className={`text-xl font-bold uppercase tracking-tight ${company.color.text}`}>{company.name}</h1>
                    <div className="text-[10px] text-slate-500 font-medium leading-relaxed">
                       <div className="flex items-center gap-2"><MapPin size={10} className={company.color.text}/> {company.contact.address}</div>
                       <div className="flex gap-4 mt-1">
                          {company.contact.vat && <span className="flex items-center gap-1"><Hash size={10}/> VAT: {company.contact.vat}</span>}
                          {company.contact.cr && <span className="flex items-center gap-1"><ShieldCheck size={10}/> CR: {company.contact.cr}</span>}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right: Quote Meta */}
              <div className="w-[40%] text-right space-y-6">
                 <div>
                    <h2 className={`text-5xl font-black tracking-tighter ${company.color.text} opacity-10`}>QUOTATION</h2>
                    <div className="flex justify-end items-center gap-3 -mt-6">
                        <span className={`text-sm font-bold uppercase tracking-widest ${company.color.text} bg-white px-2`}>Quotation</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-2 border-r-4 border-slate-100 pr-4">
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</p>
                       <p className="text-base font-mono font-bold text-slate-900">{data.id}</p>
                    </div>
                    <div className="flex justify-end gap-6">
                        <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date Issued</p>
                           <p className="text-xs font-bold text-slate-700">{data.date}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valid Until</p>
                           <p className="text-xs font-bold text-slate-700">{data.validity}</p>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- CLIENT SECTION --- */}
        <div className="px-12 py-6 bg-slate-50 border-y border-slate-100">
           <div className="grid grid-cols-2 gap-12">
              {/* To Client */}
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={12} /> Bill To
                 </p>
                 <h3 className="text-lg font-bold text-slate-900">{data.clientName}</h3>
                 <p className="text-xs text-slate-600 font-medium whitespace-pre-line mt-1 leading-relaxed">
                    {data.clientAddress || "Address not provided"}
                 </p>
                 <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                    {data.clientVat && <span>VAT: {data.clientVat}</span>}
                    {data.clientCr && <span>CR: {data.clientCr}</span>}
                 </div>
              </div>

              {/* From / Sales Rep */}
              <div className="pl-8 border-l border-slate-200">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Briefcase size={12} /> Prepared By
                 </p>
                 <p className="text-sm font-bold text-slate-900">{data.salesman || 'Sales Department'}</p>
                 <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-slate-600 flex items-center gap-2"><Mail size={10} /> {company.contact.email}</p>
                    <p className="text-[10px] text-slate-600 flex items-center gap-2"><Phone size={10} /> {company.contact.phones[0]}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* --- TABLE --- */}
        <div className="px-12 py-8 flex-1">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b-2 border-slate-900">
                    <th className="py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest w-12">#</th>
                    <th className="py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest">Description</th>
                    <th className="py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center w-20">Qty</th>
                    <th className="py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right w-32">Unit Price</th>
                    <th className="py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right w-32">Total</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                 {data.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 group">
                       <td className="py-4 text-slate-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                       <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                          {item.description && (
                             <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">{item.description}</p>
                          )}
                       </td>
                       <td className="py-4 text-center font-bold text-slate-700">{item.qty}</td>
                       <td className="py-4 text-right font-mono font-medium text-slate-600">{item.price.toLocaleString()}</td>
                       <td className="py-4 text-right font-mono font-bold text-slate-900">{(item.qty * item.price).toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* --- FOOTER SECTION --- */}
        <div className="bg-slate-50 border-t border-slate-200 break-inside-avoid">
           <div className="px-12 py-8 grid grid-cols-2 gap-12">
              
              {/* Terms & Bank */}
              <div className="space-y-6">
                 {data.terms && (
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Terms & Conditions</p>
                        <ul className="text-[10px] text-slate-600 space-y-1 list-disc list-outside ml-3 leading-relaxed">
                           {data.terms.split('\n').map((term, idx) => (
                              <li key={idx}>{term.replace(/^\d+\.\s*/, '')}</li>
                           ))}
                        </ul>
                    </div>
                 )}
                 
                 {company.bank && (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <CreditCard size={10} /> Bank Details
                       </p>
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="text-xs font-bold text-slate-900">{company.bank.name}</p>
                             <p className="text-[10px] text-slate-500">{company.bank.accountName}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-mono text-slate-400">IBAN</p>
                             <p className="text-xs font-mono font-bold text-slate-900 tracking-wide">{company.bank.iban}</p>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* Totals & Signature */}
              <div className="flex flex-col justify-between">
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                       <span>Subtotal</span>
                       <span className="font-mono">SAR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                       <span>VAT (15%)</span>
                       <span className="font-mono">SAR {vat.toLocaleString()}</span>
                    </div>
                    <div className={`h-px w-full ${company.color.primary} opacity-20 my-2`} />
                    <div className="flex justify-between items-baseline">
                       <span className={`text-lg font-black ${company.color.text}`}>Total</span>
                       <span className={`text-3xl font-black ${company.color.text} tracking-tight`}>
                          <span className="text-sm font-bold opacity-50 mr-1">SAR</span>
                          {total.toLocaleString()}
                       </span>
                    </div>
                 </div>

                 <div className="mt-8 flex items-end justify-between">
                    <div className="text-center">
                        <div className="h-16 w-32 border-b border-slate-300 mb-2"></div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Authorized Signature</p>
                    </div>
                    <div className="opacity-50 mix-blend-multiply">
                        <Barcode value={data.id} width={1} height={40} displayValue={false} background="transparent" lineColor="#000000" />
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Brand Strip Footer */}
           <div className={`h-4 w-full ${company.color.primary} flex items-center justify-between px-12 text-[8px] font-bold text-white uppercase tracking-widest`}>
              <span>{company.contact.website}</span>
              <span>Thank you for your business</span>
           </div>
        </div>
      </div>
    );
  }
);

export default QuotationTemplate;
