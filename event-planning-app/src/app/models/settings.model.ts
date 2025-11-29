import { EventColor } from './event.model';

export type Theme = 'light' | 'dark';
export type Language = 'fr' | 'en';
export type WeekStart = 'monday' | 'sunday';

export interface ColorCustomization {
  name: string;
  color: string;
}

export interface UserPreferences {
  id?: string;
  theme: Theme;
  language: Language;
  weekStart: WeekStart;
  customColors: ColorCustomization[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'fr',
  weekStart: 'monday',
  customColors: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
