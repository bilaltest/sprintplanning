# 📊 Guide de Migration des Données

## Objectif

Migrer les données de SQLite (Node.js) vers PostgreSQL/H2 (Spring Boot) **sans perte de données**.

---

## 🎯 Stratégie de migration

### Phase 1: Export depuis SQLite
### Phase 2: Transformation des données
### Phase 3: Import vers PostgreSQL/H2
### Phase 4: Validation

---

## Phase 1: Export depuis SQLite

### 1.1 Utiliser l'endpoint /api/admin/export

**Commande** :
```bash
# Démarrer Node.js backend
cd event-planning-backend
npm run dev

# Export complet
curl http://localhost:3000/api/admin/export > backup-$(date +%Y%m%d).json
```

**Format généré** :
```json
{
  "metadata": {
    "exportDate": "2024-12-08T14:30:00",
    "version": "1.0",
    "totalRecords": {
      "users": 5,
      "events": 120,
      "releases": 15,
      "history": 450,
      "releaseHistory": 80,
      "settings": 1
    }
  },
  "data": {
    "users": [...],
    "events": [...],
    "releases": [...],
    "history": [...],
    "releaseHistory": [...],
    "settings": [...]
  }
}
```

### 1.2 Export SQL brut (alternative)

```bash
sqlite3 prisma/dev.db .dump > backup.sql
```

---

## Phase 2: Transformation des données

### 2.1 Vérification de l'intégrité

**Script de validation** (`validate-export.js`):
```javascript
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

// Vérifier metadata
if (data.metadata.version !== '1.0') {
  throw new Error('Version non supportée');
}

// Vérifier relations
const userIds = new Set(data.data.users.map(u => u.id));
data.data.history.forEach(h => {
  if (h.userId && !userIds.has(h.userId)) {
    console.warn(`History ${h.id} référence user inexistant ${h.userId}`);
  }
});

// Vérifier cascade
data.data.releases.forEach(r => {
  r.squads.forEach(s => {
    s.actions.forEach(a => {
      if (a.flipping && !['feature_flipping', 'memory_flipping'].includes(a.type)) {
        console.warn(`Action ${a.id} a flipping mais type=${a.type}`);
      }
    });
  });
});

console.log('✅ Validation OK');
```

### 2.2 Transformation pour PostgreSQL

**Différences SQLite → PostgreSQL** :
- CUID → UUID (déjà compatible)
- DateTime stocké en String → Garder (compatibilité)
- JSON en String → Garder

**Aucune transformation nécessaire** grâce au format JSON de l'export.

---

## Phase 3: Import vers Spring Boot

### 3.1 Préparer la base cible

**PostgreSQL** (production) :
```bash
# Créer base
createdb eventplanning

# Variables d'environnement
export DATABASE_URL=jdbc:postgresql://localhost:5432/eventplanning
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
```

**H2** (dev) :
```bash
# Aucune action, H2 créé automatiquement
```

### 3.2 Démarrer Spring Boot (génération schema)

```bash
cd event-planning-spring-boot
mvn spring-boot:run
```

Spring Boot va créer automatiquement le schema via Hibernate DDL.

### 3.3 Import via endpoint /api/admin/import

**Commande** :
```bash
# Import complet
curl -X POST http://localhost:3000/api/admin/import \
  -H "Content-Type: application/json" \
  -d @backup-20241208.json
```

**Résultat attendu** :
```json
{
  "message": "Base de données importée avec succès",
  "importedRecords": {
    "users": 5,
    "events": 120,
    "releases": 15,
    "history": 450,
    "releaseHistory": 80,
    "settings": 1
  }
}
```

### 3.4 Vérification post-import

```bash
# Vérifier counts
curl http://localhost:3000/api/admin/stats

# Expected
{
  "stats": {
    "totalUsers": 5,
    "totalEvents": 120,
    "totalReleases": 15,
    "totalHistoryEntries": 450
  }
}
```

---

## Phase 4: Validation

### 4.1 Validation automatique

**Script** (`validate-migration.sh`):
```bash
#!/bin/bash

# Comparer counts
NODE_USERS=$(curl -s http://localhost:3000/api/admin/stats | jq '.stats.totalUsers')
SPRING_USERS=$(curl -s http://localhost:3001/api/admin/stats | jq '.stats.totalUsers')

if [ "$NODE_USERS" != "$SPRING_USERS" ]; then
  echo "❌ User count mismatch: Node=$NODE_USERS, Spring=$SPRING_USERS"
  exit 1
fi

echo "✅ User count OK: $SPRING_USERS"

# Répéter pour events, releases, etc.
```

### 4.2 Validation manuelle

**Checklist** :
- [ ] User count identique
- [ ] Event count identique
- [ ] Release count identique
- [ ] History count identique
- [ ] Tous les events affichés dans Angular
- [ ] Toutes les releases affichées avec squads
- [ ] Leaderboard games correct
- [ ] Auth fonctionne (login avec users existants)
- [ ] Relations intactes (cascade, nullable)

### 4.3 Tests de données spécifiques

**Test 1: Vérifier user avec histories**
```bash
# Node.js
curl http://localhost:3000/api/auth/login \
  -d '{"email":"jean.dupont@ca-ts.fr","password":"Password123"}' \
  -H "Content-Type: application/json"

# Spring Boot
curl http://localhost:3001/api/auth/login \
  -d '{"email":"jean.dupont@ca-ts.fr","password":"Password123"}' \
  -H "Content-Type: application/json"

# Comparer tokens et user data
```

**Test 2: Vérifier release avec relations**
```bash
# Node.js
curl http://localhost:3000/api/releases/40.5

# Spring Boot
curl http://localhost:3001/api/releases/40.5

# Comparer JSON (ignorer timestamps)
```

**Test 3: Vérifier leaderboard**
```bash
# Node.js
curl http://localhost:3000/api/games/typing-fr/leaderboard

# Spring Boot
curl http://localhost:3001/api/games/typing-fr/leaderboard

# Vérifier mêmes scores, même ordre
```

---

## 🚨 Troubleshooting

### Erreur: "Duplicate key violation"

**Cause** : IDs en conflit lors de l'import.

**Solution** :
```bash
# Vider la base Spring Boot
curl -X POST http://localhost:3001/api/admin/clear-all

# Réimporter
curl -X POST http://localhost:3001/api/admin/import -d @backup.json
```

### Erreur: "Foreign key constraint violation"

**Cause** : Ordre d'insertion incorrect.

**Solution** : Vérifier que l'endpoint `/api/admin/import` insère dans le bon ordre :
1. Users
2. Settings
3. Events
4. Releases → Squads → Features + Actions → FeatureFlipping
5. History, ReleaseHistory
6. Games → GameScores

### Erreur: "JSON parse error"

**Cause** : Champs JSON (targetClients, etc.) mal formatés.

**Solution** :
```java
// Dans import, valider JSON avant insert
ObjectMapper mapper = new ObjectMapper();
try {
    mapper.readTree(flipping.getTargetClients()); // Valider
} catch (JsonProcessingException e) {
    throw new BadRequestException("Invalid targetClients JSON");
}
```

---

## 📦 Scripts utilitaires

### Backup automatique quotidien

**Cron job** :
```bash
# Crontab: tous les jours à 2h
0 2 * * * curl http://localhost:3000/api/admin/export > /backups/backup-$(date +\%Y\%m\%d).json
```

### Comparaison de backups

**Script** (`compare-backups.js`):
```javascript
const fs = require('fs');

const backup1 = JSON.parse(fs.readFileSync('backup1.json', 'utf8'));
const backup2 = JSON.parse(fs.readFileSync('backup2.json', 'utf8'));

console.log('Users:', backup1.data.users.length, '→', backup2.data.users.length);
console.log('Events:', backup1.data.events.length, '→', backup2.data.events.length);
console.log('Releases:', backup1.data.releases.length, '→', backup2.data.releases.length);
```

---

## 🎯 Checklist finale

Avant de basculer en production :

- [ ] **Export Node.js OK** (backup-prod.json créé)
- [ ] **Validation export** (script validate-export.js OK)
- [ ] **Import Spring Boot OK** (counts identiques)
- [ ] **Tests de données** (3 tests manuels OK)
- [ ] **Angular fonctionne** (UI affiche toutes les données)
- [ ] **Performance OK** (queries rapides)
- [ ] **Backup sauvegardé** (copie dans 2 endroits différents)
- [ ] **Procédure rollback prête** (voir ROLLBACK_PROCEDURE.md)

---

## 📞 Support

En cas de problème lors de la migration :
1. Consulter ROLLBACK_PROCEDURE.md
2. Vérifier logs Spring Boot (erreurs SQL)
3. Comparer schemas (Prisma vs Hibernate)
4. Valider relations (cascade, nullable)
