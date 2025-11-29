export type EventCategory =
  | 'mep'           // Mise en production
  | 'hotfix'        // Hotfix
  | 'maintenance'   // Maintenance
  | 'pi_planning'   // PI Planning
  | 'sprint_start'  // Début de sprint
  | 'code_freeze'   // Freeze du code
  | 'psi'           // PSI
  | 'other';        // Autre

export type EventColor =
  | '#22c55e'  // mep - vert
  | '#ef4444'  // hotfix - rouge
  | '#6b7280'  // maintenance - gris
  | '#eab308'  // pi_planning - jaune
  | '#06b6d4'  // sprint_start - turquoise
  | '#f97316'  // code_freeze - orange
  | '#1f2937'  // psi - noir
  | '#8b5cf6'; // other - violet

export type EventIcon =
  | 'rocket_launch'           // mep
  | 'bug_report'              // hotfix
  | 'build'                   // maintenance
  | 'groups'                  // pi_planning
  | 'flag'                    // sprint_start
  | 'ac_unit'                 // code_freeze (gel)
  | 'block'                   // psi (stop)
  | 'event';                  // other (agenda)

export interface Event {
  id?: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  color: EventColor;
  icon: EventIcon;
  category: EventCategory;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface EventTemplate {
  id?: string;
  name: string;
  title: string;
  color: EventColor;
  icon: EventIcon;
  category: EventCategory;
  description?: string;
  createdAt: string;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  mep: 'Mise en production',
  hotfix: 'Hotfix',
  maintenance: 'Maintenance',
  pi_planning: 'PI Planning',
  sprint_start: 'Début de sprint',
  code_freeze: 'Freeze du code',
  psi: 'PSI',
  other: 'Autre'
};

export const CATEGORY_DEFAULTS: Record<EventCategory, { color: EventColor; icon: EventIcon }> = {
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
export const CATEGORY_COLORS_DARK: Record<EventCategory, string> = {
  mep: '#4ade80',        // vert plus clair
  hotfix: '#f87171',     // rouge plus clair
  maintenance: '#9ca3af', // gris plus clair
  pi_planning: '#fde047', // jaune plus clair
  sprint_start: '#22d3ee', // turquoise plus clair
  code_freeze: '#fb923c', // orange plus clair
  psi: '#4b5563',        // gris foncé plus visible
  other: '#a78bfa'       // violet plus clair
};
