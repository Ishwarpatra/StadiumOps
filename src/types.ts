export interface Hotspot {
  id: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  status: 'pending' | 'dispatched' | 'resolved';
  staffAssigned: number;
  type: 'security' | 'janitorial' | 'guest';
}

export interface Bottleneck {
  id: string;
  location: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  delayMinutes: number;
}

export interface AIActionItem {
  id: string;
  title: string;
  description: string;
  executed: boolean;
  type: 'redeploy' | 'promo' | 'cleanup';
}

export interface SimulationState {
  isLive: boolean;
  attendance: number;
  maxAttendance: number;
  fanSentiment: number;
  activeStaff: number;
  targetStaff: number;
  incidentsResolved: number;
  incidentsPending: number;
  revenueGoal: number;
  concessionsRevenue: number;
  ticketingRevenue: number;
  merchandiseRevenue: number;
  avgQueueTimeSeconds: number;
}

export interface FanSentimentLog {
  id: string;
  time: string;
  user: string;
  rating: number;
  message: string;
  category: 'concessions' | 'entry' | 'seating' | 'merch';
  sentimental: 'positive' | 'negative' | 'neutral';
}

/**
 * API Configuration mapping credentials, endpoints and access scopes
 */
export interface APIConfig {
  geminiApiKey: string;
  stadiumOpsApiKey: string;
  iotHubApiKey: string;
  posTerminalApiKey: string;
  appUrl: string;
}

/**
 * System and operational entity identifiers 
 */
export interface SystemIDs {
  stadiumId: string;
  iotHubId: string;
  posTerminalId: string;
  cctvStreamId: string;
}

/**
 * Exposing type definitions to Vite's import.meta.env
 */
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly VITE_STADIUM_OPS_API_KEY?: string;
    readonly VITE_STADIUM_ID?: string;
    readonly VITE_IOT_HUB_ID?: string;
    readonly VITE_POS_TERMINAL_ID?: string;
    readonly VITE_CCTV_STREAM_ID?: string;
    readonly VITE_APP_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

