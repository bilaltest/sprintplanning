import { EventCategory } from './event.model';

export interface EventFilter {
  categories: EventCategory[];
}

export const DEFAULT_FILTER: EventFilter = {
  categories: []
};
