import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Minus, 
  MapPin, 
  RefreshCw, 
  ShieldAlert, 
  Wrench, 
  Smile, 
  Trash2,
  Lock,
  Flame,
  Check,
  Map,
  Sparkles
} from 'lucide-react';
import { Hotspot, SimulationState } from '../types';

const getHotspotCoordinates = (hotspot: Hotspot) => {
  const loc = hotspot.location.toLowerCase();
  if (loc.includes('gate c') || hotspot.id.includes('gate-c') || hotspot.id === '1' || hotspot.id === 'inc_default_2') {
    return { top: '32%', left: '24%', pulseColor: 'bg-red-600', glowColor: 'bg-red-500/30' };
  }
  if (loc.includes('114') || hotspot.id.includes('114') || hotspot.id === '2') {
    return { top: '58%', left: '48%', pulseColor: 'bg-amber-500', glowColor: 'bg-amber-500/20' };
  }
  if (loc.includes('alpha') || loc.includes('vip') || hotspot.id === '4' || hotspot.id === 'inc_default_1') {
    return { top: '28%', left: '64%', pulseColor: 'bg-amber-500', glowColor: 'bg-amber-500/25' };
  }
  if (loc.includes('gate b') || loc.includes('gate-b')) {
    return { top: '35%', left: '76%', pulseColor: 'bg-red-600', glowColor: 'bg-red-500/30' };
  }
  if (loc.includes('west') || loc.includes('ticket')) {
    return { top: '52%', left: '18%', pulseColor: 'bg-blue-500', glowColor: 'bg-blue-500/20' };
  }
  
  // Deterministic fallback for dynamic ones
  let hash = 0;
  for (let i = 0; i < hotspot.location.length; i++) {
    hash = hotspot.location.charCodeAt(i) + ((hash << 5) - hash);
  }
  const topVal = 22 + Math.abs((hash % 55)); 
  const leftVal = 18 + Math.abs(((hash >> 3) % 65)); 
  const isHigh = hotspot.priority === 'high';
  
  return {
    top: `${topVal}%`,
    left: `${leftVal}%`,
    pulseColor: isHigh ? 'bg-red-600' : 'bg-amber-500',
    glowColor: isHigh ? 'bg-red-500/30' : 'bg-amber-500/20'
  };
};

interface StaffingScreenProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
  hotspots: Hotspot[];
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
  setBottlenecks: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function StaffingScreen({
  simulation,
  setSimulation,
  hotspots,
  setHotspots,
  setBottlenecks
}: StaffingScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'security' | 'janitorial' | 'guest'>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', title?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(msg, type, title);
    } else {
      console.log(`[Toast Fallback] ${type.toUpperCase()}: ${msg}`);
    }
  };

  const handleSyncMap = async () => {
    setSyncing(true);
    try {
      const simRes = await fetch('/api/simulation');
      const incRes = await fetch('/api/incidents');
      
      if (simRes.ok && incRes.ok) {
        const simData = await simRes.json();
        const incData = await incRes.json();

        setSimulation(prev => ({
          ...prev,
          ...simData
        }));

        const mappedHotspots: Hotspot[] = incData
          .filter((inc: any) => inc.type !== 'revenue')
          .map((inc: any) => ({
            id: inc.id,
            location: inc.location,
            priority: inc.priority,
            description: inc.description,
            status: inc.status,
            staffAssigned: inc.staffAssigned || 0,
            type: inc.type || 'security'
          }));
        
        setHotspots(mappedHotspots);

        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: "Console Operator",
            action: "Manual Map Refresh",
            details: "Manual synchronisation request of active IoT gate and ticket hub telemetry successfully processed."
          })
        });
      }
    } catch (err) {
      console.warn("Backend sync failed.");
    } finally {
      setTimeout(() => {
        setSyncing(false);
      }, 600);
    }
  };

  const handleDeployStaff = async (hotspotId: string) => {
    const hs = hotspots.find(h => h.id === hotspotId);
    if (!hs) return;
    const newStaff = hs.staffAssigned + 2;

    try {
      const res = await fetch(`/api/incidents/${hotspotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dispatched',
          staffAssigned: newStaff
        })
      });

      if (res.ok) {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: "Console Operator",
            action: "Staff Redeployment",
            details: `Dispatched +2 operators to ${hs.location} (Total Staff Assigned: ${newStaff}).`
          })
        });

        setHotspots(prev => prev.map(h => {
          if (h.id === hotspotId) {
            return {
              ...h,
              staffAssigned: newStaff,
              status: 'dispatched'
            };
          }
          return h;
        }));

        setSimulation(prev => ({
          ...prev,
          activeStaff: Math.min(prev.activeStaff + 2, prev.targetStaff)
        }));

        if (selectedHotspot && selectedHotspot.id === hotspotId) {
          setSelectedHotspot(prev => prev ? {
            ...prev,
            staffAssigned: newStaff,
            status: 'dispatched'
          } : null);
        }
      }
    } catch (err) {
      console.warn("Backend offline. Fallback to local dispatch.");
    }
  };

  const handleStatusUpdate = async (hotspotId: string) => {
    const hs = hotspots.find(h => h.id === hotspotId);
    if (!hs) return;
    const nextStatus = hs.status === 'pending' ? 'dispatched' : 'resolved';

    try {
      const res = await fetch(`/api/incidents/${hotspotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus
        })
      });

      if (res.ok) {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: "Console Operator",
            action: "Hotspot Incident Lifecycle",
            details: `Hotspot at ${hs.location} transition from "${hs.status}" to "${nextStatus}".`
          })
        });

        setHotspots(prev => prev.map(h => {
          if (h.id === hotspotId) {
            return { ...h, status: nextStatus };
          }
          return h;
        }));

        if (nextStatus === 'resolved') {
          setSimulation(s => ({
            ...s,
            incidentsResolved: s.incidentsResolved + 1,
            incidentsPending: Math.max((s.incidentsPending ?? 0) - 1, 0)
          }));
          
          if (hs.location === 'Gate C Entrance') {
            setBottlenecks(b => b.filter(item => item.location !== 'Gate C'));
          }
        }

        if (selectedHotspot && selectedHotspot.id === hotspotId) {
          setSelectedHotspot(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      }
    } catch (err) {
      console.warn("Backend offline. Status update fallback.");
    }
  };

  const handleGateSurgeScenario = async () => {
    setHotspots(prev => prev.map(h => {
      if (h.type === 'security') {
        return { ...h, status: 'dispatched', staffAssigned: h.staffAssigned + 4 };
      }
      return h;
    }));

    setSimulation(prev => ({
      ...prev,
      activeStaff: prev.targetStaff,
      avgQueueTimeSeconds: Math.max(prev.avgQueueTimeSeconds - 45, 120),
      incidentsResolved: prev.incidentsResolved + 1
    }));
    
    setBottlenecks(b => b.filter(item => item.location !== 'Gate B'));

    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeStaff: simulation.targetStaff,
          avgQueueTimeSeconds: Math.max(simulation.avgQueueTimeSeconds - 45, 120)
        })
      });

      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: "GCP Operations Controller",
          action: "Quick Deploy Scenario",
          details: "Scenario Triggered: 'Gate Surge Response' activated. Full security details dispatched."
        })
      });
    } catch (err) {
      console.warn("Scenario sync failed.");
    }

    triggerToast('Gate Surge Response Activated! Full security details deployed. Wait times projected to decline.', 'success', 'Gate Surge');
  };

  const handleMedicalAssistScenario = async () => {
    setSimulation(prev => ({
      ...prev,
      fanSentiment: Math.min(prev.fanSentiment + 4, 100),
      incidentsResolved: prev.incidentsResolved + 1,
      incidentsPending: Math.max((prev.incidentsPending ?? 0) - 1, 0)
    }));

    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanSentiment: Math.min(simulation.fanSentiment + 4, 100)
        })
      });

      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: "GCP Operations Controller",
          action: "Quick Deploy Scenario",
          details: "Scenario Triggered: 'Medical Assist Dispatch'. Fan sentiment boosted by rapid intervention."
        })
      });
    } catch (err) {
      console.warn("Medical scenario sync failed.");
    }

    triggerToast('Medical Standby dispatched to Sector 114 concourse. Incident resolved. Fan sentiment improved.', 'success', 'Medical Assist');
  };

  const handleMassCleanupScenario = async () => {
    setHotspots(prev => prev.map(h => {
      if (h.type === 'janitorial') {
        return { ...h, status: 'resolved', staffAssigned: h.staffAssigned + 2 };
      }
      return h;
    }));

    setSimulation(prev => ({
      ...prev,
      incidentsResolved: prev.incidentsResolved + 1,
      incidentsPending: Math.max((prev.incidentsPending ?? 0) - 1, 0)
    }));

    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentsResolved: simulation.incidentsResolved + 1,
          incidentsPending: Math.max((simulation.incidentsPending ?? 0) - 1, 0)
        })
      });

      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: "GCP Operations Controller",
          action: "Quick Deploy Scenario",
          details: "Scenario Triggered: 'Concourse Deep Clean Sweep'. Handled liquid hazards."
        })
      });
    } catch (err) {
      console.warn("Cleanup scenario sync failed.");
    }

    triggerToast('Concourse deep clean sweep activated. Spill hazards resolved.', 'success', 'Deep Clean Sweep');
  };

  // Filters
  const filteredHotspots = hotspots.filter(h => {
    if (activeFilter === 'all') return true;
    return h.type === activeFilter;
  });

  const getHotspotIcon = (type: 'security' | 'janitorial' | 'guest') => {
    switch (type) {
      case 'security': return <ShieldAlert className="w-4 h-4" />;
      case 'janitorial': return <Wrench className="w-4 h-4" />;
      case 'guest': return <Smile className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Staff
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              {simulation.activeStaff}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {simulation.targetStaff}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span>98% of Operations target</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Avg Wait Time / Gate
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              {Math.floor(simulation.avgQueueTimeSeconds / 60)}
            </span>
            <span className="text-sm font-semibold text-slate-500">m</span>
            <span className="text-3xl font-extrabold text-slate-900 font-display ml-1">
              {simulation.avgQueueTimeSeconds % 60}
            </span>
            <span className="text-sm font-semibold text-slate-500">s</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-orange-600">
            <AlertTriangle className="w-4 h-4" />
            <span>+45s above historical baseline</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Incidents Resolved
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              {simulation.incidentsResolved}
            </span>
            <span className="text-xs font-bold text-slate-400">/ hour</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            <span>92% Service SLA target met</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Pending Alerts
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              {hotspots.filter(h => h.status !== 'resolved').length}
            </span>
            <span className="text-xs font-bold text-slate-400">active issues</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>{hotspots.filter(h => h.status === 'resolved').length} issues resolved today</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Map (8-col) and Side Controls (4-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Canvas Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col h-[580px] relative hover:shadow-lg transition-all duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 z-10 shrink-0">
            <div>
              <h3 className="text-sm font-display font-extrabold text-slate-950 flex items-center gap-2">
                <Map className="w-4.5 h-4.5 text-blue-600" />
                Current Deployment Map
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Real-time crowd heatmaps and operational node positions.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSyncMap}
                disabled={syncing}
                className="px-3 py-1.5 border border-blue-600/30 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Data'}
              </button>
            </div>
          </div>

          {/* Map canvas itself */}
          <div className="flex-grow relative bg-[#e2e8f0] overflow-hidden">
            {/* Blueprint image background */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 origin-center"
              style={{ 
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYd-PWoZyNhZzfJE1PhIGoypXKAPzyeNe_mLqw9mz55cHAcyxvNxThw-lwZ57U-i7wbp4wEMKxa4Iss5TO_3lAoMEfjyytGOEKZ9asocq31iHhVuon598_jq5erHZweruWSmutxKlLL0eDjGCYMPVD9nQelsLn3zzGOwean6iNOZ7lLBr_Ef11BPjyx2sBAws_RuE3FarKJn-3tgDBdUM-9MOWKkzTXV5WHTOnIjd592HWnbFtC0Mgf0wCUimPM45l5twRTx7_Bew')",
                transform: `scale(${zoomLevel})`
              }}
            />

            {/* Simulated Heatmap Glows & Nodes */}
            {hotspots.filter(h => h.status !== 'resolved').map(h => {
              const { top, left, pulseColor, glowColor } = getHotspotCoordinates(h);

              return (
                <div 
                  key={h.id} 
                  className="absolute cursor-pointer group select-none transition-all duration-500"
                  style={{ top, left }}
                  onClick={() => setSelectedHotspot(h)}
                >
                  {/* Outer Pulsing aura */}
                  <div className={`absolute -inset-6 rounded-full ${glowColor} blur-lg animate-pulse scale-110`} />
                  
                  {/* Central Node Dot */}
                  <div className={`w-4.5 h-4.5 rounded-full ${pulseColor} shadow-lg border-2 border-white relative z-10 flex items-center justify-center text-white text-[8px] font-black`}>
                    !
                  </div>

                  {/* Tiny Name Tag */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded px-2 py-0.5 text-[8px] font-mono whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none font-bold">
                    {h.location}
                  </div>
                </div>
              );
            })}

            {/* Static Staff Nodes for aesthetic decoration */}
            <div className="absolute top-[42%] left-[38%] w-2 h-2 bg-blue-500 rounded-full border border-white" />
            <div className="absolute top-[44%] left-[39%] w-2 h-2 bg-blue-500 rounded-full border border-white" />
            <div className="absolute top-[48%] left-[35%] w-2 h-2 bg-blue-500 rounded-full border border-white" />
            <div className="absolute top-[30%] left-[55%] w-2 h-2 bg-blue-500 rounded-full border border-white" />

            {/* Map Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden p-1 gap-1 z-20">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
                className="p-1.5 hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="h-[1px] bg-slate-100" />
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 1))}
                className="p-1.5 hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Hotspots & Controls Column (4-col) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-[580px]">
          
          {/* Active Hotspots Lists */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 flex-grow flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white z-10 shrink-0 flex justify-between items-center">
              <h3 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4.5 h-4.5 text-red-600 animate-pulse" />
                Active Hotspots
              </h3>
              
              {/* Category Filter Chips */}
              <select 
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold font-sans text-slate-600 px-2 py-1 outline-none"
              >
                <option value="all">ALL DEPLOYMENTS</option>
                <option value="security">SECURITY</option>
                <option value="janitorial">JANITORIAL</option>
                <option value="guest">GUEST SVCS</option>
              </select>
            </div>

            {/* Hotspots List scroll area */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {filteredHotspots.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-700">No Hotspots Found</p>
                  <p className="text-[10px] text-slate-400 mt-1">All stadium zones are operational</p>
                </div>
              ) : (
                filteredHotspots.map(hot => (
                  <div 
                    key={hot.id}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedHotspot?.id === hot.id 
                        ? 'border-blue-500 bg-blue-50/20 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                    onClick={() => setSelectedHotspot(hot)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1 rounded-lg ${
                          hot.type === 'security' ? 'bg-red-50 text-red-600' :
                          hot.type === 'janitorial' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {getHotspotIcon(hot.type)}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">{hot.location}</span>
                      </div>
                      
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase border ${
                        hot.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                        hot.priority === 'medium' ? 'bg-amber-50 text-amber-800 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {hot.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-2">
                      {hot.description}
                    </p>

                    {/* Interactive inline quick deploy status */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center gap-2">
                      <div className="text-[10px] text-slate-400 font-bold font-mono">
                        {hot.staffAssigned} assigned • status: <span className="font-extrabold capitalize text-slate-700">{hot.status}</span>
                      </div>
                      
                      {hot.status !== 'resolved' && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeployStaff(hot.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                          >
                            +2 Staff
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(hot.id);
                            }}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {hot.status === 'pending' ? 'Dispatch' : 'Resolve'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Deploy Actions Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 shrink-0">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quick Deploy Scenarios
            </h4>
            
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={handleGateSurgeScenario}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  Trigger Gate Surge Response
                </span>
                <span>Deploy Staff</span>
              </button>

              <button 
                onClick={handleMedicalAssistScenario}
                className="w-full border border-blue-600/30 hover:bg-blue-50 text-blue-600 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer active:scale-95"
              >
                <span className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4 shrink-0" />
                  Medical Assist Team
                </span>
                <span>Dispatch</span>
              </button>

              <button 
                onClick={handleMassCleanupScenario}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer active:scale-95"
              >
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 shrink-0" />
                  Mass Concourse Cleanup
                </span>
                <span>Deploy Clean</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Selected Hotspot Drawer detail overlay */}
      {selectedHotspot && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in relative overflow-hidden">
          {/* Subtle overlay glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10" />
          
          <div className="flex gap-4 items-start relative z-10">
            <span className="p-3 bg-slate-800 text-blue-400 rounded-xl mt-1 shrink-0">
              {getHotspotIcon(selectedHotspot.type)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-display font-black tracking-tight">{selectedHotspot.location}</h4>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                  {selectedHotspot.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl mt-1">
                {selectedHotspot.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-[11px] font-mono font-bold text-slate-400">
                <span>ASSIGNED PERSONNEL: <span className="text-white font-extrabold">{selectedHotspot.staffAssigned} Staff</span></span>
                <span>ALERTS STATUS: <span className="text-amber-400 font-extrabold capitalize">{selectedHotspot.status}</span></span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0 relative z-10 w-full md:w-auto mt-2 md:mt-0">
            {selectedHotspot.status !== 'resolved' && (
              <>
                <button
                  onClick={() => handleDeployStaff(selectedHotspot.id)}
                  className="flex-1 md:flex-none py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Deploy +2 Staff
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedHotspot.id)}
                  className="flex-1 md:flex-none py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  {selectedHotspot.status === 'pending' ? 'Mark Dispatch' : 'Resolve Incident'}
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedHotspot(null)}
              className="px-3 py-2 bg-transparent text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer font-bold"
            >
              Dismiss Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
