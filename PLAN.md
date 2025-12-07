# Plan d'implémentation - Playground avec Typing Game

## Vue d'ensemble
Création d'un nouvel espace "Playground" avec un premier jeu de typing (60 secondes, mots aléatoires) et système de classement persistant en BDD. Architecture extensible pour ajouter d'autres jeux à l'avenir.

---

## Phase 1 : Base de données (Backend)

### 1.1 Mise à jour du schéma Prisma
**Fichier:** `event-planning-backend/prisma/schema.prisma`

Ajouter les modèles :
```prisma
model Game {
  id          String   @id @default(cuid())
  slug        String   @unique  // 'typing-game', 'memory-game', etc.
  name        String
  description String?
  icon        String   @default("sports_esports")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  scores      GameScore[]
}

model GameScore {
  id          String   @id @default(cuid())
  gameId      String
  userId      String
  score       Int           // Pour typing: nombre de mots corrects
  wpm         Int?          // Words per minute (spécifique typing)
  accuracy    Float?        // Précision en % (spécifique typing)
  metadata    String?       // JSON pour données spécifiques au jeu
  createdAt   DateTime @default(now())

  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([gameId, score(sort: Desc)])
  @@index([userId])
}
```

Ajouter la relation dans User:
```prisma
model User {
  // ... existing fields
  gameScores  GameScore[]
}
```

### 1.2 Migration et seed du jeu Typing
- Exécuter `npx prisma db push`
- Créer un seed pour insérer le jeu "Typing Challenge"

---

## Phase 2 : API Backend

### 2.1 Contrôleur des jeux
**Fichier:** `event-planning-backend/src/controllers/game.controller.js`

Endpoints :
- `GET /api/games` - Liste des jeux actifs
- `GET /api/games/:slug` - Détails d'un jeu
- `GET /api/games/:slug/leaderboard` - Top 10 classement (avec option all-time / today / week)
- `POST /api/games/:slug/scores` - Soumettre un score
- `GET /api/games/:slug/my-scores` - Historique personnel du joueur

### 2.2 Routes
**Fichier:** `event-planning-backend/src/routes/game.routes.js`

### 2.3 Enregistrement dans server.js
Ajouter `app.use('/api/games', gameRoutes);`

---

## Phase 3 : Frontend - Service et Modèles

### 3.1 Modèles TypeScript
**Fichier:** `event-planning-app/src/app/models/game.model.ts`

```typescript
export interface Game {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  isActive: boolean;
}

export interface GameScore {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  wpm?: number;
  accuracy?: number;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
  rank?: number;
}

export interface LeaderboardEntry extends GameScore {
  rank: number;
}
```

### 3.2 Service Playground
**Fichier:** `event-planning-app/src/app/services/playground.service.ts`

Pattern identique aux autres services (BehaviorSubject, async/await avec firstValueFrom).

---

## Phase 4 : Frontend - Composants

### 4.1 Page principale Playground
**Fichier:** `event-planning-app/src/app/components/playground/playground.component.ts`

- Header avec titre "Playground" et description
- Grille de cards pour chaque jeu disponible
- Design moderne avec animations hover
- Préparé pour accueillir plusieurs jeux

### 4.2 Composant Typing Game
**Fichier:** `event-planning-app/src/app/components/playground/typing-game/typing-game.component.ts`

**États du jeu :**
1. **Idle** - Écran d'accueil avec bouton "Commencer", meilleur score personnel, top 3 rapide
2. **Countdown** - 3, 2, 1... animation avant départ
3. **Playing** - Zone de jeu active (60s)
4. **Finished** - Résultats avec animation, classement, option rejouer

**Mécaniques :**
- Timer de 60 secondes avec barre de progression animée
- Mots français courants (liste intégrée ~300 mots, pas de lib externe)
- Affichage du mot actuel en GRAND + 3 mots suivants en preview
- Champ de saisie avec feedback visuel immédiat :
  - Vert si caractère correct
  - Rouge si erreur
  - Shake animation sur erreur
- Espace ou Enter pour valider le mot
- Statistiques en temps réel : mots validés, WPM live, précision
- Effets visuels :
  - Particules/confettis sur mot correct (CSS pure)
  - Combo streak avec multiplicateur visuel
  - Flash screen sur erreur

### 4.3 Composant Leaderboard
**Fichier:** `event-planning-app/src/app/components/playground/leaderboard/leaderboard.component.ts`

- Réutilisable pour tous les jeux
- Top 10 avec podium visuel (1er, 2ème, 3ème mis en valeur)
- Avatar avec initiales
- Filtres : Tous les temps / Cette semaine / Aujourd'hui
- Highlight si le joueur actuel est dans le classement
- Animation d'entrée pour chaque ligne

---

## Phase 5 : Routing et Navigation

### 5.1 Routes
**Fichier:** `event-planning-app/src/app/app.routes.ts`

```typescript
{
  path: 'playground',
  loadComponent: () => import('./components/playground/playground.component').then(m => m.PlaygroundComponent),
  data: { breadcrumb: 'Playground' }
},
{
  path: 'playground/typing',
  loadComponent: () => import('./components/playground/typing-game/typing-game.component').then(m => m.TypingGameComponent),
  data: { breadcrumb: 'Typing Challenge' }
}
```

### 5.2 Sidebar
**Fichier:** `event-planning-app/src/app/components/shared/sidebar.component.ts`

Ajouter l'item de navigation :
```typescript
{ label: 'Playground', icon: 'sports_esports', route: '/playground' }
```

---

## Phase 6 : Effets Visuels "Wow"

### 6.1 Animations CSS pures (pas de lib)
- Keyframes pour confettis (particules CSS)
- Pulsation du timer quand < 10s
- Glow effect sur le score qui augmente
- Gradient animé en arrière-plan pendant le jeu
- Transition fluide entre les états du jeu

### 6.2 Micro-interactions
- Bounce sur validation de mot
- Ripple effect sur les boutons
- Counter animé pour le score final
- Podium qui "monte" à l'affichage

### 6.3 Sons (optionnel, désactivable)
- Pas implémenté initialement (environnement DSI)

---

## Liste des mots français (intégrée)
~300 mots courants de 3-8 lettres, variés :
- Verbes : avoir, faire, dire, voir, prendre, etc.
- Noms : maison, travail, temps, monde, etc.
- Adjectifs : grand, petit, nouveau, bon, etc.

Stockés directement dans le composant (pas de requête externe).

---

## Fichiers à créer/modifier

### Backend (5 fichiers)
1. `prisma/schema.prisma` - Ajout modèles Game, GameScore
2. `src/controllers/game.controller.js` - NOUVEAU
3. `src/routes/game.routes.js` - NOUVEAU
4. `src/server.js` - Ajout route /api/games

### Frontend (8 fichiers)
1. `src/app/models/game.model.ts` - NOUVEAU
2. `src/app/services/playground.service.ts` - NOUVEAU
3. `src/app/components/playground/playground.component.ts` - NOUVEAU
4. `src/app/components/playground/typing-game/typing-game.component.ts` - NOUVEAU
5. `src/app/components/playground/leaderboard/leaderboard.component.ts` - NOUVEAU
6. `src/app/app.routes.ts` - Modification
7. `src/app/components/shared/sidebar.component.ts` - Modification

---

## Points techniques importants

1. **Pas de librairie externe** - Tout en CSS/TypeScript natif
2. **Compatible dark mode** - Classes Tailwind `dark:` sur tous les éléments
3. **Extensible** - Architecture prête pour ajouter d'autres jeux
4. **Performance** - Lazy loading des composants
5. **Anti-triche basique** - Validation côté serveur du temps de jeu

---

## Ordre d'implémentation

1. Base de données (Prisma schema + push)
2. Backend API (controller + routes + server.js)
3. Frontend service + modèles
4. Composant Leaderboard (réutilisable)
5. Composant Typing Game
6. Page Playground principale
7. Routing + Sidebar
8. Polish des animations et effets visuels
