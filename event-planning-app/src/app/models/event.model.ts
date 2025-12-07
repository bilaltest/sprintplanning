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
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  mep: 'Mise en production',
  hotfix: 'Hotfix',
  maintenance: 'Maintenance',
  pi_planning: 'PI Planning',
  sprint_start: 'Début de sprint',
  code_freeze: 'Freeze du code',
  psi: 'PSI',
  other: 'Autre'
};

export const CATEGORY_DEFAULTS: Record<string, { color: string; icon: string }> = {
  mep: { color: '#22c55e', icon: 'rocket_launch' },
  hotfix: { color: '#ef4444', icon: 'bug_report' },
  maintenance: { color: '#6b7280', icon: 'build' },
  pi_planning: { color: '#eab308', icon: 'groups' },
  sprint_start: { color: '#06b6d4', icon: 'flag' },
  code_freeze: { color: '#f97316', icon: 'ac_unit' },
  psi: { color: '#1f2937', icon: 'block' },
  other: { color: '#8b5cf6', icon: 'event' }
};

// Couleurs adaptées pour le dark mode (versions plus claires/vibrantes)
export const CATEGORY_COLORS_DARK: Record<string, string> = {
  mep: '#4ade80',        // vert plus clair
  hotfix: '#f87171',     // rouge plus clair
  maintenance: '#9ca3af', // gris plus clair
  pi_planning: '#fde047', // jaune plus clair
  sprint_start: '#22d3ee', // turquoise plus clair
  code_freeze: '#fb923c', // orange plus clair
  psi: '#4b5563',        // gris foncé plus visible
  other: '#a78bfa'       // violet plus clair
};
