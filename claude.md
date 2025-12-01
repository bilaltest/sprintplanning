# Event Planning App - Documentation Technique

## Vue d'ensemble

Application de planification d'événements et de gestion de releases pour l'équipe DSI d'une banque, développée avec Angular 20 et Node.js/Express.

L'application comprend deux modules principaux :
1. **Planning** - Gestion d'événements sur timeline annuelle/mensuelle
2. **Releases** - Gestion de releases avec squads, features et actions (Feature/Memory Flipping)

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
│   ├── home/
│   │   └── home.component.ts
│   ├── modals/
│   │   └── event-modal.component.ts
│   ├── releases/
│   │   ├── releases-list.component.ts          # Liste des releases avec export
│   │   ├── release-detail.component.ts         # Détail release avec squads
│   │   ├── release-form.component.ts           # Création/édition release
│   │   ├── feature-form.component.ts           # Formulaire feature
│   │   └── action-form.component.ts            # Formulaire action avec FF/MF
│   ├── settings/
│   │   └── settings.component.ts
│   └── timeline/
│       ├── annual-view.component.ts
│       ├── month-view.component.ts
│       └── timeline-container.component.ts
├── layouts/
│   ├── planning-layout.component.ts            # Layout module Planning
│   └── releases-layout.component.ts            # Layout module Releases
├── models/
│   ├── event.model.ts
│   ├── filter.model.ts
│   ├── release.model.ts                        # Modèles Release/Squad/Feature/Action
│   ├── settings.model.ts
│   └── timeline.model.ts
├── services/
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── export.service.ts
│   ├── filter.service.ts
│   ├── release.service.ts                      # Service gestion releases
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
│   │   ├── release.controller.js              # CRUD releases
│   │   └── settings.controller.js
│   ├── routes/
│   │   ├── event.routes.js
│   │   ├── history.routes.js
│   │   ├── release.routes.js                  # Routes releases
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

### Release
```typescript
interface Release {
  id?: string;
  name: string;
  version: string;
  description?: string;
  targetDate: string;        // Format ISO YYYY-MM-DD
  status: 'draft' | 'active' | 'completed';
  squads: Squad[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Squad
```typescript
interface Squad {
  id?: string;
  releaseId?: string;
  squadNumber: number;
  tontonMep?: string;         // Nom du Tonton MEP
  features: Feature[];
  actions: Action[];
  isCompleted: boolean;       // Calculé: toutes les actions complétées
}
```

### Feature
```typescript
interface Feature {
  id?: string;
  squadId?: string;
  title: string;
  description?: string;
}
```

### Action
```typescript
interface Action {
  id?: string;
  squadId?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  flipping?: FeatureFlipping;  // Configuration Feature/Memory Flipping
}
```

### FeatureFlipping
```typescript
interface FeatureFlipping {
  id?: string;
  actionId?: string;
  flippingType: 'feature_flipping' | 'memory_flipping';
  ruleName: string;
  ruleAction: 'create_rule' | 'obsolete_rule' | 'disable_rule' | 'enable_rule';
  targetClients: string;       // JSON array ou 'all'
  targetCaisses?: string;      // Liste caisses ou null (ALL)
  targetOS: string;            // JSON array: ['ios', 'android'] ou []
  targetVersions: string;      // JSON array: [{operator, version}]
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
- **Position**: Sticky en haut de page (top-2) avec z-index 30
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

#### Catégories
- **Affichage en grille**: 8 par ligne sur grands écrans (responsive)
- **Catégories prédéfinies**: 8 catégories par défaut en première ligne (lecture seule)
- **Séparateur**: Ligne de séparation entre catégories par défaut et personnalisées
- **Catégories personnalisées**: Affichées en dessous, même format en grille de 8
- **Création**: Formulaire avec nom, couleur (sélection visuelle), icône Material
- **Suppression**: Bouton × au survol (uniquement custom)

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

### 8. Gestion des Releases

#### Routing et Architecture
- **Route principale**: `/releases`
- **Layout dédié**: ReleasesLayout avec navigation indépendante
- **Routes lazy-loaded**:
  - `/releases` - Liste des releases
  - `/releases/new` - Création release
  - `/releases/:id` - Détail release
  - `/releases/:id/edit` - Édition release

#### Liste des Releases
- **Affichage**: Cartes avec nom, version, date cible
- **Badge statut**: Supprimé (toutes en brouillon par défaut)
- **Actions par carte**:
  - Voir détails (clic sur carte)
  - Éditer (icône edit)
  - Supprimer (icône delete avec confirmation)
  - **Export** (dropdown Markdown/HTML)

#### Export de Releases
- **Formats**: Markdown et HTML
- **Contenu exporté**:
  - En-tête avec nom, version, date, description
  - Pour chaque squad:
    - Numéro de squad et Tonton MEP
    - Liste des features avec descriptions
    - Liste détaillée des actions avec:
      - Titre et description
      - Type de flipping (Feature/Memory)
      - Nom de la règle
      - Action à effectuer (créer, désactiver, etc.)
      - Périmètres complets:
        - Clients (CAEL ou ALL)
        - Caisses (liste ou ALL)
        - OS (iOS, Android ou ALL)
        - Versions (conditions avec opérateurs)

**Fichiers concernés**:
- `releases-list.component.ts` - Liste et export
- `release-detail.component.ts` - Vue détail
- `release-form.component.ts` - Formulaires
- `release.service.ts` - API calls

#### Détail Release (Squads)
- **Affichage accordéon**: Squads repliables
- **Indicateurs visuels de complétion**:
  - Squad complétée: `bg-green-100` (light) / `bg-green-900/30` (dark)
  - Squad incomplète: `bg-orange-100/50` (light) / `bg-orange-900/20` (dark)
- **Header squad**: Numéro + Tonton MEP (pas de compteur)
- **Contenu squad**:
  - Section Features (liste simple)
  - Section Actions avec checkboxes de complétion
  - Détails Feature/Memory Flipping au clic

#### Création/Édition Actions
- **Formulaire complet**:
  - Titre et description
  - Type flipping (Feature/Memory)
  - Nom de règle
  - Action (créer, désactiver, activer, obsolescence)
  - Périmètres:
    - Clients: Checkboxes individuels ou ALL
    - Caisses: Textarea liste libre ou ALL
    - OS: iOS, Android ou ALL
    - Versions: Ajout dynamique avec opérateur + version

**Composants**:
- `feature-form.component.ts` - Formulaire feature
- `action-form.component.ts` - Formulaire action avec FF/MF

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
resetToDefaults(): Promise<void>
toggleTheme(): void
updatePreferences(preferences: UserPreferences): Promise<void>
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

### ReleaseService
```typescript
// CRUD Opérations Releases
releases$: Observable<Release[]>

getReleases(): Promise<Release[]>
getRelease(id: string): Promise<Release>
createRelease(release: Release): Promise<Release>
updateRelease(id: string, release: Release): Promise<Release>
deleteRelease(id: string): Promise<void>

// Méthodes utilitaires
toggleActionCompletion(releaseId: string, squadId: string, actionId: string): Promise<void>
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

### Releases
```
GET    /api/releases        - Liste toutes les releases
GET    /api/releases/:id    - Récupère une release (avec squads, features, actions)
POST   /api/releases        - Crée une release
PUT    /api/releases/:id    - Met à jour une release
DELETE /api/releases/:id    - Supprime une release
PATCH  /api/releases/:id/actions/:actionId/toggle - Toggle complétion action
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
  customCategories String   @default("[]")  // JSON stocké en String pour SQLite
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

### Release (avec relations)
```prisma
model Release {
  id          String   @id @default(cuid())
  name        String
  version     String
  description String?
  targetDate  String
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  squads      Squad[]

  @@index([targetDate])
  @@index([status])
}

model Squad {
  id         String    @id @default(cuid())
  releaseId  String
  release    Release   @relation(fields: [releaseId], references: [id], onDelete: Cascade)
  squadNumber Int
  tontonMep  String?
  features   Feature[]
  actions    Action[]

  @@index([releaseId])
}

model Feature {
  id          String  @id @default(cuid())
  squadId     String
  squad       Squad   @relation(fields: [squadId], references: [id], onDelete: Cascade)
  title       String
  description String?

  @@index([squadId])
}

model Action {
  id          String            @id @default(cuid())
  squadId     String
  squad       Squad             @relation(fields: [squadId], references: [id], onDelete: Cascade)
  title       String
  description String?
  isCompleted Boolean           @default(false)
  flipping    FeatureFlipping?

  @@index([squadId])
  @@index([isCompleted])
}

model FeatureFlipping {
  id             String  @id @default(cuid())
  actionId       String  @unique
  action         Action  @relation(fields: [actionId], references: [id], onDelete: Cascade)
  flippingType   String
  ruleName       String
  ruleAction     String
  targetClients  String
  targetCaisses  String?
  targetOS       String
  targetVersions String

  @@index([actionId])
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
- Position: `sticky top-2` (8px de marge minimale en haut)
- Transparence: `/80` avec `backdrop-blur-md`
- Z-index: `30` pour rester au-dessus du contenu
- Export dropdown: Z-index `50` pour s'afficher au-dessus des filtres

### 3. Premier Jour de Semaine
- **Toujours lundi**: Hardcodé dans les vues annuelle et mensuelle
- Pas de paramètre utilisateur (fonctionnalité retirée)
- Calcul offset: `startDayOfWeek === 0 ? 6 : startDayOfWeek - 1`

### 4. Capitalisation Mois
```typescript
getMonthName(month: Date): string {
  const monthName = format(month, 'MMMM yyyy', { locale: fr });
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}
```

### 5. Catégories Personnalisées
- Stockées en JSON dans SQLite (stringify/parse)
- ID généré: `custom_${Date.now()}`
- Validation: name en snake_case

### 6. Dark Mode
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

#### Module Releases (Décembre 2024 - Janvier 2025)
- ✅ **Architecture complète releases**:
  - Routing dédié avec ReleasesLayout
  - Page d'accueil `/home` avec navigation Planning/Releases
  - Routes lazy-loaded pour optimisation
- ✅ **Gestion complète releases**:
  - CRUD releases avec squads, features, actions
  - Formulaires Feature/Memory Flipping avec tous les périmètres
  - Toggle complétion actions avec indicateurs visuels
- ✅ **Indicateurs visuels squads**:
  - Squad complétée: fond vert (`bg-green-100` / `bg-green-900/30`)
  - Squad incomplète: fond orange (`bg-orange-100/50` / `bg-orange-900/20`)
  - Suppression compteurs features/actions du header
- ✅ **Export releases**:
  - Formats Markdown et HTML
  - Export détaillé complet des actions FF/MF
  - Tous les périmètres inclus (clients, caisses, OS, versions)
  - Méthodes `formatActionMarkdown()` et `formatActionHTML()`
- ✅ **Backend releases**:
  - Controllers et routes releases
  - Schéma Prisma complet avec relations
  - Cascade delete sur relations
- ✅ **Champ Tonton MEP**:
  - Ajout par squad
  - Affichage dans header squad
  - Export inclus

#### Nettoyage et Simplification Module Planning (Janvier 2025)
- ✅ Supprimé recherche textuelle des filtres (searchText)
- ✅ Supprimé filtres par dates (dateFrom, dateTo)
- ✅ Supprimé paramètre de langue (language)
- ✅ Supprimé paramètre premier jour semaine (weekStart → hardcodé lundi)
- ✅ Supprimé couleurs personnalisées (customColors)
- ✅ Nettoyé imports et méthodes inutilisés
- ✅ Migration DB: Retrait colonnes obsolètes
- ✅ Documentation mise à jour

#### Améliorations UI Module Planning
- ✅ Catégories settings: Grille 8 colonnes (responsive)
- ✅ Séparateur visuel entre catégories par défaut et personnalisées
- ✅ Bouton renommé: "Ajouter une catégorie"
- ✅ Filter sticky: Position `top-2` (marge minimale)
- ✅ Export dropdown: Z-index `50` (au-dessus des filtres)
- ✅ Noms mois: Capitalisés
- ✅ Compteur événements: Supprimé

#### Corrections Bugs Antérieures
- ✅ Auto-scroll annuel: `BehaviorSubject` → `Subject`
- ✅ Panneau détail: Rétabli sur month-view
- ✅ Mode "Wow": Supprimé complètement
- ✅ Couleurs sobres: Background `bg-gray-100`, Cards `bg-gray-50`

## Améliorations Futures Possibles

### Fonctionnalités Planning
- [ ] Authentification API complète
- [ ] Gestion multi-utilisateurs
- [ ] Notifications/rappels
- [ ] Récurrence événements
- [ ] Import/export iCal
- [ ] Drag & drop événements
- [ ] Recherche avancée
- [ ] Vues semaine/jour

### Fonctionnalités Releases
- [ ] Filtres releases (par statut, par date)
- [ ] Recherche dans releases
- [ ] Historique des modifications releases
- [ ] Validation des règles FF/MF (noms uniques, cohérence)
- [ ] Templates de releases
- [ ] Clonage de releases
- [ ] Export PDF des releases
- [ ] Statistiques de progression (% actions complétées)
- [ ] Notifications deadline releases

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

## Points Techniques Avancés

### Export Releases - Formats Markdown/HTML

#### Méthodes d'Export
Les releases peuvent être exportées en deux formats depuis `releases-list.component.ts`:

**1. Export Markdown** (`generateMarkdown()`):
- Structure hiérarchique claire avec headers
- Code blocks pour noms de règles
- Listes à puces pour périmètres
- Formatage avec trailing spaces pour line breaks

**2. Export HTML** (`generateHTML()`):
- Structure complète avec DOCTYPE et meta tags
- Styles inline pour portabilité
- Cartes avec bordures colorées
- Responsive design

#### Détails Actions - Méthode `formatActionMarkdown()`
Génère le contenu détaillé de chaque action:
```typescript
private formatActionMarkdown(action: any): string {
  // Titre et description
  // Type de flipping (Feature/Memory)
  // Nom de règle
  // Action (créer, désactiver, activer, obsolescence)
  // Périmètres:
  //   - Clients: Parse JSON, affiche CAEL ou ALL
  //   - Caisses: Affiche liste ou ALL
  //   - OS: Parse JSON, gère ios/android/ALL
  //   - Versions: Parse JSON avec opérateurs
}
```

#### Détails Actions - Méthode `formatActionHTML()`
Version HTML du formatage détaillé:
```typescript
private formatActionHTML(action: any): string {
  // Structure identique à Markdown
  // Utilise balises HTML: <div>, <h5>, <p>, <ul>, <li>, <code>
  // Styles inline pour les backgrounds et bordures
  // Couleur violette (#7c3aed) pour cohérence visuelle
}
```

#### Gestion des Périmètres
**Clients**:
- Stocké en JSON: `["all"]` ou `["CAEL1", "CAEL2"]`
- Parse avec `JSON.parse()` si string
- Affiche "ALL" si `includes('all')` ou tableau vide

**Caisses**:
- Stocké en string libre ou null
- Affiche "ALL" si null/undefined/empty
- Sinon affiche la valeur brute

**OS**:
- Stocké en JSON: `[]`, `["ios"]`, `["android"]`, `["ios", "android"]`
- Affiche "ALL" si vide ou contient les deux
- Sinon affiche "IOS" ou "ANDROID" (uppercase)

**Versions**:
- Stocké en JSON: `[{operator: ">=", version: "1.0.0"}]`
- Affiche "ALL" si tableau vide
- Sinon formate: "operator version" (ex: ">= 1.0.0, < 2.0.0")

### Indicateurs Visuels de Complétion

#### Calcul Squad Complétée
```typescript
// Dans release-detail.component.ts
squad.isCompleted = squad.actions.every(action => action.isCompleted);
```

#### Classes Conditionnelles
```html
<div [ngClass]="{
  'bg-green-100 dark:bg-green-900/30': squad.isCompleted,
  'bg-orange-100/50 dark:dark:bg-orange-900/20': !squad.isCompleted
}">
```

**Couleurs choisies**:
- Vert pour complété: Assez visible sans être agressif
- Orange pour incomplet: Subtil, rappel sans urgence
- Transparence sur dark mode pour cohérence thème

## Support & Contact

**Équipe**: DSI Banque
**Contexte**: Planning interne équipe + Gestion releases
**Stack**: Angular 20 + Node.js + Prisma + SQLite
**Password**: NMB
**Modules**: Planning (timeline événements) + Releases (FF/MF)
