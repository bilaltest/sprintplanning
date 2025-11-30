# Guide de Maintenance - Event Planning App

## Table des Matières

1. [Setup Environnement](#setup-environnement)
2. [Démarrage Rapide](#démarrage-rapide)
3. [Structure du Projet](#structure-du-projet)
4. [Tâches de Maintenance Courantes](#tâches-de-maintenance-courantes)
5. [Ajout de Fonctionnalités](#ajout-de-fonctionnalités)
6. [Debugging et Troubleshooting](#debugging-et-troubleshooting)
7. [Déploiement](#déploiement)
8. [Checklist de Release](#checklist-de-release)

---

## Setup Environnement

### Prérequis

```bash
# Node.js version 24+
node --version  # v24.11.1 ou supérieur

# npm version 10+
npm --version   # 10.9.2 ou supérieur

# Git
git --version
```

### Installation Initiale

```bash
# 1. Cloner le repository
git clone <repository-url>
cd romantic-gates

# 2. Installer dépendances Frontend
cd event-planning-app
npm install

# 3. Installer dépendances Backend
cd ../event-planning-backend
npm install

# 4. Initialiser la base de données
npx prisma db push

# 5. (Optionnel) Remplir avec des données de test
# Créer un fichier seed.js et exécuter
node seed.js
```

### Configuration IDE (VSCode Recommandé)

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

**Extensions Recommandées**:
- Angular Language Service
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Prisma

---

## Démarrage Rapide

### Lancement en Développement

```bash
# Terminal 1 - Backend
cd event-planning-backend
npm run dev
# ✓ Server running on http://localhost:3000

# Terminal 2 - Frontend
cd event-planning-app
npm start
# ✓ App running on http://localhost:4200
```

### Accès Application

```
URL: http://localhost:4200
Password: NMB
```

### Commandes Rapides

```bash
# Build production
cd event-planning-app && npm run build

# Tests unitaires
npm test

# Prisma Studio (DB UI)
cd event-planning-backend && npx prisma studio
```

---

## Structure du Projet

### Arborescence Complète

```
romantic-gates/
├── event-planning-app/          # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Tous les composants UI
│   │   │   │   ├── auth/
│   │   │   │   ├── filters/
│   │   │   │   ├── modals/
│   │   │   │   ├── releases/
│   │   │   │   ├── settings/
│   │   │   │   └── timeline/
│   │   │   ├── guards/          # Route guards
│   │   │   ├── models/          # Types TypeScript
│   │   │   └── services/        # Services métier
│   │   ├── environments/        # Configuration env
│   │   └── styles.css           # Tailwind global
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── event-planning-backend/      # Backend Node.js
│   ├── prisma/
│   │   ├── schema.prisma        # Schéma DB
│   │   └── dev.db               # SQLite database
│   ├── src/
│   │   ├── config/              # Configuration
│   │   ├── controllers/         # Logique métier
│   │   └── routes/              # Routes Express
│   ├── package.json
│   └── server.js                # Point d'entrée
│
├── CLAUDE.md                    # Documentation projet
├── DOCUMENTATION_TECHNIQUE.md   # Cette doc
├── GUIDE_MAINTENANCE.md         # Ce guide
└── README.md                    # README principal
```

### Organisation des Composants Frontend

```
components/
├── auth/
│   └── login.component.ts           # Authentification
├── filters/
│   └── filter-bar.component.ts      # Barre de filtres (sticky)
├── modals/
│   └── event-modal.component.ts     # Modale CRUD événement
├── releases/
│   ├── releases-list.component.ts   # Liste releases
│   └── release-detail.component.ts  # Détail + Feature Flipping
├── settings/
│   └── settings.component.ts        # Paramètres utilisateur
└── timeline/
    ├── timeline-container.component.ts  # Hub principal
    ├── annual-view.component.ts         # Vue annuelle (par défaut)
    ├── month-view.component.ts          # Vue mensuelle
    └── year-view.component.ts           # Vue année (non utilisée)
```

### Organisation des Services

```
services/
├── auth.service.ts           # Authentification + Token
├── category.service.ts       # Catégories système + custom
├── event.service.ts          # CRUD événements
├── export.service.ts         # Export PDF/Excel/JSON/CSV
├── filter.service.ts         # Filtrage par catégorie
├── history.service.ts        # Historique + Auto-refresh
├── release.service.ts        # CRUD releases + nested entities
├── settings.service.ts       # Préférences utilisateur
└── timeline.service.ts       # Navigation timeline
```

---

## Tâches de Maintenance Courantes

### 1. Mise à Jour des Dépendances

```bash
# Vérifier versions obsolètes
cd event-planning-app
npm outdated

# Update mineur (recommandé)
npm update

# Update majeur (ATTENTION: tester après)
npm install @angular/core@latest @angular/common@latest

# Backend
cd ../event-planning-backend
npm outdated
npm update
```

### 2. Nettoyage de la Base de Données

```bash
cd event-planning-backend

# Option 1: Reset complet (⚠️ PERTE DE DONNÉES)
rm prisma/dev.db
npx prisma db push

# Option 2: Nettoyer anciennes entrées (safe)
sqlite3 prisma/dev.db
DELETE FROM History WHERE timestamp < datetime('now', '-30 days');
.quit
```

### 3. Optimisation des Performances

#### A. Vérifier Bundle Size

```bash
cd event-planning-app
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

**Optimisations possibles**:
- Lazy load des routes
- Tree-shaking des imports date-fns
- Optimisation des images

#### B. Profiling Runtime

```typescript
// Ajouter dans un composant lent
import { AfterViewInit } from '@angular/core';

export class MyComponent implements AfterViewInit {
  ngAfterViewInit() {
    performance.mark('component-init-start');

    // ... logique métier

    performance.mark('component-init-end');
    performance.measure(
      'component-init',
      'component-init-start',
      'component-init-end'
    );

    const measure = performance.getEntriesByName('component-init')[0];
    console.log(`Init time: ${measure.duration}ms`);
  }
}
```

### 4. Maintenance de la Base de Données

#### Backup

```bash
# Backup manuel
cp event-planning-backend/prisma/dev.db \
   event-planning-backend/prisma/backup-$(date +%Y%m%d).db

# Script backup automatique (cron)
#!/bin/bash
# backup.sh
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp event-planning-backend/prisma/dev.db \
   "$BACKUP_DIR/backup_$DATE.db"

# Garder seulement 7 derniers backups
ls -t $BACKUP_DIR/backup_*.db | tail -n +8 | xargs rm -f
```

#### Compaction SQLite

```bash
sqlite3 event-planning-backend/prisma/dev.db "VACUUM;"
```

#### Vérification Intégrité

```bash
sqlite3 event-planning-backend/prisma/dev.db "PRAGMA integrity_check;"
# Doit retourner: ok
```

### 5. Logs et Monitoring

#### Logs Backend

```javascript
// Ajouter dans server.js pour logging avancé
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Remplacer console.error par logger.error
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});
```

#### Rotation des Logs

```bash
# logrotate.conf
/path/to/event-planning-backend/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## Ajout de Fonctionnalités

### Ajouter une Nouvelle Catégorie d'Événement

#### 1. Backend - Mise à jour Schéma Prisma

```prisma
// prisma/schema.prisma
// La catégorie est un champ `string`, donc pas besoin de migration
// Les catégories personnalisées sont stockées dans Settings.customCategories
```

#### 2. Frontend - Ajouter la Catégorie Système

```typescript
// src/app/models/event.model.ts

// Ajouter dans le type EventCategory
export type EventCategory =
  | 'mep'
  | 'hotfix'
  | 'maintenance'
  | 'pi_planning'
  | 'sprint_start'
  | 'code_freeze'
  | 'psi'
  | 'demo'           // ← NOUVEAU
  | 'other';

// Ajouter dans les labels
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  mep: 'MEP',
  hotfix: 'Hotfix',
  maintenance: 'Maintenance',
  pi_planning: 'PI Planning',
  sprint_start: 'Début de Sprint',
  code_freeze: 'Code Freeze',
  psi: 'PSI',
  demo: 'Démo',      // ← NOUVEAU
  other: 'Autre'
};

// Ajouter dans les couleurs par défaut
export const CATEGORY_DEFAULTS: CategoryDefault[] = [
  // ... existing
  {
    id: 'demo',
    label: 'Démo',
    color: '#9c27b0',        // ← Choisir couleur
    icon: 'presentation'      // ← Icône Material
  }
];
```

#### 3. Tester

```bash
# 1. Redémarrer le serveur
# Frontend compile à chaud, mais relancer pour être sûr

# 2. Vérifier dans l'UI
# - Créer un événement
# - Vérifier que "Démo" apparaît dans le select
# - Créer et vérifier l'affichage
```

### Ajouter un Nouveau Type d'Action (Release)

#### 1. Backend - Mettre à Jour le Type

```typescript
// Le type est un string en DB, donc flexible
// Pas besoin de migration Prisma
```

#### 2. Frontend - Ajouter le Type

```typescript
// src/app/models/release.model.ts

export type ActionType =
  | 'topic_creation'
  | 'database_update'
  | 'vault_credentials'
  | 'feature_flipping'
  | 'memory_flipping'
  | 'api_configuration'    // ← NOUVEAU
  | 'other';

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  topic_creation: 'Création de topic Kafka',
  database_update: 'Mise à jour BDD',
  vault_credentials: 'Credentials Vault',
  feature_flipping: 'Feature Flipping',
  memory_flipping: 'Memory Flipping',
  api_configuration: 'Configuration API',  // ← NOUVEAU
  other: 'Autre'
};
```

#### 3. Mettre à Jour le Composant

```typescript
// src/app/components/releases/release-detail.component.ts

// Dans le template, ajouter l'option
<select [(ngModel)]="newAction.type" name="type" required class="input text-sm">
  <option value="">Sélectionner un type</option>
  <option value="topic_creation">{{ ACTION_TYPE_LABELS['topic_creation'] }}</option>
  <option value="database_update">{{ ACTION_TYPE_LABELS['database_update'] }}</option>
  <option value="vault_credentials">{{ ACTION_TYPE_LABELS['vault_credentials'] }}</option>
  <option value="feature_flipping">{{ ACTION_TYPE_LABELS['feature_flipping'] }}</option>
  <option value="memory_flipping">{{ ACTION_TYPE_LABELS['memory_flipping'] }}</option>
  <option value="api_configuration">{{ ACTION_TYPE_LABELS['api_configuration'] }}</option>
  <option value="other">{{ ACTION_TYPE_LABELS['other'] }}</option>
</select>
```

### Ajouter une Nouvelle Route

#### 1. Créer le Composant

```bash
cd event-planning-app
ng generate component components/reports/reports-list --standalone
```

#### 2. Définir la Route

```typescript
// src/app/app.routes.ts

export const routes: Routes = [
  // ... existing routes
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/reports-list.component').then(m => m.ReportsListComponent),
    canActivate: [authGuard]
  }
];
```

#### 3. Ajouter dans la Navigation

```typescript
// src/app/app.component.ts

views = [
  { path: '/', icon: 'event', label: 'Timeline' },
  { path: '/releases', icon: 'rocket_launch', label: 'Releases' },
  { path: '/reports', icon: 'analytics', label: 'Rapports' },  // ← NOUVEAU
  { path: '/settings', icon: 'settings', label: 'Paramètres' }
];
```

### Créer un Nouveau Service

```bash
cd event-planning-app
ng generate service services/notification
```

```typescript
// src/app/services/notification.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  success(message: string, duration = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.show({ type: 'error', message, duration });
  }

  private show(notification: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID();
    const fullNotification: Notification = { id, ...notification };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, fullNotification]);

    if (notification.duration) {
      setTimeout(() => this.dismiss(id), notification.duration);
    }
  }

  dismiss(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }
}
```

---

## Debugging et Troubleshooting

### Problèmes Frontend

#### 1. Erreur: "Cannot find module"

```bash
# Solution 1: Nettoyer cache
rm -rf node_modules package-lock.json
npm install

# Solution 2: Nettoyer cache Angular
rm -rf .angular
npm start

# Solution 3: Vérifier tsconfig paths
cat tsconfig.json | grep paths
```

#### 2. Erreur: Memory Leak Détecté

```typescript
// Vérifier que toutes les subscriptions utilisent takeUntilDestroyed()

// ❌ AVANT
ngOnInit() {
  this.service.data$.subscribe(data => {
    this.data = data;
  });
}

// ✅ APRÈS
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

constructor(private service: MyService) {
  this.service.data$
    .pipe(takeUntilDestroyed())
    .subscribe(data => {
      this.data = data;
    });
}
```

**Outil de détection**:
```bash
# Chrome DevTools
1. Performance > Memory
2. Take snapshot
3. Navigate app (10+ times)
4. Take another snapshot
5. Compare - look for "Detached" elements
```

#### 3. Erreur: Styles Tailwind Non Appliqués

```bash
# Vérifier compilation Tailwind
cat src/styles.css

# Doit contenir:
@tailwind base;
@tailwind components;
@tailwind utilities;

# Redémarrer dev server
npm start
```

### Problèmes Backend

#### 1. Erreur: "Prisma Client not generated"

```bash
cd event-planning-backend
npx prisma generate
npm run dev
```

#### 2. Erreur: Port 3000 Already in Use

```bash
# Trouver process
lsof -i :3000

# Tuer process
kill -9 <PID>

# Ou utiliser un autre port
PORT=3001 npm run dev
```

#### 3. Erreur: Database Locked

```bash
# Identifier connexions actives
sqlite3 prisma/dev.db ".timeout 5000"

# Fermer Prisma Studio si ouvert
# Puis retry
```

### Debugging Avancé

#### Activer Debug RxJS

```typescript
// src/app/app.config.ts
import { tap } from 'rxjs/operators';

// Dans un service
loadData() {
  return this.http.get('/api/data').pipe(
    tap(data => console.log('[DEBUG] Data loaded:', data)),
    tap({
      error: err => console.error('[DEBUG] Error:', err),
      complete: () => console.log('[DEBUG] Complete')
    })
  );
}
```

#### Activer Source Maps Production

```json
// angular.json
{
  "projects": {
    "event-planning-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "sourceMap": true  // ← Pour debugging production
            }
          }
        }
      }
    }
  }
}
```

---

## Déploiement

### Build de Production

#### Frontend

```bash
cd event-planning-app
npm run build

# Output dans: dist/event-planning-app/browser/
# Taille attendue: ~2-3 MB
```

#### Backend

```bash
cd event-planning-backend

# Pas de build nécessaire (Node.js)
# Mais configurer environment

# 1. Créer .env.production
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./prod.db"
EOF

# 2. Initialiser DB production
DATABASE_URL="file:./prod.db" npx prisma db push
```

### Déploiement sur Serveur

#### Option 1: Serveur Unique (Frontend + Backend)

```bash
# Structure déploiement
/var/www/event-planning/
├── frontend/          # Contenu de dist/
├── backend/           # Code backend
│   ├── src/
│   ├── prisma/
│   ├── node_modules/
│   └── server.js
└── nginx.conf
```

**Configuration Nginx**:

```nginx
# /etc/nginx/sites-available/event-planning

server {
    listen 80;
    server_name event-planning.example.com;

    # Frontend (SPA)
    location / {
        root /var/www/event-planning/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Service systemd pour Backend**:

```ini
# /etc/systemd/system/event-planning-backend.service

[Unit]
Description=Event Planning Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/event-planning/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer
sudo systemctl enable event-planning-backend
sudo systemctl start event-planning-backend
sudo systemctl status event-planning-backend
```

#### Option 2: Docker (Recommandé)

**Dockerfile Frontend**:

```dockerfile
# frontend/Dockerfile
FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/event-planning-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**Dockerfile Backend**:

```dockerfile
# backend/Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "server.js"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  backend:
    build: ./event-planning-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./prod.db
    volumes:
      - ./data:/app/prisma
    restart: unless-stopped

  frontend:
    build: ./event-planning-app
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

```bash
# Déployer
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## Checklist de Release

### Avant Chaque Release

- [ ] **Code Quality**
  - [ ] Aucun `console.log` en production
  - [ ] Aucun import inutilisé
  - [ ] Aucun code commenté
  - [ ] ESLint 0 erreurs

- [ ] **Tests**
  - [ ] Tests unitaires passent (npm test)
  - [ ] Tests manuels des fonctionnalités critiques
    - [ ] Login/Logout
    - [ ] Création événement
    - [ ] Création release + Feature Flipping
    - [ ] Export PDF/Excel
    - [ ] Filtres timeline

- [ ] **Performance**
  - [ ] Bundle size acceptable (<5 MB)
  - [ ] Lighthouse score > 80
  - [ ] Pas de memory leaks détectés

- [ ] **Documentation**
  - [ ] CHANGELOG.md mis à jour
  - [ ] README.md à jour
  - [ ] Documentation API à jour

- [ ] **Base de Données**
  - [ ] Backup créé
  - [ ] Migrations Prisma appliquées
  - [ ] Intégrité vérifiée

- [ ] **Sécurité**
  - [ ] Dépendances à jour (npm audit)
  - [ ] Aucune vulnérabilité critique
  - [ ] Variables sensibles dans .env

### Process de Release

```bash
# 1. Créer branche release
git checkout -b release/v1.1.0

# 2. Bump version
cd event-planning-app
npm version minor  # ou major/patch
cd ../event-planning-backend
npm version minor

# 3. Build et test
cd ../event-planning-app
npm run build
npm test

# 4. Commit et tag
git add .
git commit -m "chore: release v1.1.0"
git tag v1.1.0

# 5. Merge dans main
git checkout main
git merge release/v1.1.0

# 6. Push
git push origin main --tags

# 7. Créer release GitHub
gh release create v1.1.0 \
  --title "Release v1.1.0" \
  --notes "Voir CHANGELOG.md pour détails"
```

### Post-Release

- [ ] Vérifier déploiement production
- [ ] Monitorer logs pour erreurs
- [ ] Informer utilisateurs des nouveautés
- [ ] Archiver branche release
- [ ] Créer milestone next release

---

## Contacts et Support

### Équipe

- **Lead Developer**: [Nom]
- **DevOps**: [Nom]
- **Support**: dsi-support@example.com

### Ressources

- **Repository**: https://github.com/org/event-planning
- **Documentation**: Confluence/Wiki
- **Bugs**: JIRA/GitHub Issues
- **Chat**: Slack #event-planning

### Escalation

1. **Niveau 1**: Consulter cette documentation
2. **Niveau 2**: Poser question sur Slack
3. **Niveau 3**: Créer ticket JIRA
4. **Niveau 4**: Contacter Lead Developer

---

**Dernière mise à jour**: 30 Novembre 2025
**Mainteneur**: Équipe DSI
