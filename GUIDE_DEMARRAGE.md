# 🚀 Guide de démarrage - Application de Planning Événementiel

Ce guide vous explique comment démarrer l'application complète (frontend Angular + backend Node.js).

## 📋 Prérequis

- **Node.js** v18+ et **npm** (vérifier avec `node --version` et `npm --version`)
- Un navigateur moderne (Chrome, Firefox, Edge, Safari)

## 🏗️ Architecture

L'application est composée de 2 parties :

```
Planning/
├── event-planning-app/          # Frontend Angular (port 4200)
└── event-planning-backend/      # Backend Node.js/Express + Prisma (port 3000)
```

- **Frontend** : Application Angular qui affiche l'interface utilisateur
- **Backend** : API REST qui stocke les événements dans une base de données (SQLite ou PostgreSQL)

## ⚡ Démarrage rapide

### Étape 1 : Installer les dépendances du backend

```bash
cd event-planning-backend
npm install
```

### Étape 2 : Configurer la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer la base de données et les tables
npx prisma migrate dev --name init
```

> **Note** : Par défaut, l'application utilise **SQLite** (fichier `dev.db`). Aucune installation supplémentaire n'est requise !

### Étape 3 : Démarrer le backend

```bash
# Dans le dossier event-planning-backend
npm run dev
```

Le backend démarre sur **http://localhost:3000**

Vous devriez voir :
```
🚀 Server running on http://localhost:3000
📊 API available at http://localhost:3000/api
```

### Étape 4 : Démarrer le frontend (dans un nouveau terminal)

```bash
cd ../event-planning-app
npm start
```

Le frontend démarre sur **http://localhost:4200**

### Étape 5 : Ouvrir l'application

Ouvrez votre navigateur à l'adresse : **http://localhost:4200**

🎉 **C'est prêt !** Vous pouvez maintenant créer des événements qui seront partagés entre tous les utilisateurs.

---

## 🔧 Commandes utiles

### Backend

```bash
cd event-planning-backend

# Démarrage en mode développement (avec auto-reload)
npm run dev

# Démarrage en mode production
npm start

# Générer le client Prisma (après modification du schema)
npx prisma generate

# Créer une migration (après modification du schema)
npx prisma migrate dev --name nom_de_la_migration

# Ouvrir Prisma Studio (interface graphique pour voir les données)
npx prisma studio
```

### Frontend

```bash
cd event-planning-app

# Démarrage en mode développement
npm start

# Build pour production
npm run build

# Lancer les tests
npm test
```

---

## 🗄️ Base de données

### SQLite (par défaut - recommandé pour le développement)

- **Emplacement** : `event-planning-backend/dev.db`
- **Avantages** : Pas d'installation, fichier local, simple
- **Configuration** : Déjà configurée dans `.env`

### PostgreSQL (pour la production)

Si vous voulez utiliser PostgreSQL :

1. Installer PostgreSQL sur votre machine
2. Créer une base de données `event_planning`
3. Modifier `event-planning-backend/.env` :
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/event_planning?schema=public"
   ```
4. Modifier `prisma/schema.prisma` :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Relancer `npx prisma migrate dev`

---

## 🌐 API REST - Endpoints disponibles

### Events

- `GET /api/events` - Liste tous les événements
  - Paramètres optionnels : `?category=mep&dateFrom=2025-01-01&dateTo=2025-12-31&search=texte`
- `GET /api/events/:id` - Récupérer un événement
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `POST /api/events/bulk` - Importer plusieurs événements

### Settings

- `GET /api/settings` - Récupérer les paramètres
- `PUT /api/settings` - Modifier les paramètres

### History

- `GET /api/history` - Récupérer l'historique (20 derniers)
- `POST /api/history/:id/rollback` - Annuler une modification
- `DELETE /api/history` - Vider l'historique

### Health Check

- `GET /api/health` - Vérifier que l'API fonctionne

---

## 🎨 Catégories d'événements

L'application supporte 8 catégories :

| Catégorie | Icône | Couleur |
|-----------|-------|---------|
| Mise en production | 🚀 | Vert |
| Hotfix | 🐛 | Rouge |
| Maintenance | 🔧 | Gris |
| PI Planning | 👥 | Jaune |
| Début de sprint | 🏁 | Turquoise |
| Freeze du code | ❄️ | Orange |
| PSI | 🛑 | Noir |
| Autre | 📅 | Violet |

---

## 🔐 Sécurité et Production

### Pour déployer en production :

1. **Backend** :
   - Changer `DATABASE_URL` pour pointer vers PostgreSQL en production
   - Ajouter des variables d'environnement pour les secrets
   - Utiliser HTTPS
   - Ajouter un système d'authentification (JWT recommandé)

2. **Frontend** :
   - Modifier `src/environments/environment.prod.ts` avec l'URL de production
   - Build : `npm run build`
   - Servir les fichiers du dossier `dist/`

3. **Options de déploiement** :
   - **Backend** : Heroku, Render, Railway, DigitalOcean, AWS
   - **Frontend** : Netlify, Vercel, Firebase Hosting, GitHub Pages

---

## 🐛 Résolution de problèmes

### Le backend ne démarre pas

```bash
# Vérifier que le port 3000 n'est pas déjà utilisé
lsof -i :3000

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Le frontend ne se connecte pas au backend

1. Vérifier que le backend tourne sur http://localhost:3000
2. Ouvrir la console du navigateur (F12) pour voir les erreurs
3. Vérifier que `src/environments/environment.ts` contient :
   ```typescript
   apiUrl: 'http://localhost:3000/api'
   ```

### Erreur CORS

Si vous voyez des erreurs CORS dans la console, vérifier que le backend a bien :
```javascript
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Base de données corrompue

```bash
# Supprimer et recréer la base de données
cd event-planning-backend
rm dev.db
npx prisma migrate dev
```

---

## 📚 Documentation supplémentaire

- **Frontend README** : `event-planning-app/README.md`
- **Backend README** : `event-planning-backend/README.md`
- **Architecture** : `event-planning-app/docs/ARCHITECTURE.md`

---

## 💡 Conseils

1. **Toujours démarrer le backend AVANT le frontend**
2. **Prisma Studio** est très utile pour visualiser/modifier les données : `npx prisma studio`
3. **Les événements sont partagés** entre tous les utilisateurs qui se connectent
4. **Export/Import** : Utilisez les boutons d'export pour sauvegarder vos données

---

## 🆘 Support

En cas de problème :

1. Vérifier les logs dans le terminal (backend et frontend)
2. Ouvrir la console du navigateur (F12)
3. Consulter la documentation dans les dossiers `docs/`

---

**Bon planning ! 🎉**
