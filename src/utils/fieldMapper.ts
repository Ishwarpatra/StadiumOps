/**
 * Field mapping utilities to safely access data from types.ts
 * Prevents crashes from typos in field names
 */

import { Hotspot, Bottleneck, SimulationState } from '../types';

export const HotspotFieldMap = {
  // Real fields in Hotspot type
  getLocation: (h: Hotspot) => h.location || 'Unknown Location',
  getPriority: (h: Hotspot) => h.priority || 'medium',
  getDescription: (h: Hotspot) => h.description || 'No description',
  getStatus: (h: Hotspot) => h.status || 'pending',
  getStaffAssigned: (h: Hotspot) => h.staffAssigned || 0,
  getType: (h: Hotspot) => h.type || 'guest',
  getId: (h: Hotspot) => h.id,
  
  // Safe getters that never throw
  getDisplayName: (h: Hotspot) => `${h.type.charAt(0).toUpperCase() + h.type.slice(1)} - ${h.location}`,
  getQueueDisplay: (h: Hotspot) => `${h.staffAssigned} staff assigned`,
};

export const BottleneckFieldMap = {
  // Real fields in Bottleneck type
  getLocation: (b: Bottleneck) => b.location || 'Unknown Location',
  getSeverity: (b: Bottleneck) => b.severity || 'medium',
  getDescription: (b: Bottleneck) => b.description || 'No description',
  getDelayMinutes: (b: Bottleneck) => b.delayMinutes || 0,
  getId: (b: Bottleneck) => b.id,
  
  // Safe getters
  getDisplayName: (b: Bottleneck) => `${b.location} - ${b.delayMinutes}m delay`,
  getWaitTimeDisplay: (b: Bottleneck) => `${b.delayMinutes} minutes`,
};

export const SimulationFieldMap = {
  // Real fields in SimulationState type
  getConcessionsRevenue: (s: SimulationState) => s.concessionsRevenue || 0,
  getTicketingRevenue: (s: SimulationState) => s.ticketingRevenue || 0,
  getMerchandiseRevenue: (s: SimulationState) => s.merchandiseRevenue || 0,
  getTotalRevenue: (s: SimulationState) => 
    (s.concessionsRevenue || 0) + (s.ticketingRevenue || 0) + (s.merchandiseRevenue || 0),
  getRevenueGoal: (s: SimulationState) => s.revenueGoal || 0,
  getAttendance: (s: SimulationState) => s.attendance || 0,
  getMaxAttendance: (s: SimulationState) => s.maxAttendance || 0,
  getActiveStaff: (s: SimulationState) => s.activeStaff || 0,
  getTargetStaff: (s: SimulationState) => s.targetStaff || 0,
  getAvgQueueTimeSeconds: (s: SimulationState) => s.avgQueueTimeSeconds || 0,
  getFanSentiment: (s: SimulationState) => s.fanSentiment || 0,
  getIncidentsResolved: (s: SimulationState) => s.incidentsResolved || 0,
  getIncidentsPending: (s: SimulationState) => s.incidentsPending || 0,
};
