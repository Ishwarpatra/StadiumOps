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
import { generateUUID } from '../utils/uuid';

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
  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', title?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(msg, type, title);
    } else {
      console.log(`[Toast Fallback] ${type.toUpperCase()}: ${msg}`);
    }
  };

  // General State loaded from localStorage
  const [fullName, setFullName] = useState(() => 
    localStorage.getItem('setting_fullName') || 'Alexander Thorne'
  );
  const [primaryEmail, setPrimaryEmail] = useState(() => 
    localStorage.getItem('setting_primaryEmail') || 'a.thorne@stadiumpro.ops'
  );
  const [systemLanguage, setSystemLanguage] = useState(() => 
    localStorage.getItem('setting_systemLanguage') || 'English (United States)'
  );
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  
  // Notification thresholds loaded from localStorage
  const [crowdDensityThreshold, setCrowdDensityThreshold] = useState(() => {
    const saved = localStorage.getItem('setting_crowdDensityThreshold');
    return saved ? Number(saved) : 85;
  });
  const [revenueLeakageThreshold, setRevenueLeakageThreshold] = useState(() => {
    const saved = localStorage.getItem('setting_revenueLeakageThreshold');
    return saved ? Number(saved) : 500;
  });

  // Security, Credentials, and System IDs
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [idsVisible, setIdsVisible] = useState(false);

  // Live API key validation state (Point 1, 3, 8)
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationError, setValidationError] = useState('');

  const handleValidateApiKey = async () => {
    setIsValidatingKey(true);
    setValidationStatus('idle');
    setValidationError('');
    try {
      const res = await fetch('/api/config/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: stadiumOpsApiKey })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
        setValidationError(data.error || 'Invalid API Key format.');
      }
    } catch (err) {
      setValidationStatus('invalid');
      setValidationError('Failed to connect to backend server for validation.');
    } finally {
      setIsValidatingKey(false);
    }
  };

  // Load editable values from localStorage or default env vars / safe placeholders
  const [stadiumOpsApiKey, setStadiumOpsApiKey] = useState(() => 
    localStorage.getItem('setting_stadiumOpsApiKey') || import.meta.env.VITE_STADIUM_OPS_API_KEY || ''
  );
  const [iotHubApiKey, setIotHubApiKey] = useState(() => 
    localStorage.getItem('setting_iotHubApiKey') || ''
  );
  const [posTerminalApiKey, setPosTerminalApiKey] = useState(() => 
    localStorage.getItem('setting_posTerminalApiKey') || ''
  );
  const [stadiumId, setStadiumId] = useState(() => 
    localStorage.getItem('setting_stadiumId') || import.meta.env.VITE_STADIUM_ID || ''
  );
  const [iotHubId, setIotHubId] = useState(() => 
    localStorage.getItem('setting_iotHubId') || import.meta.env.VITE_IOT_HUB_ID || ''
  );
  const [posTerminalId, setPosTerminalId] = useState(() => 
    localStorage.getItem('setting_posTerminalId') || import.meta.env.VITE_POS_TERMINAL_ID || ''
  );
  const [cctvStreamId, setCctvStreamId] = useState(() => 
    localStorage.getItem('setting_cctvStreamId') || import.meta.env.VITE_CCTV_STREAM_ID || ''
  );
  const [appUrl, setAppUrl] = useState(() => 
    localStorage.getItem('setting_appUrl') || import.meta.env.VITE_APP_URL || window.location.origin
  );

  // Dynamic config derived from states
  const apiConfig: APIConfig = {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "• • • • • • • • • • • • • • • •",
    stadiumOpsApiKey: stadiumOpsApiKey || "sk_stadiumops_placeholder_key_xxxx",
    iotHubApiKey: iotHubApiKey || "key_iot_mesh_placeholder_xxxx",
    posTerminalApiKey: posTerminalApiKey || "key_pos_hub_placeholder_xxxx",
    appUrl: appUrl || window.location.origin
  };

  const systemIDs: SystemIDs = {
    stadiumId: stadiumId || "stadium_stg_coliseum_99b",
    iotHubId: iotHubId || "hub_mesh_west_gate_c",
    posTerminalId: posTerminalId || "pos_alpha_vendor_42",
    cctvStreamId: cctvStreamId || "stream_unified_concourse_112"
  };

  const apiKeyValue = apiConfig.stadiumOpsApiKey;

  // Interactive GCP Web Services state
  const [selectedGcpServiceId, setSelectedGcpServiceId] = useState<string>('gcp_cloud_run');
  const [isPingingService, setIsPingingService] = useState(false);
  const [gcpPingConsoleLogs, setGcpPingConsoleLogs] = useState<string[]>([
    "[SYSTEM INFO] Ready to run live service ping diagnostics.",
    "Click 'Run Diagnostics Self-Test' to compile active operational telemetry logs."
  ]);

  const gcpServices = [
    {
      id: 'gcp_gke',
      category: 'Core Infrastructure & Compute',
      name: 'Google Kubernetes Engine (GKE)',
      status: 'Orchestrating Pods',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
      latency: '14ms',
      throughput: '18,420 req/s',
      description: 'Hosts high-performance stadium APIs and coordinate microservices. Automatically scales nodes based on game day traffic spikes.',
      command: 'gcloud container clusters get-credentials stadium-gke-cluster --region=us-central1',
      defaultLogs: [
        "Kubernetes Engine scheduler: reconciling replicaSets...",
        "Scaling: Added 4 new nodes to worker pool 'concourse-stewards-pool'",
        "All 24 active pods report HEALTHY status (ingress-controller OK)"
      ]
    },
    {
      id: 'gcp_cloud_run',
      category: 'Core Infrastructure & Compute',
      name: 'Google Cloud Run',
      status: 'Active Auto-scaling',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
      latency: '22ms',
      throughput: '5,120 req/s',
      description: 'Serves lightweight, serverless JSON event routes and endpoints. Automatically scales to zero during off-peak, non-event hours to prevent utility waste.',
      command: 'gcloud run deploy stadium-ops-api --source=. --region=us-central1',
      defaultLogs: [
        "Cloud Run environment variables injected successfully from Secret Manager.",
        "Listening on port 3000...",
        "Auto-scaled to 1 active container instance (cold start: 180ms)."
      ]
    },
    {
      id: 'gcp_cloud_functions',
      category: 'Core Infrastructure & Compute',
      name: 'Google Cloud Functions',
      status: 'Event-driven Triggers',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
      latency: '45ms',
      throughput: '850 invocations/min',
      description: 'Executes highly specialized code routines on-demand, such as compiling mobile food order tallies and firing transactional SMS receipts.',
      command: 'gcloud functions deploy processOrder --trigger-http --runtime=nodejs20',
      defaultLogs: [
        "Cloud Function trigger resolved: 'order_completed_topic'",
        "Compiled order details & pushed receipt payload to customer mobile.",
        "Execution completed in 42ms."
      ]
    },
    {
      id: 'gcp_vertex_ai',
      category: 'AI, Machine Learning & Computer Vision',
      name: 'Vertex AI Model Registry',
      status: 'Predictive Analytics Active',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
      latency: '110ms',
      throughput: '125 predictions/s',
      description: 'Hosts neural network and dynamic forecasting models to anticipate turnstile crowding patterns and recalculate ticket pricing metrics in real-time.',
      command: 'gcloud ai models list --region=us-central1',
      defaultLogs: [
        "Vertex AI model 'crowd_density_predictor_v4' loaded successfully.",
        "Recalculating crowd bottleneck vector coefficients based on latest gates inflow...",
        "Prediction output: Gate B queue expected wait time will surpass 180s in 5 mins."
      ]
    },
    {
      id: 'gcp_cloud_vision',
      category: 'AI, Machine Learning & Computer Vision',
      name: 'Cloud Vision API',
      status: 'CheckoutOCR Online',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
      latency: '280ms',
      throughput: '45 frames/s',
      description: 'Powers checkout-free computer-vision concessions by scanning and identifying purchased snack/beverage products dynamically.',
      command: 'gcloud services enable vision.googleapis.com',
      defaultLogs: [
        "Vision API client instantiated. Monitoring high-definition RTSP streams...",
        "Detected object: 'Beverage - Classic Cola 12oz' (Confidence: 98.4%)",
        "Detected object: 'Snack - Salted Pretzels' (Confidence: 95.1%)"
      ]
    },
    {
      id: 'gcp_mediapipe',
      category: 'AI, Machine Learning & Computer Vision',
      name: 'MediaPipe Integration',
      status: 'Edge Biometrics Ready',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
      latency: '18ms',
      throughput: '60 fps (Edge)',
      description: 'Handles local low-latency turnstile biometric validations, scanning digital face models and facial descriptors directly at ticketing points.',
      command: 'npm install @mediapipe/tasks-vision',
      defaultLogs: [
        "MediaPipe task scheduler initialized on local turnstile CPU core.",
        "Running lightweight facial marker alignment...",
        "Match score confirmed against security token database: Match (99.1%)"
      ]
    },
    {
      id: 'gcp_bigquery',
      category: 'Data Analytics & IoT',
      name: 'Google BigQuery',
      status: 'Warehouse Sync Active',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
      latency: '1.2s (Batch)',
      throughput: '12.4 TB Ingested',
      description: 'Analyzes colossal historic stadium logs, fan attendance trends, concession revenue tallies, and staffing logs for post-match executive audits.',
      command: 'bq query --use_legacy_sql=false "SELECT count(*) FROM stadium_ops.transactions"',
      defaultLogs: [
        "BigQuery cluster linked to GCS streaming exports.",
        "Unified transactional partition updated: added 1,420 rows.",
        "Audit check: No revenue leakage anomalies detected in the last hour."
      ]
    },
    {
      id: 'gcp_pubsub',
      category: 'Data Analytics & IoT',
      name: 'Google Cloud Pub/Sub',
      status: 'Telemetry Streaming',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
      latency: '8ms',
      throughput: '15,420 events/s',
      description: 'The real-time ingest backbone connecting turnstiles, smart climate controllers, water flow meters, and mobile apps to analytical backends.',
      command: 'gcloud pubsub topics publish stadium-telemetry --message="HEARTBEAT"',
      defaultLogs: [
        "Subscribed topic: 'stadium-telemetry-sensors-mesh'",
        "Ingesting payload: [NodeID 1422 - Temp: 74F, Fan Level: High]",
        "Ingesting payload: [Turnstile C4 - Ticket validated: TicketID #442a98]"
      ]
    },
    {
      id: 'gcp_dataflow',
      category: 'Data Analytics & IoT',
      name: 'Google Cloud Dataflow',
      status: 'Streaming Pipeline Active',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
      latency: '85ms',
      throughput: '12,500 messages/s',
      description: 'Streams and filters data flowing from Pub/Sub on the fly, instantly forwarding emergency incident logs to the operator dashboard.',
      command: 'gcloud dataflow jobs run stream-sensor-metrics --gcs-location-gs=...',
      defaultLogs: [
        "Dataflow streaming window finalized: 10s rolling average.",
        "Alert validation: sensor values within standard bounds.",
        "Transformed 142 turnstile scan intervals and streamed to client-side dashboard."
      ]
    },
    {
      id: 'gcp_cloud_sql',
      category: 'Database & Storage',
      name: 'Cloud SQL (PostgreSQL)',
      status: 'Healthy Database',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
      latency: '3ms',
      throughput: '1.2 GB stored',
      description: 'Stores strongly relational core details including ticket IDs, active administrator permissions, and concession POS catalog databases.',
      command: 'gcloud sql instances describe stadium-postgres-db',
      defaultLogs: [
        "Cloud SQL Postgres pool connection initialized: 12 active pools.",
        "Running database migration schema 'v1.12_stewards_allocations'...",
        "Query result: 24 active concession stalls mapped."
      ]
    },
    {
      id: 'gcp_firestore',
      category: 'Database & Storage',
      name: 'Cloud Firestore',
      status: 'NoSQL Sync Active',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
      latency: '15ms',
      throughput: '24,120 operations/s',
      description: 'Syncs dynamic states instantly to fan mobile apps, enabling real-time concession order progress checks and seat upgrade notices.',
      command: 'gcloud firestore databases list',
      defaultLogs: [
        "Firestore socket connected to fan clients.",
        "Document change pushed: /orders/order_4281 (Status updated to: 'In Delivery')",
        "Document change pushed: /tickets/gate_status (Gate C queue congestion: HIGH)"
      ]
    },
    {
      id: 'gcp_cloud_storage',
      category: 'Database & Storage',
      name: 'Google Cloud Storage (GCS)',
      status: 'Asset Storage Active',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
      latency: '40ms',
      throughput: '110 MB/s',
      description: 'Caches structural venue 3D models for the spatial Digital Twin, high-definition static imagery, and printable operators PDF reports.',
      command: 'gsutil mb -l us-central1 gs://stadium-assets-bucket',
      defaultLogs: [
        "Fetched structural asset: 'stadium_spatial_model_highpoly.glb' (12.4 MB)",
        "GCS object status: CACHED (CDN cloud cache hit)",
        "Write complete: 'audit_report_2026_07_15.pdf' uploaded to /reports/ bucket."
      ]
    },
    {
      id: 'gcp_maps_platform',
      category: 'Fan Engagement & Frontend',
      name: 'Google Maps Platform',
      status: '3D Tiles & Maps Active',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
      latency: '24ms',
      throughput: '42,500 map loads',
      description: 'Uses photorealistic 3D Tiles, aerial mapping, and spatial maps to power the virtual interactive "Digital Twin" booking view and mobile maps.',
      command: 'npm install @googlemaps/js-api-loader',
      defaultLogs: [
        "Maps Javascript API loaded successfully with custom theme variables.",
        "Loaded 3D Photorealistic Tiles viewport vector mesh coordinates.",
        "Camera locked on Stadium center stadium_stg_coliseum_99b"
      ]
    },
    {
      id: 'gcp_firebase_messaging',
      category: 'Fan Engagement & Frontend',
      name: 'Firebase Cloud Messaging (FCM)',
      status: 'Pushes Delivering',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
      latency: '150ms',
      throughput: '3,200 pushes/min',
      description: 'Sends real-time high-priority alerts directly to fan devices, detailing mobile orders completed, gate updates, or security bulletins.',
      command: 'gcloud beta firebase messaging send --message-payload=...',
      defaultLogs: [
        "FCM dispatcher target resolve: /topics/stadium_alerts",
        "Dispatched push message: 'Concession Order #4281 is ready for pick up!'",
        "Delivery confirmation rate: 99.4% in under 500ms."
      ]
    },
    {
      id: 'gcp_firebase_auth',
      category: 'Fan Engagement & Frontend',
      name: 'Firebase Authentication',
      status: 'Identity Tokens Valid',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
      latency: '45ms',
      throughput: '420 auths/s',
      description: 'Provides rock-solid secure authentication mechanisms for fans and administrative stewards. Fully compatible with facial recognition login modules.',
      command: 'npm install firebase/auth',
      defaultLogs: [
        "Auth provider linked: Google Identity & custom OAuth backend.",
        "Token validated: user Alexander Thorne auth status: Authorized",
        "Token renewal scheduled in 3600 seconds."
      ]
    },
    {
      id: 'gcp_looker',
      category: 'Operational Efficiency',
      name: 'Looker Analytics Integration',
      status: 'Dashboards Synced',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
      latency: '2.5s (Real-time Embed)',
      throughput: '110 embedded updates/min',
      description: 'Embeds real-time executive analytics dashboards to track sales metrics, queue wait patterns, leakage alerts, and fan satisfaction scorecards.',
      command: 'gcloud looker instances list',
      defaultLogs: [
        "Looker embed frame successfully authorized via OAuth token.",
        "Query execution completed: calculated daily concessions EBITDA.",
        "Render complete: Revenue Tab dynamic gauge updated."
      ]
    }
  ];

  const handlePingGcpService = (serviceId: string) => {
    setIsPingingService(true);
    const service = gcpServices.find(s => s.id === serviceId);
    if (!service) return;

    setGcpPingConsoleLogs([
      `[DIAGNOSTICS] Pinging Google Cloud endpoint for: ${service.name}...`,
      `[SHELL COMMAND] $ ${service.command}`,
      `Connecting to GCP Gateway API (Region: us-central1)...`,
      `TCP Handshake latency: ${service.latency}. Throughput active: ${service.throughput}.`
    ]);

    setTimeout(() => {
      setGcpPingConsoleLogs(prev => [
        ...prev,
        `[HEALTH CHECK] Status response: 200 OK (${service.status})`,
        ...service.defaultLogs,
        `[SUCCESS] Diagnostics completed successfully.`
      ]);
      setIsPingingService(false);
    }, 1200);
  };

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: 'gcp_secret_manager', name: 'Google Secret Manager', status: 'Active: Secure Key Injection', type: 'security', icon: Lock },
    { id: 'gcp_pubsub', name: 'GCP Pub/Sub Telemetry Gateway', status: 'Streaming: 15,420 events/sec', type: 'messaging', icon: Radio },
    { id: 'gcp_cloud_run', name: 'Google Cloud Run Webhost', status: 'Hosting: Active Auto-scaling Container', type: 'compute', icon: Cpu },
    { id: 'gcp_bigquery', name: 'Google BigQuery Warehouse', status: 'Syncing: Historical Operations Log', type: 'database', icon: Database },
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

  // Fetch from live server APIs on mount (Point 1, 3, 4)
  React.useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.stadiumOpsApiKey) setStadiumOpsApiKey(configData.stadiumOpsApiKey);
          if (configData.iotHubApiKey) setIotHubApiKey(configData.iotHubApiKey);
          if (configData.posTerminalApiKey) setPosTerminalApiKey(configData.posTerminalApiKey);
          if (configData.stadiumId) setStadiumId(configData.stadiumId);
          if (configData.iotHubId) setIotHubId(configData.iotHubId);
          if (configData.posTerminalId) setPosTerminalId(configData.posTerminalId);
          if (configData.cctvStreamId) setCctvStreamId(configData.cctvStreamId);
          if (configData.appUrl) setAppUrl(configData.appUrl);
        }

        const rolesRes = await fetch('/api/roles');
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          if (Array.isArray(rolesData) && rolesData.length > 0) {
            setRoles(prev => {
              // Merge default roles with dynamic roles
              const customOnly = rolesData.filter(r => r.id.startsWith('role_'));
              const baseOnly = prev.filter(p => !p.id.startsWith('role_') && p.id !== 'sec' && p.id !== 'jan' && p.id !== 'con');
              return [...customOnly, ...prev.filter(p => p.id === 'sec' || p.id === 'jan' || p.id === 'con')];
            });
          }
        }

        const intRes = await fetch('/api/integrations');
        if (intRes.ok) {
          const intData = await intRes.json();
          if (Array.isArray(intData) && intData.length > 0) {
            setIntegrations(prev => {
              const customOnly = intData.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status,
                type: item.type,
                icon: Cpu
              }));
              const baseOnly = prev.filter(p => !p.id.startsWith('int_'));
              return [...customOnly, ...baseOnly];
            });
          }
        }
      } catch (err) {
        console.warn('[OFFLINE DETECTED] Unable to fetch settings configuration from server. Falling back to local cache.', err);
      }
    };

    fetchSettingsData();
  }, []);

  // Toggle Dark Mode with persistent localStorage preference (Point 9)
  const handleToggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // AI assistant apply suggestion
  const handleApplySuggestion = () => {
    setCrowdDensityThreshold(80);
    triggerToast('Crowd Density Alert Threshold optimized to 80%.', 'success', 'AI Insight Applied');
  };

  // Reset Configuration to defaults
  const handleDiscardChanges = () => {
    setFullName(localStorage.getItem('setting_fullName') || 'Alexander Thorne');
    setPrimaryEmail(localStorage.getItem('setting_primaryEmail') || 'a.thorne@stadiumpro.ops');
    setSystemLanguage(localStorage.getItem('setting_systemLanguage') || 'English (United States)');
    
    const savedDensity = localStorage.getItem('setting_crowdDensityThreshold');
    setCrowdDensityThreshold(savedDensity ? Number(savedDensity) : 85);
    const savedLeakage = localStorage.getItem('setting_revenueLeakageThreshold');
    setRevenueLeakageThreshold(savedLeakage ? Number(savedLeakage) : 500);

    setStadiumOpsApiKey(localStorage.getItem('setting_stadiumOpsApiKey') || '');
    setIotHubApiKey(localStorage.getItem('setting_iotHubApiKey') || '');
    setPosTerminalApiKey(localStorage.getItem('setting_posTerminalApiKey') || '');
    
    setStadiumId(localStorage.getItem('setting_stadiumId') || '');
    setIotHubId(localStorage.getItem('setting_iotHubId') || '');
    setPosTerminalId(localStorage.getItem('setting_posTerminalId') || '');
    setCctvStreamId(localStorage.getItem('setting_cctvStreamId') || '');
    setAppUrl(localStorage.getItem('setting_appUrl') || window.location.origin);

    triggerToast('Configuration changes discarded and reloaded.', 'info', 'Settings Discarded');
  };

  const handleSaveConfiguration = async () => {
    // Client-side Input Validations
    if (!fullName || fullName.trim().length < 2) {
      triggerToast('Full Name must be at least 2 characters.', 'error', 'Validation Error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(primaryEmail)) {
      triggerToast('Please enter a valid email address.', 'error', 'Validation Error');
      return;
    }
    if (appUrl) {
      try {
        new URL(appUrl);
      } catch (e) {
        triggerToast('Please enter a valid App URL (e.g. http://localhost:3000).', 'error', 'Validation Error');
        return;
      }
    }
    const densityVal = Number(crowdDensityThreshold);
    if (isNaN(densityVal) || densityVal < 1 || densityVal > 100) {
      triggerToast('Crowd Density Alert Threshold must be between 1 and 100.', 'error', 'Validation Error');
      return;
    }
    const leakageVal = Number(revenueLeakageThreshold);
    if (isNaN(leakageVal) || leakageVal < 0) {
      triggerToast('Revenue Leakage Alert Threshold must be a non-negative number.', 'error', 'Validation Error');
      return;
    }

    // 1. Persist local storage fallbacks
    localStorage.setItem('setting_fullName', fullName);
    localStorage.setItem('setting_primaryEmail', primaryEmail);
    localStorage.setItem('setting_systemLanguage', systemLanguage);
    localStorage.setItem('setting_crowdDensityThreshold', String(crowdDensityThreshold));
    localStorage.setItem('setting_revenueLeakageThreshold', String(revenueLeakageThreshold));
    
    localStorage.setItem('setting_stadiumOpsApiKey', stadiumOpsApiKey);
    localStorage.setItem('setting_iotHubApiKey', iotHubApiKey);
    localStorage.setItem('setting_posTerminalApiKey', posTerminalApiKey);
    
    localStorage.setItem('setting_stadiumId', stadiumId);
    localStorage.setItem('setting_iotHubId', iotHubId);
    localStorage.setItem('setting_posTerminalId', posTerminalId);
    localStorage.setItem('setting_cctvStreamId', cctvStreamId);
    localStorage.setItem('setting_appUrl', appUrl);

    // 2. Perform server-side validation & persistence (Point 1, 3, 8)
    try {
      const configRes = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stadiumOpsApiKey,
          iotHubApiKey,
          posTerminalApiKey,
          stadiumId,
          iotHubId,
          posTerminalId,
          cctvStreamId,
          appUrl
        })
      });

      if (!configRes.ok) {
        const errData = await configRes.json();
        triggerToast(`Validation Error: ${errData.error || 'Failed to update credentials.'}`, 'error', 'Server Validation Failed');
        return;
      }

      // Sync thresholds simulation parameters
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenueGoal: simulation.revenueGoal
        })
      });

      triggerToast('Configuration saved successfully and synchronized with backend.', 'success', 'Settings Saved');
    } catch (e) {
      console.warn('[OFFLINE SAVE] Saved to browser LocalStorage as fallback. Connection state: OFFLINE', e);
      triggerToast('Settings cached locally. Backend server appears offline.', 'warning', 'Offline Mode');
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all configurations to default values?")) {
      const keysToClear = [
        'setting_fullName', 'setting_primaryEmail', 'setting_systemLanguage',
        'setting_crowdDensityThreshold', 'setting_revenueLeakageThreshold',
        'setting_stadiumOpsApiKey', 'setting_iotHubApiKey', 'setting_posTerminalApiKey',
        'setting_stadiumId', 'setting_iotHubId', 'setting_posTerminalId', 'setting_cctvStreamId', 'setting_appUrl'
      ];
      keysToClear.forEach(key => localStorage.removeItem(key));

      setFullName('Alexander Thorne');
      setPrimaryEmail('a.thorne@stadiumpro.ops');
      setSystemLanguage('English (United States)');
      setCrowdDensityThreshold(85);
      setRevenueLeakageThreshold(500);
      setStadiumOpsApiKey('');
      setIotHubApiKey('');
      setPosTerminalApiKey('');
      setStadiumId('');
      setIotHubId('');
      setPosTerminalId('');
      setCctvStreamId('');
      setAppUrl(window.location.origin);

      triggerToast('All configurations have been reset to default values.', 'info', 'Factory Reset');
    }
  };

  // Express Backend Incident Trigger with cascading business logic (Point 5, 10)
  const handleTriggerIncident = async (type: 'gate_surge' | 'spill' | 'wifi_fail') => {
    let payload = {
      location: '',
      priority: 'medium',
      description: '',
      type: 'security'
    };

    if (type === 'gate_surge') {
      payload = {
        location: 'Gate A Turnstiles',
        priority: 'high',
        description: 'Rapid influx of commuter fans causing backup at metal detectors. Immediate security redeployment recommended.',
        type: 'security'
      };
    } else if (type === 'spill') {
      payload = {
        location: 'South Food Hall Block',
        priority: 'medium',
        description: 'Large soda spill in aisle 3 concourse area. Wet floor slip hazard.',
        type: 'janitorial'
      };
    } else if (type === 'wifi_fail') {
      payload = {
        location: 'VIP Suites Access Corridor',
        priority: 'critical',
        description: 'Broadband router drop causing contactless ordering system delay. Manual payment backup active.',
        type: 'revenue' // Drives concessions bottleneck mapping
      };
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update local React states to reflect instantly
        if (type === 'gate_surge') {
          const newH: Hotspot = {
            id: data.incident.id,
            location: payload.location,
            priority: 'high',
            description: payload.description,
            status: 'pending',
            staffAssigned: 0,
            type: 'security'
          };
          const newB: Bottleneck = {
            id: 'b_surge_' + data.incident.id,
            location: 'Gate A',
            severity: 'high',
            description: 'Heavy commuter congestion at turnstiles.',
            delayMinutes: 12
          };
          setHotspots(prev => [newH, ...prev]);
          setBottlenecks(prev => [newB, ...prev]);
        } else if (type === 'spill') {
          const newH: Hotspot = {
            id: data.incident.id,
            location: payload.location,
            priority: 'medium',
            description: payload.description,
            status: 'pending',
            staffAssigned: 0,
            type: 'janitorial'
          };
          setHotspots(prev => [newH, ...prev]);
        } else if (type === 'wifi_fail') {
          const newB: Bottleneck = {
            id: 'b_wifi_' + data.incident.id,
            location: 'VIP Suites Concourse',
            severity: 'critical',
            description: payload.description,
            delayMinutes: 15
          };
          setBottlenecks(prev => [newB, ...prev]);
        }

        // Apply updated simulation metrics calculated on backend
        if (data.simulationUpdates) {
          setSimulation(data.simulationUpdates);
        }

        triggerToast(`Incident [${data.incident.id}] injected via database. Metrics recalculated.`, 'success', 'Incident Injected');
      }
    } catch (e) {
      console.warn('[OFFLINE INJECTION] Triggering local fallback incident.', e);
      // Local fallback
      if (type === 'gate_surge') {
        const newHotspot: Hotspot = {
          id: 'local_surge_' + generateUUID(),
          location: 'Gate A Turnstiles',
          priority: 'high',
          description: 'Gate A backup. Local cache active.',
          status: 'pending',
          staffAssigned: 0,
          type: 'security'
        };
        setHotspots(prev => [newHotspot, ...prev]);
      }
    }
  };

  const handleNumericParamChange = async (field: keyof SimulationState, value: number) => {
    // 1. Update client immediately for responsive slider UI
    setSimulation(prev => ({
      ...prev,
      [field]: value
    }));

    // 2. Sync to Express server backend (Point 1, 10)
    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
    } catch (e) {
      console.warn('Backend offline. Saved sliders locally.', e);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKeyValue);
    alert('API key copied to clipboard!');
  };

  // Real backend Custom Integration Creator (Point 3)
  const handleAddNewIntegration = async () => {
    const name = prompt("Enter Integration Name:");
    if (!name) return;
    const type = prompt("Enter Integration Type (e.g. iot, security, database):", "custom") || "custom";
    
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });

      if (res.ok) {
        const data = await res.json();
        const newInt = {
          id: data.integration.id,
          name: data.integration.name,
          status: data.integration.status,
          type: data.integration.type,
          icon: Cpu
        };
        setIntegrations(prev => [newInt, ...prev]);
        alert(`Success: Registered integration [${data.integration.id}] on Express backend.`);
      }
    } catch (err) {
      console.warn('Error saving integration on server. Adding locally.', err);
      const fallback = {
        id: 'local_int_' + generateUUID(),
        name,
        status: 'Offline Pending Sync',
        type,
        icon: Cpu
      };
      setIntegrations(prev => [fallback, ...prev]);
    }
  };

  // Real backend Custom Role Creator (Point 3, 4)
  const handleDefineRole = async () => {
    const role = prompt("Enter Role Title:");
    if (!role) return;
    const permissions = prompt("Enter Permissions (comma separated):", "Access general logs, View statistics");
    if (!permissions) return;
    const level = prompt("Enter Access Level Group (e.g. Supervisor, Standard, Root Admin):", "Standard") || "Standard";

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions, level })
      });

      if (res.ok) {
        const data = await res.json();
        const newRole = {
          id: data.role.id,
          role: data.role.role,
          permissions: data.role.permissions,
          level: data.role.level,
          levelColor: data.role.level === 'Supervisor' 
            ? 'bg-blue-100 text-blue-800 border-blue-200' 
            : data.role.level === 'Root Admin'
            ? 'bg-purple-100 text-purple-800 border-purple-200'
            : 'bg-slate-100 text-slate-700 border-slate-200'
        };
        setRoles(prev => [newRole, ...prev]);
        alert(`Success: Persisted role [${data.role.id}] inside custom RBAC registry.`);
      }
    } catch (err) {
      console.warn('Error saving role on server. Adding locally.', err);
      const fallback = {
        id: 'local_role_' + generateUUID(),
        role,
        permissions,
        level,
        levelColor: 'bg-slate-100 text-slate-700 border-slate-200'
      };
      setRoles(prev => [fallback, ...prev]);
    }
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
              id="btn-reset-defaults"
              onClick={handleResetToDefaults}
              className="bg-surface border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-md py-sm rounded-lg font-bold text-label-md text-rose-600 transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
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
            
            {/* GCP Web Services Architecture Hub */}
            <section id="card-gcp-architecture-hub" className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-md border-b border-outline-variant/30 pb-md mb-md">
                <span className="p-2 bg-primary-container/20 text-primary rounded-lg">
                  <Cpu className="w-6 h-6 text-primary" />
                </span>
                <div>
                  <h2 className="text-headline-md font-headline-md text-on-surface">GCP Web Services</h2>
                  <p className="text-[11px] text-on-surface-variant opacity-70">Active Cloud Infrastructure for Smart Stadium Digital Assistant</p>
                </div>
              </div>

              {/* Service selector group by category */}
              <div className="space-y-sm">
                <label className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter">Select Active Web Service</label>
                <select
                  id="select-gcp-service"
                  value={selectedGcpServiceId}
                  onChange={(e) => {
                    setSelectedGcpServiceId(e.target.value);
                    const service = gcpServices.find(s => s.id === e.target.value);
                    if (service) {
                      setGcpPingConsoleLogs([
                        `[SYSTEM INFO] Loaded ${service.name} configuration context.`,
                        `Description: ${service.description}`,
                        `Run diagnostics below to simulate a real-time health-check query.`
                      ]);
                    }
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-body-md text-on-surface dark:bg-surface-container outline-none font-bold"
                >
                  <optgroup label="1. Core Infrastructure & Compute">
                    <option value="gcp_gke">Google Kubernetes Engine (GKE)</option>
                    <option value="gcp_cloud_run">Google Cloud Run</option>
                    <option value="gcp_cloud_functions">Google Cloud Functions</option>
                  </optgroup>
                  <optgroup label="2. AI, Machine Learning & Computer Vision">
                    <option value="gcp_vertex_ai">Vertex AI Model Registry</option>
                    <option value="gcp_cloud_vision">Cloud Vision API</option>
                    <option value="gcp_mediapipe">MediaPipe Integration</option>
                  </optgroup>
                  <optgroup label="3. Data Analytics & IoT">
                    <option value="gcp_bigquery">Google BigQuery</option>
                    <option value="gcp_pubsub">Google Cloud Pub/Sub</option>
                    <option value="gcp_dataflow">Google Cloud Dataflow</option>
                  </optgroup>
                  <optgroup label="4. Database & Storage">
                    <option value="gcp_cloud_sql">Cloud SQL (PostgreSQL)</option>
                    <option value="gcp_firestore">Cloud Firestore</option>
                    <option value="gcp_cloud_storage">Google Cloud Storage (GCS)</option>
                  </optgroup>
                  <optgroup label="5. Fan Engagement & Frontend">
                    <option value="gcp_maps_platform">Google Maps Platform</option>
                    <option value="gcp_firebase_messaging">Firebase Cloud Messaging (FCM)</option>
                    <option value="gcp_firebase_auth">Firebase Authentication</option>
                  </optgroup>
                  <optgroup label="6. Operational Efficiency">
                    <option value="gcp_looker">Looker Analytics Integration</option>
                  </optgroup>
                </select>
              </div>

              {/* Selected service details card */}
              {selectedGcpServiceId && (() => {
                const service = gcpServices.find(s => s.id === selectedGcpServiceId);
                if (!service) return null;
                return (
                  <div className="mt-md p-md bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-md dark:bg-slate-900/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {service.category}
                        </span>
                        <h3 className="text-body-md font-black text-on-surface mt-1">{service.name}</h3>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${service.badgeColor}`}>
                        {service.status}
                      </span>
                    </div>

                    <p className="text-body-sm text-on-surface-variant opacity-85 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-2 gap-sm text-xs bg-white p-sm rounded-lg border border-outline-variant/20 dark:bg-slate-800/40">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Response Latency</span>
                        <span className="font-mono font-bold text-on-surface">{service.latency}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Throughput</span>
                        <span className="font-mono font-bold text-on-surface">{service.throughput}</span>
                      </div>
                    </div>

                    <div className="space-y-xs">
                      <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Live Diagnostics Console</span>
                      <div className="bg-slate-950 text-slate-200 p-sm rounded-lg font-mono text-[11px] leading-relaxed max-h-[140px] overflow-y-auto space-y-1">
                        {gcpPingConsoleLogs.map((log, idx) => (
                          <div key={idx} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[DIAGNOSTICS]') ? 'text-amber-400 font-bold' : log.includes('[SHELL COMMAND]') ? 'text-blue-400' : 'text-slate-300'}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      id={`btn-ping-gcp-${service.id}`}
                      onClick={() => handlePingGcpService(service.id)}
                      disabled={isPingingService}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-sm ${isPingingService ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-hover shadow-sm'}`}
                    >
                      {isPingingService ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                          Querying Google Cloud APIs...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Run Diagnostics Self-Test
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
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
                <div className="space-y-md pt-xs">
                  <div className="space-y-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter block">StadiumOps API Access Key (VITE_STADIUM_OPS_API_KEY)</label>
                      <button 
                        id="btn-verify-key"
                        onClick={handleValidateApiKey}
                        disabled={isValidatingKey || !stadiumOpsApiKey}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        {isValidatingKey ? 'Validating...' : 'Verify Key'}
                      </button>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="relative flex-grow">
                        <input 
                          id="input-api-key"
                          type={apiKeyVisible ? "text" : "password"} 
                          value={stadiumOpsApiKey}
                          onChange={(e) => {
                            setStadiumOpsApiKey(e.target.value);
                            setValidationStatus('idle');
                          }}
                          placeholder="sk_stadiumops_xxxxxxxxxxxxxxxx"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-md pr-10 py-sm text-body-md font-mono text-on-surface dark:bg-surface-container outline-none focus:border-primary"
                        />
                        <button 
                          id="btn-toggle-key-visibility"
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                          aria-label={apiKeyVisible ? "Hide API key" : "Show API key"}
                        >
                          {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button 
                        id="btn-copy-api-key"
                        onClick={handleCopyKey}
                        className="p-2 bg-surface-container-high hover:bg-surface-variant rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Copy API Key"
                        aria-label="Copy API Key"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>

                    {/* API Verification Result Indicator (Point 1, 3) */}
                    {validationStatus === 'valid' && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg flex items-center gap-1.5 mt-1.5 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Handshake 200 OK: Valid StadiumOps API format (Timing: 420ms). Ready for production streaming.
                      </div>
                    )}
                    {validationStatus === 'invalid' && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg flex flex-col gap-1 mt-1.5 border border-rose-100 dark:border-rose-900/30">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Verification Denied: {validationError}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">Must begin with correct suffix (e.g. "sk_stadiumops_") to authenticate GCP channels safely.</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-xs">
                    <label className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter block">IoT Hub Sensor Access Key (VITE_IOT_HUB_API_KEY)</label>
                    <input 
                      id="input-iot-api-key"
                      type="password" 
                      value={iotHubApiKey}
                      onChange={(e) => setIotHubApiKey(e.target.value)}
                      placeholder="key_iot_mesh_xxxxxxxxxxxxxxxx"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md font-mono text-on-surface dark:bg-surface-container outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-xs">
                    <label className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter block">POS Hub Terminal Access Key (VITE_POS_TERMINAL_API_KEY)</label>
                    <input 
                      id="input-pos-api-key"
                      type="password" 
                      value={posTerminalApiKey}
                      onChange={(e) => setPosTerminalApiKey(e.target.value)}
                      placeholder="key_pos_hub_xxxxxxxxxxxxxxxx"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md font-mono text-on-surface dark:bg-surface-container outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Exposing System IDs and Typed Credentials */}
                <div className="border-t border-outline-variant/20 pt-md mt-md space-y-md">
                  <div className="flex items-center justify-between">
                    <p className="text-label-sm font-black text-on-surface-variant uppercase tracking-tighter">System Identifiers &amp; credentials</p>
                    <button
                      onClick={() => setIdsVisible(!idsVisible)}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      {idsVisible ? "Hide System IDs" : "Expose System IDs"}
                    </button>
                  </div>
                </div>
                
                {idsVisible && (
                  <div className="space-y-sm p-md bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs dark:bg-slate-900/40">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Stadium Identifier (stadiumId)</span>
                      <input 
                        type="text"
                        value={stadiumId}
                        onChange={(e) => setStadiumId(e.target.value)}
                        placeholder="stadium_stg_coliseum_99b"
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">IoT Hub Identifier (iotHubId)</span>
                      <input 
                        type="text"
                        value={iotHubId}
                        onChange={(e) => setIotHubId(e.target.value)}
                        placeholder="hub_mesh_west_gate_c"
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">POS Terminal Identifier (posTerminalId)</span>
                      <input 
                        type="text"
                        value={posTerminalId}
                        onChange={(e) => setPosTerminalId(e.target.value)}
                        placeholder="pos_alpha_vendor_42"
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CCTV Feed Stream ID (cctvStreamId)</span>
                      <input 
                        type="text"
                        value={cctvStreamId}
                        onChange={(e) => setCctvStreamId(e.target.value)}
                        placeholder="stream_unified_concourse_112"
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Gemini API Connection State</span>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        <span className={`w-2 h-2 rounded-full ${apiConfig.geminiApiKey.includes('•') ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                        <span className="font-mono text-xs">{apiConfig.geminiApiKey}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Operational App URL (appUrl)</span>
                      <input 
                        type="text"
                        value={appUrl}
                        onChange={(e) => setAppUrl(e.target.value)}
                        placeholder="https://ais-dev-27qe423lhobpe6k3s5y2mt-743089973269.asia-east1.run.app"
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
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
