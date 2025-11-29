# Planning DSI - Application de Gestion d'Événements

Application de planning événementiel moderne développée en Angular 20+ pour la gestion des événements DSI bancaire, avec backend Node.js + Express.

![Angular](https://img.shields.io/badge/Angular-20+-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Fonctionnalités

### 🎯 Gestion d'Événements

- **CRUD Complet** : Créer, lire, modifier, supprimer des événements
- **8 Catégories Prédéfinies** : MEP, Hotfix, Maintenance, PI Planning, Sprint Start, Code Freeze, PSI, Other
- **Couleurs et Icônes** : Personnalisables via Material Icons
- **Multi-événements par jour** : Support illimité
- **Création rapide** : Clic sur jour vide → création directe
- **Suppression rapide** : Bouton de suppression dans le panneau détail (au survol)

### 📅 Vues Timeline

- **Vue Annuelle** : Grille 2×6 mois avec calendriers compacts
  - Affichage des événements avec nom et icône (max 3 visibles par jour)
  - Auto-scroll sur le mois courant à l'ouverture
  - Clic sur jour avec événements → panneau de détails
  - Clic sur jour vide → création d'événement directe
- **Vue Mensuelle** : Calendrier détaillé jour par jour
  - Grille 7 colonnes (semaine)
  - Tous les événements visibles
  - Bouton ajout au survol de chaque jour
- **Navigation intuitive** : Boutons en haut ET en bas de page, flèches clavier (← →), bouton "Aujourd'hui"

### 🔍 Filtres

- **Filtre par catégorie** : Multi-sélection avec icônes Material
- **Position sticky** : Barre de filtres qui suit le scroll (top-2)
- **Bouton réinitialiser** : Efface tous les filtres
- **Couleur PSI adaptée** : Gris clair en mode sombre pour meilleure lisibilité

### 📤 Import/Export

- **Export PDF** : Snapshot visuel de la vue actuelle
- **Export PNG** : Image haute résolution
- **Export JSON** : Données brutes (backup/restore)
- **Export CSV** : Compatible Excel

### 🕐 Historique & Rollback

- **20 dernières modifications** : Création, modification, suppression
- **Annulation (undo)** : Restauration de l'état précédent
- **Suppression automatique** : L'entrée d'historique disparaît après rollback
- **Description lisible** : Détails de chaque action

### ⚙️ Paramètres

- **Thème** : Clair/Sombre avec persistance
- **Catégories personnalisées** : Création de catégories avec nom, couleur et icône
- **Grille responsive** : 8 catégories par ligne (responsive)
- **Séparation visuelle** : Catégories par défaut et personnalisées séparées

## 🏗️ Stack Technique

### Frontend

```
Angular 20+ (Standalone Components)
├── TypeScript 5.7 (strict mode)
├── TailwindCSS 4.0 (design system)
├── date-fns 4.1 (manipulation dates)
├── html2canvas + jsPDF (export PDF/PNG)
└── RxJS 7.8 (gestion d'état réactive)
```

### Backend

```
Node.js 18+ + Express 4
├── Prisma ORM (TypeScript-first)
├── SQLite (dev) / PostgreSQL (prod)
├── CORS activé pour http://localhost:4200
└── JSON serialization pour compatibilité SQLite
```

## 📦 Installation

### Prérequis

- **Node.js** : v18+ (LTS recommandé)
- **npm** : v9+

### Étapes d'installation

```bash
# 1. Installer le backend
cd event-planning-backend
npm install

# Générer le client Prisma et créer la base de données
npx prisma generate
npx prisma db push

# Démarrer le backend (port 3000)
npm start

# 2. Dans un autre terminal, installer le frontend
cd ../event-planning-app
npm install

# Démarrer l'application frontend (port 4200)
npm start

# L'application sera accessible sur http://localhost:4200
```

## 📂 Structure du Projet

```
Planning/
├── event-planning-backend/          # Backend Node.js
│   ├── src/
│   │   ├── server.js               # Point d'entrée Express
│   │   ├── config/
│   │   │   └── database.js         # Configuration Prisma
│   │   ├── routes/
│   │   │   ├── event.routes.js     # Routes /api/events
│   │   │   ├── settings.routes.js  # Routes /api/settings
│   │   │   └── history.routes.js   # Routes /api/history
│   │   ├── controllers/
│   │   │   ├── event.controller.js
│   │   │   ├── settings.controller.js
│   │   │   └── history.controller.js
│   │   └── middleware/
│   │       └── error.middleware.js
│   ├── prisma/
│   │   └── schema.prisma           # Schéma de base de données
│   ├── .env                        # Configuration (DATABASE_URL, PORT)
│   └── package.json
│
└── event-planning-app/              # Frontend Angular
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── timeline/
    │   │   │   │   ├── timeline-container.component.ts
    │   │   │   │   ├── annual-view.component.ts    # Vue annuelle (12 mois)
    │   │   │   │   └── month-view.component.ts     # Vue mensuelle
    │   │   │   ├── modals/
    │   │   │   │   └── event-modal.component.ts
    │   │   │   ├── filters/
    │   │   │   │   └── filter-bar.component.ts
    │   │   │   ├── settings/
    │   │   │   │   └── settings.component.ts
    │   │   │   └── history/
    │   │   │       └── history.component.ts
    │   │   ├── services/
    │   │   │   ├── event.service.ts           # CRUD via HTTP
    │   │   │   ├── filter.service.ts          # Logique filtres
    │   │   │   ├── export.service.ts          # Export PDF/PNG/JSON/CSV
    │   │   │   ├── settings.service.ts        # Préférences utilisateur
    │   │   │   ├── history.service.ts         # Historique & rollback
    │   │   │   └── timeline.service.ts        # Navigation timeline
    │   │   ├── models/
    │   │   │   ├── event.model.ts
    │   │   │   ├── filter.model.ts
    │   │   │   ├── settings.model.ts
    │   │   │   ├── history.model.ts
    │   │   │   └── timeline.model.ts
    │   │   ├── app.component.ts
    │   │   └── app.routes.ts
    │   ├── environments/
    │   │   ├── environment.ts              # Dev: apiUrl = http://localhost:3000/api
    │   │   └── environment.prod.ts         # Prod: URL backend de production
    │   ├── styles.scss
    │   └── main.ts
    └── package.json
```

## 🔧 Architecture

### Backend API

#### Endpoints Disponibles

**Événements** (`/api/events`)
- `GET /api/events` - Liste tous les événements
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement

**Paramètres** (`/api/settings`)
- `GET /api/settings` - Récupérer les préférences
- `PUT /api/settings` - Mettre à jour les préférences

**Historique** (`/api/history`)
- `GET /api/history` - Liste les 20 dernières modifications
- `POST /api/history/:id/rollback` - Annuler une action
- `DELETE /api/history` - Vider l'historique

### Base de Données (Prisma)

**Tables**

```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  date        String   // ISO format YYYY-MM-DD
  startTime   String?  // HH:mm format
  endTime     String?
  category    String
  color       String
  icon        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Settings {
  id               String   @id @default(cuid())
  theme            String   @default("light")
  customCategories String   @default("[]")  // JSON en String pour SQLite
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model History {
  id              String   @id @default(cuid())
  action          String   // 'create', 'update', 'delete'
  eventId         String?
  eventData       String   // JSON en String pour SQLite
  previousData    String?  // Pour rollback
  timestamp       DateTime @default(now())
}
```

### Frontend

**Gestion d'État**
- **RxJS BehaviorSubject** : État réactif dans les services
- **Observables** : Communication unidirectionnelle
- **HttpClient** : Requêtes HTTP vers le backend
- **firstValueFrom** : Conversion Observable → Promise

## 🚀 Utilisation

### Créer un Événement

**Méthode 1 : Bouton principal**
1. Cliquer sur "Nouvel événement" en haut
2. Remplir le formulaire
3. Cliquer sur "Créer"

**Méthode 2 : Clic sur jour vide (Vue Annuelle)**
1. Cliquer sur un jour sans événement
2. Le modal s'ouvre avec la date pré-remplie
3. Remplir le reste et créer

**Méthode 3 : Bouton dans le panneau détail**
1. Cliquer sur un jour avec des événements
2. Cliquer sur "Créer un événement" dans le panneau
3. Le modal s'ouvre avec la date pré-remplie

### Modifier/Supprimer un Événement

**Modifier**
1. Cliquer sur un événement (dans la timeline ou le panneau détail)
2. Le modal s'ouvre en mode édition
3. Modifier et sauvegarder

**Supprimer**
1. Ouvrir le panneau détail (clic sur jour avec événements)
2. Survoler un événement
3. Cliquer sur l'icône "delete" qui apparaît
4. Confirmer la suppression

### Naviguer dans le Planning

- **Navigation haute** : Flèches, sélecteur de vue, bouton "Aujourd'hui"
- **Navigation basse** : Boutons "Période précédente", "Aujourd'hui", "Période suivante"
- **Raccourcis clavier** : ← (précédent), → (suivant)

### Filtrer les Événements

1. La barre de filtres suit automatiquement le scroll (sticky)
2. **Catégories** : Cliquer sur les badges avec icônes pour filtrer
3. **Réinitialiser** : Bouton pour tout effacer

### Annuler une Action

1. Aller dans "Historique" (menu)
2. Trouver l'action à annuler
3. Cliquer sur l'icône "↩"
4. Confirmer
5. L'événement est restauré et l'entrée d'historique disparaît

## 🎨 Personnalisation

### Changer les Catégories d'Événements

Consultez le fichier [CATEGORIES_GUIDE.md](./CATEGORIES_GUIDE.md) pour le guide complet.

### Basculer de SQLite à PostgreSQL

```bash
# 1. Modifier event-planning-backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/event_planning"

# 2. Modifier prisma/schema.prisma
datasource db {
  provider = "postgresql"  # Au lieu de "sqlite"
  url      = env("DATABASE_URL")
}

# 3. Mettre à jour les types Json
customColors Json @default([])  # Au lieu de String
eventData    Json
previousData Json?

# 4. Regénérer le client et créer la base
npx prisma generate
npx prisma db push
```

## 🧪 Tests

```bash
# Frontend
cd event-planning-app
npm test                # Jest
npm run test:coverage   # Rapport de couverture

# Backend (à implémenter)
cd event-planning-backend
npm test
```

## 📊 Performance

### Optimisations Implémentées

- **Debounce** : Recherche (300ms)
- **TrackBy** : Optimisation *ngFor
- **Auto-scroll intelligent** : Vue annuelle
- **Lazy Loading** : Routes à la demande
- **Compression JSON** : SQLite String storage

### Benchmarks Attendus

- Chargement initial : < 1s
- Changement de vue : < 100ms
- Support : 1000+ événements sans lag

## 🐛 Troubleshooting

### Le backend ne démarre pas

```bash
# Vérifier que le port 3000 est libre
lsof -i :3000

# Réinstaller les dépendances
cd event-planning-backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Le frontend ne se connecte pas au backend

```bash
# Vérifier que le backend est démarré sur port 3000
curl http://localhost:3000/api/events

# Vérifier l'URL dans environment.ts
apiUrl: 'http://localhost:3000/api'
```

### Erreurs Prisma

```bash
# Regénérer le client Prisma
npx prisma generate

# Réappliquer le schéma
npx prisma db push

# Voir la base de données
npx prisma studio
```

## 🌐 Support Navigateurs

| Navigateur | Version Min | Support |
|------------|-------------|---------|
| Chrome     | 90+         | ✅ Full  |
| Firefox    | 88+         | ✅ Full  |
| Safari     | 14+         | ✅ Full  |
| Edge       | 90+         | ✅ Full  |

## 📝 Changelog

### Version 2.1.0 (Current)
- ✅ Nettoyage et simplification (Janvier 2025)
  - Suppression recherche textuelle des filtres
  - Suppression filtres par dates (dateFrom, dateTo)
  - Suppression paramètre de langue
  - Suppression paramètre premier jour semaine (hardcodé lundi)
  - Suppression couleurs personnalisées
- ✅ Améliorations UI
  - Catégories en grille 8 colonnes (responsive)
  - Séparateur entre catégories par défaut et personnalisées
  - Bouton renommé "Ajouter une catégorie"
  - Filtres sticky (top-2)
  - Export dropdown z-index corrigé

### Version 2.0.0
- ✅ Backend Node.js + Express + Prisma
- ✅ Base de données SQLite (dev) / PostgreSQL (prod)
- ✅ Renommage quarter-view → annual-view
- ✅ Vue annuelle avec grille 2×6 mois
- ✅ Affichage événements avec nom et icône
- ✅ Auto-scroll sur mois courant
- ✅ Création directe sur jour vide
- ✅ Suppression rapide dans panneau détail
- ✅ Navigation bas de page
- ✅ Couleur PSI adaptée en dark mode
- ✅ Icônes dans les filtres de catégories
- ✅ Suppression entrée historique après rollback

### Version 1.0.0
- ✅ Application frontend Angular standalone
- ✅ Stockage IndexedDB (local)
- ✅ 3 vues timeline (année, trimestre, mois)
- ✅ CRUD événements complet
- ✅ Filtres avancés
- ✅ Export PDF/PNG/JSON/CSV
- ✅ Historique & rollback

## 🤝 Contribution

Ce projet est en développement interne pour la DSI.

## 📄 License

MIT License

## 📧 Contact

Pour toute question, contactez l'équipe DSI.

---

**Développé avec ❤️ pour la DSI Bancaire**
