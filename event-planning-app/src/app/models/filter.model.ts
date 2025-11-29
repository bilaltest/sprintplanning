import { EventCategory } from './event.model';

export interface EventFilter {
  categories: EventCategory[];
  dateFrom?: string; // ISO format
  dateTo?: string; // ISO format
  searchText: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export const DEFAULT_FILTER: EventFilter = {
  categories: [],
  searchText: ''
};
