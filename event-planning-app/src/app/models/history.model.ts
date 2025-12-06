import { Event } from './event.model';

export type HistoryAction = 'create' | 'update' | 'delete';

export interface HistoryEntry {
  id: string;
  action: string;
  eventId?: string;
  eventData: any; // Event ou null
  previousData?: any; // Event ou null
  userId?: string;
  userDisplayName?: string; // Format: "Prenom N."
  timestamp: Date;
}

export interface HistoryState {
  entries: HistoryEntry[];
  maxEntries: number;
}

export const DEFAULT_HISTORY_STATE: HistoryState = {
  entries: [],
  maxEntries: 20
};
