import { EventColor } from './event.model';

export type Theme = 'light' | 'dark';
export type Language = 'fr' | 'en';
export type WeekStart = 'monday' | 'sunday';

export interface ColorCustomization {
  name: string;
  color: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface UserPreferences {
  id?: string;
  theme: Theme;
  language: Language;
  weekStart: WeekStart;
  customColors: ColorCustomization[];
  customCategories: CustomCategory[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'fr',
  weekStart: 'monday',
  customColors: [],
  customCategories: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
