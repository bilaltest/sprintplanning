# Ma Banque Tools - Guide Technique Essentiel

## Vue d'ensemble
Application Angular 20 + Node.js/Express pour la DSI d'une banque.
- **Modules**: Planning (Timeline annuelle/mensuelle), Releases (Squads, Features, Actions FF/MF)

## Stack Technique
- **Frontend**: Angular 20 standalone, Tailwind CSS, Material Icons, date-fns, RxJS. Ports: :4200
- **Backend**: Node.js, Express, Prisma ORM, SQLite. Ports: :3000

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
├── planning-layout.component.ts             # Layout Planning (header gradient)
└── releases-layout.component.ts             # Layout Releases (header gradient)
services/
├── event.service.ts, release.service.ts     # CRUD
├── settings.service.ts, filter.service.ts   # Prefs & Filtres
├── timeline.service.ts                      # Nav
└── toast.service.ts                         # Notifications
```

### Backend
```
src/
├── controllers/ {event, release, settings}.controller.js
└── routes/      {event, release, settings}.routes.js
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
  id?: string; name: string; description?: string; releaseDate: string; // ISO YYYY-MM-DD
  status: 'draft' | 'active' | 'completed'; squads: Squad[];
}
interface Squad {
  id?: string; releaseId?: string; squadNumber: number; tontonMep?: string;
  features: Feature[]; actions: Action[]; isCompleted: boolean; // Calculé
}
interface Feature { id?: string; squadId?: string; title: string; description?: string; }
interface Action {
  id?: string; squadId?: string; title: string; description?: string;
  isCompleted: boolean; phase: 'pre_mep' | 'post_mep'; flipping?: FeatureFlipping;
}
interface FeatureFlipping {
  flippingType: 'feature_flipping' | 'memory_flipping'; ruleName: string;
  ruleAction: 'create_rule' | 'obsolete_rule' | 'disable_rule' | 'enable_rule';
  targetClients: string; targetCaisses?: string; targetOS: string; targetVersions: string;
}
```

## API Endpoints
```
Events:   GET/POST/PUT/DELETE /api/events[/:id]
Releases: GET/POST/PUT/DELETE /api/releases[/:id], PATCH /api/releases/:id/actions/:actionId/toggle
Settings: GET/PUT /api/settings
```

## Design System
### Palette & Classes
- **Primary**: Vert émeraude (#10b981). **Alert**: Amber doux (#f59e0b). **Dark**: `bg-gray-800`.
- **Gradients**: `bg-gradient-planning`, `bg-gradient-releases`.
- **Classes**: `.card` (bg-gray-50/900), `.card-releases` (bg-white/800), `.btn-primary`.
- **UI**: Filter bar sticky, Export dropdown z-50, Date MEP neutre.

## Fonctionnalités Clés
### Planning
- Timeline annuelle/mensuelle. Scroll manuel "Aujourd'hui".
- Filtres catégorie uniquement. Semaine commence Lundi.
- Catégories custom (8 colonnes, JSON).

### Releases
- **Export**: Markdown/HTML avec détails FF/MF.
- **Squads**: Accordéon, indicateurs visuels (Vert/Amber).
- **Actions**: Pre/Post MEP, toggle.
- **FF/MF**: Clients, Caisses, OS, Versions.

## Points Techniques
- **Scroll**: `Subject` (pas BehaviorSubject).
- **Dark Mode**: Classe `.dark` sur `html`.
- **Squad Complete**: `squad.actions.every(a => a.isCompleted)`.

## Scripts & Notes
- **Run**: `npm start` (Front :4200), `npm run dev` (Back :3000). `npx prisma db push/studio`.
- **Dec 2024 Updates**: Renommé "Ma Banque Tools", Design unifié, Dark mode adouci, Export détaillé.
- **Auth**: Password "NMB". **Version**: Incluse dans nom release. **Prisma**: Cascade delete.

---
**Équipe**: DSI Banque | **Stack**: Angular 20 + Node.js + Prisma + SQLite | **Password**: NMB
