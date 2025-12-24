// Catégories par défaut + catégories personnalisées (IDs dynamiques)
export type EventCategory = string; // Accepte les catégories par défaut ET les IDs personnalisés

// Couleurs par défaut pour les catégories prédéfinies
export type EventColor = string; // Accepte n'importe quelle couleur hex pour les catégories personnalisées

// Icônes Material par défaut pour les catégories prédéfinies
export type EventIcon = string; // Accepte n'importe quelle icône Material pour les catégories personnalisées

export interface Event {
  id?: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD (date de début)
  endDate?: string; // ISO format YYYY-MM-DD (date de fin optionnelle pour les périodes)
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  color: EventColor;
  icon: EventIcon;
  category: EventCategory;
  description?: string;
  tags?: string[];
  sprintId?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  mep_front: 'MEP Front',
  mep_back: 'MEP Back',
  hotfix: 'Hotfix',
  code_freeze: 'Freeze du code',
  other: 'Autre'
};

export const CATEGORY_DEFAULTS: Record<string, { color: string; icon: string }> = {
  mep_front: { color: '#22c55e', icon: 'rocket_launch' },
  mep_back: { color: '#06b6d4', icon: 'rocket_launch' },
  hotfix: { color: '#ef4444', icon: 'bug_report' },
  code_freeze: { color: '#1e3a8a', icon: 'ac_unit' },
  other: { color: '#8b5cf6', icon: 'event' }
};

// Couleurs adaptées pour le dark mode (versions plus claires/vibrantes)
export const CATEGORY_COLORS_DARK: Record<string, string> = {
  mep_front: '#4ade80',  // vert plus clair
  mep_back: '#22d3ee',   // cyan plus clair
  hotfix: '#f87171',     // rouge plus clair
  code_freeze: '#3b82f6', // bleu plus clair
  other: '#a78bfa'       // violet plus clair
};
