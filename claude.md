# Ma Banque Tools - Guide Technique Essentiel

## Vue d'ensemble
Application Angular 20 + Node.js/Express pour la DSI d'une banque.
- **Module Planning**: Gestion événements sur timeline annuelle/mensuelle
- **Module Releases**: Gestion releases avec squads, features et actions (Feature/Memory Flipping)

## Stack Technique
**Frontend**: Angular 20 standalone, Tailwind CSS, Material Icons, date-fns, RxJS
**Backend**: Node.js, Express, Prisma ORM, SQLite
**Ports**: Frontend :4200, Backend :3000

## Architecture Rapide

### Composants Clés
```
components/
├── auth/login.component.ts                  # Auth simple (password: "NMB")
├── filters/filter-bar.component.ts          # Filtres par catégorie uniquement
├── home/home.component.ts                   # Page accueil avec nav Planning/Releases
├── modals/event-modal.component.ts          # Formulaire événements
├── releases/
│   ├── releases-list.component.ts           # Liste + Export Markdown/HTML
│   ├── release-detail.component.ts          # Détail avec squads (accordéon)
│   ├── feature-form.component.ts            # Formulaire features
│   └── action-form.component.ts             # Formulaire actions FF/MF
├── settings/settings.component.ts           # Thème + catégories custom
└── timeline/
    ├── annual-view.component.ts             # Vue 12 mois
    ├── month-view.component.ts              # Vue mensuelle
    └── timeline-container.component.ts      # Conteneur principal

layouts/
├── planning-layout.component.ts             # Layout Planning avec header gradient
└── releases-layout.component.ts             # Layout Releases avec header gradient

services/
├── event.service.ts                         # CRUD événements
├── release.service.ts                       # CRUD releases
├── settings.service.ts                      # Préférences (thème, catégories)
├── filter.service.ts                        # Filtrage catégories
├── timeline.service.ts                      # Navigation timeline
└── toast.service.ts                         # Notifications modernes
```

### Backend
```
src/
├── controllers/
│   ├── event.controller.js
│   ├── release.controller.js                # CRUD releases avec cascade delete
│   └── settings.controller.js
└── routes/
    ├── event.routes.js
    ├── release.routes.js
    └── settings.routes.js
```

## Modèles Essentiels

### Event
```typescript
interface Event {
  id?: string; title: string; date: string; // ISO YYYY-MM-DD
  startTime?: string; endTime?: string; color: string; icon: string;
  category: EventCategory; description?: string;
}
type EventCategory = 'mep' | 'hotfix' | 'maintenance' | 'pi_planning' | 'sprint_start' | 'code_freeze' | 'psi' | 'other';
```

### Release / Squad / Feature / Action
```typescript
interface Release {
  id?: string; name: string; description?: string;
  releaseDate: string; // ISO YYYY-MM-DD (PAS de version séparée)
  status: 'draft' | 'active' | 'completed';
  squads: Squad[];
}

interface Squad {
  id?: string; releaseId?: string; squadNumber: number;
  tontonMep?: string; features: Feature[]; actions: Action[];
  isCompleted: boolean; // Calculé: toutes actions complétées
}

interface Feature {
  id?: string; squadId?: string; title: string; description?: string;
}

interface Action {
  id?: string; squadId?: string; title: string; description?: string;
  isCompleted: boolean; phase: 'pre_mep' | 'post_mep';
  flipping?: FeatureFlipping;
}

interface FeatureFlipping {
  flippingType: 'feature_flipping' | 'memory_flipping';
  ruleName: string;
  ruleAction: 'create_rule' | 'obsolete_rule' | 'disable_rule' | 'enable_rule';
  targetClients: string;    // JSON: ["CAEL1"] ou ["all"]
  targetCaisses?: string;   // String libre ou null (ALL)
  targetOS: string;         // JSON: ["ios", "android"] ou []
  targetVersions: string;   // JSON: [{operator: ">=", version: "1.0.0"}]
}
```

## API Endpoints
```
# Events
GET/POST/PUT/DELETE  /api/events[/:id]

# Releases
GET/POST/PUT/DELETE  /api/releases[/:id]
PATCH                /api/releases/:id/actions/:actionId/toggle

# Settings
GET/PUT              /api/settings
```

## Design System

### Palette Unifiée (Planning + Releases)
- **Primary**: Vert émeraude (#10b981 / planning-500)
- **Gradients**: `bg-gradient-planning` et `bg-gradient-releases` (identiques)
- **Alert**: Amber doux (#f59e0b / releases-alert-500) pour squads incomplètes
- **Dark mode**: `bg-gray-800` pour cards (pas bg-gray-900, trop agressif)

### Classes Tailwind Importantes
```scss
.card                                // bg-gray-50 dark:bg-gray-900
.card-releases                       // Cards releases: bg-white dark:bg-gray-800
.card-releases-squad-complete        // Vert: bg-gradient-squad-complete dark:bg-gray-800
.card-releases-squad-incomplete      // Amber: bg-gradient-squad-incomplete dark:bg-gray-800
.btn-primary                         // Bouton vert principal
.glass-planning / .glass-releases    // Glassmorphism (backdrop-blur)
```

### Points UI Critiques
- **Filter bar**: `sticky top-2 z-30` avec backdrop-blur
- **Export dropdown**: `z-50` pour passer au-dessus des filtres
- **Header gradient**: Appliqué sur home, planning-layout et releases-layout
- **Compteurs**: Releases cards affichent uniquement nombre de squads (pas d'actions)
- **Date MEP**: Icône et texte gris neutre (pas de fond vert)

## Fonctionnalités Clés

### Planning
- Timeline annuelle (défaut) ou mensuelle
- Scroll manuel vers "Aujourd'hui" (pas auto au load)
- Filtres par catégorie uniquement (pas de dates, pas de recherche)
- Premier jour semaine: **toujours lundi** (hardcodé)
- Catégories custom: Grille 8 colonnes, stockées JSON en SQLite

### Releases
- **Export**: Markdown et HTML avec détails complets FF/MF
- **Squads accordéon**: Indicateurs visuels (vert = complété, amber = incomplet)
- **Actions**: Phase Pre-MEP / Post-MEP, toggle complétion
- **Périmètres FF/MF**: Clients (CAEL ou ALL), Caisses (liste ou ALL), OS (iOS/Android/ALL), Versions (opérateurs)

## Points Techniques à Retenir

### Scroll Timeline
```typescript
// Utilise Subject (pas BehaviorSubject) pour éviter émission initiale
private scrollToTodaySubject = new Subject<void>();
public scrollToToday$ = this.scrollToTodaySubject.asObservable();
```

### Dark Mode
```typescript
// Application via classe .dark sur <html>
applyTheme(theme: string) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
```

### Calcul Squad Complétée
```typescript
squad.isCompleted = squad.actions.every(action => action.isCompleted);
```

## Scripts de Démarrage
```bash
# Frontend
cd event-planning-app && npm start          # Port 4200

# Backend
cd event-planning-backend && npm run dev    # Port 3000 (nodemon)

# Base de données
npx prisma db push                          # Sync schema
npx prisma studio                           # Admin DB GUI
```

## Dernières Modifications (Décembre 2024)
- ✅ Renommé "Ma Banque Tools"
- ✅ Design system unifié Planning/Releases (vert émeraude)
- ✅ Dark mode adouci (bg-gray-800 au lieu de bg-gray-900)
- ✅ Suppression compteurs actions sur cards releases
- ✅ Suppression couleur verte date MEP
- ✅ Notifications/confirmations modernes (ToastService/ConfirmationService)
- ✅ Simplification filtres (catégorie uniquement)
- ✅ Export releases Markdown/HTML détaillé avec FF/MF

## Remarques Importantes
- **Auth**: Password simple "NMB" (pas de JWT, architecture préparée)
- **Version**: Non séparée du nom, incluse dans le nom de release
- **Tonton MEP**: Champ par squad, éditable inline
- **Catégories prédéfinies**: 8 par défaut, lecture seule, séparées des custom
- **Prisma**: Relations avec `onDelete: Cascade` pour delete propre

---
**Équipe**: DSI Banque | **Stack**: Angular 20 + Node.js + Prisma + SQLite | **Password**: NMB
