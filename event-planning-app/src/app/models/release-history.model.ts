export type ReleaseHistoryAction = 'create' | 'update' | 'delete';

export interface ReleaseHistoryEntry {
  id: string;
  action: ReleaseHistoryAction;
  releaseId?: string;
  releaseData: any; // Release ou null
  previousData?: any; // Release ou null
  userId?: string;
  userDisplayName?: string; // Format: "Prenom N."
  timestamp: Date;
}

export interface ReleaseHistoryState {
  entries: ReleaseHistoryEntry[];
  maxEntries: number;
}

export const DEFAULT_RELEASE_HISTORY_STATE: ReleaseHistoryState = {
  entries: [],
  maxEntries: 30
};
