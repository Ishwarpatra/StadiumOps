import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  MapPin, 
  Settings, 
  Activity, 
  Clock, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  Wifi,
  WifiOff,
  Radio,
  Tv,
  Eye,
  LogOut,
  BellRing,
  HelpCircle,
  Search
} from 'lucide-react';

// Subscreens
import IntroScreen from './components/IntroScreen';
import DashboardScreen from './components/DashboardScreen';
import RevenueScreen from './components/RevenueScreen';
import StaffingScreen from './components/StaffingScreen';
import VenueScreen from './components/VenueScreen';
import SettingsScreen from './components/SettingsScreen';
import HelpScreen from './components/HelpScreen';

// Types and mock data
import { SimulationState, Hotspot, Bottleneck, AIActionItem } from './types';
import { 
  initialSimulation, 
  initialHotspots, 
  initialBottlenecks, 
  initialAIActionItems 
} from './data';
import { generateUUID } from './utils/uuid';

type AppTab = 'initializing' | 'dashboard' | 'revenue' | 'staffing' | 'venue' | 'settings' | 'help';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('initializing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Safe localStorage helper to prevent QuotaExceededError silent crashes (Point 8)
  const safeSetLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[STORAGE QUOTA OVERFLOW] LocalStorage quota exceeded while caching "${key}". Gracefully falling back to in-memory state.`, e);
    }
  };

  // Simulation parameters in unified React state with localStorage persistence and API backend synchronization (Point 1 & 15)
  const [simulation, setSimulation] = useState<SimulationState>(() => {
    const saved = localStorage.getItem('stadium_ops_simulation');
    return saved ? JSON.parse(saved) : initialSimulation;
  });
  const [hotspots, setHotspots] = useState<Hotspot[]>(() => {
    const saved = localStorage.getItem('stadium_ops_hotspots');
    return saved ? JSON.parse(saved) : initialHotspots;
  });
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>(() => {
    const saved = localStorage.getItem('stadium_ops_bottlenecks');
    return saved ? JSON.parse(saved) : initialBottlenecks;
  });
  const [aiActions, setAiActions] = useState<AIActionItem[]>(() => {
    const saved = localStorage.getItem('stadium_ops_aiActions');
    return saved ? JSON.parse(saved) : initialAIActionItems;
  });

  // Dynamic system-level notifications
  const [notifications, setNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('stadium_ops_notifications');
    return saved ? JSON.parse(saved) : [
      'System synced: Loaded 4 default hotspots.',
      'VIP Concourse Alpha ordering bottleneck detected.'
    ];
  });

  // Synchronize dynamic states with localStorage safely when updated (Quota-checked, Point 8)
  useEffect(() => {
    safeSetLocalStorage('stadium_ops_simulation', simulation);
  }, [simulation]);

  useEffect(() => {
    safeSetLocalStorage('stadium_ops_hotspots', hotspots);
  }, [hotspots]);

  useEffect(() => {
    safeSetLocalStorage('stadium_ops_bottlenecks', bottlenecks);
  }, [bottlenecks]);

  useEffect(() => {
    safeSetLocalStorage('stadium_ops_aiActions', aiActions);
  }, [aiActions]);

  useEffect(() => {
    safeSetLocalStorage('stadium_ops_notifications', notifications);
  }, [notifications]);

  // Real-time backend API synchronization & polling system (Points 1, 2, 5, 10, 15)
  useEffect(() => {
    let active = true;

    const syncWithBackend = async () => {
      try {
        // 1. Sync simulation parameters from server (Point 10)
        const simRes = await fetch('/api/simulation');
        if (!simRes.ok) throw new Error('Backend offline');
        const simData = await simRes.json();
        
        if (active) {
          setSimulation(prev => ({
            ...prev,
            ...simData,
            // Keep dynamic local additions like isLive
            isLive: prev.isLive
          }));
          setIsOnline(true);
        }

        // 2. Sync incidents & failure states (Point 5)
        const incRes = await fetch('/api/incidents');
        if (incRes.ok) {
          const incData = await incRes.json();
          if (active && Array.isArray(incData)) {
            // Map backend incidents to dynamic hotspots and bottlenecks (Point 5)
            const mappedHotspots: Hotspot[] = incData
              .filter(inc => inc.type !== 'revenue')
              .map(inc => ({
                id: inc.id,
                location: inc.location,
                priority: inc.priority,
                description: inc.description,
                status: inc.status,
                staffAssigned: inc.staffAssigned || 0,
                type: inc.type || 'security'
              }));
            
            const mappedBottlenecks: Bottleneck[] = incData
              .filter(inc => inc.type === 'revenue')
              .map(inc => ({
                id: inc.id,
                location: inc.location,
                severity: inc.priority === 'critical' ? 'critical' : inc.priority === 'high' ? 'high' : 'medium',
                description: inc.description,
                delayMinutes: inc.status === 'resolved' ? 0 : inc.priority === 'critical' ? 15 : 8
              }));

            // Merge with local states to preserve initial items if they aren't duplicates
            setHotspots(prev => {
              const nonSync = prev.filter(p => !p.id.startsWith('inc_') && p.id !== '1' && p.id !== '2');
              return [...mappedHotspots, ...nonSync];
            });

            setBottlenecks(prev => {
              const nonSync = prev.filter(p => !p.id.startsWith('inc_') && p.id !== 'inc_default_1' && p.id !== 'inc_default_2');
              return [...mappedBottlenecks, ...nonSync];
            });
          }
        }
      } catch (error) {
        console.warn('[BACKEND OFFLINE] Falling back to offline client-side simulation state.', error);
        if (active) {
          setIsOnline(false);
        }
      }
    };

    // Initial sync
    syncWithBackend();

    // Setup 5-second interval short-polling (Point 15)
    const intervalId = setInterval(syncWithBackend, 5000);

    // Dynamic browser offline/online detection (Point 8)
    const handleBrowserOnline = () => setIsOnline(true);
    const handleBrowserOffline = () => setIsOnline(false);
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
    };
  }, []);

  // Header functionality state hooks
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showGlobalSearchResults, setShowGlobalSearchResults] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showActivityPopover, setShowActivityPopover] = useState(false);
  const [showWifiPopover, setShowWifiPopover] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Toast System State
  interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', title?: string) => {
    const id = generateUUID();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    (window as any).showToast = showToast;
    return () => {
      delete (window as any).showToast;
    };
  }, []);

  // Real-time dynamic ticking clock (UTC representation)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const format = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentTime(format);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset helper
  const handleResetTelemetry = () => {
    localStorage.removeItem('stadium_ops_simulation');
    localStorage.removeItem('stadium_ops_hotspots');
    localStorage.removeItem('stadium_ops_bottlenecks');
    localStorage.removeItem('stadium_ops_aiActions');
    localStorage.removeItem('stadium_ops_notifications');

    setSimulation(initialSimulation);
    setHotspots(initialHotspots);
    setBottlenecks(initialBottlenecks);
    setAiActions(initialAIActionItems);
    setNotifications([
      'Simulation state re-initialized successfully.',
      'Refreshed all dynamic heatmap hotspots.'
    ]);
  };

  const handleNavigate = (tab: AppTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  // Skip / loading complete trigger
  const handleInitializationComplete = () => {
    setCurrentTab('dashboard');
  };

  const [diagnosticsResult, setDiagnosticsResult] = useState<string | null>(null);

  const handleDeployStaffDirectly = (hotspotId: string) => {
    setHotspots(prev => prev.map(h => {
      if (h.id === hotspotId) {
        return {
          ...h,
          staffAssigned: h.staffAssigned + 2,
          status: 'dispatched'
        };
      }
      return h;
    }));

    setSimulation(prev => ({
      ...prev,
      activeStaff: Math.min(prev.activeStaff + 2, prev.targetStaff)
    }));

    const targetH = hotspots.find(h => h.id === hotspotId);
    if (targetH) {
      setNotifications(prev => [
        `Direct Dispatch: Assigned 2 reinforcements to ${targetH.location}.`,
        ...prev
      ]);
    }
  };

  const handleGeneralStaffIncrement = () => {
    setSimulation(prev => ({
      ...prev,
      activeStaff: Math.min(prev.activeStaff + 1, prev.targetStaff + 10),
      targetStaff: Math.max(prev.targetStaff, prev.activeStaff + 1)
    }));
    setNotifications(prev => [
      `Operational Stewards Pool expanded: Dispatched 1 extra general duty steward.`,
      ...prev
    ]);
  };

  const runHelpDiagnostics = () => {
    setDiagnosticsResult('Scanning telemetry arrays...');
    setTimeout(() => {
      const activePending = hotspots.filter(h => h.status === 'pending').length;
      const waitTime = simulation.avgQueueTimeSeconds;
      let advice = '';

      if (activePending > 0) {
        advice = `Found ${activePending} pending crowd hot-zones. Recommend deploying staff stewards to concourses immediately to disperse lines.`;
      } else if (waitTime > 200) {
        advice = `Avg queue wait time is critical (${waitTime}s). Recommend adjusting concessions pricing or adding staff.`;
      } else {
        advice = `All operations normal. Concessions revenue is at $${simulation.concessionsRevenue.toLocaleString()} with average queue times optimized at ${waitTime}s.`;
      }
      setDiagnosticsResult(advice);
    }, 600);
  };

  if (currentTab === 'initializing') {
    return <IntroScreen onComplete={handleInitializationComplete} />;
  }

  const getTabLabel = (tab: AppTab) => {
    switch (tab) {
      case 'dashboard': return 'Live Dashboard';
      case 'revenue': return 'Revenue Concessions';
      case 'staffing': return 'Staffing Map';
      case 'venue': return 'Venue Sentiment';
      case 'settings': return 'Settings';
      default: return 'StadiumOps Pro';
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col md:flex-row antialiased overflow-hidden">
      
      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex flex-col py-md px-sm gap-xs w-[280px] h-full fixed left-0 top-0 border-r border-outline-variant bg-surface-container-low shadow-md flex-shrink-0 z-40 select-none overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-start px-sm pb-md border-b border-outline-variant mb-sm">
          <img 
            alt="StadiumOps Pro Logo" 
            className="w-12 h-12 rounded-lg mb-sm object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG3FcdfqmnjO5mK6s2_zjJrRzRihD4mra8Mg_wDN7tCnZ9BirRjNdC552XKnIP_hOBBvH-0xW8BR5kebMWyNhUNw1rpKnxoiWA71CvrVNNetTqTks7EmB7IkNBPHaSqmi7yypGz9eAIIcyxqnnbrOW8on7eE6qJS0w2405Xavxzev5bSJKbj3W3KSaVlZzUUftuAvrxxAWdz0w1jdQmNsIYxSeAkDFkQV4TOPCDu_GfZQwKdObtxTy0bjYo9jZU3nzotOS0Kdf_NI"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-headline-md font-headline-md font-extrabold text-primary leading-tight">StadiumOps Pro</h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-xs">Operational Control</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto font-label-md text-label-md">
          <button 
            id="nav-dashboard"
            onClick={() => handleNavigate('dashboard')}
            className={`flex items-center gap-sm px-sm py-sm rounded-lg font-semibold transition-all duration-200 w-full text-left cursor-pointer active:translate-x-1 ${
              currentTab === 'dashboard' 
                ? 'bg-primary-container text-on-primary-container font-semibold' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button 
            id="nav-revenue"
            onClick={() => handleNavigate('revenue')}
            className={`flex items-center gap-sm px-sm py-sm rounded-lg font-semibold transition-all duration-200 w-full text-left cursor-pointer active:translate-x-1 ${
              currentTab === 'revenue' 
                ? 'bg-primary-container text-on-primary-container font-semibold' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <DollarSign className="w-5 h-5 shrink-0" />
            <span>Revenue</span>
          </button>

          <button 
            id="nav-staffing"
            onClick={() => handleNavigate('staffing')}
            className={`flex items-center gap-sm px-sm py-sm rounded-lg font-semibold transition-all duration-200 w-full text-left cursor-pointer active:translate-x-1 ${
              currentTab === 'staffing' 
                ? 'bg-primary-container text-on-primary-container font-semibold' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span>Staffing</span>
          </button>

          <button 
            id="nav-venue"
            onClick={() => handleNavigate('venue')}
            className={`flex items-center gap-sm px-sm py-sm rounded-lg font-semibold transition-all duration-200 w-full text-left cursor-pointer active:translate-x-1 ${
              currentTab === 'venue' 
                ? 'bg-primary-container text-on-primary-container font-semibold' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Venue Management</span>
          </button>

          <button 
            id="nav-settings"
            onClick={() => handleNavigate('settings')}
            className={`flex items-center gap-sm px-sm py-sm rounded-lg font-semibold transition-all duration-200 w-full text-left cursor-pointer active:translate-x-1 ${
              currentTab === 'settings' 
                ? 'bg-primary-container text-on-primary-container font-semibold' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span>Settings</span>
          </button>
        </nav>

        {/* CTA */}
        <div className="px-sm py-sm">
          <button 
            onClick={() => setIsDeployModalOpen(true)}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:bg-surface-tint transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer font-bold shadow-sm"
          >
            Deploy Staff
          </button>
        </div>

        {/* Footer */}
        <div className="pt-sm border-t border-outline-variant space-y-xs">
          <button 
            onClick={() => handleNavigate('help')}
            className={`flex items-center gap-sm px-sm py-sm rounded-lg transition-colors w-full text-left cursor-pointer font-bold ${
              currentTab === 'help'
                ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span className="text-label-md font-label-md">Help Center</span>
          </button>
          <button 
            onClick={() => setCurrentTab('initializing')}
            className="flex items-center gap-sm px-sm py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors w-full text-left cursor-pointer font-bold"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-label-md font-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-[280px] w-full md:w-[calc(100vw-280px)] bg-[#F8F9FA]">
        
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-[64px] z-30 bg-surface shadow-sm border-b border-outline-variant flex-shrink-0 select-none">
          {/* Brand / Mobile Menu */}
          <div className="flex items-center space-x-md">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface cursor-pointer p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-headline-md font-headline-md font-bold text-primary">StadiumOps Pro</span>
          </div>

          {/* Global Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-md relative">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-sm text-outline w-4 h-4 pointer-events-none" />
              <input 
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowGlobalSearchResults(true);
                }}
                onFocus={() => setShowGlobalSearchResults(true)}
                className="w-full pl-lg pr-sm py-[8px] bg-surface-container rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-label-md font-label-md placeholder-outline focus:outline-none transition-all" 
                placeholder="Search operations, staff, or gates..." 
                type="text"
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setShowGlobalSearchResults(false);
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Floating Dropdown Results */}
            {showGlobalSearchResults && (
              <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-4 z-50 text-left max-h-[380px] overflow-y-auto space-y-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Results</span>
                  <button 
                    onClick={() => setShowGlobalSearchResults(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* If query is empty, show quick shortcuts */}
                {!globalSearchQuery ? (
                  <div className="space-y-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Quick Navigation</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { handleNavigate('dashboard'); setShowGlobalSearchResults(false); }}
                        className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                        Dashboard
                      </button>
                      <button 
                        onClick={() => { handleNavigate('revenue'); setShowGlobalSearchResults(false); }}
                        className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-primary" />
                        Revenue
                      </button>
                      <button 
                        onClick={() => { handleNavigate('staffing'); setShowGlobalSearchResults(false); }}
                        className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-primary" />
                        Staffing Map
                      </button>
                      <button 
                        onClick={() => { handleNavigate('help'); setShowGlobalSearchResults(false); }}
                        className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                        Help Center
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-sm">
                    {/* Render matching categories */}
                    {(() => {
                      const q = globalSearchQuery.toLowerCase();
                      
                      // 1. Matches Tabs
                      const matchedTabs = [
                        { name: 'Live Dashboard', tab: 'dashboard' as const, icon: LayoutDashboard },
                        { name: 'Revenue Concessions', tab: 'revenue' as const, icon: DollarSign },
                        { name: 'Staffing Map', tab: 'staffing' as const, icon: Users },
                        { name: 'Venue Sentiment', tab: 'venue' as const, icon: MapPin },
                        { name: 'Settings Control', tab: 'settings' as const, icon: Settings },
                        { name: 'Help Center & Docs', tab: 'help' as const, icon: HelpCircle }
                      ].filter(t => t.name.toLowerCase().includes(q));

                      // 2. Matches Hotspots (Safeguarded against undefined values)
                      const matchedHotspots = hotspots.filter(h => 
                        ((h && h.location) || '').toLowerCase().includes(q) ||
                        ((h && h.description) || '').toLowerCase().includes(q)
                      );

                      // 3. Matches Bottlenecks (Safeguarded against undefined values)
                      const matchedBottlenecks = bottlenecks.filter(b => 
                        ((b && b.location) || '').toLowerCase().includes(q) || 
                        ((b && b.description) || '').toLowerCase().includes(q)
                      );

                      // 4. Matches System actions
                      const systemActions = [
                        { name: 'Reset Telemetry / Simulation', action: handleResetTelemetry, icon: ShieldCheck },
                        { name: 'Expand Stewards active pool (+1)', action: handleGeneralStaffIncrement, icon: Users }
                      ].filter(a => a.name.toLowerCase().includes(q));

                      const totalResults = matchedTabs.length + matchedHotspots.length + matchedBottlenecks.length + systemActions.length;

                      if (totalResults === 0) {
                        return <p className="text-xs text-on-surface-variant italic text-center py-4">No results match "{globalSearchQuery}"</p>;
                      }

                      return (
                        <div className="space-y-md">
                          {/* Tabs list */}
                          {matchedTabs.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Navigation</p>
                              {matchedTabs.map(t => {
                                const TabIcon = t.icon;
                                return (
                                  <button
                                    key={t.tab}
                                    onClick={() => {
                                      handleNavigate(t.tab);
                                      setShowGlobalSearchResults(false);
                                      setGlobalSearchQuery('');
                                    }}
                                    className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer text-slate-700"
                                  >
                                    <TabIcon className="w-4 h-4 text-primary" />
                                    <span>{t.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Hotspots list */}
                          {matchedHotspots.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Stadium Hotspots</p>
                              {matchedHotspots.map(h => (
                                <div key={h.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                                  <button
                                    onClick={() => {
                                      handleNavigate('staffing');
                                      setShowGlobalSearchResults(false);
                                      setGlobalSearchQuery('');
                                    }}
                                    className="text-left text-xs font-semibold flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <MapPin className="w-4 h-4 text-amber-500" />
                                    <div>
                                      <span>{h.location}</span>
                                      <span className="text-[10px] text-slate-400 block">{h.description} • Priority: {h.priority.toUpperCase()}</span>
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeployStaffDirectly(h.id);
                                    }}
                                    className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md hover:bg-primary-container cursor-pointer"
                                  >
                                    + Deploy Staff
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Bottlenecks list */}
                          {matchedBottlenecks.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Concessions Bottlenecks</p>
                              {matchedBottlenecks.map(b => (
                                <button
                                  key={b.id}
                                  onClick={() => {
                                    handleNavigate('revenue');
                                    setShowGlobalSearchResults(false);
                                    setGlobalSearchQuery('');
                                  }}
                                  className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer text-slate-700"
                                >
                                  <DollarSign className="w-4 h-4 text-emerald-500" />
                                  <div>
                                    <span>{b.location}</span>
                                    <span className="text-[10px] text-slate-400 block">{b.description} • Wait Time: {b.delayMinutes} mins</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Actions list */}
                          {systemActions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Quick Operations</p>
                              {systemActions.map((a, idx) => {
                                const ActionIcon = a.icon;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      a.action();
                                      setShowGlobalSearchResults(false);
                                      setGlobalSearchQuery('');
                                    }}
                                    className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer text-slate-700"
                                  >
                                    <ActionIcon className="w-4 h-4 text-purple-500" />
                                    <span>{a.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-sm relative">
            {/* Trailing Icon Actions */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  setShowActivityPopover(false);
                  setShowWifiPopover(false);
                  setShowProfileDropdown(false);
                }}
                className="p-sm text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative cursor-pointer block"
                aria-label="Toggle notifications menu"
              >
                <BellRing className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-ping"></span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant p-4 z-50 text-left space-y-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Notifications</span>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic text-center py-4">No active system alerts.</p>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span>{notif}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const list = [
                        "Gate B sensor threshold exceeded: Queue is over 240 seconds!",
                        "Concession POS Alpha restored local connection.",
                        "Incident Log Alert: Section 112 medical help resolved.",
                        "Steward dispatch update: 2 attendants reallocated.",
                        "Weather Advisory: Extreme temperature alert for West Stands."
                      ];
                      const randNotif = list[Math.floor(Math.random() * list.length)];
                      setNotifications(prev => [randNotif, ...prev]);
                    }}
                    className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-primary font-bold rounded-xl transition-all cursor-pointer"
                  >
                    + Simulate Random Alert
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowActivityPopover(!showActivityPopover);
                  setShowNotificationsDropdown(false);
                  setShowWifiPopover(false);
                  setShowProfileDropdown(false);
                }}
                className="p-sm text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors cursor-pointer block"
                aria-label="Toggle metrics auditor popover"
              >
                <Activity className="w-5 h-5" />
              </button>

              {showActivityPopover && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant p-4 z-50 text-left space-y-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metrics Auditor</span>
                    <button 
                      onClick={() => setShowActivityPopover(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-sm">
                    {/* Metric 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Fan Sentiment</span>
                        <span className={`${simulation.fanSentiment >= 80 ? 'text-green-600' : 'text-amber-600'} font-bold`}>
                          {simulation.fanSentiment}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${simulation.fanSentiment}%` }}></div>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Average Queue Wait Time</span>
                        <span className={`${simulation.avgQueueTimeSeconds < 180 ? 'text-green-600' : 'text-rose-600'} font-bold`}>
                          {simulation.avgQueueTimeSeconds}s
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, (simulation.avgQueueTimeSeconds / 300) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Active Staff Coverage</span>
                        <span className="text-slate-800 font-bold">
                          {simulation.activeStaff} / {simulation.targetStaff}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, (simulation.activeStaff / simulation.targetStaff) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Audit trigger */}
                    <button
                      onClick={() => {
                        alert(`--- LIVE STADIUM DIAGNOSTICS REPORT ---\n` +
                              `• Match Status: Active Live Event\n` +
                              `• Total Concessions Revenue: $${simulation.concessionsRevenue.toLocaleString()}\n` +
                              `• Fan Satisfaction Sentiment: ${simulation.fanSentiment}%\n` +
                              `• Active Bottlenecks: ${bottlenecks.length}\n` +
                              `• Active Hotspots: ${hotspots.length}\n` +
                              `• Rating: ${simulation.fanSentiment >= 85 ? 'Grade A (Excellent)' : simulation.fanSentiment >= 70 ? 'Grade B (Fair)' : 'Grade C (High Latency)'}`);
                      }}
                      className="w-full text-center py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Generate Printable Audit Report
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowWifiPopover(!showWifiPopover);
                  setShowNotificationsDropdown(false);
                  setShowActivityPopover(false);
                  setShowProfileDropdown(false);
                }}
                className={`p-sm rounded-full transition-colors cursor-pointer block ${
                  isOnline ? 'text-on-surface-variant hover:bg-surface-container-high' : 'text-rose-600 hover:bg-rose-50 bg-rose-50 animate-pulse'
                }`}
                aria-label={isOnline ? "Network: Connected" : "Network: Offline Mode"}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </button>

              {showWifiPopover && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant p-4 z-50 text-left space-y-md">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Network Control Panel</span>
                    <button 
                      onClick={() => setShowWifiPopover(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Simulation Offline Mode</span>
                        <span className="text-[10px] text-slate-400 block">Buffer POS & turnstile logs locally</span>
                      </div>
                      <button
                        onClick={() => {
                          const newOnline = !isOnline;
                          setIsOnline(newOnline);
                          setNotifications(prev => [
                            `System network switched to ${newOnline ? 'ONLINE' : 'OFFLINE MODE'}.`,
                            ...prev
                          ]);
                          if (newOnline) {
                            showToast("Syncing offline POS payment logs and turnstile ticket validations to centralized database servers... Complete!", "success", "Network Synced");
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          !isOnline ? 'bg-rose-500' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            !isOnline ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-rose-500 animate-pulse'}`}></span>
                        <span>Gateway Connection: {isOnline ? 'ACTIVE (Central Hub)' : 'OFFLINE'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {isOnline 
                          ? 'All ticketing queues, revenue registers and steward coordinates are writing directly to Cloud databases.' 
                          : 'Offline mesh networking enabled. Transaction payloads are automatically queued in indexedDB/localStorage.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action */}
            <div className="hidden md:flex items-center px-sm py-xs bg-error-container text-on-error-container rounded-full space-x-xs font-label-md text-label-md mx-sm shadow-sm border border-error/20 select-none">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span>Live Event</span>
            </div>

            {!isOnline && (
              <div className="hidden lg:flex items-center px-sm py-xs bg-amber-100 text-amber-800 rounded-full space-x-xs font-label-md text-label-md mx-sm shadow-sm border border-amber-300 select-none animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Offline Mode Active</span>
              </div>
            )}

            {/* Profile */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotificationsDropdown(false);
                  setShowActivityPopover(false);
                  setShowWifiPopover(false);
                }}
                className="ml-sm focus:outline-none rounded-full ring-2 ring-transparent focus:ring-primary transition-shadow cursor-pointer block"
                aria-label="Toggle profile dropdown menu"
              >
                <img 
                  alt="Administrator Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxJYP4hQgTJMfZw1t2Cw3e_0iIE91kB1mQyWSjl55HfB6VMSflWc6Sxm6OAUE_XICmiP9EB-FQ_DyVxihc-Sivr0AfvjMpeIbGcSQbeDAmvKcakT1-Yq-xDO5BLVKoEZ_Gfl1QplVHnSn7VW5MFKnspTIFjiyF9UGtLvPUBvj5WXoIbUoLvTCyM16OksuPxg9b_yPW5qDP93vcIdE1wFuP3v0CxTCMHGTH3QKIKDo7JmGvxTW358hSDJTUx7El1Lu58f1g_LqC77k"
                  referrerPolicy="no-referrer"
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant p-4 z-50 text-left space-y-md">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Administrator Identity</span>
                    <button 
                      onClick={() => setShowProfileDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex items-center gap-sm">
                    <img 
                      alt="Administrator Profile" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxJYP4hQgTJMfZw1t2Cw3e_0iIE91kB1mQyWSjl55HfB6VMSflWc6Sxm6OAUE_XICmiP9EB-FQ_DyVxihc-Sivr0AfvjMpeIbGcSQbeDAmvKcakT1-Yq-xDO5BLVKoEZ_Gfl1QplVHnSn7VW5MFKnspTIFjiyF9UGtLvPUBvj5WXoIbUoLvTCyM16OksuPxg9b_yPW5qDP93vcIdE1wFuP3v0CxTCMHGTH3QKIKDo7JmGvxTW358hSDJTUx7El1Lu58f1g_LqC77k"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Admin Officer</h4>
                      <span className="text-xs font-mono text-slate-500 block">ishwarpatragod@gmail.com</span>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        Stadium Operations Director
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-sm space-y-xs">
                    <button
                      onClick={() => {
                        handleNavigate('settings');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer text-slate-700"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Control Panel Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavigate('help');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer text-slate-700"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Help Center & Manuals</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setCurrentTab('initializing');
                      }}
                      className="w-full text-left p-2 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out / Lock Console</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-outline-variant p-4 space-y-2 select-none z-40 shadow-md">
            <button 
              onClick={() => handleNavigate('dashboard')}
              className={`w-full flex items-center space-x-sm px-sm py-2 rounded-lg font-bold text-left cursor-pointer ${
                currentTab === 'dashboard' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-label-md font-label-md">Dashboard</span>
            </button>
            
            <button 
              onClick={() => handleNavigate('revenue')}
              className={`w-full flex items-center space-x-sm px-sm py-2 rounded-lg font-bold text-left cursor-pointer ${
                currentTab === 'revenue' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-label-md font-label-md">Revenue</span>
            </button>

            <button 
              onClick={() => handleNavigate('staffing')}
              className={`w-full flex items-center space-x-sm px-sm py-2 rounded-lg font-bold text-left cursor-pointer ${
                currentTab === 'staffing' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-label-md font-label-md">Staffing</span>
            </button>

            <button 
              onClick={() => handleNavigate('venue')}
              className={`w-full flex items-center space-x-sm px-sm py-2 rounded-lg font-bold text-left cursor-pointer ${
                currentTab === 'venue' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-label-md font-label-md">Venue Management</span>
            </button>

            <button 
              onClick={() => handleNavigate('settings')}
              className={`w-full flex items-center space-x-sm px-sm py-2 rounded-lg font-bold text-left cursor-pointer ${
                currentTab === 'settings' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-label-md font-label-md">Settings</span>
            </button>

            {/* Mobile Actions Drawer Footer */}
            <div className="pt-4 border-t border-outline-variant space-y-2">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsDeployModalOpen(true);
                }}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:bg-primary-container transition-colors cursor-pointer text-center"
              >
                Deploy Staff
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavigate('help');
                  }}
                  className={`flex-1 flex items-center justify-center space-x-sm py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    currentTab === 'help'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help Center</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentTab('initializing');
                  }}
                  className="flex-1 flex items-center justify-center space-x-sm py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Main Canvas */}
        <main className="flex-grow flex-1 overflow-y-auto p-margin-mobile pb-24 md:p-margin-desktop md:pb-6 bg-[#F8F9FA]">
          <div className={`${currentTab === 'settings' ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto space-y-lg`}>
        

          {currentTab === 'dashboard' && (
            <DashboardScreen 
              simulation={simulation}
              setSimulation={setSimulation}
              bottlenecks={bottlenecks}
              setBottlenecks={setBottlenecks}
              aiActions={aiActions}
              setAiActions={setAiActions}
              setHotspots={setHotspots}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'revenue' && (
            <RevenueScreen 
              simulation={simulation}
              setSimulation={setSimulation}
            />
          )}

          {currentTab === 'staffing' && (
            <StaffingScreen 
              simulation={simulation}
              setSimulation={setSimulation}
              hotspots={hotspots}
              setHotspots={setHotspots}
              setBottlenecks={setBottlenecks}
            />
          )}

          {currentTab === 'venue' && (
            <VenueScreen 
              simulation={simulation}
              setSimulation={setSimulation}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen 
              simulation={simulation}
              setSimulation={setSimulation}
              setHotspots={setHotspots}
              setBottlenecks={setBottlenecks}
              onReset={handleResetTelemetry}
            />
          )}

          {currentTab === 'help' && (
            <HelpScreen 
              simulation={simulation}
              setSimulation={setSimulation}
            />
          )}
        </div>
      </main>
    </div>

      {/* ─── QUICK DEPLOY STAFF MODAL ─── */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative flex flex-col max-h-[90vh] overflow-hidden">
            <button 
              onClick={() => setIsDeployModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Dispatched Resource Center</h2>
                <p className="text-xs text-slate-400 font-medium">Quick staff reinforcements dispatch</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Assign stadium stewards, gate officers, and guest relations specialists to active crowd bottlenecks and high-occupancy hotspots.
            </p>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Target Hotspots</h3>
              {hotspots.map(h => {
                const waitTime = h.priority === 'critical' ? 240 : h.priority === 'high' ? 180 : 90;
                const queueCount = h.priority === 'critical' ? 95 : h.priority === 'high' ? 60 : 30;
                return (
                  <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{h.location || 'Unknown Location'}</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                          {h.type || 'Security'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>Wait: <span className="font-bold text-slate-600">{waitTime}s</span></span>
                        <span>Queue: <span className="font-bold text-slate-600">{queueCount} fans</span></span>
                      </div>
                    </div>

                    <div>
                      {h.status === 'dispatched' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-xl border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Dispatched ({h.staffAssigned})
                        </span>
                      ) : h.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-100">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeployStaffDirectly(h.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Deploy Staff
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">General Reinforcements</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800">Add Stewards Pool</span>
                    <p className="text-xs text-slate-400 mt-0.5">Increments stadium active duty staff</p>
                  </div>
                  <button
                    onClick={handleGeneralStaffIncrement}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Deploy +1 Staff
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="text-xs text-slate-400">
                Active Staff on Duty: <span className="font-extrabold text-slate-800">{simulation.activeStaff} / {simulation.targetStaff}</span>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CLICK-AWAY BACKDROP OVERLAY ─── */}
      {(showNotificationsDropdown || showActivityPopover || showWifiPopover || showProfileDropdown || showGlobalSearchResults) && (
        <div 
          className="fixed inset-0 z-20 bg-transparent" 
          onClick={() => {
            setShowNotificationsDropdown(false);
            setShowActivityPopover(false);
            setShowWifiPopover(false);
            setShowProfileDropdown(false);
            setShowGlobalSearchResults(false);
          }}
        />
      )}

      {/* ─── TOAST NOTIFICATIONS SYSTEM ─── */}
      <div className="fixed bottom-20 md:bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          let bgClass = 'bg-slate-800 text-white';
          if (toast.type === 'success') bgClass = 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10';
          if (toast.type === 'error') bgClass = 'bg-rose-600 text-white shadow-lg shadow-rose-900/10';
          if (toast.type === 'warning') bgClass = 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/10';
          if (toast.type === 'info') bgClass = 'bg-blue-600 text-white shadow-lg shadow-blue-900/10';

          return (
            <div 
              key={toast.id}
              className={`p-4 rounded-xl border border-white/10 flex flex-col gap-1 transform transition-all duration-300 translate-y-0 opacity-100 pointer-events-auto ${bgClass}`}
            >
              {toast.title && <p className="font-bold text-[10px] tracking-wider uppercase opacity-90">{toast.title}</p>}
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </div>
          );
        })}
      </div>

      {/* ─── GLOBAL DEPLOY STAFF FAB ─── */}
      <button
        onClick={() => setIsDeployModalOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-4 rounded-full shadow-2xl transition-all flex items-center justify-center cursor-pointer group border border-blue-500/20 hover:shadow-blue-500/20 hover:shadow-xl"
        title="Deploy Staff"
        aria-label="Deploy Staff"
      >
        <Users className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold text-xs whitespace-nowrap">
          Deploy Staff
        </span>
      </button>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex items-center justify-around px-2 z-40 select-none">
        <button 
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentTab === 'dashboard' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Dashboard</span>
        </button>
        <button 
          onClick={() => handleNavigate('revenue')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentTab === 'revenue' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400'}`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Revenue</span>
        </button>
        <button 
          onClick={() => handleNavigate('staffing')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentTab === 'staffing' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Staffing</span>
        </button>
        <button 
          onClick={() => handleNavigate('venue')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentTab === 'venue' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400'}`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Venue</span>
        </button>
        <button 
          onClick={() => handleNavigate('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentTab === 'settings' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Settings</span>
        </button>
      </nav>

    </div>
  );
}

