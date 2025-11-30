# Event Planning App

> Application de planification d'événements et gestion de releases pour équipes DSI

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular)](https://angular.dev)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 🚀 Démarrage Rapide

```bash
# 1. Installation
git clone <repository-url>
cd romantic-gates

# 2. Backend
cd event-planning-backend
npm install
npx prisma db push
npm run dev

# 3. Frontend (nouveau terminal)
cd ../event-planning-app
npm install
npm start

# 4. Accéder à l'application
# http://localhost:4200
# Password: NMB
```

---

## 📋 Fonctionnalités

### 🗓️ Planning d'Événements

- **Timeline interactive** avec vues annuelle et mensuelle
- **Catégories prédéfinies** : MEP, Hotfix, Maintenance, PI Planning, Sprint, etc.
- **Catégories personnalisables** : Créez vos propres types d'événements
- **Filtrage avancé** : Par catégorie avec barre sticky
- **Mode sombre** : Thème clair/sombre avec persistance

### 🚢 Gestion de Releases

- **Releases multi-squads** : 6 squads par release
- **Features tracking** : Suivi des fonctionnalités majeures par squad
- **Actions Pre/Post-MEP** : Checklist détaillée avec statut
- **Feature Flipping & Memory Flipping** :
  - Configuration granulaire par règle
  - Ciblage : Clients (CAEL), Caisses, OS (iOS/Android), Versions
  - Actions : Créer, Rendre obsolète, Activer, Désactiver
  - Affichage en tableaux compacts

### 📊 Export & Historique

- **Export multi-format** : PDF, Excel, JSON, CSV
- **Historique des actions** : Tracking complet avec auto-refresh
- **Snapshot des données** : Rollback préparé

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│               Frontend (Angular 20)                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Components │→ │  Services  │→ │  HttpClient  │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓ HTTP/REST
┌─────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)               │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Routes   │→ │Controllers │→ │ Prisma ORM   │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓
                  ┌──────────┐
                  │  SQLite  │
                  └──────────┘
```

### Stack Technique

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Angular 20 (Standalone), RxJS, Tailwind CSS, Material Icons, date-fns |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | SQLite (dev), PostgreSQL ready (prod) |
| **Build** | Vite (Angular), ESBuild |
| **Testing** | Jest, Jasmine, Karma |

---

## 📁 Structure du Projet

```
romantic-gates/
├── event-planning-app/              # Frontend Angular
│   ├── src/app/
│   │   ├── components/              # UI Components
│   │   │   ├── auth/                  # Authentification
│   │   │   ├── filters/               # Filtres (sticky bar)
│   │   │   ├── modals/                # Modales (CRUD événement)
│   │   │   ├── releases/              # Gestion releases
│   │   │   ├── settings/              # Paramètres utilisateur
│   │   │   └── timeline/              # Vues timeline
│   │   ├── guards/                  # Route Guards
│   │   ├── models/                  # Types TypeScript
│   │   ├── services/                # Business Logic
│   │   └── app.config.ts            # Configuration app
│   └── tailwind.config.js
│
├── event-planning-backend/          # Backend Node.js
│   ├── prisma/
│   │   ├── schema.prisma              # Schéma DB
│   │   └── dev.db                     # SQLite DB
│   ├── src/
│   │   ├── config/                    # Config
│   │   ├── controllers/               # Business Logic
│   │   └── routes/                    # Express Routes
│   └── server.js                    # Entry Point
│
├── CLAUDE.md                        # Documentation projet
├── DOCUMENTATION_TECHNIQUE.md       # Architecture & Diagrammes
├── GUIDE_MAINTENANCE.md             # Guide maintenance développeurs
└── README.md                        # Ce fichier
```

---

## 🔧 Configuration

### Frontend (`event-planning-app/src/environments/`)

```typescript
// environment.ts (dev)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: '/api'  // Même origine
};
```

### Backend (`.env`)

```bash
PORT=3000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Documentation complète du projet (fonctionnalités, modèles, API) |
| [DOCUMENTATION_TECHNIQUE.md](./DOCUMENTATION_TECHNIQUE.md) | Architecture système, diagrammes Mermaid, flux de données |
| [GUIDE_MAINTENANCE.md](./GUIDE_MAINTENANCE.md) | Guide complet pour maintenir et étendre l'application |

---

## 🧪 Tests

### Frontend

```bash
cd event-planning-app

# Tests unitaires
npm test

# Tests avec coverage
npm test -- --coverage

# Tests en watch mode
npm test -- --watch
```

**Fichiers testés actuellement** :
- `annual-view.component.spec.ts` (8 tests)
- `month-view.component.spec.ts` (9 tests)

**Couverture actuelle** : ~9% (2/22 composants)
**Objectif** : 80% (voir [DOCUMENTATION_TECHNIQUE.md](./DOCUMENTATION_TECHNIQUE.md#couverture-de-tests))

### Backend

```bash
cd event-planning-backend

# Aucun test actuellement configuré
# TODO: Implémenter tests Jest + Supertest
```

---

## 🚢 Déploiement

### Option 1: Serveur Traditionnel

```bash
# Build Frontend
cd event-planning-app
npm run build  # → dist/

# Déployer avec Nginx
sudo cp -r dist/event-planning-app/browser/* /var/www/html/
sudo systemctl restart nginx
```

### Option 2: Docker (Recommandé)

```bash
# Utiliser docker-compose
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down
```

Voir [GUIDE_MAINTENANCE.md](./GUIDE_MAINTENANCE.md#déploiement) pour instructions détaillées.

---

## 🛠️ Scripts Utiles

### Frontend

```bash
npm start              # Dev server (port 4200)
npm run build          # Build production
npm test               # Tests unitaires
npm run lint           # ESLint
ng generate component  # Générer composant
```

### Backend

```bash
npm run dev            # Dev server avec nodemon
npm start              # Production server
npx prisma db push     # Synchroniser schema DB
npx prisma studio      # Interface DB (port 5555)
npx prisma migrate dev # Créer migration
```

### Database

```bash
# SQLite CLI
sqlite3 event-planning-backend/prisma/dev.db

# Commandes utiles
.tables                # Liste tables
.schema Event          # Schema table
SELECT * FROM Event;   # Query
.quit                  # Exit
```

---

## 🐛 Troubleshooting

### Problème: Port déjà utilisé

```bash
# Backend (3000)
lsof -i :3000
kill -9 <PID>

# Frontend (4200)
lsof -i :4200
kill -9 <PID>
```

### Problème: Erreurs de compilation Angular

```bash
# Nettoyer cache
cd event-planning-app
rm -rf .angular node_modules/.cache
npm install
npm start
```

### Problème: Prisma Client non généré

```bash
cd event-planning-backend
npx prisma generate
npm run dev
```

### Problème: Memory Leaks

Toutes les subscriptions utilisent `takeUntilDestroyed()` depuis les corrections récentes.
Voir [GUIDE_MAINTENANCE.md](./GUIDE_MAINTENANCE.md#debugging-et-troubleshooting) pour debugging avancé.

---

## 📈 Roadmap

### ✅ Complété

- [x] Timeline annuelle et mensuelle
- [x] CRUD événements avec catégories
- [x] Gestion releases multi-squads
- [x] Feature Flipping / Memory Flipping
- [x] Export PDF/Excel/JSON/CSV
- [x] Filtres par catégorie
- [x] Mode sombre
- [x] Catégories personnalisables
- [x] Historique des actions
- [x] Auto-refresh événements
- [x] Affichage tableaux compacts (Feature Flipping)
- [x] URLs version-based pour releases
- [x] Corrections memory leaks

### 🚧 En Cours

- [ ] Tests unitaires (objectif 80%)
- [ ] Tests E2E (Cypress/Playwright)
- [ ] CI/CD Pipeline

### 📋 Planifié

- [ ] Authentification API (remplacer password en dur)
- [ ] Multi-tenancy (support multi-équipes)
- [ ] Notifications temps réel
- [ ] Récurrence événements
- [ ] Import/Export iCal
- [ ] Drag & drop événements
- [ ] Vue semaine/jour
- [ ] PWA avec Service Workers
- [ ] Internationalisation (i18n)

---

## 🤝 Contribution

### Guidelines

1. **Branches** : Créer branche feature depuis `main`
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```

2. **Commits** : Utiliser Conventional Commits
   ```bash
   feat: ajout export Excel
   fix: correction memory leak timeline
   docs: mise à jour README
   chore: update dependencies
   ```

3. **Tests** : Ajouter tests pour nouvelles fonctionnalités

4. **Pull Request** : Créer PR vers `main` avec description détaillée

### Code Style

- **Frontend** : Angular style guide officiel
- **Backend** : Standard JavaScript
- **Formatting** : Prettier (auto-format on save)
- **Linting** : ESLint configuré

---

## 📝 Changelog

### Version 1.0.0 (30 Novembre 2025)

#### ✨ Nouvelles Fonctionnalités

- Feature Flipping / Memory Flipping avec tableaux compacts
- URLs version-based pour releases (ex: `/releases/40.5`)
- Affichage "ALL" pour sélections multiples
- Labels dynamiques FF/MF dans dropdowns
- Catégories personnalisables avec grille 8 colonnes

#### 🐛 Corrections

- ✅ Memory leaks : Toutes subscriptions avec `takeUntilDestroyed()`
- ✅ Auto-refresh non arrêté dans HistoryService
- ✅ Code mort supprimé (~80 lignes)
- ✅ Console.log en production supprimés
- ✅ Imports inutilisés nettoyés
- ✅ Auto-refresh manuel des actions après CRUD

#### 🔧 Optimisations

- Bundle timeline-container réduit de 143.20 kB à 141.68 kB
- Suppression méthodes non utilisées
- Optimisation RxJS avec `takeUntilDestroyed()`

#### 📚 Documentation

- Documentation technique complète avec diagrammes Mermaid
- Guide de maintenance pour développeurs
- README mis à jour avec roadmap et troubleshooting

---

## 📄 Licence

Propriétaire - Équipe DSI Banque

---

## 👥 Équipe

**Développé par** : Équipe DSI
**Context

e** : Planning interne équipe
**Support** : dsi-support@example.com

---

## 🔗 Liens Utiles

- [Angular Documentation](https://angular.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [RxJS](https://rxjs.dev)
- [Material Icons](https://fonts.google.com/icons)

---

**⭐ Si ce projet vous est utile, n'hésitez pas à le star !**
