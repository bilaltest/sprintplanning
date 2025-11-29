# Event Planning App - Documentation Technique

## Vue d'ensemble

Application de planification d'événements pour l'équipe DSI d'une banque, développée avec Angular 20 et Node.js/Express.

## Stack Technique

### Frontend
- **Framework**: Angular 20 (Standalone Components)
- **Styling**: Tailwind CSS avec mode sombre
- **Icons**: Material Icons
- **Date Management**: date-fns
- **HTTP**: HttpClient (Angular)
- **State Management**: RxJS (BehaviorSubject/Observable)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite
- **CORS**: Activé pour développement local

## Architecture

### Structure Frontend (`event-planning-app/src/app/`)

```
├── components/
│   ├── auth/
│   │   └── login.component.ts
│   ├── filters/
│   │   └── filter-bar.component.ts
│   ├── modals/
│   │   └── event-modal.component.ts
│   ├── settings/
│   │   └── settings.component.ts
│   └── timeline/
│       ├── annual-view.component.ts
│       ├── month-view.component.ts
│       └── timeline-container.component.ts
├── models/
│   ├── event.model.ts
│   ├── filter.model.ts
│   ├── settings.model.ts
│   └── timeline.model.ts
├── services/
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── export.service.ts
│   ├── filter.service.ts
│   ├── settings.service.ts
│   └── timeline.service.ts
└── guards/
    └── auth.guard.ts
```

### Structure Backend (`event-planning-backend/`)

```
├── prisma/
│   ├── schema.prisma
│   └── dev.db (SQLite)
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── event.controller.js
│   │   ├── history.controller.js
│   │   └── settings.controller.js
│   ├── routes/
│   │   ├── event.routes.js
│   │   ├── history.routes.js
│   │   └── settings.routes.js
│   └── server.js
└── package.json
```

## Modèles de Données

### Event
```typescript
interface Event {
  id?: string;
  title: string;
  date: string; // Format ISO YYYY-MM-DD
  startTime?: string; // Format HH:mm
  endTime?: string; // Format HH:mm
  color: string; // Hex color
  icon: string; // Material Icons name
  category: EventCategory;
  description?: string;
  createdAt: string;
}
```

### EventCategory
```typescript
type EventCategory =
  | 'mep'           // Mise en production
  | 'hotfix'        // Hotfix
  | 'maintenance'   // Maintenance
  | 'pi_planning'   // PI Planning
  | 'sprint_start'  // Début de sprint
  | 'code_freeze'   // Freeze du code
  | 'psi'           // PSI
  | 'other';        // Autre
```

### UserPreferences
```typescript
interface UserPreferences {
  id?: string;
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  weekStart: 'monday' | 'sunday';
  customColors: ColorCustomization[];
  customCategories: CustomCategory[];
  createdAt: string;
  updatedAt: string;
}
```

### CustomCategory
```typescript
interface CustomCategory {
  id: string;
  name: string;      // snake_case identifier
  label: string;     // Display name
  color: string;     // Hex color
  icon: string;      // Material Icons name
}
```

## Fonctionnalités Principales

### 1. Authentification
- **Password simple**: "NMB"
- **SessionStorage**: Token stocké localement
- **AuthGuard**: Protection des routes
- **Architecture préparée**: Pour future intégration API

**Fichiers concernés**:
- `auth.service.ts` - Gestion authentification
- `auth.guard.ts` - Protection routes
- `login.component.ts` - Interface login

### 2. Vues Timeline

#### Vue Annuelle (par défaut)
- Affichage des 12 mois de l'année
- Grille compacte avec événements colorés
- Scroll vers le mois courant sur clic "Aujourd'hui"
- **Pas de scroll automatique** au chargement

#### Vue Mensuelle
- Calendrier mensuel détaillé
- Navigation mois par mois
- Même système de détail que vue annuelle

**Composants**:
- `timeline-container.component.ts` - Conteneur principal
- `annual-view.component.ts` - Vue annuelle
- `month-view.component.ts` - Vue mensuelle

### 3. Gestion des Événements

#### Création/Édition
- **Modale complète** avec formulaire
- Sélection catégorie, couleur, icône
- Dates et horaires optionnels
- Validation des données

#### Affichage
- **Panneau latéral** au clic sur un jour
- Liste des événements du jour
- Actions: éditer, supprimer, ajouter

#### Suppression
- Confirmation avant suppression
- Mise à jour automatique de la vue

**Composants**:
- `event-modal.component.ts` - Formulaire création/édition
- `event.service.ts` - API calls

### 4. Filtres

#### Filter Bar
- **Position**: Sticky sous le header (top-16)
- **Transparence**: bg-gray-50/80 avec backdrop-blur
- **Filtres disponibles**: Par catégorie uniquement
- **Badge cliquable**: Toggle catégorie
- **Reset**: Bouton pour réinitialiser

**Fichiers**:
- `filter-bar.component.ts` - Barre de filtres
- `filter.service.ts` - Logique filtrage
- `filter.model.ts` - Types

### 5. Paramètres

#### Apparence
- **Thème**: Clair/Sombre
- Toggle dans header + page paramètres
- Application automatique via SettingsService

#### Calendrier
- **Premier jour**: Lundi/Dimanche
- Affecte toutes les vues

#### Catégories
- **Affichage en grille**: 8 par ligne sur grands écrans (responsive)
- **Catégories prédéfinies**: 8 catégories par défaut (lecture seule)
- **Catégories personnalisées**: Création avec nom, icône, couleur
- **Suppression**: Bouton × au survol (uniquement custom)

#### Langue
- Français/Anglais (interface préparée)

**Composants**:
- `settings.component.ts` - Page paramètres
- `settings.service.ts` - Gestion préférences

### 6. Export de Données

Formats supportés:
- **PDF**: Export visuel du calendrier
- **Excel**: Export structuré
- **JSON**: Export données brutes
- **CSV**: Export tabulaire

**Service**: `export.service.ts`

### 7. Historique

- Tracking des opérations CRUD
- Snapshot des événements
- Possibilité de rollback (architecture préparée)

**Backend**: `history.controller.js`

## Services Clés

### TimelineService
```typescript
// État de la timeline
state$: Observable<TimelineState>
scrollToToday$: Observable<void>

// Navigation
setView(view: TimelineView): void
setCurrentDate(date: Date): void
goToToday(): void
```

### SettingsService
```typescript
// Préférences
preferences$: Observable<UserPreferences>

// Modifications
setTheme(theme: Theme): Promise<void>
setLanguage(language: Language): Promise<void>
setWeekStart(weekStart: WeekStart): Promise<void>
addCustomCategory(category: CustomCategory): Promise<void>
removeCustomCategory(id: string): Promise<void>
```

### FilterService
```typescript
// État des filtres
activeFilters$: Observable<EventFilter>

// Actions
toggleCategory(category: EventCategory): void
resetFilters(): void
```

### EventService
```typescript
// CRUD Opérations
events$: Observable<Event[]>

getEvents(): Promise<Event[]>
createEvent(event: Event): Promise<Event>
updateEvent(id: string, event: Event): Promise<Event>
deleteEvent(id: string): Promise<void>
```

## API Endpoints

### Events
```
GET    /api/events          - Liste tous les événements
GET    /api/events/:id      - Récupère un événement
POST   /api/events          - Crée un événement
PUT    /api/events/:id      - Met à jour un événement
DELETE /api/events/:id      - Supprime un événement
```

### Settings
```
GET    /api/settings        - Récupère les paramètres
PUT    /api/settings        - Met à jour les paramètres
```

### History
```
GET    /api/history         - Récupère l'historique
GET    /api/history/:id     - Récupère une entrée
```

## Base de Données (Prisma Schema)

### Event
```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  date        String
  startTime   String?
  endTime     String?
  color       String
  icon        String
  category    String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
  @@index([category])
}
```

### Settings
```prisma
model Settings {
  id               String   @id @default(cuid())
  theme            String   @default("light")
  language         String   @default("fr")
  weekStart        String   @default("monday")
  customColors     String   @default("[]")
  customCategories String   @default("[]")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### History
```prisma
model History {
  id           String   @id @default(cuid())
  action       String
  eventId      String?
  eventData    String
  previousData String?
  timestamp    DateTime @default(now())

  @@index([timestamp])
}
```

## Styling & Design System

### Couleurs
- **Background**: `bg-gray-100` / `dark:bg-gray-950`
- **Cards**: `bg-gray-50` / `dark:bg-gray-900`
- **Borders**: `border-gray-200` / `dark:border-gray-800`
- **Primary**: Vert (green-500/600)

### Composants Réutilisables (Tailwind Classes)
```scss
.card           // Carte avec bordure et shadow
.btn            // Bouton de base
.btn-primary    // Bouton principal (vert)
.btn-secondary  // Bouton secondaire (gris)
.btn-danger     // Bouton danger (rouge)
.btn-sm         // Petit bouton
.input          // Input de formulaire
.modal-overlay  // Overlay de modale
.modal-content  // Contenu de modale
```

### Animations
```scss
.slide-in-right   // Slide depuis droite
.slide-in-left    // Slide depuis gauche
.fade-in-scale    // Fade avec scale
```

## Gestion d'État

### Pattern Utilisé
- **Services avec BehaviorSubject/Subject**
- **Observables pour réactivité**
- **Async pipe dans templates**

### Exemple
```typescript
// Service
private preferencesSubject = new BehaviorSubject<UserPreferences>(DEFAULT);
public preferences$ = this.preferencesSubject.asObservable();

// Component
constructor(private settingsService: SettingsService) {
  this.settingsService.preferences$.subscribe(prefs => {
    this.preferences = prefs;
  });
}
```

## Points Techniques Importants

### 1. Scroll Automatique
- **Désactivé** au chargement de la vue annuelle
- **Activé** uniquement sur clic bouton "Aujourd'hui"
- Utilise un `Subject` (pas `BehaviorSubject`) pour éviter émission initiale

### 2. Filter Sticky
- Position: `sticky top-16` (64px pour header)
- Transparence: `/80` avec `backdrop-blur-md`
- Z-index: `40` pour rester au-dessus du contenu

### 3. Capitalisation Mois
```typescript
getMonthName(month: Date): string {
  const monthName = format(month, 'MMMM yyyy', { locale: fr });
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}
```

### 4. Catégories Personnalisées
- Stockées en JSON dans SQLite (stringify/parse)
- ID généré: `custom_${Date.now()}`
- Validation: name en snake_case

### 5. Dark Mode
- Application via classe `.dark` sur `<html>`
- Gestion dans `SettingsService.applyTheme()`
- Persistance en base de données

## Environnements

### Development
```typescript
// Frontend (environment.ts)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// Backend (.env)
PORT=3000
DATABASE_URL="file:./dev.db"
```

### Production
```typescript
// Frontend (environment.prod.ts)
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

## Scripts Utiles

### Frontend
```bash
npm start              # Démarrage dev (port 4200)
npm run build          # Build production
npm test               # Tests unitaires
ng generate component  # Générer composant
```

### Backend
```bash
npm run dev           # Démarrage avec nodemon
npm start             # Démarrage production
npx prisma db push    # Synchroniser schema DB
npx prisma studio     # Interface admin DB
```

## Tests

### Composants Testés
- `annual-view.component.spec.ts` - 8 tests
- `month-view.component.spec.ts` - 9 tests

### Scénarios Couverts
- Affichage panneau détail au clic
- Émission addEventClick sur jour vide
- Fermeture panneau détail
- Navigation événements
- Suppression avec confirmation

## Changelog Récent

### Version Actuelle

#### Suppression Mode "Wow"
- ✅ Supprimé `design-wow.css`
- ✅ Retiré type `DesignMode`
- ✅ Nettoyé backend (schema + controller)
- ✅ Migration DB effectuée

#### Ajustements Couleurs "Sobre"
- ✅ Background: `bg-gray-100` (au lieu de `bg-gray-50`)
- ✅ Cards: `bg-gray-50` (au lieu de `bg-white`)
- ✅ Meilleur contraste entre éléments

#### Corrections Bugs
- ✅ Auto-scroll annuel: `BehaviorSubject` → `Subject`
- ✅ Panneau détail: Rétabli sur month-view

#### Améliorations UI
- ✅ Catégories settings: Grille 8 colonnes (responsive)
- ✅ Filter sticky: `top-16` avec transparence `/80`
- ✅ Noms mois: Capitalisés
- ✅ Compteur événements: Supprimé

## Améliorations Futures Possibles

### Fonctionnalités
- [ ] Authentification API complète
- [ ] Gestion multi-utilisateurs
- [ ] Notifications/rappels
- [ ] Récurrence événements
- [ ] Import/export iCal
- [ ] Drag & drop événements
- [ ] Recherche avancée
- [ ] Vues semaine/jour

### Technique
- [ ] Internationalisation complète (i18n)
- [ ] Tests e2e (Cypress/Playwright)
- [ ] PWA (Service Worker)
- [ ] Optimisation performances (lazy loading)
- [ ] Backend TypeScript
- [ ] PostgreSQL au lieu de SQLite
- [ ] Docker containerization
- [ ] CI/CD pipeline

## Remarques

### Sécurité
- ⚠️ Authentification basique (password en dur)
- ⚠️ Pas de JWT/session côté serveur
- ✅ Architecture préparée pour migration

### Performance
- ✅ Pagination pas nécessaire (scope limité)
- ✅ Filtres côté client suffisants
- ✅ SQLite adapté pour usage équipe

### Accessibilité
- ⚠️ Labels ARIA à améliorer
- ⚠️ Navigation clavier à tester
- ✅ Contraste couleurs respecté

## Support & Contact

**Équipe**: DSI Banque
**Contexte**: Planning interne équipe
**Stack**: Angular 20 + Node.js + Prisma + SQLite
**Password**: NMB
