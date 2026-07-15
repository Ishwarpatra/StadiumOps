import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  ChevronDown, 
  Bell, 
  Cpu, 
  Radio, 
  Video, 
  Receipt, 
  Database, 
  ExternalLink, 
  Copy, 
  Shield, 
  UserPlus, 
  Bot, 
  Lightbulb, 
  LineChart, 
  AlertTriangle, 
  Zap, 
  Trash2, 
  Settings, 
  RotateCcw, 
  Lock,
  CheckCircle,
  HelpCircle,
  LogOut,
  Users,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { SimulationState, Hotspot, Bottleneck, APIConfig, SystemIDs } from '../types';

interface SettingsScreenProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
  setBottlenecks: React.Dispatch<React.SetStateAction<Bottleneck[]>>;
  onReset: () => void;
}

export default function SettingsScreen({
  simulation,
  setSimulation,
  setHotspots,
  setBottlenecks,
  onReset
}: SettingsScreenProps) {
  // General State
  const [fullName, setFullName] = useState('Alexander Thorne');
  const [primaryEmail, setPrimaryEmail] = useState('a.thorne@stadiumpro.ops');
  const [systemLanguage, setSystemLanguage] = useState('English (United States)');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  
  // Notification thresholds
  const [crowdDensityThreshold, setCrowdDensityThreshold] = useState(85);
  const [revenueLeakageThreshold, setRevenueLeakageThreshold] = useState(500);

  // Security and API Key
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [idsVisible, setIdsVisible] = useState(false);

  // Load API keys and System IDs through typed interface mapping
  const apiConfig: APIConfig = {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "• • • • • • • • • • • • • • • •",
    stadiumOpsApiKey: import.meta.env.VITE_STADIUM_OPS_API_KEY || "sk_stadiumops_pro_live_8d7a12b6fd599812",
    iotHubApiKey: "key_iot_mesh_w_3289ab72c91a01",
    posTerminalApiKey: "key_pos_hub_vendor_8f11074da",
    appUrl: import.meta.env.VITE_APP_URL || window.location.origin
  };

  const systemIDs: SystemIDs = {
    stadiumId: import.meta.env.VITE_STADIUM_ID || "stadium_stg_coliseum_99b",
    iotHubId: import.meta.env.VITE_IOT_HUB_ID || "hub_mesh_west_gate_c",
    posTerminalId: import.meta.env.VITE_POS_TERMINAL_ID || "pos_alpha_vendor_42",
    cctvStreamId: import.meta.env.VITE_CCTV_STREAM_ID || "stream_unified_concourse_112"
  };

  const apiKeyValue = apiConfig.stadiumOpsApiKey;

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: 'iot', name: 'IoT Sensor Mesh', status: 'Connected: 1,240 nodes', type: 'sensors', icon: Radio },
    { id: 'cctv', name: 'CCTV Unified Feed', status: 'Status: Active (HD)', type: 'videocam', icon: Video },
    { id: 'pos', name: 'POS Terminal Hub', status: 'Integrated: 42 Vendors', type: 'point_of_sale', icon: Receipt },
  ]);

  // Roles state
  const [roles, setRoles] = useState([
    { id: 'sec', role: 'Security Personnel', permissions: 'CCTV Access, Gate Override, Incident Reporting', level: 'High Priority', levelColor: 'bg-error/10 text-error border-error/20' },
    { id: 'jan', role: 'Janitorial Services', permissions: 'Inventory Logs, Facility Map Access, Maintenance Requests', level: 'Standard', levelColor: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'con', role: 'Concessions Manager', permissions: 'POS Oversight, Inventory Tracking, Revenue Reports', level: 'Authorized', levelColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  ]);

  const [reportsEnabled, setReportsEnabled] = useState(true);

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // AI assistant apply suggestion
  const handleApplySuggestion = () => {
    setCrowdDensityThreshold(80);
    alert('AI Insight applied: Crowd Density Alert Threshold optimized to 80%.');
  };

  // Reset Configuration to defaults
  const handleDiscardChanges = () => {
    setFullName('Alexander Thorne');
    setPrimaryEmail('a.thorne@stadiumpro.ops');
    setSystemLanguage('English (United States)');
    setCrowdDensityThreshold(85);
    setRevenueLeakageThreshold(500);
    alert('Configuration changes discarded.');
  };

  const handleSaveConfiguration = () => {
    alert('StadiumOps Pro configuration saved successfully!');
  };

  // Original Incident Triggers from original code
  const handleTriggerIncident = (type: 'gate_surge' | 'spill' | 'wifi_fail') => {
    if (type === 'gate_surge') {
      const newHotspot: Hotspot = {
        id: Math.random().toString(),
        location: 'Gate A Turnstiles',
        priority: 'high',
        description: 'Rapid influx of commuter fans causing backup at metal detectors. Immediate security redeployment recommended.',
        status: 'pending',
        staffAssigned: 0,
        type: 'security'
      };
      const newBottleneck: Bottleneck = {
        id: Math.random().toString(),
        location: 'Gate A',
        severity: 'critical',
        description: 'Commuter rush crowding turnstiles.',
        delayMinutes: 12
      };

      setHotspots(prev => [newHotspot, ...prev]);
      setBottlenecks(prev => [newBottleneck, ...prev]);
      setSimulation(prev => ({
        ...prev,
        avgQueueTimeSeconds: prev.avgQueueTimeSeconds + 48,
        fanSentiment: Math.max(prev.fanSentiment - 5, 0)
      }));
      alert('Simulation: Triggered Gate A Surge incident. Added to alerts log.');

    } else if (type === 'spill') {
      const newHotspot: Hotspot = {
        id: Math.random().toString(),
        location: 'South Food Hall Block',
        priority: 'medium',
        description: 'Large soda spill in aisle 3 concourse area. Wet floor slip hazard.',
        status: 'pending',
        staffAssigned: 0,
        type: 'janitorial'
      };
      setHotspots(prev => [newHotspot, ...prev]);
      alert('Simulation: Triggered concessions floor spill hazard. Added to alerts log.');

    } else if (type === 'wifi_fail') {
      const newHotspot: Hotspot = {
        id: Math.random().toString(),
        location: 'VIP Suites Access Corridor',
        priority: 'medium',
        description: 'Broadband router drop causing contactless ordering system delay. Manual payment backup active.',
        status: 'pending',
        staffAssigned: 0,
        type: 'guest'
      };
      setHotspots(prev => [newHotspot, ...prev]);
      setSimulation(prev => ({
        ...prev,
        concessionsRevenue: Math.max(prev.concessionsRevenue - 15000, 0),
        fanSentiment: Math.max(prev.fanSentiment - 4, 0)
      }));
      alert('Simulation: Triggered broadband payment router downtime. VIP concessions revenue leaking.');
    }
  };

  const handleNumericParamChange = (field: keyof SimulationState, value: number) => {
    setSimulation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKeyValue);
    alert('API key copied to clipboard!');
  };

  const handleAddNewIntegration = () => {
    const name = prompt("Enter Integration Name:");
    if (!name) return;
    const newIntegration = {
      id: Math.random().toString(),
      name,
      status: 'Status: Pending Setup',
      type: 'custom',
      icon: Cpu
    };
    setIntegrations(prev => [...prev, newIntegration]);
  };

  const handleDefineRole = () => {
    const role = prompt("Enter Role Title:");
    if (!role) return;
    const permissions = prompt("Enter Permissions (comma separated):", "Access general logs, View statistics");
    if (!permissions) return;
    
    const newRole = {
      id: Math.random().toString(),
      role,
      permissions,
      level: 'Standard',
      levelColor: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    setRoles(prev => [...prev, newRole]);
  };

  return (
    <div id="settings-screen" className="animate-fade-in flex flex-col xl:flex-row gap-gutter w-full">
      
      {/* Left Column: Form & Bento Layout */}
      <div className="flex-1 space-y-lg max-w-[1200px]">
        
        {/* Page Header */}
        <div id="settings-header" className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant/20 pb-lg">
          <div>
            <h1 className="text-display-lg font-display-lg text-on-surface">Settings</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mt-xs">
              Configure the core operational parameters for StadiumOps Pro, manage integrations, and fine-tune staff access protocols.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button 
              id="btn-discard-changes"
              onClick={handleDiscardChanges}
              className="bg-surface border border-outline px-md py-sm rounded-lg font-bold text-label-md text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button 
              id="btn-save-config"
              onClick={handleSaveConfiguration}
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold text-label-md shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Bento Grid Layout for Settings */}
        <div id="settings-bento-grid" className="grid grid-cols-12 gap-gutter">
          
          {/* Column A: Left side (Span 7 on desktop) */}
          <div className="col-span-12 lg:col-span-7 space-y-gutter">
            
            {/* General Settings Card */}
            <section id="card-general-settings" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-primary/10 text-primary rounded-lg">
                  <User className="w-6 h-6" />
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface">General Settings</h2>
              </div>
              
              <div className="space-y-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface font-semibold">Full Name</label>
                    <input 
                      id="input-full-name"
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md outline-none text-on-surface dark:bg-surface-container"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface font-semibold">Primary Email</label>
                    <input 
                      id="input-primary-email"
                      type="email" 
                      value={primaryEmail}
                      onChange={(e) => setPrimaryEmail(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md outline-none text-on-surface dark:bg-surface-container"
                    />
                  </div>
                </div>

                {/* Display Mode Theme Toggle */}
                <div className="flex items-center justify-between p-md bg-surface-container-low rounded-xl border border-outline-variant/30 dark:bg-surface-container">
                  <div className="flex items-center gap-md">
                    <span className="p-2 bg-primary-container/20 text-primary rounded-lg">
                      {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                    </span>
                    <div>
                      <p className="text-label-md font-bold text-on-surface">Display Mode</p>
                      <p className="text-body-md text-on-surface-variant opacity-70">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <button 
                    id="btn-toggle-theme"
                    onClick={handleToggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isDarkMode ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Language Select */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface font-semibold">System Language</label>
                  <div className="relative">
                    <select 
                      id="select-system-language"
                      value={systemLanguage}
                      onChange={(e) => setSystemLanguage(e.target.value)}
                      className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md outline-none text-on-surface dark:bg-surface-container"
                    >
                      <option value="English (United States)">English (United States)</option>
                      <option value="Spanish (ES)">Spanish (ES)</option>
                      <option value="French (FR)">French (FR)</option>
                      <option value="German (DE)">German (DE)</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                  </div>
                </div>
              </div>
            </section>

            {/* Notification Thresholds Card */}
            <section id="card-notification-thresholds" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-secondary-container/20 text-secondary rounded-lg">
                  <Bell className="w-6 h-6 text-amber-600" />
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface">Notification Thresholds</h2>
              </div>
              
              <div className="space-y-md">
                {/* Crowd Density Slider */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm group">
                  <div className="space-y-0.5">
                    <p className="text-label-md font-bold text-on-surface">Crowd Density Alert</p>
                    <p className="text-body-sm text-on-surface-variant opacity-70">Trigger alert when a section reaches capacity limit</p>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="text-label-md font-bold text-secondary text-right min-w-[40px]">{crowdDensityThreshold}%</span>
                    <input 
                      id="range-crowd-density-threshold"
                      type="range"
                      min="50"
                      max="100"
                      value={crowdDensityThreshold}
                      onChange={(e) => setCrowdDensityThreshold(Number(e.target.value))}
                      className="w-32 h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-secondary"
                    />
                  </div>
                </div>

                {/* Revenue Leakage Slider */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm group pt-md border-t border-outline-variant/20">
                  <div className="space-y-0.5">
                    <p className="text-label-md font-bold text-on-surface">Revenue Leakage Detection</p>
                    <p className="text-body-sm text-on-surface-variant opacity-70">Monitor POS discrepancies over threshold</p>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="text-label-md font-bold text-secondary text-right min-w-[40px]">${revenueLeakageThreshold}+</span>
                    <input 
                      id="range-revenue-leakage-threshold"
                      type="range"
                      min="100"
                      max="2000"
                      step="50"
                      value={revenueLeakageThreshold}
                      onChange={(e) => setRevenueLeakageThreshold(Number(e.target.value))}
                      className="w-32 h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-secondary"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Simulated Live Variables Tweak Card (Retaining full interactive capabilities) */}
            <section id="card-simulation-variables" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface">Live Event Telemetry Variables</h2>
              </div>

              <div className="space-y-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Attendance slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>SIMULATED ATTENDANCE</span>
                      <span className="text-primary font-extrabold">{simulation.attendance.toLocaleString()} fans</span>
                    </div>
                    <input 
                      id="slider-attendance"
                      type="range"
                      min="10000"
                      max="50000"
                      step="500"
                      value={simulation.attendance}
                      onChange={(e) => handleNumericParamChange('attendance', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[11px] text-slate-400 font-medium leading-tight">
                      Simulates active stadium occupancy. Drives total fan density and queue sizes.
                    </p>
                  </div>

                  {/* Target Staffing slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>TARGET STAFF DEPLOYMENT</span>
                      <span className="text-primary font-extrabold">{simulation.targetStaff} staff</span>
                    </div>
                    <input 
                      id="slider-target-staff"
                      type="range"
                      min="350"
                      max="500"
                      step="5"
                      value={simulation.targetStaff}
                      onChange={(e) => handleNumericParamChange('targetStaff', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[11px] text-slate-400 font-medium leading-tight">
                      Adjusts baseline stadium resource capacity. Impacts dispatch cost metrics.
                    </p>
                  </div>

                  {/* Concession queue time slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>AVG QUEUE WAIT TIME</span>
                      <span className="text-primary font-extrabold">{(simulation.avgQueueTimeSeconds / 60).toFixed(1)} min</span>
                    </div>
                    <input 
                      id="slider-avg-queue-time"
                      type="range"
                      min="60"
                      max="400"
                      step="5"
                      value={simulation.avgQueueTimeSeconds}
                      onChange={(e) => handleNumericParamChange('avgQueueTimeSeconds', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[11px] text-slate-400 font-medium leading-tight">
                      Modifies current average queue delay. Alerts fire if latency spikes above 3 mins.
                    </p>
                  </div>

                  {/* Total Revenue Goal slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>REVENUE TARGET GOAL</span>
                      <span className="text-primary font-extrabold">${(simulation.revenueGoal / 1000000).toFixed(2)}M</span>
                    </div>
                    <input 
                      id="slider-revenue-goal"
                      type="range"
                      min="1000000"
                      max="2000000"
                      step="50000"
                      value={simulation.revenueGoal}
                      onChange={(e) => handleNumericParamChange('revenueGoal', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[11px] text-slate-400 font-medium leading-tight">
                      Event revenue goal. Recalculates financial KPI meters on Revenue tab.
                    </p>
                  </div>

                </div>
              </div>
            </section>

          </div>

          {/* Column B: Right side (Span 5 on desktop) */}
          <div className="col-span-12 lg:col-span-5 space-y-gutter">
            
            {/* System Integrations Card */}
            <section id="card-system-integrations" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-tertiary-container/20 text-tertiary rounded-lg">
                  <Cpu className="w-6 h-6 text-orange-600" />
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface">System Integrations</h2>
              </div>
              
              <div className="space-y-md">
                {integrations.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-outline-variant/20 hover:border-tertiary/50 transition-colors cursor-pointer group dark:bg-surface-container"
                    >
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                          <IconComp className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-label-md font-bold text-on-surface">{item.name}</p>
                          <p className="text-body-sm text-on-surface-variant opacity-60">{item.status}</p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity -rotate-90" />
                    </div>
                  );
                })}
                
                <button 
                  id="btn-add-integration"
                  onClick={handleAddNewIntegration}
                  className="w-full py-3 border-2 border-dashed border-outline-variant rounded-lg text-label-md font-bold text-on-surface-variant hover:border-tertiary hover:text-tertiary transition-all cursor-pointer text-center"
                >
                  + Add New Integration
                </button>
              </div>
            </section>

            {/* Data & Export Card */}
            <section id="card-data-export" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Database className="w-6 h-6" />
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface">Data &amp; Export</h2>
              </div>
              
              <div className="space-y-md">
                <div className="bg-primary/5 p-md rounded-xl space-y-sm border border-primary/10">
                  <div className="flex justify-between items-center">
                    <p className="text-label-md font-bold text-primary">Automated Reports</p>
                    <button 
                      id="btn-toggle-reports"
                      onClick={() => setReportsEnabled(!reportsEnabled)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${reportsEnabled ? 'bg-primary text-on-primary' : 'bg-slate-300 text-slate-700'}`}
                    >
                      {reportsEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-body-sm text-on-surface-variant opacity-80 leading-relaxed">
                    Daily operational summaries sent to board members at 06:00 AM UTC.
                  </p>
                  <button 
                    id="btn-manage-schedule"
                    onClick={() => alert("Report scheduler options open.")}
                    className="text-label-md font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Manage Schedule <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* API Key Access */}
                <div className="space-y-xs pt-xs">
                  <label className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter">Live API Access Key</label>
                  <div className="flex items-center gap-sm">
                    <div className="relative flex-grow">
                      <input 
                        id="input-api-key"
                        type={apiKeyVisible ? "text" : "password"} 
                        value={apiKeyValue}
                        readOnly
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-md pr-10 py-sm text-body-md font-mono text-on-surface dark:bg-surface-container outline-none"
                      />
                      <button 
                        id="btn-toggle-key-visibility"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      >
                        {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button 
                      id="btn-copy-api-key"
                      onClick={handleCopyKey}
                      className="p-2 bg-surface-container-high hover:bg-surface-variant rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Copy API Key"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Exposing System IDs and Typed Credentials */}
                <div className="border-t border-outline-variant/20 pt-md mt-md space-y-md">
                  <div className="flex items-center justify-between">
                    <p className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter">Typed Identifiers &amp; credentials</p>
                    <button
                      onClick={() => setIdsVisible(!idsVisible)}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      {idsVisible ? "Hide System IDs" : "Expose System IDs"}
                    </button>
                  </div>
                  
                  {idsVisible && (
                    <div className="space-y-sm p-sm bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs dark:bg-slate-900/40">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Stadium Identifier (stadiumId)</span>
                        <code className="block bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                          {systemIDs.stadiumId}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">IoT Hub Identifier (iotHubId)</span>
                        <code className="block bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                          {systemIDs.iotHubId}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">POS Terminal Identifier (posTerminalId)</span>
                        <code className="block bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                          {systemIDs.posTerminalId}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">CCTV Feed Stream ID (cctvStreamId)</span>
                        <code className="block bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                          {systemIDs.cctvStreamId}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Gemini API Connection State</span>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                          <span className={`w-2 h-2 rounded-full ${apiConfig.geminiApiKey.includes('•') ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                          <span className="font-mono text-[11px]">{apiConfig.geminiApiKey}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Operational App URL (appUrl)</span>
                        <code className="block bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                          {apiConfig.appUrl}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Failure Injector Section (Retaining full interactive capabilities) */}
            <section id="card-failure-injector" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface">Failure Injector (Live Testing)</h2>
              </div>
              <p className="text-body-sm text-slate-500 mb-4 leading-relaxed">
                Inject custom crowd failures to test how AI dispatches, charts, and metrics update in real-time.
              </p>

              <div className="space-y-3">
                <button 
                  id="btn-fail-gate-surge"
                  onClick={() => handleTriggerIncident('gate_surge')}
                  className="w-full text-left p-3 rounded-xl border border-red-100 hover:bg-red-50 text-red-700 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-extrabold">Surge Gate A Entry congestion</div>
                    <div className="text-[10px] text-red-500 font-medium">Adds critical delay bottleneck</div>
                  </div>
                  <Users className="w-4 h-4 text-red-500" />
                </button>

                <button 
                  id="btn-fail-spill"
                  onClick={() => handleTriggerIncident('spill')}
                  className="w-full text-left p-3 rounded-xl border border-amber-100 hover:bg-amber-50 text-amber-800 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-extrabold">Simulate Floor spill concession</div>
                    <div className="text-[10px] text-amber-600 font-medium">Janitorial slip risk hotspot</div>
                  </div>
                  <Trash2 className="w-4 h-4 text-amber-500" />
                </button>

                <button 
                  id="btn-fail-wifi"
                  onClick={() => handleTriggerIncident('wifi_fail')}
                  className="w-full text-left p-3 rounded-xl border border-amber-100 hover:bg-amber-50 text-amber-800 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-extrabold">VIP broadband connection loss</div>
                    <div className="text-[10px] text-amber-600 font-medium">Triggers revenue leakage leak</div>
                  </div>
                  <Zap className="w-4 h-4 text-amber-500" />
                </button>

                {/* Reset simulation telemetry */}
                <button 
                  id="btn-reset-simulation-telemetry"
                  onClick={() => {
                    onReset();
                    alert('Simulation telemetry restarted and restored to default baseline configurations.');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow mt-4"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Event Telemetry
                </button>
              </div>
            </section>

          </div>

          {/* Section 4: Access Control (Full Width - Col Span 12) */}
          <section id="section-access-control" className="col-span-12">
            <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-outline-variant/30 pb-md mb-md">
                <div className="flex items-center gap-md">
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </span>
                  <h2 className="text-headline-md font-headline-md text-on-surface">Access Control &amp; Role Management</h2>
                </div>
                <button 
                  id="btn-define-role"
                  onClick={handleDefineRole}
                  className="bg-secondary-container text-on-secondary-container px-md py-sm rounded-lg font-bold text-label-md hover:brightness-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Define New Role
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-label-sm font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30">
                      <th className="pb-md px-md">Staff Role</th>
                      <th className="pb-md px-md">Primary Permissions</th>
                      <th className="pb-md px-md">Access Level</th>
                      <th className="pb-md px-md text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-md text-on-surface">
                    {roles.map((r) => (
                      <tr key={r.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                        <td className="py-md px-md font-bold">{r.role}</td>
                        <td className="py-md px-md opacity-85">{r.permissions}</td>
                        <td className="py-md px-md">
                          <span className={`px-sm py-1 rounded-full text-label-sm font-bold border ${r.levelColor}`}>
                            {r.level}
                          </span>
                        </td>
                        <td className="py-md px-md text-right">
                          <button 
                            onClick={() => alert(`Modify permissions for ${r.role}`)}
                            className="text-primary font-bold hover:underline cursor-pointer"
                          >
                            Edit Permissions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* Right Column: AI Insights Sidebar (Visual match for settings sidebar) */}
      <aside id="aside-ai-insights" className="hidden xl:flex flex-col p-md w-[320px] shrink-0 border border-outline-variant bg-surface-container-low rounded-xl z-35 space-y-md h-fit">
        <div className="flex items-center gap-sm pb-md border-b border-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface">AI Insights</h3>
            <p className="text-label-sm text-on-surface-variant opacity-70">Real-time Assistant</p>
          </div>
        </div>
        
        <div className="space-y-md flex-grow">
          {/* Optimization Suggestion Box */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
            <div className="flex items-center gap-sm text-tertiary">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="text-label-md font-bold uppercase tracking-wider">Optimization Tip</span>
            </div>
            <p className="text-body-sm text-on-surface leading-relaxed">
              Your current <span className="font-bold">Crowd Alert</span> threshold is at <span className="text-secondary font-bold">{crowdDensityThreshold}%</span>. Data from the last 3 events suggests lowering this to <span className="font-bold text-primary">80%</span> to avoid entrance bottlenecks.
            </p>
            {crowdDensityThreshold !== 80 && (
              <button 
                id="btn-apply-ai-suggestion"
                onClick={handleApplySuggestion}
                className="w-full py-2 bg-tertiary text-on-tertiary hover:brightness-110 rounded-lg font-bold text-label-md cursor-pointer transition-all text-center text-white"
              >
                Apply Suggestion
              </button>
            )}
            {crowdDensityThreshold === 80 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg justify-center">
                <CheckCircle className="w-4 h-4" />
                Optimized to 80%
              </div>
            )}
          </div>

          {/* AI Links list */}
          <div className="space-y-sm">
            <a href="#ai" className="flex items-center gap-md p-md text-tertiary font-bold border-l-4 border-tertiary bg-tertiary/5 rounded-r-lg">
              <Bot className="w-5 h-5" />
              <span className="text-label-md">AI Assistant</span>
            </a>
            <a href="#predictions" className="flex items-center gap-md p-md text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:opacity-100 transition-all rounded-lg group">
              <LineChart className="w-5 h-5 group-hover:text-tertiary" />
              <span className="text-label-md">Predictions</span>
            </a>
            <a href="#bottlenecks" className="flex items-center gap-md p-md text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:opacity-100 transition-all rounded-lg group">
              <AlertTriangle className="w-5 h-5 group-hover:text-error" />
              <span className="text-label-md">Bottlenecks</span>
            </a>
          </div>
        </div>

        {/* Bottom Operator Presence Indicator */}
        <div className="pt-md border-t border-outline-variant/30 mt-auto">
          <div className="flex items-center gap-md px-base">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-high overflow-hidden">
                <img 
                  alt="Staff A" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-high overflow-hidden">
                <img 
                  alt="Staff B" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-high overflow-hidden bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                +2
              </div>
            </div>
            <span className="text-label-sm text-on-surface-variant font-medium">4 Active Operators</span>
          </div>
        </div>
      </aside>

    </div>
  );
}
