import { Hotspot, Bottleneck, AIActionItem, SimulationState, FanSentimentLog } from './types';

export const initialHotspots: Hotspot[] = [
  {
    id: '1',
    location: 'Gate C Entrance',
    priority: 'high',
    description: 'Crowd density exceeding optimal flow. Surge of incoming attendees detected.',
    status: 'pending',
    staffAssigned: 0,
    type: 'security'
  },
  {
    id: '2',
    location: 'Section 114 Concourse',
    priority: 'medium',
    description: 'Liquid spill reported near concessions. Hazard risk for walking fans.',
    status: 'pending',
    staffAssigned: 0,
    type: 'janitorial'
  },
  {
    id: '3',
    location: 'West Stand Ticket Hub',
    priority: 'low',
    description: 'Minor scanner calibration delay. Fans guided to alternate lanes.',
    status: 'resolved',
    staffAssigned: 2,
    type: 'guest'
  },
  {
    id: '4',
    location: 'VIP Section Alpha Lounge',
    priority: 'medium',
    description: 'In-seat ordering volume below expected threshold. Low active servers.',
    status: 'pending',
    staffAssigned: 1,
    type: 'guest'
  }
];

export const initialBottlenecks: Bottleneck[] = [
  {
    id: 'b1',
    location: 'Gate B',
    severity: 'critical',
    description: 'Critical density due to rapid arrivals from commuter rail trains.',
    delayMinutes: 8
  },
  {
    id: 'b2',
    location: 'North Concourse',
    severity: 'medium',
    description: 'High traffic bottleneck around key beverage kiosks.',
    delayMinutes: 4
  }
];

export const initialAIActionItems: AIActionItem[] = [
  {
    id: 'ai1',
    title: 'Security Staff Deployment',
    description: 'Re-deploy 5 security staff to Gate B due to rapid density surge.',
    executed: false,
    type: 'redeploy'
  },
  {
    id: 'ai2',
    title: 'Push In-Seat Promo Notification',
    description: 'Trigger 15% discount on appetizers to VIP Section Alpha to boost volume.',
    executed: false,
    type: 'promo'
  },
  {
    id: 'ai3',
    title: 'Dispatch Quick Janitorial',
    description: 'Send standby cleanup crew to Section 114 Concourse to resolve liquid spill.',
    executed: false,
    type: 'cleanup'
  }
];

export const initialSimulation: SimulationState = {
  isLive: true,
  attendance: 42500,
  maxAttendance: 50000,
  fanSentiment: 88,
  activeStaff: 412,
  targetStaff: 420,
  incidentsResolved: 38,
  incidentsPending: 3,
  revenueGoal: 1200000,
  concessionsRevenue: 663000,
  ticketingRevenue: 255000,
  merchandiseRevenue: 102000,
  avgQueueTimeSeconds: 252 // 4 min 12 s
};

// Historical hourly volume (T-60 down to Q4) for the bar chart
export interface BarData {
  label: string;
  value: number; // percentage height
  tpm: number;   // transactions per minute
  isPeak: boolean;
  tooltip: string;
}

export const initialBarData: BarData[] = [
  { label: 'T-60', value: 10, tpm: 120, isPeak: false, tooltip: 'Pre-game prep' },
  { label: 'T-45', value: 20, tpm: 240, isPeak: false, tooltip: 'Gate doors open' },
  { label: 'T-30', value: 40, tpm: 480, isPeak: false, tooltip: 'Stadium filling up' },
  { label: 'T-15', value: 65, tpm: 780, isPeak: false, tooltip: 'Pre-kickoff influx' },
  { label: '00:00', value: 95, tpm: 1140, isPeak: true, tooltip: 'Kickoff Rush Peak' },
  { label: 'Q1', value: 30, tpm: 360, isPeak: false, tooltip: 'Steady play' },
  { label: 'Q1 End', value: 35, tpm: 420, isPeak: false, tooltip: 'Quarter transition rush' },
  { label: 'Q2', value: 25, tpm: 300, isPeak: false, tooltip: 'Mid-quarter lull' },
  { label: 'HT', value: 100, tpm: 1200, isPeak: true, tooltip: 'Halftime Rush Peak' },
  { label: 'Q3', value: 35, tpm: 420, isPeak: false, tooltip: 'Second half start' },
  { label: 'Q4', value: 20, tpm: 240, isPeak: false, tooltip: 'Final minutes egress' }
];

// Interactive fan reviews

export const initialFanLogs: FanSentimentLog[] = [
  {
    id: 'f1',
    time: '14:28',
    user: 'Sarah M. (Sec 104)',
    rating: 5,
    message: 'Love the quick order service! Hot dog arrived in under 3 minutes at my seat.',
    category: 'concessions',
    sentimental: 'positive'
  },
  {
    id: 'f2',
    time: '14:25',
    user: 'Marcus K. (Sec 114)',
    rating: 2,
    message: 'Long lines near the concession stand. Missed part of the first quarter trying to get water.',
    category: 'concessions',
    sentimental: 'negative'
  },
  {
    id: 'f3',
    time: '14:20',
    user: 'Diana R. (Gate B)',
    rating: 3,
    message: 'Bit of a crowd jam getting through Gate B, but security check was friendly.',
    category: 'entry',
    sentimental: 'neutral'
  },
  {
    id: 'f4',
    time: '14:15',
    user: 'Tommy J. (Sec 201)',
    rating: 5,
    message: 'Outstanding view! The digital seat ticket integration made entry a breeze.',
    category: 'seating',
    sentimental: 'positive'
  },
  {
    id: 'f5',
    time: '14:02',
    user: 'Glenn L. (South Gate)',
    rating: 1,
    message: 'Merch stand ran out of medium size championship jersey. Highly disappointing.',
    category: 'merch',
    sentimental: 'negative'
  }
];
