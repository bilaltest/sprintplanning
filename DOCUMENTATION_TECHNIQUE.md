# Documentation Technique - Event Planning App

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Système](#architecture-système)
3. [Architecture Frontend](#architecture-frontend)
4. [Architecture Backend](#architecture-backend)
5. [Flux de Données](#flux-de-données)
6. [Modèles de Données](#modèles-de-données)
7. [Diagrammes de Séquence](#diagrammes-de-séquence)
8. [Guide de Débogage](#guide-de-débogage)

---

## Vue d'ensemble

Application de planification d'événements DSI développée pour gérer:
- **Planning d'événements** (MEP, maintenances, PI Planning, etc.)
- **Gestion de releases** avec squads, features et actions
- **Feature Flipping / Memory Flipping** pour configuration applicative
- **Export multi-format** (PDF, Excel, JSON, CSV)
- **Historique** des modifications

### Stack Technique

```mermaid
graph TB
    subgraph "Frontend - Angular 20"
        A[Components Standalone]
        B[RxJS Services]
        C[HttpClient]
        D[Tailwind CSS]
    end

    subgraph "Backend - Node.js"
        E[Express.js]
        F[Prisma ORM]
        G[SQLite]
    end

    A --> B
    B --> C
    C --> E
    E --> F
    F --> G

    style A fill:#e3f2fd
    style E fill:#fff3e0
    style G fill:#e8f5e9
```

---

## Architecture Système

### Architecture Globale

```mermaid
graph LR
    User[Utilisateur]
    Browser[Navigateur]

    subgraph "Frontend :4200"
        Angular[Angular 20 App]
        Router[Angular Router]
        Services[Services RxJS]
    end

    subgraph "Backend :3000"
        Express[Express API]
        Prisma[Prisma ORM]
        SQLite[(SQLite DB)]
    end

    User --> Browser
    Browser --> Angular
    Angular --> Router
    Router --> Services
    Services -->|HTTP| Express
    Express --> Prisma
    Prisma --> SQLite

    style Angular fill:#1976d2,color:#fff
    style Express fill:#68a063,color:#fff
    style SQLite fill:#003b57,color:#fff
```

### Layers d'Architecture

```mermaid
graph TD
    subgraph "Presentation Layer"
        Components[Components<br/>UI Templates]
        Guards[Route Guards]
    end

    subgraph "Business Logic Layer"
        Services[Services<br/>Business Logic]
        Models[Models & Types]
    end

    subgraph "Data Access Layer"
        HTTP[HttpClient]
        Interceptors[Interceptors]
    end

    subgraph "Backend Layer"
        Routes[Express Routes]
        Controllers[Controllers]
        Prisma[Prisma Client]
    end

    subgraph "Data Layer"
        DB[(SQLite Database)]
    end

    Components --> Guards
    Components --> Services
    Services --> Models
    Services --> HTTP
    HTTP --> Interceptors
    Interceptors -->|REST API| Routes
    Routes --> Controllers
    Controllers --> Prisma
    Prisma --> DB

    style Components fill:#42a5f5
    style Services fill:#66bb6a
    style Controllers fill:#ffa726
    style DB fill:#ef5350
```

---

## Architecture Frontend

### Structure des Composants

```mermaid
graph TD
    App[AppComponent<br/>Root]

    App --> Login[LoginComponent<br/>Authentification]
    App --> Timeline[TimelineContainerComponent<br/>Hub Principal]
    App --> Releases[ReleasesListComponent<br/>Liste Releases]
    App --> Settings[SettingsComponent<br/>Paramètres]
    App --> History[HistoryComponent<br/>Historique]

    Timeline --> Annual[AnnualViewComponent<br/>Vue Annuelle]
    Timeline --> Month[MonthViewComponent<br/>Vue Mensuelle]
    Timeline --> EventModal[EventModalComponent<br/>CRUD Événement]
    Timeline --> FilterBar[FilterBarComponent<br/>Filtres]

    Releases --> ReleaseDetail[ReleaseDetailComponent<br/>Détail Release<br/>+ Feature Flipping]

    style App fill:#1976d2,color:#fff
    style Timeline fill:#388e3c,color:#fff
    style Releases fill:#d32f2f,color:#fff
    style Settings fill:#7b1fa2,color:#fff
```

### Services et leur Responsabilité

```mermaid
graph LR
    subgraph "Core Services"
        Auth[AuthService<br/>Authentification<br/>Token Management]
        Settings[SettingsService<br/>Préférences<br/>Thème, Catégories]
    end

    subgraph "Feature Services"
        Event[EventService<br/>CRUD Événements<br/>Duplication]
        Release[ReleaseService<br/>CRUD Releases<br/>Squads, Features, Actions]
        Timeline[TimelineService<br/>Navigation<br/>Vue, Date]
    end

    subgraph "Utility Services"
        Filter[FilterService<br/>Filtrage Catégories]
        Export[ExportService<br/>PDF, Excel, JSON, CSV]
        Category[CategoryService<br/>Catégories Système<br/>+ Personnalisées]
        HistorySvc[HistoryService<br/>Tracking Actions<br/>Auto-refresh]
    end

    style Auth fill:#d32f2f,color:#fff
    style Event fill:#1976d2,color:#fff
    style Export fill:#388e3c,color:#fff
```

### Flux RxJS - State Management

```mermaid
graph TD
    subgraph "EventService"
        EventsBS[BehaviorSubject&lt;Event[]&gt;<br/>eventsSubject]
        EventsObs[Observable&lt;Event[]&gt;<br/>events$]
        LoadingBS[BehaviorSubject&lt;boolean&gt;<br/>loadingSubject]
        LoadingObs[Observable&lt;boolean&gt;<br/>loading$]
    end

    subgraph "Components"
        TimelineContainer[TimelineContainer]
        AnnualView[AnnualView]
        MonthView[MonthView]
    end

    EventsBS --> EventsObs
    LoadingBS --> LoadingObs

    EventsObs -->|subscribe + takeUntilDestroyed| TimelineContainer
    EventsObs -->|subscribe + takeUntilDestroyed| AnnualView
    EventsObs -->|subscribe + takeUntilDestroyed| MonthView

    TimelineContainer -->|createEvent| EventService
    EventService -->|next| EventsBS

    style EventsBS fill:#ff9800
    style EventsObs fill:#4caf50
```

---

## Architecture Backend

### Routes et Contrôleurs

```mermaid
graph LR
    Client[Client HTTP]

    subgraph "Express Router"
        EventRoutes[/api/events<br/>event.routes.js]
        ReleaseRoutes[/api/releases<br/>release.routes.js]
        SettingsRoutes[/api/settings<br/>settings.routes.js]
        HistoryRoutes[/api/history<br/>history.routes.js]
    end

    subgraph "Controllers"
        EventCtrl[EventController<br/>CRUD + Search]
        ReleaseCtrl[ReleaseController<br/>CRUD + Nested Entities]
        SettingsCtrl[SettingsController<br/>Get/Update Preferences]
        HistoryCtrl[HistoryController<br/>Track + Rollback]
    end

    subgraph "Prisma ORM"
        PrismaClient[Prisma Client<br/>Type-safe DB Access]
    end

    Client -->|POST /api/events| EventRoutes
    Client -->|GET /api/releases/:id| ReleaseRoutes
    Client -->|PUT /api/settings| SettingsRoutes
    Client -->|GET /api/history| HistoryRoutes

    EventRoutes --> EventCtrl
    ReleaseRoutes --> ReleaseCtrl
    SettingsRoutes --> SettingsCtrl
    HistoryRoutes --> HistoryCtrl

    EventCtrl --> PrismaClient
    ReleaseCtrl --> PrismaClient
    SettingsCtrl --> PrismaClient
    HistoryCtrl --> PrismaClient

    style EventRoutes fill:#1976d2,color:#fff
    style ReleaseRoutes fill:#388e3c,color:#fff
    style PrismaClient fill:#2d3748,color:#fff
```

### Modèle de Base de Données

```mermaid
erDiagram
    Event {
        string id PK
        string title
        string date
        string startTime
        string endTime
        string color
        string icon
        string category
        string description
        datetime createdAt
        datetime updatedAt
    }

    Release {
        string id PK
        string name
        string version
        string releaseDate
        string description
        string status
        datetime createdAt
        datetime updatedAt
    }

    Squad {
        string id PK
        string releaseId FK
        int squadNumber
        datetime createdAt
        datetime updatedAt
    }

    Feature {
        string id PK
        string squadId FK
        string title
        string description
        int order
        datetime createdAt
        datetime updatedAt
    }

    Action {
        string id PK
        string squadId FK
        string phase
        string type
        string title
        string description
        string status
        int order
        datetime createdAt
        datetime updatedAt
    }

    Flipping {
        string id PK
        string actionId FK "1-1"
        string flippingType
        string ruleName
        string ruleAction
        string targetClients "JSON"
        string targetCaisses
        string targetOS "JSON"
        string targetVersions "JSON"
        datetime createdAt
        datetime updatedAt
    }

    Settings {
        string id PK
        string theme
        string customCategories "JSON"
        datetime createdAt
        datetime updatedAt
    }

    History {
        string id PK
        string action
        string eventId
        string eventData "JSON"
        string previousData "JSON"
        datetime timestamp
    }

    Release ||--o{ Squad : "has 6"
    Squad ||--o{ Feature : "has many"
    Squad ||--o{ Action : "has many"
    Action ||--|| Flipping : "has 0-1"
```

---

## Flux de Données

### Flux CRUD - Événements

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant EventService
    participant HttpClient
    participant Backend
    participant DB

    User->>Component: Crée événement
    Component->>EventService: createEvent(event)
    EventService->>EventService: loadingSubject.next(true)
    EventService->>HttpClient: POST /api/events
    HttpClient->>Backend: HTTP Request
    Backend->>DB: INSERT INTO Event
    DB-->>Backend: Event créé
    Backend-->>HttpClient: 201 Created
    HttpClient-->>EventService: Event object
    EventService->>EventService: loadEvents()
    EventService->>HttpClient: GET /api/events
    HttpClient->>Backend: HTTP Request
    Backend->>DB: SELECT * FROM Event
    DB-->>Backend: Events array
    Backend-->>HttpClient: 200 OK
    HttpClient-->>EventService: Events[]
    EventService->>EventService: eventsSubject.next(events)
    EventService->>EventService: loadingSubject.next(false)
    EventService-->>Component: Observable emit
    Component->>Component: takeUntilDestroyed
    Component-->>User: UI mise à jour
```

### Flux Feature Flipping - Release

```mermaid
sequenceDiagram
    participant User
    participant ReleaseDetail
    participant ReleaseService
    participant Backend
    participant DB

    User->>ReleaseDetail: Remplit formulaire FF
    ReleaseDetail->>ReleaseDetail: Validation champs
    ReleaseDetail->>ReleaseDetail: Parse targetVersions
    ReleaseDetail->>ReleaseService: addAction(squadId, actionDto)

    alt Action avec Flipping
        ReleaseService->>Backend: POST /api/squads/:id/actions
        Note over Backend: actionDto.flipping présent
        Backend->>DB: BEGIN TRANSACTION
        Backend->>DB: INSERT INTO Action
        Backend->>DB: INSERT INTO Flipping<br/>(targetClients: JSON.stringify)
        Backend->>DB: COMMIT
        DB-->>Backend: Action + Flipping
        Backend-->>ReleaseService: Action object
    end

    ReleaseService->>ReleaseService: loadRelease()
    ReleaseService->>Backend: GET /api/releases/:id
    Backend->>DB: SELECT Release<br/>INCLUDE Squads, Actions, Flipping
    DB-->>Backend: Complete Release
    Backend->>Backend: transformRelease()<br/>(JSON.parse targetClients, etc.)
    Backend-->>ReleaseService: Release object
    ReleaseService->>ReleaseService: currentReleaseSubject.next(release)
    ReleaseService-->>ReleaseDetail: Observable emit
    ReleaseDetail-->>User: UI mise à jour
```

### Flux Authentification

```mermaid
sequenceDiagram
    participant User
    participant LoginComponent
    participant AuthService
    participant AuthGuard
    participant Router

    User->>LoginComponent: Entre mot de passe
    LoginComponent->>AuthService: login(password)

    alt Password correct ("NMB")
        AuthService->>AuthService: Génère token
        AuthService->>AuthService: sessionStorage.setItem('auth_token')
        AuthService->>AuthService: isAuthenticatedSubject.next(true)
        AuthService-->>LoginComponent: Observable emit true
        LoginComponent->>Router: navigate(['/'])
        Router->>AuthGuard: canActivate()
        AuthGuard->>AuthService: isAuthenticated()
        AuthService->>AuthService: Check sessionStorage
        AuthService-->>AuthGuard: true
        AuthGuard-->>Router: Allow navigation
        Router-->>User: Redirection Timeline
    else Password incorrect
        AuthService-->>LoginComponent: Observable emit false
        LoginComponent-->>User: Message erreur
    end
```

---

## Modèles de Données

### Event Model

```typescript
interface Event {
  id?: string;
  title: string;              // Requis
  date: string;               // ISO YYYY-MM-DD
  startTime?: string;         // HH:mm
  endTime?: string;           // HH:mm
  color: string;              // Hex #RRGGBB
  icon: string;               // Material Icons name
  category: EventCategory;    // Type prédéfini
  description?: string;
  createdAt: string;
}

type EventCategory =
  | 'mep'           // Mise en production
  | 'hotfix'
  | 'maintenance'
  | 'pi_planning'
  | 'sprint_start'
  | 'code_freeze'
  | 'psi'
  | 'other';
```

### Release Model

```typescript
interface Release {
  id?: string;
  name: string;               // Ex: "Release Q1 2024"
  version: string;            // Ex: "40.5"
  releaseDate: string;        // ISO date
  description?: string;
  status: ReleaseStatus;      // planned | in_progress | completed | cancelled
  squads: Squad[];            // Toujours 6 squads
  createdAt: string;
  updatedAt: string;
}

interface Squad {
  id?: string;
  releaseId: string;
  squadNumber: number;        // 1-6
  features: Feature[];
  actions: Action[];
  createdAt: string;
  updatedAt: string;
}

interface Action {
  id?: string;
  squadId: string;
  phase: ActionPhase;         // pre_mep | post_mep
  type: ActionType;
  title: string;
  description?: string;
  status: ActionStatus;       // pending | completed
  order: number;
  flipping?: Flipping;        // Optionnel, si type === feature_flipping || memory_flipping
  createdAt: string;
  updatedAt: string;
}
```

### Flipping Model

```typescript
interface Flipping {
  id?: string;
  actionId: string;
  flippingType: FlippingType;        // feature_flipping | memory_flipping
  ruleName: string;                  // Ex: "FEATURE_NEW_DASHBOARD"
  ruleAction: RuleAction;            // create_rule | obsolete_rule | disable_rule | enable_rule
  targetClients: string[];           // ["all"] ou ["891234567", "898765432"]
  targetCaisses?: string;            // "Caisse 1, Caisse 2" ou undefined (= toutes)
  targetOS: OSType[];                // ["ios", "android"] ou ["ios"] ou []
  targetVersions: VersionCondition[]; // [{ operator: ">=", version: "40.0" }] ou []
  createdAt: string;
  updatedAt: string;
}

interface VersionCondition {
  operator: VersionOperator;   // ">=" | "<=" | ">" | "<" | "=" | "!="
  version: string;             // "40.5"
}
```

---

## Diagrammes de Séquence

### Création d'un Événement

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant TC as TimelineContainer
    participant EM as EventModal
    participant ES as EventService
    participant API as Backend API

    U->>TC: Clic sur jour vide
    TC->>EM: Ouvre modale (mode création)
    U->>EM: Remplit formulaire
    U->>EM: Clique "Enregistrer"
    EM->>EM: Valide formulaire
    EM->>ES: createEvent(eventData)
    ES->>ES: loadingSubject.next(true)
    ES->>API: POST /api/events
    API->>API: Valide + Insert DB
    API-->>ES: 201 Created (event)
    ES->>ES: loadEvents()
    ES->>API: GET /api/events
    API-->>ES: 200 OK (all events)
    ES->>ES: eventsSubject.next(events)
    ES->>ES: loadingSubject.next(false)
    ES-->>EM: Événement créé
    EM->>EM: Ferme modale
    EM->>TC: Notification success
    TC->>TC: Subscription events$ update
    TC-->>U: Vue mise à jour
```

### Export PDF

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant TC as TimelineContainer
    participant EXP as ExportService
    participant H2C as html2canvas
    participant JSPDF as jsPDF

    U->>TC: Clique "Exporter PDF"
    TC->>EXP: exportToPdf(elementId)
    EXP->>EXP: document.getElementById(elementId)

    alt Element trouvé
        EXP->>H2C: html2canvas(element)
        H2C->>H2C: Capture screenshot
        H2C-->>EXP: Canvas object
        EXP->>EXP: canvas.toDataURL('image/png')
        EXP->>JSPDF: new jsPDF(orientation, 'mm', 'a4')
        EXP->>JSPDF: pdf.addImage(imgData, 'PNG', ...)
        EXP->>JSPDF: pdf.save('timeline.pdf')
        JSPDF-->>EXP: Fichier téléchargé
        EXP-->>TC: Success
        TC-->>U: Fichier téléchargé
    else Element non trouvé
        EXP-->>TC: Error
        TC-->>U: Message erreur
    end
```

### Navigation Timeline avec Filtres

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FB as FilterBar
    participant FS as FilterService
    participant TC as TimelineContainer
    participant AV as AnnualView

    U->>FB: Toggle filtre "MEP"
    FB->>FS: toggleCategory('mep')
    FS->>FS: Update activeFiltersSubject
    FS-->>FB: filter$ emit
    FS-->>TC: filter$ emit
    TC->>TC: filterEvents()
    TC->>AV: [events]="filteredEvents"
    AV->>AV: Rebuild calendar
    AV-->>U: Vue mise à jour (sans MEP)

    U->>FB: Reset filtres
    FB->>FS: resetFilters()
    FS->>FS: activeFiltersSubject.next(DEFAULT_FILTER)
    FS-->>TC: filter$ emit
    TC->>TC: filterEvents()
    TC->>AV: [events]="allEvents"
    AV-->>U: Vue complète
```

---

## Guide de Débogage

### Problèmes Courants

#### 1. Memory Leaks - Subscriptions

**Symptôme**: Application ralentit avec le temps, consommation mémoire augmente

**Diagnostic**:
```typescript
// ❌ MAUVAIS - Leak
ngOnInit() {
  this.eventService.events$.subscribe(events => {
    this.events = events;
  });
}

// ✅ BON - Pas de leak
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

constructor(private eventService: EventService) {
  this.eventService.events$
    .pipe(takeUntilDestroyed())
    .subscribe(events => {
      this.events = events;
    });
}
```

**Vérification**:
```bash
# Chrome DevTools
1. Ouvrir Performance Monitor
2. Naviguer dans l'app (changements de routes)
3. Observer "JS Heap Size" - ne doit pas augmenter indéfiniment
```

#### 2. Auto-refresh Non Arrêté

**Symptôme**: Appels API continuent après fermeture composant

**Solution**:
```typescript
export class HistoryService implements OnDestroy {
  private refreshIntervalId?: number;

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private stopAutoRefresh(): void {
    if (this.refreshIntervalId) {
      window.clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = undefined;
    }
  }
}
```

#### 3. Erreurs TypeScript après Modifications

**Symptôme**: Compilation échoue avec erreurs TypeScript

**Diagnostic**:
```bash
# Nettoyer cache Angular
cd event-planning-app
rm -rf .angular node_modules/.cache
npm start
```

#### 4. Feature Flipping - Données Non Affichées

**Symptôme**: Après ajout action FF, les données ne s'affichent pas

**Diagnostic**:
```typescript
// Vérifier que loadRelease() est appelé après ajout
async addAction(squadId: string, actionDto: CreateActionDto) {
  await this.http.post(...).toPromise();

  // CRITIQUE: Recharger la release
  if (this.currentReleaseSubject.value) {
    await this.getRelease(this.currentReleaseSubject.value.id!);
  }
}
```

**Vérifier JSON parsing backend**:
```javascript
// backend - release.controller.js
const transformRelease = (release) => ({
  ...release,
  squads: release.squads.map(squad => ({
    ...squad,
    actions: squad.actions.map(action => ({
      ...action,
      flipping: action.flipping ? {
        ...action.flipping,
        // CRITIQUE: Parser les champs JSON
        targetClients: JSON.parse(action.flipping.targetClients || '[]'),
        targetOS: JSON.parse(action.flipping.targetOS || '[]'),
        targetVersions: JSON.parse(action.flipping.targetVersions || '[]')
      } : undefined
    }))
  }))
});
```

### Outils de Débogage

#### Angular DevTools

```bash
# Installation
chrome://extensions/
# Rechercher "Angular DevTools"
```

**Utilisation**:
- **Component Explorer**: Inspecter état composants
- **Profiler**: Mesurer change detection
- **Injector Tree**: Visualiser injection dépendances

#### Network Monitoring

```javascript
// Ajouter dans app.config.ts pour debug HTTP
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          console.log('HTTP Request:', req.method, req.url);
          return next(req).pipe(
            tap(event => {
              if (event.type === HttpEventType.Response) {
                console.log('HTTP Response:', event.status, event.body);
              }
            })
          );
        }
      ])
    )
  ]
};
```

#### Database Inspection

```bash
# Prisma Studio
cd event-planning-backend
npx prisma studio
# Ouvre http://localhost:5555
```

### Performance Profiling

#### Bundle Size Analysis

```bash
cd event-planning-app
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

#### Runtime Performance

```typescript
// Mesurer temps de chargement
ngOnInit() {
  const start = performance.now();

  this.loadData().then(() => {
    const end = performance.now();
    console.log(`Load time: ${end - start}ms`);
  });
}
```

#### Memory Profiling

```javascript
// Chrome DevTools > Memory
1. Prendre snapshot initial
2. Naviguer dans l'app (10-20 navigations)
3. Forcer garbage collection (icône poubelle)
4. Prendre snapshot final
5. Comparer snapshots - chercher "Detached HTMLElement"
```

---

## Bonnes Pratiques Implémentées

### ✅ Angular Best Practices

1. **Standalone Components**: Tous les composants sont standalone
2. **takeUntilDestroyed()**: Toutes les subscriptions sont nettoyées
3. **OnPush Change Detection**: Préparé pour optimisation future
4. **Lazy Loading**: Routes chargées à la demande
5. **Type Safety**: TypeScript strict activé

### ✅ Backend Best Practices

1. **Prisma ORM**: Protection injection SQL native
2. **Transaction Support**: Operations multi-tables atomiques
3. **Error Handling**: Gestion centralisée des erreurs
4. **CORS Configuration**: Configuré pour dev/prod
5. **Validation Input**: Validation des données entrantes

### ✅ Code Quality

1. **No Console.log in Production**: Supprimés
2. **No Dead Code**: Code mort supprimé
3. **No Memory Leaks**: Subscriptions nettoyées
4. **Consistent Naming**: Conventions respectées
5. **Documentation**: Code commenté où nécessaire

---

## Prochaines Étapes Recommandées

### Court Terme (Semaine 1-2)

1. **Tests Unitaires** - Atteindre 30% coverage (Phase 1 du plan de tests)
2. **ESLint Configuration** - Règles pour détecter memory leaks
3. **CI/CD Pipeline** - Automated testing & deployment

### Moyen Terme (Mois 1-2)

4. **Tests E2E** - Cypress/Playwright pour parcours critiques
5. **Logging Service** - Remplacement console.log
6. **Error Monitoring** - Intégration Sentry
7. **Performance Monitoring** - Métriques temps réel

### Long Terme (Trimestre 1-2)

8. **Authentification API** - Remplacement password en dur
9. **Multi-tenancy** - Support multi-équipes
10. **PWA** - Support offline avec Service Workers
11. **Internationalization** - Support multi-langues

---

## Support et Ressources

### Documentation Officielle

- [Angular 20](https://angular.dev)
- [RxJS](https://rxjs.dev)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)

### Commandes Utiles

```bash
# Frontend
cd event-planning-app
npm start                      # Dev server
npm run build                  # Production build
npm test                       # Unit tests
ng generate component name     # Nouveau composant

# Backend
cd event-planning-backend
npm run dev                    # Dev server avec nodemon
npm start                      # Production server
npx prisma db push             # Sync schema
npx prisma studio              # Database UI
npx prisma migrate dev         # Create migration

# Database
sqlite3 event-planning-backend/prisma/dev.db
.tables                        # Liste tables
.schema Event                  # Schema table
SELECT * FROM Event LIMIT 10;  # Query
.quit                          # Exit
```

---

**Dernière mise à jour**: 30 Novembre 2025
**Version de l'application**: 1.0.0
**Auteur**: Équipe DSI
