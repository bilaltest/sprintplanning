# Architecture de l'Application

## Vue d'Ensemble

L'application suit une architecture **Clean Architecture** avec séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                       │
│  Components (Smart & Dumb) + Templates              │
│  - timeline-container (smart)                       │
│  - year/quarter/month-view (dumb)                   │
│  - event-modal (smart)                              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC                      │
│  Services (Injectable) + RxJS State Management      │
│  - EventService (CRUD)                              │
│  - FilterService (filtering)                        │
│  - ExportService (PDF/PNG/JSON/CSV)                 │
│  - HistoryService (rollback)                        │
│  - SettingsService (preferences)                    │
│  - TimelineService (navigation)                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                   DATA LAYER                         │
│  Dexie.js (IndexedDB Wrapper)                       │
│  - events table                                     │
│  - templates table                                  │
│  - preferences table                                │
│  - history table                                    │
└─────────────────────────────────────────────────────┘
```

## Patterns Utilisés

### 1. Smart/Dumb Components

**Smart Components** (Containers)
- Gèrent la logique métier
- S'abonnent aux Observables
- Manipulent les services
- Exemples : `TimelineContainerComponent`, `EventModalComponent`

**Dumb Components** (Presentational)
- Reçoivent les données via `@Input()`
- Émettent les événements via `@Output()`
- Pas d'injection de services (sauf utilitaires)
- Exemples : `YearViewComponent`, `MonthViewComponent`

### 2. Service Layer Pattern

Chaque service a une responsabilité unique :

```typescript
// EventService : CRUD événements
class EventService {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  async createEvent(event: Event) { /* ... */ }
  async updateEvent(id: string, updates: Partial<Event>) { /* ... */ }
  async deleteEvent(id: string) { /* ... */ }
}

// FilterService : logique de filtrage
class FilterService {
  private filterSubject = new BehaviorSubject<EventFilter>(DEFAULT_FILTER);
  public filteredEvents$ = combineLatest([
    eventService.events$,
    this.filter$
  ]).pipe(map(([events, filter]) => this.applyFilters(events, filter)));
}
```

### 3. Observer Pattern (RxJS)

Flux de données unidirectionnel :

```
User Action → Component → Service → BehaviorSubject
                                          ↓
                                    Observable
                                          ↓
                                  Components (subscribe)
```

### 4. Repository Pattern (via Dexie)

```typescript
class AppDatabase extends Dexie {
  events!: Table<Event, string>;
  templates!: Table<EventTemplate, string>;

  constructor() {
    super('EventPlanningDB');
    this.version(1).stores({
      events: '++id, date, category, title',
      templates: '++id, name, category'
    });
  }
}

export const db = new AppDatabase();
```

## Flux de Données

### Exemple : Création d'un Événement

```
1. User clicks "Nouvel événement"
   └─> TimelineContainerComponent.openCreateEventModal()

2. Modal opens
   └─> EventModalComponent displays form

3. User fills form and submits
   └─> EventModalComponent.onSubmit()
       └─> EventService.createEvent(eventData)
           └─> db.events.add(newEvent)
           └─> HistoryService.addEntry({ action: 'create', ... })
           └─> EventService.loadEvents()
               └─> eventsSubject.next(updatedEvents)

4. All subscribed components receive updated events
   └─> TimelineContainerComponent (via filteredEvents$)
       └─> MonthViewComponent receives new events via @Input()
           └─> Template re-renders with new event
```

## Gestion d'État

### State Management Strategy

**Pas de NgRx** pour cette application car :
- Complexité faible/moyenne
- Pas de state partagé massif
- BehaviorSubject suffit largement

**Architecture d'État :**

```typescript
// Each service holds its own state
export class EventService {
  // State
  private eventsSubject = new BehaviorSubject<Event[]>([]);

  // Exposed observable (read-only)
  public events$ = this.eventsSubject.asObservable();

  // State mutations (async)
  async createEvent() {
    // 1. Update database
    await db.events.add(newEvent);

    // 2. Reload from source of truth (DB)
    await this.loadEvents();
  }

  private async loadEvents() {
    const events = await db.events.toArray();
    this.eventsSubject.next(events); // Emit new state
  }
}
```

### Derived State (FilterService)

```typescript
export class FilterService {
  // Combine multiple sources
  public filteredEvents$ = combineLatest([
    eventService.events$,      // Source 1
    this.filter$               // Source 2
  ]).pipe(
    debounceTime(300),         // Performance optimization
    map(([events, filter]) => this.applyFilters(events, filter))
  );
}
```

## Modèles de Données

### Core Models

```typescript
// Event (événement)
interface Event {
  id?: string;
  title: string;              // Max 100 chars
  date: string;               // ISO format YYYY-MM-DD
  startTime?: string;         // HH:mm
  endTime?: string;           // HH:mm
  color: EventColor;          // #RRGGBB
  icon: EventIcon;            // Material icon name
  category: EventCategory;    // mep | incident | ...
  description?: string;       // Max 500 chars
  createdAt: string;          // ISO timestamp
  updatedAt: string;          // ISO timestamp
}

// Filter (filtre)
interface EventFilter {
  categories: EventCategory[];
  dateFrom?: string;
  dateTo?: string;
  searchText: string;
}

// HistoryEntry (historique)
interface HistoryEntry {
  id?: string;
  action: 'create' | 'update' | 'delete';
  eventSnapshot: Event;
  previousSnapshot?: Event;
  timestamp: string;
  description: string;
}

// UserPreferences (paramètres)
interface UserPreferences {
  id?: string;
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  weekStart: 'monday' | 'sunday';
  customColors: ColorCustomization[];
  createdAt: string;
  updatedAt: string;
}
```

## Performance Optimizations

### 1. Lazy Loading

```typescript
// app.routes.ts
{
  path: 'planning',
  loadComponent: () => import('./components/timeline/timeline-container.component')
    .then(m => m.TimelineContainerComponent)
}
```

### 2. Debouncing

```typescript
// filter.service.ts
this.filter$.pipe(
  debounceTime(300),  // Wait 300ms after last input
  distinctUntilChanged()
)
```

### 3. TrackBy Functions

```typescript
// Dans les templates
*ngFor="let event of events; trackBy: trackByEventId"

// Dans le component
trackByEventId(index: number, event: Event): string {
  return event.id!;
}
```

### 4. OnPush Change Detection (à implémenter)

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## Sécurité

### 1. Input Validation

```typescript
// Max lengths
title: string;        // max 100 chars (HTML maxlength)
description: string;  // max 500 chars (HTML maxlength)
```

### 2. XSS Prevention

Angular sanitize automatiquement :
```html
<!-- Safe: Angular échappe automatiquement -->
<div>{{ event.title }}</div>
```

### 3. IndexedDB Quota

```typescript
try {
  await db.events.add(newEvent);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Handle storage full
  }
}
```

## Testing Strategy

### Unit Tests (Jest)

```typescript
// event.service.spec.ts
describe('EventService', () => {
  it('should create an event', async () => {
    const event = await service.createEvent({
      title: 'Test',
      date: '2025-01-01',
      category: 'mep'
    });
    expect(event.id).toBeDefined();
  });
});
```

### Component Tests

```typescript
// month-view.component.spec.ts
describe('MonthViewComponent', () => {
  it('should display events for a day', () => {
    component.events = [mockEvent];
    fixture.detectChanges();
    const eventElements = fixture.nativeElement.querySelectorAll('.event');
    expect(eventElements.length).toBe(1);
  });
});
```

## Évolutivité

### Adding New Features

#### Exemple : Ajouter un nouveau type d'export

1. Créer la méthode dans `ExportService`
```typescript
async exportAsXLSX(): Promise<void> {
  // Implementation
}
```

2. Ajouter le bouton dans le template
```html
<button (click)="exportAsXLSX()">Export XLSX</button>
```

#### Exemple : Ajouter une nouvelle vue timeline

1. Créer le composant
```typescript
@Component({
  selector: 'app-week-view',
  template: `<!-- ... -->`
})
export class WeekViewComponent {
  @Input() events: Event[] | null = [];
}
```

2. Ajouter dans le router
```typescript
// timeline-container.component.ts
views = [
  { value: 'week', label: 'Semaine', icon: 'view_week' }
];
```

3. Ajouter la logique dans `TimelineService`
```typescript
case 'week':
  // Navigation logic
```

## Dépendances Externes

### Production Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@angular/core` | 20.0+ | Framework principal |
| `dexie` | 4.0+ | IndexedDB wrapper |
| `date-fns` | 4.1+ | Manipulation dates |
| `html2canvas` | 1.4+ | Export PNG |
| `jspdf` | 2.5+ | Export PDF |

### Dev Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `tailwindcss` | 4.0+ | Styles utility-first |
| `jest` | 29.7+ | Testing framework |
| `typescript` | 5.7+ | Type safety |

## Limitations Connues

1. **Pas de backend** : Données uniquement locales (IndexedDB)
2. **Pas de sync** : Impossible de partager entre utilisateurs
3. **Quota IndexedDB** : ~50MB par domaine (navigateur dépendant)
4. **Pas de PWA** : Pas de fonctionnement offline complet (à venir)

## Roadmap Technique

### Court terme
- [ ] Tests unitaires (80% coverage)
- [ ] OnPush change detection
- [ ] Virtual scrolling (liste > 100 events)
- [ ] Drag & drop événements

### Moyen terme
- [ ] PWA avec Service Worker
- [ ] i18n complet (Angular i18n)
- [ ] Raccourcis clavier (hotkeys)

### Long terme
- [ ] Backend optionnel (API REST)
- [ ] Sync multi-devices
- [ ] Export iCal
- [ ] Mode collaboration

---

**Note** : Cette architecture est conçue pour évoluer progressivement sans refactoring majeur.
