export type Theme = 'light' | 'dark';

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
  customCategories: CustomCategory[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  customCategories: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
