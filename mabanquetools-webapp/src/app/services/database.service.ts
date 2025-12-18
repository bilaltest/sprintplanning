import Dexie, { Table } from 'dexie';
import { Event } from '@models/event.model';
import { UserPreferences } from '@models/settings.model';
import { HistoryEntry } from '@models/history.model';

export class AppDatabase extends Dexie {
  events!: Table<Event, string>;
  preferences!: Table<UserPreferences, string>;
  history!: Table<HistoryEntry, string>;

  constructor() {
    super('EventPlanningDB');

    this.version(1).stores({
      events: '++id, date, category, title, createdAt, updatedAt',
      preferences: '++id, theme, language',
      history: '++id, timestamp, action'
    });
  }
}

export const db = new AppDatabase();
