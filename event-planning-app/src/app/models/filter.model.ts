import { EventCategory } from './event.model';

export interface EventFilter {
  categories: EventCategory[];
  searchText: string;
  dateFrom?: string;
  dateTo?: string;
}

export const DEFAULT_FILTER: EventFilter = {
  categories: [],
  searchText: '',
  dateFrom: undefined,
  dateTo: undefined
};
