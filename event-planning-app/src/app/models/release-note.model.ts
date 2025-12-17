export type DeploymentStatus = 'HOM2' | 'IN_PROGRESS_PROD' | 'DEPLOYED_PROD' | 'ROLLBACK';

export interface ReleaseNoteEntry {
  id?: string;
  releaseId: string;

  // Microservice info
  microserviceId?: string;      // Preferred: ID reference to microservice table
  microservice?: string;         // Legacy: Free text or fallback display name
  microserviceName?: string;     // Display name from microservice entity
  solution?: string;             // Solution from microservice entity

  squad: string;
  partEnMep: boolean;
  deployOrder?: number;
  tag?: string;
  previousTag?: string; // Tag N-1 en production
  parentVersion?: string;
  changes: ChangeItem[];
  comment?: string; // Commentaire libre
  status?: DeploymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChangeItem {
  jiraId: string;
  description: string;
}

export interface CreateReleaseNoteEntryRequest {
  // Preferred: Use microserviceId to reference microservice entity
  microserviceId?: string;

  // Legacy/Fallback: Free text microservice name (used if microserviceId is null)
  microservice?: string;

  squad: string;
  partEnMep: boolean;
  deployOrder?: number;
  tag?: string;
  previousTag?: string; // Tag N-1 en production
  parentVersion?: string;
  changes: ChangeItem[];
  comment?: string; // Commentaire libre
  status?: DeploymentStatus;
}

// Interface pour le groupement par squad dans l'UI
export interface ReleaseNoteBySquad {
  squad: string;
  entries: ReleaseNoteEntry[];
}

// Liste des squads disponibles (Squad 1 à Squad 6)
export const SQUAD_OPTIONS = [
  'Squad 1',
  'Squad 2',
  'Squad 3',
  'Squad 4',
  'Squad 5',
  'Squad 6'
];
