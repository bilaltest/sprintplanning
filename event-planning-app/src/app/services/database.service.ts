import Dexie, { Table } from 'dexie';
import { Event, EventTemplate } from '@models/event.model';
import { UserPreferences } from '@models/settings.model';
import { HistoryEntry } from '@models/history.model';

export class AppDatabase extends Dexie {
  events!: Table<Event, string>;
  templates!: Table<EventTemplate, string>;
  preferences!: Table<UserPreferences, string>;
  history!: Table<HistoryEntry, string>;

  constructor() {
    super('EventPlanningDB');

    this.version(1).stores({
      events: '++id, date, category, title, createdAt, updatedAt',
      templates: '++id, name, category, createdAt',
      preferences: '++id, theme, language',
      history: '++id, timestamp, action'
    });
  }
}

export const db = new AppDatabase();
