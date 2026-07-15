import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Wrench, 
  Cpu, 
  Users, 
  ShieldAlert, 
  FileText, 
  Code, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  PhoneCall, 
  MessageSquare, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { SimulationState } from '../types';
import { generateUUID } from '../utils/uuid';

interface HelpScreenProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
}

interface Article {
  id: string;
  title: string;
  description: string;
  category: 'hardware' | 'updates' | 'staffing' | 'protocols';
}

export default function HelpScreen({ simulation, setSimulation }: HelpScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    { sender: 'agent', text: "Hello Admin! Stadium VIP Operations support line is active. How can we help you coordinate matches today?", time: "09:20" }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Loaded tickets from backend DB
  const [loadedTickets, setLoadedTickets] = useState<{ id: string; subject: string; message: string; status: string; created: string }[]>([]);

  // Diagnostics state
  const [diagnosticsResult, setDiagnosticsResult] = useState<string | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setLoadedTickets(data);
      }
    } catch (err) {
      console.warn('Backend offline. Loaded tickets fallback to local state.');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const articles: Article[] = [
    { id: '1', title: 'Gate C Turnstile Reset', description: 'Locate physical override under primary kiosk base, hold 5s until LED blinks yellow.', category: 'hardware' },
    { id: '2', title: 'Concession POS Offline Sync', description: 'POS terminals auto-buffer and queue payments locally, syncing on mesh restore.', category: 'hardware' },
    { id: '3', title: 'Evacuation PA Override', description: 'Emergency alarm system automatically takes precedence on all channels.', category: 'protocols' },
    { id: '4', title: 'Staff Roster Push Alerts', description: 'Force updates to operators by pressing Smart Reassign in the Staffing pane.', category: 'staffing' },
    { id: '5', title: 'Firmware v4.2 Patch Notes', description: 'Improves contactless NFC latency by 45ms and fixes scanner timeouts.', category: 'updates' },
    { id: '6', title: 'VIP Lounge Entry Protocols', description: 'Verify encrypted credentials using direct NFC reading or manual QR entry.', category: 'protocols' },
    { id: '7', title: 'Staffing Heatmap Thresholds', description: 'Zones mark yellow at 120s queue wait and flashing red at 240s queue wait.', category: 'staffing' },
    { id: '8', title: 'Database Cold Reboots', description: 'If telemetry feed halts, click Reset Telemetry in the Settings tab.', category: 'updates' }
  ];

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = { sender: 'user' as const, text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setNewMessage('');

    // Simulate auto-agent support reply after a small delay
    setTimeout(() => {
      let replyText = "Received your operational log. Analyzing stadium telemetry coordinates to address the issue...";
      if (newMessage.toLowerCase().includes('gate') || newMessage.toLowerCase().includes('turnstile')) {
        replyText = "Gate sensors are responding. Turnstile override command sent. Confirming reset status...";
      } else if (newMessage.toLowerCase().includes('staff') || newMessage.toLowerCase().includes('reassign')) {
        replyText = "Steward dispatch signals updated. Reassigned operators should receive notifications momentarily.";
      }
      
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) return;

    setTicketStatus('submitting');
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketDetails
        })
      });
      if (res.ok) {
        setTicketStatus('success');
        setTicketSubject('');
        setTicketDetails('');
        fetchTickets(); // Refresh list!
        
        // Log ticket to audit log as well (State Consistency Point 15)
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: "Console Operator",
            action: "Ticket Filed",
            details: `Urgent support ticket created: "${ticketSubject}"`
          })
        });

        setTimeout(() => setTicketStatus('idle'), 4000);
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      // Local fallback if server offline
      setLoadedTickets(prev => [
        ...prev,
        {
          id: 't_local_' + generateUUID(),
          subject: ticketSubject,
          message: ticketDetails,
          status: 'open',
          created: new Date().toISOString()
        }
      ]);
      setTicketStatus('success');
      setTicketSubject('');
      setTicketDetails('');
      setTimeout(() => setTicketStatus('idle'), 4000);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: "Console Operator",
          action: "Feedback Submitted",
          details: `User submitted suggestion: "${feedbackText.substring(0, 100)}..."`
        })
      });
    } catch (err) {
      console.warn('Offline audit log failed.');
    }

    setFeedbackText('');
    setTimeout(() => setFeedbackSubmitted(false), 4500);
  };

  const runHelpDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnosticsResult('Executing full-stack operational telemetry sweep...');
    
    const start = Date.now();
    try {
      const healthRes = await fetch('/api/health');
      const healthData = healthRes.ok ? await healthRes.json() : null;
      
      const configRes = await fetch('/api/config');
      const configData = configRes.ok ? await configRes.json() : null;

      const duration = Date.now() - start;
      const waitTime = simulation.avgQueueTimeSeconds;
      
      let advice = '';
      if (!healthData) {
        advice = 'CRITICAL DIAGNOSTICS ALERT: The Node/Express backend server appears to be unreachable. Check sandbox gateway routes.';
      } else {
        advice = `[200 OK Handshake: ${duration}ms] Backend operational (Status: "${healthData.status}").\n` +
                 `Active GCP Colosseum ID: "${configData?.stadiumId || 'stadium_stg_coliseum_99b'}".\n` +
                 `Operational Metrics: Sentiment is ${simulation.fanSentiment}%, standard queue delay is ${waitTime}s.\n`;
        
        if ((simulation.incidentsPending ?? 0) > 0) {
          advice += `RECOMMENDATION: Deploy staff reinforcements immediately to clear the ${simulation.incidentsPending ?? 0} unresolved gate/retail hotspots.`;
        } else if (waitTime > 200) {
          advice += 'RECOMMENDATION: Queue times are elevated. Trigger temporary 15% discount or increase Concessions target thresholds.';
        } else {
          advice += 'RECOMMENDATION: All systems nominal. Active POS turnstiles are reporting high throughput.';
        }
      }
      setDiagnosticsResult(advice);
    } catch (err) {
      setDiagnosticsResult('DIAGNOSTICS ERROR: Failed to communicate with sandbox API channels. Check local server stack.');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleDownloadResource = (resource: 'manual' | 'api' | 'firmware') => {
    let content = '';
    let filename = '';
    let contentType = 'text/plain';

    if (resource === 'manual') {
      content = `STADIUMOPS PRO CONSOLE SUITE
===========================
MANUAL EDITION 2024 - CONFIDENTIAL
For Authorized GCP Operations Stewards Only

1. TURNSTILE DEVICE MANAGEMENT
   If Gate turnstile counters lag or freeze, hold the physical manual override
   button under the base housing for 5 seconds until status LED flashes Amber.
   You can also reboot device clusters remotely via the Settings tab.

2. POS PAYMENT OFFLINE BUFFERING
   All terminal micro-controllers buffer up to 400 transaction records locally
   during wireless network drops. On mesh recovery, transaction logs will auto-sync
   and post back to the central gateway database.
`;
      filename = 'stadiumops_operator_manual_2024.txt';
    } else if (resource === 'api') {
      content = `# StadiumOps Core Operational Telemetry REST API
==================================================

All endpoints require credential handshakes starting with 'sk_stadiumops_' header.

## GET /api/simulation
Returns live dashboard variable synchronizer payload.
Response:
{
  "attendance": 34500,
  "activeStaff": 382,
  "avgQueueTimeSeconds": 195,
  "revenueGoal": 1500000,
  "isOnline": true
}

## POST /api/tickets
Submit a new support ticket to the backend database.
Request body: { "subject": "Gate C turnstile queue", "message": "Queue times elevated" }
`;
      filename = 'stadiumops_api_endpoints.md';
    } else {
      content = JSON.stringify({
        bundleId: "fw_stadium_coliseum_v4.2.3",
        buildDate: "2026-07-15T07:38:48Z",
        targetHardware: "NFC_Reader_Terminals_A2",
        romVersion: "4.2.3",
        payloadChecksum: "0x8f7d6a2e",
        modules: [
          { name: "NFC_Driver", size: 1024, version: "2.1.0" },
          { name: "Offline_Buffer_Manager", size: 2048, version: "3.5.1" }
        ]
      }, null, 2);
      filename = 'stadiumops_firmware_v4.2.json';
      contentType = 'application/json';
    }

    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter articles based on category select and search query
  const filteredArticles = articles.filter(art => {
    const matchesCategory = !selectedCategory || art.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqs = [
    {
      q: "How do I reset a gate controller?",
      a: "To reset a gate controller, locate the physical override button on the underside of the kiosk. Hold for 5 seconds until the status LED flashes Amber. Alternatively, use the 'Venue Management' tab in your dashboard to perform a remote soft-reboot."
    },
    {
      q: "What if the POS system loses Wi-Fi?",
      a: "All POS units are equipped with 'Offline Mode.' Transactions will be stored locally and synced automatically once the stadium's secondary mesh network restores connectivity. Ensure you have the 'Offline Sync' toggle enabled in Concession Settings."
    },
    {
      q: "Can I reassign staff mid-event?",
      a: "Yes. Navigate to the 'Staffing' module, select the active heat map to identify over-staffed zones, and use the 'Smart Reassign' button. Staff will receive a push notification with their new sector assignment immediately."
    },
    {
      q: "How is VIP lounge access validated?",
      a: "VIP access is validated via encrypted NFC or dynamic QR codes. If a guest's credential fails, check their profile status in the 'Ticketing' search. Real-time validation requires the VIP Hub server to be in 'Active' state."
    }
  ];

  return (
    <div className="space-y-xl animate-fade-in">
      
      {/* Search & Hero Header Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-center justify-center p-md md:p-xl shadow-lg border border-outline-variant">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center brightness-[0.4]" 
            style={{ 
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDkjN51cqt6tU8IabwvaJ_Zv4aO0b8IZxAAM4Gm1sVKp1pJIDFh6vd--YWJtheSKn4EYwdvl_dvHq6xF9tcGickkBCASEJIOrS8QPnHO9KhZpgL8g8FHSmJnKU_wZGCY929bZtu_119CDQPgj751jcan7Iaw8U1DfXR2WBXOEiRwFOIMLXhWHUJLsWpEAjaduiVYg0fFB0AubvMC0x7cpdzo4VDcJtcRAAoAWt9N74bjWQYdvyleYqho-dupj6YtpIGMl06-Rg8C0I")` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-black/20" />
        </div>
        <div className="relative z-10 text-center w-full max-w-2xl px-sm">
          <h2 className="text-3xl md:text-display-lg font-display-lg text-white mb-md drop-shadow-md">
            How can we help, Admin?
          </h2>
          <div className="relative group transition-all duration-300 transform focus-within:scale-[1.02]">
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-xl pr-md rounded-2xl bg-white/95 backdrop-blur-md border-none focus:ring-4 focus:ring-secondary-fixed shadow-2xl text-body-lg font-body-lg text-on-surface" 
              placeholder="Search for error codes, manuals, or troubleshooting..." 
              type="text"
            />
            <Search className="absolute left-md top-1/2 -translate-y-1/2 text-primary w-7 h-7" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface font-bold text-sm bg-slate-100 px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Resource Categories Grid */}
      <section className="space-y-sm">
        <div className="flex items-center justify-between mb-sm">
          <div>
            <h3 className="text-headline-lg font-headline-lg text-slate-900">Knowledge Base</h3>
            <p className="text-xs text-on-surface-variant">Browse standard operational diagnostic and repair logs</p>
          </div>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full"
            >
              Reset Category Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Category Card 1 */}
          <div 
            onClick={() => setSelectedCategory(selectedCategory === 'hardware' ? null : 'hardware')}
            className={`group p-md rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedCategory === 'hardware' 
                ? 'bg-primary-fixed border-primary shadow-md' 
                : 'bg-surface-container-lowest border-outline-variant hover:border-primary hover:shadow-lg'
            }`}
          >
            <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary mb-md group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-headline-md font-headline-md mb-sm text-slate-900">Hardware</h4>
            <p className="text-body-md font-body-md text-on-surface-variant mb-md leading-relaxed">
              Troubleshooting for turnstiles, gate kiosks, and VIP lounge readers.
            </p>
            <div className="text-label-sm font-label-sm text-primary font-bold">3 Articles</div>
          </div>

          {/* Category Card 2 */}
          <div 
            onClick={() => setSelectedCategory(selectedCategory === 'updates' ? null : 'updates')}
            className={`group p-md rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedCategory === 'updates' 
                ? 'bg-secondary-fixed border-secondary shadow-md' 
                : 'bg-surface-container-lowest border-outline-variant hover:border-primary hover:shadow-lg'
            }`}
          >
            <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center text-on-secondary-fixed-variant mb-md group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-headline-md font-headline-md mb-sm text-slate-900">Updates</h4>
            <p className="text-body-md font-body-md text-on-surface-variant mb-md leading-relaxed">
              Software release updates, patches, firmware files, and deployment logs.
            </p>
            <div className="text-label-sm font-label-sm text-primary font-bold">2 Articles</div>
          </div>

          {/* Category Card 3 */}
          <div 
            onClick={() => setSelectedCategory(selectedCategory === 'staffing' ? null : 'staffing')}
            className={`group p-md rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedCategory === 'staffing' 
                ? 'bg-tertiary-fixed border-tertiary shadow-md' 
                : 'bg-surface-container-lowest border-outline-variant hover:border-primary hover:shadow-lg'
            }`}
          >
            <div className="w-12 h-12 bg-tertiary-fixed rounded-xl flex items-center justify-center text-tertiary mb-md group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-headline-md font-headline-md mb-sm text-slate-900">Staffing</h4>
            <p className="text-body-md font-body-md text-on-surface-variant mb-md leading-relaxed">
              Guide maps and on-duty instructions for event-day stewards.
            </p>
            <div className="text-label-sm font-label-sm text-primary font-bold">2 Articles</div>
          </div>

          {/* Category Card 4 */}
          <div 
            onClick={() => setSelectedCategory(selectedCategory === 'protocols' ? null : 'protocols')}
            className={`group p-md rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedCategory === 'protocols' 
                ? 'bg-error-container border-error shadow-md' 
                : 'bg-surface-container-lowest border-outline-variant hover:border-primary hover:shadow-lg'
            }`}
          >
            <div className="w-12 h-12 bg-error-container rounded-xl flex items-center justify-center text-error mb-md group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-headline-md font-headline-md mb-sm text-slate-900">Protocols</h4>
            <p className="text-body-md font-body-md text-on-surface-variant mb-md leading-relaxed">
              Evacuation protocols, safety overrides, and priority incident codes.
            </p>
            <div className="text-label-sm font-label-sm text-primary font-bold">2 Articles</div>
          </div>
        </div>

        {/* Dynamic filtered articles results block */}
        {(selectedCategory || searchQuery) && (
          <div className="p-md bg-surface-container-low rounded-2xl border border-outline-variant space-y-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Results ({filteredArticles.length} found)
            </h4>
            {filteredArticles.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic py-2">
                No matching documentation articles found. Try adjusting filters or searching a different term.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {filteredArticles.map(art => (
                  <div key={art.id} className="p-sm bg-white rounded-xl border border-slate-200/80 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-slate-400">ID: {art.id}</span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-800 mt-1">{art.title}</h5>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      {art.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Middle Section: Support, Diagnostics & Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Live Support Card (Left/ColSpan-2) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary via-[#004fbc] to-[#00398f] rounded-3xl p-lg text-on-primary shadow-xl relative overflow-hidden border border-primary-container">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary-container rounded-full opacity-20"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary-fixed rounded-full opacity-10"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-md">
            <div>
              <div className="flex items-center gap-sm mb-md bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white">Live Event Priority Support</span>
              </div>
              <h3 className="text-2xl md:text-headline-lg font-headline-lg mb-sm text-white leading-tight">
                Technical Support is Online
              </h3>
              <p className="text-body-md opacity-90 max-w-lg leading-relaxed text-slate-100">
                During live matches, your administrator account has premium VIP priority. 
                Our rapid-response engineers respond to active gate, POS, or staffing emergencies.
              </p>
            </div>

            {/* Interactive diagnostics tool in the help card */}
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 space-y-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-secondary-container" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Stadium Operations Live Diagnostics Monitor
                </h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={runHelpDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="px-4 py-2 bg-secondary-container hover:brightness-110 disabled:brightness-90 text-on-secondary-container font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md text-center shrink-0"
                >
                  {isRunningDiagnostics ? 'Scanning Telemetry...' : 'Run Stadium Health Diagnostics'}
                </button>
                {diagnosticsResult && (
                  <div className="p-2 bg-white/95 rounded-xl text-slate-800 text-[11px] font-mono leading-relaxed overflow-x-auto flex-1 border border-white/20">
                    <span className="font-bold text-primary block mb-0.5">Report Status:</span>
                    {diagnosticsResult}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-md pt-2">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-white text-primary px-xl py-md rounded-2xl font-bold flex items-center gap-sm hover:bg-slate-50 transition-colors shadow-lg cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                {isChatOpen ? 'Close Chat Feed' : 'Start Priority Chat'}
              </button>
              <a 
                href="tel:+18005553000"
                className="bg-primary-container text-white px-xl py-md rounded-2xl font-bold border border-white/20 flex items-center gap-sm hover:bg-white/10 transition-colors cursor-pointer text-center"
              >
                <PhoneCall className="w-5 h-5" />
                Call Hotline
              </a>
            </div>
          </div>
        </div>

        {/* Documentation Quick Links (Right) */}
        <div className="bg-surface-container-high rounded-3xl p-lg flex flex-col justify-between border border-outline-variant shadow-sm">
          <div>
            <h3 className="text-headline-lg font-headline-lg text-slate-900 mb-sm">Quick Resources</h3>
            <p className="text-xs text-on-surface-variant mb-md">Download manuals or copy active credentials endpoints</p>
            
            <div className="space-y-sm">
              <a 
                className="flex items-center justify-between p-md bg-white rounded-xl hover:shadow-md transition-all group border border-slate-200/80" 
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadResource('manual'); }}
              >
                <div className="flex items-center gap-sm">
                  <FileText className="text-on-surface-variant group-hover:text-primary w-5 h-5" />
                  <span className="text-label-md font-label-md text-slate-800 font-semibold">2024 Operator Manual</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">TXT</span>
              </a>

              <a 
                className="flex items-center justify-between p-md bg-white rounded-xl hover:shadow-md transition-all group border border-slate-200/80" 
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadResource('api'); }}
              >
                <div className="flex items-center gap-sm">
                  <Code className="text-on-surface-variant group-hover:text-primary w-5 h-5" />
                  <span className="text-label-md font-label-md text-slate-800 font-semibold">API Documentation</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">MD</span>
              </a>

              <a 
                className="flex items-center justify-between p-md bg-white rounded-xl hover:shadow-md transition-all group border border-slate-200/80" 
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadResource('firmware'); }}
              >
                <div className="flex items-center gap-sm">
                  <Cpu className="text-on-surface-variant group-hover:text-primary w-5 h-5" />
                  <span className="text-label-md font-label-md text-slate-800 font-semibold">Firmware Bundle v4.2</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">JSON</span>
              </a>
            </div>
          </div>

          <div className="mt-lg pt-md border-t border-outline-variant text-center">
            <p className="text-xs font-semibold text-on-surface-variant italic">
              System Sync: Today, 09:20 AM (UTC)
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Chat Drawer overlay */}
      {isChatOpen && (
        <div className="p-md bg-white border border-outline-variant rounded-2xl shadow-xl space-y-md animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
              <h4 className="text-sm font-bold text-slate-900">VIP Operational Chat Stream</h4>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
            >
              Hide Chat
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-sm pr-1">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-lg leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type urgent ticket description or command (e.g. 'Reset Section 114')..."
              className="flex-grow text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button 
              type="submit"
              className="p-2 bg-primary hover:bg-primary-container text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto py-md space-y-md">
        <h3 className="text-headline-lg font-headline-lg text-center text-slate-900">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-sm">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isOpen ? 'border-primary shadow-md scale-[1.005]' : 'border-outline-variant hover:border-slate-300'
                }`}
              >
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-md flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <span className="text-sm font-extrabold text-slate-800">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-md pt-0 text-xs text-on-surface-variant leading-relaxed border-t border-slate-50 bg-slate-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Help Footer CTA - Submit Tickets & Feedback */}
      <section className="bg-surface-container-high rounded-3xl p-lg text-center border border-outline-variant shadow-sm space-y-md">
        <div>
          <h4 className="text-headline-lg font-headline-lg text-slate-900">Still need assistance?</h4>
          <p className="text-body-md text-on-surface-variant mt-1.5">
            Submit a direct system ticket or report console feedback to our stadium ops development team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter text-left max-w-4xl mx-auto pt-sm">
          {/* Create a Ticket Form */}
          <div className="bg-white p-md rounded-2xl border border-slate-200/80 space-y-sm shadow-xs">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" />
              File Urgent Ticket
            </h5>
            
            {ticketStatus === 'success' ? (
              <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs space-y-1">
                <span className="font-bold">Ticket Submitted successfully!</span>
                <p>Engineers have received your stadium node coordinates and are reviewing.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-sm">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subject</label>
                  <input 
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                    placeholder="e.g., Gate C turnstile sensor lag"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Detailed description</label>
                  <textarea 
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    required
                    placeholder="Enter terminal logs, section locations or errors..."
                    rows={2}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={ticketStatus === 'submitting'}
                  className="w-full py-2 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {ticketStatus === 'submitting' ? 'Submitting Urgent Ticket...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>

          {/* Submit Feedback Form */}
          <div className="bg-white p-md rounded-2xl border border-slate-200/80 space-y-sm shadow-xs">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Submit App Feedback
            </h5>
            {feedbackSubmitted ? (
              <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs space-y-1">
                <span className="font-bold">Feedback received!</span>
                <p>Thank you for helping us improve StadiumOps Pro console suite.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-sm flex flex-col justify-between h-full">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Your suggestion</label>
                  <textarea 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                    placeholder="Tell us what visual layouts or interactive tools you would love to see next..."
                    rows={4}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Active Platform Tickets */}
      <section className="bg-white rounded-3xl p-lg border border-outline-variant shadow-sm space-y-md">
        <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
          <div>
            <h4 className="text-base font-display font-bold text-slate-900">Active Support Tickets</h4>
            <p className="text-xs text-on-surface-variant">
              Live synchronization with Node/Express persistent memory database
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">
            {loadedTickets.length} Sync'd
          </span>
        </div>

        {loadedTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-450 font-semibold italic">
            No active support tickets filed. Use the form above to submit ticket details.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Message Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">{ticket.id.substring(0, 8)}</td>
                    <td className="px-4 py-3 font-bold text-slate-950">{ticket.subject}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{ticket.message}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ticket.status === 'open' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
                      {new Date(ticket.created).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
