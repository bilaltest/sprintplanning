# Planning DSI - Backend API

Backend REST API pour l'application Planning DSI, développé avec Node.js, Express et Prisma ORM.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)

## 📋 Description

API RESTful permettant la gestion centralisée des événements du planning DSI avec support multi-utilisateurs.

### Fonctionnalités

- ✅ **CRUD complet** pour les événements
- ✅ **Gestion des préférences** utilisateur
- ✅ **Historique des modifications** avec rollback
- ✅ **Base de données SQLite** (développement)
- ✅ **Support PostgreSQL** (production)
- ✅ **CORS configuré** pour le frontend Angular
- ✅ **Validation des données** avec express-validator
- ✅ **Gestion d'erreurs** centralisée

## 🚀 Installation

### Prérequis

- **Node.js** : v18+ (LTS recommandé)
- **npm** : v9+

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env selon vos besoins

# 3. Générer le client Prisma
npx prisma generate

# 4. Créer/synchroniser la base de données
npx prisma db push

# 5. (Optionnel) Ouvrir Prisma Studio pour voir la base
npx prisma studio

# 6. Démarrer le serveur
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📂 Structure du Projet

```
event-planning-backend/
├── src/
│   ├── server.js                   # Point d'entrée Express
│   ├── config/
│   │   └── database.js             # Configuration Prisma Client
│   ├── routes/
│   │   ├── event.routes.js         # Routes /api/events
│   │   ├── settings.routes.js      # Routes /api/settings
│   │   └── history.routes.js       # Routes /api/history
│   ├── controllers/
│   │   ├── event.controller.js     # Logique métier événements
│   │   ├── settings.controller.js  # Logique métier paramètres
│   │   └── history.controller.js   # Logique métier historique
│   └── middleware/
│       └── error.middleware.js     # Gestion d'erreurs centralisée
├── prisma/
│   ├── schema.prisma               # Schéma de base de données
│   └── dev.db                      # Base SQLite (généré)
├── .env                            # Variables d'environnement
├── .env.example                    # Template de configuration
├── package.json                    # Dépendances
└── README.md                       # Ce fichier
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Événements

#### GET /api/events
Récupère tous les événements.

**Réponse**: `200 OK`
```json
[
  {
    "id": "clxxx...",
    "title": "MEP v2.0",
    "date": "2025-12-15",
    "startTime": "09:00",
    "endTime": "12:00",
    "category": "mep",
    "color": "#22c55e",
    "icon": "rocket_launch",
    "description": "Mise en production majeure",
    "createdAt": "2025-11-29T10:00:00.000Z",
    "updatedAt": "2025-11-29T10:00:00.000Z"
  }
]
```

#### POST /api/events
Crée un nouvel événement.

**Body** (JSON):
```json
{
  "title": "MEP v2.0",
  "date": "2025-12-15",
  "startTime": "09:00",        // Optionnel
  "endTime": "12:00",          // Optionnel
  "category": "mep",
  "color": "#22c55e",
  "icon": "rocket_launch",
  "description": "Description" // Optionnel
}
```

**Réponse**: `201 Created`
```json
{
  "id": "clxxx...",
  "title": "MEP v2.0",
  // ... autres champs
}
```

#### PUT /api/events/:id
Met à jour un événement.

**Paramètres**: `id` (string, dans l'URL)

**Body** (JSON): Même format que POST

**Réponse**: `200 OK`

#### DELETE /api/events/:id
Supprime un événement.

**Paramètres**: `id` (string, dans l'URL)

**Réponse**: `204 No Content`

### Paramètres

#### GET /api/settings
Récupère les préférences utilisateur.

**Réponse**: `200 OK`
```json
{
  "id": "clxxx...",
  "theme": "dark",
  "customCategories": [
    {
      "id": "custom_123",
      "name": "reunion_client",
      "label": "Réunion client",
      "color": "#3b82f6",
      "icon": "meeting_room"
    }
  ],
  "createdAt": "2025-11-29T10:00:00.000Z",
  "updatedAt": "2025-11-29T10:00:00.000Z"
}
```

#### PUT /api/settings
Met à jour les préférences.

**Body** (JSON):
```json
{
  "theme": "dark",
  "customCategories": [
    {
      "id": "custom_123",
      "name": "reunion_client",
      "label": "Réunion client",
      "color": "#3b82f6",
      "icon": "meeting_room"
    }
  ]
}
```

**Réponse**: `200 OK`

### Historique

#### GET /api/history
Récupère les 20 dernières modifications.

**Réponse**: `200 OK`
```json
[
  {
    "id": "clxxx...",
    "action": "create",
    "eventId": "clyyy...",
    "eventData": {
      "title": "MEP v2.0",
      "date": "2025-12-15",
      // ... données complètes de l'événement
    },
    "previousData": null,
    "timestamp": "2025-11-29T10:00:00.000Z"
  }
]
```

#### POST /api/history/:id/rollback
Annule une modification.

**Paramètres**: `id` (string, dans l'URL)

**Réponse**: `200 OK`
```json
{
  "message": "Rollback successful"
}
```

**Comportement**:
- `action: 'create'` → Supprime l'événement créé
- `action: 'update'` → Restaure l'ancienne version
- `action: 'delete'` → Re-crée l'événement supprimé
- L'entrée d'historique est supprimée après rollback réussi

#### DELETE /api/history
Vide tout l'historique.

**Réponse**: `204 No Content`

## 💾 Base de Données

### Schéma Prisma

```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  date        String   // Format: YYYY-MM-DD
  startTime   String?  // Format: HH:mm
  endTime     String?  // Format: HH:mm
  category    String
  color       String   // Format: #RRGGBB
  icon        String   // Material Icon name
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
  previousData    String?  // JSON en String pour SQLite
  timestamp       DateTime @default(now())
}
```

### Basculer de SQLite à PostgreSQL

#### 1. Modifier `.env`

```bash
# SQLite (développement)
DATABASE_URL="file:./dev.db"

# PostgreSQL (production)
DATABASE_URL="postgresql://user:password@localhost:5432/event_planning?schema=public"
```

#### 2. Modifier `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  // Au lieu de "sqlite"
  url      = env("DATABASE_URL")
}

model Settings {
  customCategories Json @default([])  // Au lieu de String
}

model History {
  eventData    Json   // Au lieu de String
  previousData Json?  // Au lieu de String?
}
```

#### 3. Mettre à jour les contrôleurs

**Avant** (SQLite avec String):
```javascript
await prisma.history.create({
  data: {
    eventData: JSON.stringify(event),  // ← Avec stringify
    previousData: JSON.stringify(old)
  }
});
```

**Après** (PostgreSQL avec Json):
```javascript
await prisma.history.create({
  data: {
    eventData: event,      // ← Directement l'objet
    previousData: old
  }
});
```

#### 4. Regénérer et migrer

```bash
npx prisma generate
npx prisma db push
```

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine :

```bash
# Port du serveur
PORT=3000

# Base de données
# SQLite (développement)
DATABASE_URL="file:./dev.db"

# PostgreSQL (production)
# DATABASE_URL="postgresql://user:password@localhost:5432/event_planning?schema=public"

# CORS Origin (frontend)
CORS_ORIGIN="http://localhost:4200"
```

### Scripts NPM

```bash
npm start              # Démarre le serveur (nodemon en dev)
npm run dev            # Alias de start
npm test               # Lance les tests (à implémenter)
```

## 🔐 Sécurité

### CORS

Le backend autorise les requêtes depuis `http://localhost:4200` uniquement.

Pour modifier :

```javascript
// src/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
```

### Validation

Toutes les requêtes sont validées avec `express-validator` (à implémenter).

### Gestion d'Erreurs

Toutes les erreurs sont capturées par le middleware centralisé :

```javascript
// src/middleware/error.middleware.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
};
```

## 🐛 Troubleshooting

### Le serveur ne démarre pas

```bash
# Vérifier que le port 3000 est libre
lsof -i :3000

# Tuer le processus si nécessaire
kill -9 <PID>
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

### Base SQLite verrouillée

```bash
# Arrêter tous les processus utilisant la base
pkill -f prisma

# Supprimer le fichier de verrouillage
rm prisma/dev.db-journal
```

### CORS Errors

Vérifiez que :
1. Le backend tourne sur `http://localhost:3000`
2. Le frontend tourne sur `http://localhost:4200`
3. La variable `CORS_ORIGIN` est correcte

## 📊 Performance

### Optimisations

- **Indexation** : Index sur `category` et `timestamp`
- **Limite historique** : Max 20 entrées récupérées
- **Connection pooling** : Géré automatiquement par Prisma

### Benchmarks Attendus

- GET /api/events : < 50ms (100 événements)
- POST /api/events : < 100ms
- Rollback : < 200ms

## 🚀 Déploiement

### Production avec PostgreSQL

```bash
# 1. Installer PostgreSQL
# 2. Créer la base de données
createdb event_planning

# 3. Modifier .env pour PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/event_planning"

# 4. Mettre à jour schema.prisma (voir section PostgreSQL)
# 5. Générer et migrer
npx prisma generate
npx prisma db push

# 6. Démarrer avec PM2
npm install -g pm2
pm2 start src/server.js --name "planning-backend"
pm2 save
```

## 📝 Changelog

### Version 1.1.0 (Current)
- ✅ Nettoyage du schéma Settings (Janvier 2025)
  - Suppression colonnes language et weekStart
  - Suppression colonne customColors
  - Ajout support customCategories (JSON)
- ✅ Migration base de données effectuée

### Version 1.0.0
- ✅ API REST complète (événements, paramètres, historique)
- ✅ Base de données SQLite (dev)
- ✅ Support PostgreSQL (prod)
- ✅ Rollback avec suppression automatique de l'historique
- ✅ CORS configuré
- ✅ Gestion d'erreurs centralisée

## 📄 License

MIT License

## 📧 Contact

Pour toute question, contactez l'équipe DSI.

---

**Développé avec ❤️ pour la DSI Bancaire**
