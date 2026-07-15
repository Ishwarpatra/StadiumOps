import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Download, 
  Utensils, 
  Ticket, 
  ShoppingBag, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  HelpCircle,
  TrendingUp as TrendingIcon,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { SimulationState } from '../types';
import { initialBarData, BarData } from '../data';

interface RevenueScreenProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function RevenueScreen({ simulation, setSimulation }: RevenueScreenProps) {
  const [techDispatched, setTechDispatched] = useState(false);
  const [promoSent, setPromoSent] = useState(false);
  const [activeBar, setActiveBar] = useState<BarData | null>(null);
  const [exporting, setExporting] = useState(false);
  const [barData, setBarData] = useState<BarData[]>(initialBarData);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', title?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(msg, type, title);
    } else {
      console.log(`[Toast Fallback] ${type.toUpperCase()}: ${msg}`);
    }
  };

  // Fetch real-time TPM transactions from API matching backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/pos/transactions');
        if (res.ok) {
          const data = await res.json();
          setBarData(data);
        }
      } catch (err) {
        console.warn('Backend offline. Displaying local cache for POS transaction TPM.');
      }
    };
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [simulation.concessionsRevenue]);

  // Dynamic calculations
  const totalActualRevenue = simulation.concessionsRevenue + simulation.ticketingRevenue + simulation.merchandiseRevenue;
  const completionPercentage = Math.min(Math.round((totalActualRevenue / simulation.revenueGoal) * 100), 100);

  // Financial tracking projections (Point 13 & 14)
  const marginPct = 68.5; // Average operating margin for stadium operations
  const operatingMarginDollars = Math.round(totalActualRevenue * (marginPct / 100));
  const hourlyProjection = Math.round(totalActualRevenue * 1.15); // Dynamic 15% projection increase
  const progressToGoal = totalActualRevenue - simulation.revenueGoal;

  // SVG Gauge math
  const radius = 42.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  // Percentage sources
  const concessionsPct = Math.round((simulation.concessionsRevenue / totalActualRevenue) * 100) || 0;
  const ticketingPct = Math.round((simulation.ticketingRevenue / totalActualRevenue) * 100) || 0;
  const merchPct = Math.round((simulation.merchandiseRevenue / totalActualRevenue) * 100) || 0;

  const handleSliderChange = async (key: 'concessionsRevenue' | 'ticketingRevenue' | 'merchandiseRevenue', val: number) => {
    // 1. Update React state immediately
    setSimulation(prev => ({
      ...prev,
      [key]: val
    }));

    // 2. Synchronize to the Node/Express backend database
    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: val })
      });
    } catch (err) {
      console.warn('Backend server offline. Cached settings slider value locally.');
    }
  };

  const handleDispatchTech = async () => {
    setTechDispatched(true);
    triggerToast('On-Site Technician dispatched to Gate C concessions terminal.', 'info', 'Resource Dispatched');
    
    // Log dispatch on backend
    try {
       await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: "POS Vendor Coordinator",
          action: "Dispatch Tech",
          details: "Technician dispatched to Gate C concessions to recalibrate local broadband routers."
        })
      });
    } catch (err) {
      console.warn('Audit logger offline.');
    }

    setTimeout(async () => {
      // simulate resolving leakage and sync on server dynamically
      const boosterAmt = Math.round(10000 + Math.random() * 8000); // Dynamic $10,000 - $18,000 recovery
      const updatedConcessions = simulation.concessionsRevenue + boosterAmt;
      const updatedQueue = Math.max(simulation.avgQueueTimeSeconds - Math.round(15 + Math.random() * 15), 120);
      
      setSimulation(prev => ({
        ...prev,
        concessionsRevenue: updatedConcessions,
        avgQueueTimeSeconds: updatedQueue
      }));

      try {
        await fetch('/api/simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concessionsRevenue: updatedConcessions,
            avgQueueTimeSeconds: updatedQueue
          })
        });

        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: "SmartBite POS Gateway",
            action: "Network Restored",
            details: `POS terminals verified online. Recovered concessions revenue rate (+${boosterAmt.toLocaleString()}).`
          })
        });
      } catch (err) {
        console.warn('Offline resolution completed.');
      }

      triggerToast(`Technician completed hardware recalibration! Restored +$${boosterAmt.toLocaleString()} concessions sales flow.`, 'success', 'Terminal Recovered');
    }, 2500);
  };

  const handleTriggerPromo = async () => {
    setPromoSent(true);
    const merchBoostAmt = Math.round(6000 + Math.random() * 6000); // Dynamic $6,000 - $12,000 sales uplift
    const updatedMerch = simulation.merchandiseRevenue + merchBoostAmt;
    const updatedSentiment = Math.min(simulation.fanSentiment + 5, 100);

    setSimulation(prev => ({
      ...prev,
      fanSentiment: updatedSentiment,
      merchandiseRevenue: updatedMerch
    }));

    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchandiseRevenue: updatedMerch,
          fanSentiment: updatedSentiment
        })
      });

      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: "Operations Steward Lead",
          action: "Promo Code Pushed",
          details: `15% APP DISCOUNT issued to VIP Lounge Alpha. Retail merchandise sales elevated (+${merchBoostAmt.toLocaleString()}).`
        })
      });
    } catch (err) {
      console.warn('Failed to push promo audit.');
    }

    triggerToast(`Promo push active in VIP Lounge Alpha! Merchandise sales boosted by +$${merchBoostAmt.toLocaleString()}.`, 'success', 'Promo Code Pushed');
  };

  // Real client-side PDF Document Blob downloader (No fake alerts) (Point 11)
  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      
      const pdfText = 
`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R /MediaBox [0 0 595.28 841.89] >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length 750 >>
stream
BT
/F1 18 Tf
70 770 TD
(STADIUMOPS PRO - FINANCIAL REVENUE REPORT) Tj
/F1 12 Tf
0 -40 TD
(Date: 2026-07-15) Tj
0 -20 TD
(Daily Financial Target Audits and Operational Ledger) Tj
0 -40 TD
(==================================================================) Tj
0 -30 TD
(Actual Revenue Total: $${(totalActualRevenue / 1000000).toFixed(3)}M) Tj
0 -20 TD
(Revenue Daily Target: $${(simulation.revenueGoal / 1000000).toFixed(3)}M) Tj
0 -20 TD
(Target Accomplished: ${completionPercentage}%) Tj
0 -30 TD
(Ledger Itemized Sales Channels:) Tj
0 -20 TD
(  - Concessions Food & Beverage: $${simulation.concessionsRevenue.toLocaleString()}) Tj
0 -20 TD
(  - Ticketing Entrance Ingress: $${simulation.ticketingRevenue.toLocaleString()}) Tj
0 -20 TD
(  - Merchandise & Retail Fan Apparel: $${simulation.merchandiseRevenue.toLocaleString()}) Tj
0 -40 TD
(Estimated Net Operating Profit Margin (68.5%): $${operatingMarginDollars.toLocaleString()}) Tj
0 -20 TD
(Projected End-of-Event Volume: $${hourlyProjection.toLocaleString()}) Tj
0 -40 TD
(==================================================================) Tj
0 -20 TD
(End of Handshake File Stream. Authorized by StadiumOps Secure Sandbox Server.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000223 00000 n 
0000000298 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1110
%%EOF`;

      const blob = new Blob([pdfText], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stadiumops_pro_revenue_audit_report_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900">
            Revenue &amp; Concessions Monitor
          </h2>
          <p className="text-sm font-sans font-medium text-slate-500 mt-1">
            Real-time financial performance and sales tracking.
          </p>
        </div>
        
        <button
          onClick={handleExportReport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {exporting ? (
            <>
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              Export Financial Report
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Target (Donut Gauge) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Daily Target Gauge
            </h3>
            <span className="p-1 rounded-lg bg-slate-50 text-slate-400">
              <RefreshCw className="w-4.5 h-4.5 animate-pulse" />
            </span>
          </div>

          {/* Donut Chart */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-4">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                className="stroke-slate-100 fill-none" 
                cx="50" 
                cy="50" 
                r={radius} 
                strokeWidth="10" 
              />
              {/* Filled progress circle */}
              <circle 
                className="stroke-blue-600 fill-none transition-all duration-1000 ease-out" 
                cx="50" 
                cy="50" 
                r={radius} 
                strokeWidth="10" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-4xl font-black text-slate-900">
                {completionPercentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Completion
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-3xl font-extrabold text-slate-900 font-display">
              ${(totalActualRevenue / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              of ${(simulation.revenueGoal / 1000000).toFixed(2)}M Daily Goal
            </p>
          </div>
        </div>

        {/* Revenue Sources & Sliders */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Revenue Sources
            </h3>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              ADJUST TO MOCK SIMULATION
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 py-2">
            {/* Concessions */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Utensils className="w-4 h-4 text-blue-600" /> Concessions
                </span>
                <span className="text-blue-600 font-bold">{concessionsPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${concessionsPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold font-mono">
                <span>${simulation.concessionsRevenue.toLocaleString()}</span>
                <input 
                  type="range" 
                  min="200000" 
                  max="900000" 
                  step="10000"
                  value={simulation.concessionsRevenue}
                  onChange={(e) => handleSliderChange('concessionsRevenue', Number(e.target.value))}
                  className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Ticketing */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Ticket className="w-4 h-4 text-amber-500" /> Ticketing
                </span>
                <span className="text-amber-500 font-bold">{ticketingPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${ticketingPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold font-mono">
                <span>${simulation.ticketingRevenue.toLocaleString()}</span>
                <input 
                  type="range" 
                  min="100000" 
                  max="400000" 
                  step="5000"
                  value={simulation.ticketingRevenue}
                  onChange={(e) => handleSliderChange('ticketingRevenue', Number(e.target.value))}
                  className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Merchandise */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <ShoppingBag className="w-4 h-4 text-red-500" /> Merchandise
                </span>
                <span className="text-red-500 font-bold">{merchPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${merchPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold font-mono">
                <span>${simulation.merchandiseRevenue.toLocaleString()}</span>
                <input 
                  type="range" 
                  min="50000" 
                  max="200000" 
                  step="2500"
                  value={simulation.merchandiseRevenue}
                  onChange={(e) => handleSliderChange('merchandiseRevenue', Number(e.target.value))}
                  className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leakage & Alerts Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Dynamic Leakage Alert Card */}
          {simulation.concessionsRevenue < 450000 ? (
            <div className="bg-red-50 rounded-2xl p-5 shadow-md border border-red-100 flex-1 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
                    Leakage Alert Active
                  </h4>
                  <p className="text-xs text-red-900 font-semibold mt-1">
                    Potential missed revenue detected at <strong className="font-extrabold text-slate-900">Gate C Concessions</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-3 border border-red-200/50 mt-3">
                <p className="text-[11px] leading-relaxed text-red-900">
                  Transaction rate is dropped {Math.round((1 - (simulation.concessionsRevenue / 485400)) * 100)}% below historical baseline. Please dispatch tech.
                </p>
              </div>

              <button
                onClick={handleDispatchTech}
                disabled={techDispatched}
                className="mt-4 w-full py-2.5 px-4 bg-transparent hover:bg-red-600/10 border border-red-600 text-red-600 hover:text-red-700 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 disabled:bg-emerald-50 disabled:border-emerald-600 disabled:text-emerald-700 flex items-center justify-center gap-1"
              >
                {techDispatched ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    Tech Dispatched to POS
                  </>
                ) : (
                  'Dispatch On-Site Tech'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-2xl p-5 shadow-md border border-emerald-100 flex-1 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Leakage Status Stable
                  </h4>
                  <p className="text-xs text-emerald-900 font-semibold mt-1">
                    All concessions POS devices are communicating normally.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-3 border border-emerald-200/50 mt-3">
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  Transaction rate is at {Math.round((simulation.concessionsRevenue / 485400) * 100)}% of baseline volume. Revenue flows optimized.
                </p>
              </div>

              <div className="mt-4 w-full py-2.5 px-4 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl text-center border border-emerald-200">
                POS Grid Healthy
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-amber-50 rounded-2xl p-5 shadow-md border border-amber-100 flex-1 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Info className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  VIP Section Alpha Lounge
                </h4>
                <p className="text-xs text-amber-900 font-medium mt-1">
                  In-seat ordering volume below expected threshold.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerPromo}
              disabled={promoSent}
              className="mt-4 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow"
            >
              {promoSent ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Promo Push Complete
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Push 15% App Discount
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Transaction Volume Bar Chart */}
      <section className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-display font-bold text-slate-800">
              Transaction Volume (TPM)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Click a bar to inspect quarter sales telemetry.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="inline-flex items-center text-xs text-slate-500 font-semibold">
              <span className="w-3 h-3 rounded bg-blue-600 mr-2 inline-block"></span>
              Standard Period
            </span>
            <span className="inline-flex items-center text-xs text-slate-500 font-semibold">
              <span className="w-3 h-3 rounded bg-amber-400 mr-2 inline-block"></span>
              Peak Event Rush
            </span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="h-64 flex items-end justify-between px-2 pt-6 gap-2 md:gap-4">
          {barData.map((bar, i) => (
            <div 
              key={bar.label} 
              className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer relative"
              onClick={() => setActiveBar(bar)}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-mono px-2 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                {bar.tpm} TPM ({bar.tooltip})
              </div>

              {/* Bar Fill */}
              <div 
                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 group-hover:scale-x-105 ${
                  bar.isPeak 
                    ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' 
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
                style={{ height: `${bar.value}%` }}
              />
              
              {/* Label */}
              <span className="font-mono text-[10px] md:text-xs text-slate-400 group-hover:text-slate-900 transition-colors font-bold mt-2">
                {bar.label}
              </span>
            </div>
          ))}
        </div>

        {/* Selected Bar Details Drawer */}
        {activeBar && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-white border border-slate-200 text-sm font-black font-mono">
                {activeBar.label}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {activeBar.tooltip}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Transaction Rate: <span className="font-extrabold text-slate-800 font-mono">{activeBar.tpm} transactions/minute</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveBar(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
