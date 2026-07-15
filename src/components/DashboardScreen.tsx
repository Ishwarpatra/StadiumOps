import React, { useState } from 'react';
import { 
  Users, 
  Smile, 
  TrendingDown, 
  Hourglass, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Zap, 
  X, 
  Shield, 
  Flame, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';
import { SimulationState, Bottleneck, AIActionItem, Hotspot } from '../types';

interface DashboardScreenProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
  bottlenecks: Bottleneck[];
  setBottlenecks: React.Dispatch<React.SetStateAction<Bottleneck[]>>;
  aiActions: AIActionItem[];
  setAiActions: React.Dispatch<React.SetStateAction<AIActionItem[]>>;
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
  onNavigate: (tab: 'dashboard' | 'revenue' | 'staffing' | 'venue' | 'settings') => void;
}

export default function DashboardScreen({
  simulation,
  setSimulation,
  bottlenecks,
  setBottlenecks,
  aiActions,
  setAiActions,
  setHotspots,
  onNavigate
}: DashboardScreenProps) {
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleExecuteAIAction = (actionId: string) => {
    // Execute AI Action
    setAiActions(prev => prev.map(act => {
      if (act.id === actionId) {
        return { ...act, executed: true };
      }
      return act;
    }));

    if (actionId === 'ai1') {
      // Re-deploy security staff
      setSimulation(prev => ({
        ...prev,
        activeStaff: Math.min(prev.activeStaff + 5, prev.targetStaff),
        incidentsResolved: prev.incidentsResolved + 1
      }));
      // Resolve Gate B bottleneck
      setBottlenecks(prev => prev.filter(b => b.location !== 'Gate B'));
      
      // Update Hotspots status
      setHotspots(prev => prev.map(h => {
        if (h.location === 'Gate C Entrance') {
          return { ...h, status: 'dispatched', staffAssigned: h.staffAssigned + 4 };
        }
        return h;
      }));

      triggerToast('AI Action: Re-deployed 5 Security Staff to Gate B. Bottleneck cleared!');
    } else if (actionId === 'ai2') {
      // Promo push
      setSimulation(prev => ({
        ...prev,
        fanSentiment: Math.min(prev.fanSentiment + 4, 100),
        concessionsRevenue: prev.concessionsRevenue + 12500
      }));
      triggerToast('AI Action: Sent 15% discount appetizers push. VIP sentiment boosted!');
    } else if (actionId === 'ai3') {
      // Cleanup crews
      setSimulation(prev => ({
        ...prev,
        avgQueueTimeSeconds: Math.max(prev.avgQueueTimeSeconds - 24, 180),
        incidentsResolved: prev.incidentsResolved + 1
      }));
      // Resolve spill hotspot
      setHotspots(prev => prev.map(h => {
        if (h.location === 'Section 114 Concourse') {
          return { ...h, status: 'resolved', staffAssigned: h.staffAssigned + 2 };
        }
        return h;
      }));
      triggerToast('AI Action: Standby janitorial dispatched to Section 114 spill.');
    }
  };

  const handleDismissAIAction = (actionId: string) => {
    setAiActions(prev => prev.filter(act => act.id !== actionId));
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 4000);
  };

  // Convert queue time from seconds to min/s format
  const formatQueueTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}.${secs === 0 ? '0' : Math.floor(secs / 10)} min`;
  };

  const attendancePercentage = (simulation.attendance / simulation.maxAttendance) * 100;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-blue-500/30 text-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <p className="text-xs font-semibold">{showToast}</p>
          <button onClick={() => setShowToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section: Real-time Status */}
      <section className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2">
              Event Status:{' '}
              <span className="text-red-600 flex items-center animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2 inline-block"></span>
                LIVE
              </span>
            </h2>
            <p className="text-sm font-sans font-medium text-slate-500 mt-1">
              Championship Finals — Q2 14:30
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-6">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Attendance
              </div>
              <div className="text-2xl font-extrabold text-blue-600 font-display">
                {simulation.attendance.toLocaleString()}{' '}
                <span className="text-sm font-medium text-slate-400">/ {simulation.maxAttendance.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="text-right border-l border-slate-100 pl-6">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Fan Sentiment
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 flex items-center justify-end font-display gap-1">
                <Smile className="w-6 h-6 text-emerald-500" />
                {simulation.fanSentiment}%
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1 text-xs text-slate-500 font-medium">
            <span>Stadium Seating Capacity</span>
            <span className="font-bold text-slate-700">{Math.round(attendancePercentage)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Net Revenue Leakage */}
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
              <TrendingDown className="w-3 h-3 mr-0.5" /> 15%
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Net Revenue Leakage
          </h3>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            $12,000
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Detected via CV Concessions
          </p>
        </div>

        {/* Card 2: Avg Concession Queue */}
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => onNavigate('staffing')}>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
              <Hourglass className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              ALERT
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg. Concession Queue
          </h3>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {formatQueueTime(simulation.avgQueueTimeSeconds)}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-2 flex items-center gap-1">
            Target threshold: &lt; 3.0 min
          </p>
        </div>

        {/* Card 3: Crowd Throughput */}
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              HIGH
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Crowd Throughput
          </h3>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            850 <span className="text-xs font-medium text-slate-500">fans/min</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Peak volume at Gate A
          </p>
        </div>

        {/* Card 4: Labor Efficiency */}
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => onNavigate('staffing')}>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              OPTIMIZED
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Labor Efficiency
          </h3>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {Math.round((simulation.activeStaff / simulation.targetStaff) * 100)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {simulation.activeStaff} of {simulation.targetStaff} active staff
          </p>
        </div>
      </section>

      {/* Main Chart Area & Bottom Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
            <h3 className="text-base font-display font-bold text-slate-800">
              Revenue Flow vs. Crowd Density
            </h3>
            <div className="flex gap-4">
              <span className="inline-flex items-center text-xs text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2 inline-block"></span>
                Concession Revenue
              </span>
              <span className="inline-flex items-center text-xs text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-500 bg-amber-500/10 mr-2 inline-block"></span>
                Crowd Density
              </span>
            </div>
          </div>

          {/* Interactive Chart Visual representation */}
          <div className="flex-grow w-full bg-slate-50/50 rounded-xl relative overflow-hidden flex items-end">
            {/* Custom SVG Line Graphics representing both variables */}
            <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* gridlines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />

              {/* Area Under Concession Revenue */}
              <path d="M0,100 L0,70 L20,60 L40,40 L60,80 L80,50 L100,20 L100,100 Z" fill="url(#blueGrad)" />
              {/* Concession Revenue Line */}
              <path d="M0,70 L20,60 L40,40 L60,80 L80,50 L100,20" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

              {/* Area Under Crowd Density */}
              <path d="M0,100 L0,85 L20,80 L40,75 L60,65 L80,85 L100,55 L100,100 Z" fill="url(#amberGrad)" />
              {/* Crowd Density Line */}
              <path d="M0,85 L20,80 L40,75 L60,65 L80,85 L100,55" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="3" strokeLinecap="round" />
              
              {/* Dot Markers */}
              <circle cx="40" cy="40" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="60" cy="65" r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
            
            {/* Overlay indicators */}
            <div className="absolute top-[35%] left-[38%] bg-slate-900/90 text-white rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap shadow z-10">
              Peak: 14:00 (Kickoff)
            </div>
          </div>
          
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold font-mono mt-3 px-1">
            <span>—4 Hours</span>
            <span>—3 Hours</span>
            <span>—2 Hours</span>
            <span>—1 Hour</span>
            <span className="text-blue-500 font-bold">Now (14:30)</span>
          </div>
        </section>

        {/* Side Column: Bottlenecks & AI Action Items */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Active Bottlenecks Card */}
          <section className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 flex-1">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 animate-pulse" />
                Active Bottlenecks
              </h3>
            </div>
            
            {bottlenecks.length === 0 ? (
              <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                <p className="text-xs font-semibold">All Gates Operating Under Target Capacity</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {bottlenecks.map(bot => (
                  <li 
                    key={bot.id} 
                    className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-start gap-3 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('staffing')}
                  >
                    <div className="p-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider shrink-0">
                      {bot.location}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">{bot.location} Concourse</div>
                      <div className="text-[11px] font-semibold text-red-700 mt-0.5">
                        {bot.severity === 'critical' ? 'Critical Density' : 'High Traffic'} — Est. {bot.delayMinutes} min delay
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* AI Action Items Card */}
          <section className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800 flex-1 relative overflow-hidden flex flex-col justify-between">
            {/* Decorative mesh glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20" />
            
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800 relative z-10">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                AI-Powered Operations
              </h3>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                GENAI ENGINE V2.1
              </span>
            </div>

            <div className="relative z-10 flex-grow flex flex-col justify-center">
              {aiActions.filter(a => !a.executed).length === 0 ? (
                <div className="text-center py-4 text-slate-400 flex flex-col items-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-300">All AI Recommendations Executed</p>
                  <p className="text-[10px] text-slate-500 mt-1">Real-time parameters optimized</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiActions.filter(a => !a.executed).slice(0, 1).map(act => (
                    <div key={act.id} className="bg-slate-800/80 rounded-xl p-4 border border-blue-500/20 shadow">
                      <p className="text-xs text-blue-300 font-mono mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> RECOMMENDED MITIGATION:
                      </p>
                      <p className="text-xs text-slate-200 font-semibold leading-relaxed mb-4">
                        &ldquo;{act.description}&rdquo;
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleExecuteAIAction(act.id)}
                          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                        >
                          Execute Auto-Staffing
                        </button>
                        <button 
                          onClick={() => handleDismissAIAction(act.id)}
                          className="px-2.5 py-2 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
