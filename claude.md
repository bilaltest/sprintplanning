# Ma Banque Tools - Guide Technique Essentiel

## Vue d'ensemble
Application Angular 20 + Node.js/Express pour la DSI d'une banque.
- **Modules**: Calendrier (Timeline trimestrielle), Préparation des MEP (Squads, Features, Actions FF/MF)

## Stack Technique
- **Frontend**: Angular 20 standalone, Tailwind CSS, Material Icons, date-fns, RxJS. Ports: :4200
- **Backend**: Node.js, Express, Prisma ORM, SQLite. Ports: :3000

## Architecture Rapide
### Composants Clés
```
components/
├── auth/login.component.ts                  # Auth simple (password: "NMB")
├── filters/filter-bar.component.ts          # Filtres par catégorie uniquement
├── home/home.component.ts                   # Page accueil avec nav Calendrier/Prépa MEP
├── modals/event-modal.component.ts          # Formulaire événements
├── releases/
│   ├── releases-list.component.ts           # Liste + Export Markdown/HTML
│   ├── release-detail.component.ts          # Détail avec squads (accordéon)
│   ├── feature-form.component.ts            # Formulaire features
│   └── action-form.component.ts             # Formulaire actions FF/MF
├── settings/settings.component.ts           # Thème + catégories custom
└── timeline/
    ├── quarterly-view.component.ts          # Vue trimestrielle (3 mois)
    └── timeline-container.component.ts      # Conteneur principal
layouts/
└── main-layout.component.ts                 # Layout principal avec sidebar
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
### Calendrier
- **Timeline trimestrielle**: Affiche 3 mois (T1-T4) en colonne verticale.
- **Navigation**: Boutons Précédent/Suivant (±3 mois), "Aujourd'hui", flèches clavier.
- **Jours fériés**: Grisés automatiquement (week-ends + fériés français).
- **Scroll depuis Accueil**: Navigation automatique vers le trimestre d'un événement.
- **Filtres**: Catégorie uniquement. Semaine commence Lundi.
- **Catégories custom**: 8 colonnes, JSON.

### Préparation des MEP
- **Export**: Markdown/HTML avec détails FF/MF.
- **Squads**: Accordéon, indicateurs visuels (Vert/Amber).
- **Actions**: Pre/Post MEP, toggle.
- **FF/MF**: Clients, Caisses, OS, Versions.

## Points Techniques
- **TimelineView**: Type unique `'quarter'` (Vue trimestrielle).
- **Navigation trimestrielle**: `nextPeriod()` / `previousPeriod()` avancent/reculent de 3 mois.
- **Jours fériés**: Algorithme Computus pour Pâques + fériés fixes français.
- **Scroll**: `Subject` (pas BehaviorSubject) pour `scrollToToday$`.
- **Dark Mode**: Classe `.dark` sur `html`.
- **Squad Complete**: `squad.actions.every(a => a.isCompleted)`.

## Scripts & Notes
- **Run**: `npm start` (Front :4200), `npm run dev` (Back :3000). `npx prisma db push/studio`.
- **Dec 2024 Updates**:
  - Renommé "Ma Banque Tools", Design unifié, Dark mode adouci, Export détaillé.
  - **Vue trimestrielle** (Dec 6): Fusion annuelle/mensuelle → Vue unique 3 mois en colonne.
  - Jours fériés grisés (sans badge), navigation T1-T4, scroll auto depuis Accueil.
  - **Renommage** (Dec 7): Planning → Calendrier (route: /calendar), Dashboard → Accueil (route: /home), Releases → Préparation des MEP (affichage uniquement).
- **Auth**: Password "NMB". **Version**: Incluse dans nom release. **Prisma**: Cascade delete.

---
**Équipe**: DSI Banque | **Stack**: Angular 20 + Node.js + Prisma + SQLite | **Password**: NMB
