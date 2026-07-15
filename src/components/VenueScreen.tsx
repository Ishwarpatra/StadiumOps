import React, { useState } from 'react';
import { 
  Users, 
  DoorOpen, 
  Activity, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Smile, 
  Frown, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { SimulationState, FanSentimentLog } from '../types';
import { initialFanLogs } from '../data';
import { generateUUID } from '../utils/uuid';

interface VenueScreenProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function VenueScreen({ simulation, setSimulation }: VenueScreenProps) {
  const [logs, setLogs] = useState<FanSentimentLog[]>(initialFanLogs);
  const [broadcastText, setBroadcastText] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'concessions' | 'entry' | 'seating' | 'merch'>('all');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handlePostBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // Simulate sending broadcast to screens
    setBroadcastSent(true);
    setSimulation(prev => ({
      ...prev,
      fanSentiment: Math.min(prev.fanSentiment + 2, 100)
    }));

    const newLog: FanSentimentLog = {
      id: generateUUID(),
      time: 'Just Now',
      user: 'Stadium Broadcast',
      rating: 5,
      message: `[Operational Update] ${broadcastText}`,
      category: 'seating',
      sentimental: 'positive'
    };

    setLogs(prev => [newLog, ...prev]);
    setBroadcastText('');

    setTimeout(() => {
      setBroadcastSent(false);
    }, 3000);
  };

  const handleClearReview = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const filteredLogs = logs.filter(log => {
    if (activeCategory === 'all') return true;
    return log.category === activeCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro row */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900">
          Venue Management &amp; Fan Feed
        </h2>
        <p className="text-sm font-sans font-medium text-slate-500 mt-1">
          Monitor entry gates, real-time feedback reviews, and trigger operational broadcasts.
        </p>
      </div>

      {/* Main Grid: Gate Capacity (5-col) and Fan Feed (7-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gate Capacity & Status Cards (5-col) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gate Overview card */}
          <section className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <DoorOpen className="w-4.5 h-4.5 text-blue-600" />
              Real-Time Gate Capacities
            </h3>

            <div className="space-y-4">
              {/* Gate A */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Gate A (North Concourse)</span>
                  <span className="text-blue-600">76% Capacity</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '76%' }} />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">Flow rate: 120 fans/min • status: Standard</p>
              </div>

              {/* Gate B */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Gate B (Commuter Rail Loop)</span>
                  <span className="text-amber-500">85% Capacity</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">Flow rate: 210 fans/min • status: Elevated Rush</p>
              </div>

              {/* Gate C */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Gate C (East Concessions Portal)</span>
                  <span className="text-red-600 font-extrabold">92% Critical Capacity</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-[10px] text-red-600 font-extrabold font-mono flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Flow rate: 340 fans/min • status: Critical Surge Alert
                </p>
              </div>

              {/* Gate D */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Gate D (VIP Suites Access)</span>
                  <span className="text-emerald-600">45% Capacity</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">Flow rate: 45 fans/min • status: Optimal</p>
              </div>
            </div>
          </section>

          {/* Trigger Broadcast Card */}
          <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md text-white">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-amber-500" />
              Broadcast to Arena Screens
            </h3>

            <form onSubmit={handlePostBroadcast} className="space-y-3">
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Type operational notice (e.g., Gate C is heavily busy, please use Gate D alternate lanes for swift entry)..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors resize-none"
              />

              <button
                type="submit"
                disabled={broadcastSent || !broadcastText.trim()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                {broadcastSent ? (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
                    Sent to Screens!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Post Operational Broadcast
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        {/* Real-time Fan Feed Reviews (7-col) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-md border border-slate-100 flex flex-col h-[560px] overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <div>
              <h3 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-blue-600" />
                Live Fan Sentiments Feed
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Aggregated social posts and seat-ordering review logs.
              </p>
            </div>

            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold font-sans text-slate-600 px-2 py-1 outline-none"
            >
              <option value="all">ALL SENTIMENTS</option>
              <option value="concessions">CONCESSIONS</option>
              <option value="entry">GATES &amp; ENTRY</option>
              <option value="seating">SEATING COMFORT</option>
              <option value="merch">MERCHANDISE</option>
            </select>
          </div>

          {/* Logs feed scroll zone */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Review Logs Available</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`p-3.5 rounded-xl border border-slate-50 flex items-start gap-3 relative ${
                    log.user === 'Stadium Broadcast' ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50/30'
                  }`}
                >
                  <span className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    log.sentimental === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                    log.sentimental === 'negative' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {log.sentimental === 'positive' ? <Smile className="w-4 h-4" /> :
                     log.sentimental === 'negative' ? <Frown className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                  </span>

                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-900">{log.user}</span>
                      <span className="text-[9px] font-bold font-mono text-slate-400">{log.time}</span>
                    </div>
                    
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                      {log.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-mono font-bold bg-white px-2 py-0.5 border border-slate-100 text-slate-400 uppercase rounded">
                        {log.category}
                      </span>
                      {log.rating > 0 && (
                        <span className="text-[9px] font-mono font-bold text-amber-500">
                          {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}
                        </span>
                      )}
                    </div>
                  </div>

                  {log.user !== 'Stadium Broadcast' && (
                    <button 
                      onClick={() => handleClearReview(log.id)}
                      className="text-slate-300 hover:text-red-500 absolute top-3.5 right-3.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
