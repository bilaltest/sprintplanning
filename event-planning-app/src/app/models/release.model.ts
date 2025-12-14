// Release status
export type ReleaseStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

// Release type
export type ReleaseType = 'release' | 'hotfix';

// Action phase
export type ActionPhase = 'pre_mep' | 'post_mep';

// Action type
export type ActionType =
  | 'feature_flipping'
  | 'memory_flipping'
  | 'other';

// Action status
export type ActionStatus = 'pending' | 'completed';

// Feature Flipping type
export type FlippingType = 'memory_flipping' | 'feature_flipping';

// Rule action
export type RuleAction = 'create_rule' | 'obsolete_rule' | 'disable_rule' | 'enable_rule';

// Rule state
export type RuleState = 'enabled' | 'disabled';

// OS types
export type OSType = 'ios' | 'android';

// Version operator
export type VersionOperator = '>=' | '<=' | '>' | '<' | '=' | '!=';

// Version condition
export interface VersionCondition {
  operator: VersionOperator;
  version: string;
}

// Feature Flipping configuration
export interface FeatureFlipping {
  id?: string;
  actionId: string;
  flippingType: FlippingType;
  ruleName: string;
  theme: string; // Thème du FF/MF (obligatoire)
  ruleAction: RuleAction;
  ruleState?: RuleState;
  targetClients: string[]; // ['all'] ou liste de CAELs
  targetCaisses?: string; // Liste de caisses (texte libre)
  targetOS: OSType[];
  targetVersions: VersionCondition[];
  createdAt?: string;
  updatedAt?: string;
}

// Action
export interface Action {
  id?: string;
  squadId: string;
  phase: ActionPhase;
  type: ActionType;
  description: string; // Obligatoire pour toutes les actions
  status: ActionStatus;
  order: number;
  flipping?: FeatureFlipping;
  createdAt?: string;
  updatedAt?: string;
}

// Feature
export interface Feature {
  id?: string;
  squadId: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Squad
export interface Squad {
  id?: string;
  releaseId: string;
  squadNumber: number; // 1 à 6
  tontonMep?: string; // Nom du Tonton MEP responsable de la squad
  isCompleted: boolean; // Indique si le squad est Complété
  featuresEmptyConfirmed?: boolean;
  preMepEmptyConfirmed?: boolean;
  postMepEmptyConfirmed?: boolean;
  features: Feature[];
  actions: Action[];
  createdAt?: string;
  updatedAt?: string;
}

// Release
export interface Release {
  id?: string;
  name: string; // Contient déjà la version (ex: "Release v40.5")
  releaseDate: string; // ISO format
  status: ReleaseStatus;
  type: ReleaseType; // release ou hotfix
  description?: string;
  squads: Squad[];
  createdAt?: string;
  updatedAt?: string;
}

// DTO pour créer une release
export interface CreateReleaseDto {
  name: string; // Contient déjà la version
  releaseDate: string;
  type: ReleaseType; // release ou hotfix
  description?: string;
}

// DTO pour mettre à jour une release
export interface UpdateReleaseDto {
  name?: string;
  releaseDate?: string;
  description?: string;
  status?: ReleaseStatus;
  type?: ReleaseType;
}

// DTO pour créer une feature
export interface CreateFeatureDto {
  title: string;
  description?: string;
}

// DTO pour créer une action
export interface CreateActionDto {
  phase: ActionPhase;
  type: ActionType;
  title: string; // Titre de l'action (obligatoire)
  description?: string; // Description optionnelle
  order?: number;
  flipping?: Partial<FeatureFlipping>;
}

// Constants
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  feature_flipping: 'Feature Flipping',
  memory_flipping: 'Memory Flipping',
  other: 'Autre'
};

export const ACTION_PHASE_LABELS: Record<ActionPhase, string> = {
  pre_mep: 'Pré-MEP',
  post_mep: 'Post-MEP'
};

export const FLIPPING_TYPE_LABELS: Record<FlippingType, string> = {
  memory_flipping: 'Memory Flipping',
  feature_flipping: 'Feature Flipping'
};

export const RULE_ACTION_LABELS: Record<RuleAction, string> = {
  create_rule: 'Ajouter dans le référentiel et ne rien faire',
  obsolete_rule: 'Ajouter dans le référentiel et désactiver la règle',
  disable_rule: 'Désactiver la règle',
  enable_rule: 'Activer la règle'
};

export const RULE_STATE_LABELS: Record<RuleState, string> = {
  enabled: 'Activé',
  disabled: 'Désactivé'
};

export const STATUS_LABELS: Record<ReleaseStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée'
};

export const STATUS_COLORS: Record<ReleaseStatus, string> = {
  draft: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  release: 'Release',
  hotfix: 'Hotfix'
};

export const RELEASE_TYPE_COLORS: Record<ReleaseType, { gradient: string; badge: string; text: string }> = {
  release: {
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  hotfix: {
    gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    text: 'text-red-600 dark:text-red-400'
  }
};
