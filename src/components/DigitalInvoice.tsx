import React, { useEffect, useState } from 'react';
import { Download, Printer, MapPin, Phone, Mail, Globe, CheckCircle2, Share2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface InvoiceProps {
  order: {
    id: string;
    created_at: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    payment_method: string;
    shipping_address: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      gstNumber?: string | null;
      businessName?: string | null;
      discountAmount?: number | null;
      discountLabel?: string | null;
    };
  };
  onClose?: () => void;
  autoDownload?: boolean;
}

const DigitalInvoice: React.FC<InvoiceProps> = ({ order, onClose, autoDownload = false }) => {
  const [expandedMobileInfo, setExpandedMobileInfo] = useState(false);

  const handleDownloadPDF = React.useCallback(() => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    // We hide the PAID watermark on screen but show it in PDF by using a specific class logic, or just let it be.
    // For html2pdf, we can just print as is.
    const opt = {
      margin:       0,
      filename:     `Invoice_SRC_${order.id.slice(0, 8).toUpperCase()}.pdf`,
      image:        { type: 'jpeg' as const, quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 1024 },
      jsPDF:        { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  }, [order.id]);

  useEffect(() => {
    if (autoDownload) {
      // Small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, handleDownloadPDF]);

  const handleShare = () => {
    const link = `${window.location.origin}/invoice/${order.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Invoice link copied to clipboard!');
  };

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  
  const dueDate = new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Deep navy: #0A1628
  // Gold accent: #F5A623

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md no-print overflow-y-auto font-['Inter',sans-serif]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white text-slate-900 sm:rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:my-8"
      >
        {/* Controls Header - No Print */}
        <div className="px-6 py-4 bg-[#0A1628] flex items-center justify-between no-print sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-wide">Invoice #{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleShare}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all"
            >
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5A623] text-[#0A1628] rounded-lg text-sm font-bold hover:bg-[#e0961f] transition-all shadow-lg shadow-[#F5A623]/20"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-slate-400 ml-2"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* INVOICE DOCUMENT */}
        <div id="invoice-content" className="relative bg-white print:p-0 print:m-0 w-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            @media print {
              @page { margin: 0; size: auto; }
              body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
              .print-break-inside-avoid { break-inside: avoid; }
            }
          `}</style>
          
          {/* PAYMENT STATUS WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.03]">
            <span className="text-[15rem] font-black text-[#0A1628] rotate-[-45deg] tracking-widest uppercase">
              {order.payment_method.toLowerCase() === 'cod' ? 'PENDING' : 'PAID'}
            </span>
          </div>

          <div className="relative z-10 p-6 sm:p-12 space-y-8 max-w-[1024px] mx-auto">
            
            {/* INVOICE HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="12" fill="#0A1628"/>
                    <path d="M14 24L22 32L34 16" stroke="#F5A623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <h1 className="text-3xl font-black text-[#0A1628] tracking-tight uppercase">Sri Raj Computers</h1>
                    <p className="text-xs font-bold text-[#F5A623] tracking-widest uppercase">IT Solutions & Services</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#F5A623]" /> Main Road, Peddapuram, East Godavari, AP - 533437</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#F5A623]" /> +91 99499 15177, +91 97041 37266</p>
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#F5A623]" /> srirajcomputers@gmail.com</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">GST: 37CQEPB1752N1ZQ</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="w-full sm:w-auto bg-[#0A1628] text-white p-6 rounded-2xl shadow-lg border-b-4 border-[#F5A623]">
                <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Tax Invoice</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="text-slate-400 font-medium">Invoice No:</div>
                  <div className="font-bold text-right">INV-{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-slate-400 font-medium">Date:</div>
                  <div className="font-bold text-right">{orderDate}</div>
                  <div className="text-slate-400 font-medium">Due Date:</div>
                  <div className="font-bold text-right text-[#F5A623]">{dueDate}</div>
                </div>
              </div>
            </div>

            {/* STATUS TRACKER */}
            <div className="hidden sm:block py-4 border-y border-slate-100">
              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0 rounded-full"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-1 bg-[#F5A623] z-0 rounded-full"></div>
                
                {[
                  { label: 'Order Placed', active: true },
                  { label: 'Processing', active: true },
                  { label: 'Shipped', active: false },
                  { label: 'Delivered', active: false }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step.active ? 'bg-[#F5A623] border-[#F5A623] text-[#0A1628]' : 'bg-white border-slate-200 text-transparent'}`}>
                      {step.active && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${step.active ? 'text-[#0A1628]' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BILLING & SHIPPING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print-break-inside-avoid">
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#F5A623] uppercase tracking-widest border-b border-slate-100 pb-2">Billed To</h3>
                <p className="text-lg font-black text-[#0A1628]">{order.shipping_address.fullName}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {order.shipping_address.line1}<br/>
                  {order.shipping_address.line2 && <>{order.shipping_address.line2}<br/></>}
                  {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </p>
                <p className="text-sm font-semibold text-[#0A1628] flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.shipping_address.phone}
                </p>
                {(order.shipping_address.gstNumber || order.shipping_address.businessName) && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                    <p className="text-xs font-bold text-[#0A1628]">{order.shipping_address.businessName}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">GSTIN: <span className="text-[#0A1628]">{order.shipping_address.gstNumber}</span></p>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:text-right">
                <h3 className="text-xs font-black text-[#F5A623] uppercase tracking-widest border-b border-slate-100 pb-2 sm:text-right text-left">Payment Details</h3>
                <div className="flex flex-col sm:items-end gap-1">
                  <p className="text-sm text-slate-600">Method: <span className="font-bold text-[#0A1628] uppercase">{order.payment_method}</span></p>
                  {order.payment_method.toLowerCase() === 'cod' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-black tracking-widest border border-amber-200 mt-1 uppercase">
                      <Clock className="w-3.5 h-3.5" /> PENDING
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-black tracking-widest border border-green-200 mt-1 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MOBILE COLLAPSIBLE ITEMS */}
            <div className="sm:hidden no-print">
              <button 
                onClick={() => setExpandedMobileInfo(!expandedMobileInfo)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0A1628]"
              >
                <span>View Order Items ({order.items.length})</span>
                {expandedMobileInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* PRODUCTS TABLE */}
            <div className={`overflow-hidden rounded-xl border border-slate-200 print:block ${expandedMobileInfo ? 'block' : 'hidden sm:block'}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A1628] text-white text-xs uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Product Name</th>
                    <th className="px-6 py-4 font-bold text-center">Qty</th>
                    <th className="px-6 py-4 font-bold text-right">Unit Price</th>
                    <th className="px-6 py-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg p-1 hidden sm:block flex-shrink-0">
                            <img src={item.image || 'https://via.placeholder.com/40'} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0A1628] text-sm">{item.name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">SKU: {item.product_id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right font-black text-[#0A1628]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS & CODES */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-8 pt-4 print-break-inside-avoid">
              
              {/* QR & Barcode */}
              <div className="flex gap-6 items-end">
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 border-2 border-slate-200 p-2 rounded-xl mx-auto flex items-center justify-center bg-white shadow-sm overflow-hidden">
                    <QRCode 
                      value={`${window.location.origin}/invoice/${order.id}`}
                      size={80}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scan to Verify</p>
                </div>
                <div className="text-center space-y-2 hidden sm:block">
                  <div className="h-16 flex items-center justify-center opacity-90">
                    <Barcode 
                      value={order.id.slice(0, 12).toUpperCase()} 
                      width={1.2}
                      height={40}
                      displayValue={false}
                      background="transparent"
                      lineColor="#0A1628"
                      margin={0}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-[#0A1628] tracking-[0.2em]">{order.id.slice(0,12).toUpperCase()}</p>
                </div>
              </div>

              {/* Totals */}
              <div className="w-full sm:w-80 space-y-4">
                <div className="space-y-3 text-sm px-4">
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Shipping Fee</span>
                    <span className={order.shipping === 0 ? 'text-green-600' : ''}>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                  </div>
                  {order.shipping_address.discountAmount && order.shipping_address.discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-green-600">
                      <span>{order.shipping_address.discountLabel || 'Discount'}</span>
                      <span>-₹{order.shipping_address.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
                <div className="bg-[#0A1628] text-white p-6 rounded-2xl shadow-lg border-t-4 border-[#F5A623] flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-80">Grand Total</span>
                  <span className="text-3xl font-black text-[#F5A623]">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="pt-12 border-t border-slate-200 text-center space-y-4 print-break-inside-avoid">
              <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-2xl mx-auto">
                This is a computer-generated document and does not require a physical signature.<br/>
                For terms, conditions, and return policy, please visit <span className="text-[#0A1628] font-black">srcb2b.com</span>
              </p>
              <div className="flex items-center justify-center gap-6 text-slate-400">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0A1628]">Thank you for your business!</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DigitalInvoice;


