# 🔄 Procédure de Rollback d'Urgence

## Objectif

En cas de problème critique avec Spring Boot, **revenir à Node.js en moins de 5 minutes**.

---

## 🚨 Quand faire un rollback ?

### Situations critiques

- ❌ **Perte de données** détectée (counts différents)
- ❌ **Angular ne fonctionne plus** (erreurs API)
- ❌ **Performance dégradée** (> 2x plus lent)
- ❌ **Bug bloquant** non résolu en < 1h
- ❌ **Corruption de base de données**

### Situations NON critiques (ne pas rollback)

- ⚠️ Bug mineur (UI)
- ⚠️ Performance légèrement dégradée (< 20%)
- ⚠️ Endpoint peu utilisé cassé
- ⚠️ Logs verbeux

---

## 🎯 Procédure de rollback (5 minutes)

### Étape 1: Arrêter Spring Boot (30 secondes)

```bash
# Arrêter le process Spring Boot
pkill -f "spring-boot"

# OU via systemd
sudo systemctl stop event-planning-spring-boot

# Vérifier que le port 3000 est libéré
lsof -i :3000
```

### Étape 2: Restaurer le backup (1 minute)

```bash
# Aller dans le répertoire Node.js
cd event-planning-backend

# Copier le dernier backup
cp backups/backup-before-migration.json backup-restore.json

# Importer dans SQLite
curl -X POST http://localhost:3000/api/admin/import \
  -H "Content-Type: application/json" \
  -d @backup-restore.json
```

### Étape 3: Redémarrer Node.js (1 minute)

```bash
# Démarrer Node.js backend
npm run dev

# OU via PM2 (production)
pm2 start src/server.js --name event-planning-api

# Vérifier que le serveur répond
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Étape 4: Vérifier Angular (1 minute)

```bash
# Ouvrir Angular
open http://localhost:4200

# Vérifier que :
# ✅ Login fonctionne
# ✅ Calendrier affiche les événements
# ✅ Releases affichent les squads
# ✅ Games affichent le leaderboard
```

### Étape 5: Validation post-rollback (1 minute)

```bash
# Vérifier counts
curl http://localhost:3000/api/admin/stats

# Vérifier quelques endpoints
curl http://localhost:3000/api/events | jq 'length'
curl http://localhost:3000/api/releases | jq 'length'

# Tester auth
curl http://localhost:3000/api/auth/login \
  -d '{"email":"admin","password":"NMB"}' \
  -H "Content-Type: application/json"
```

### Étape 6: Communication (30 secondes)

```bash
# Envoyer notification
echo "⚠️ Rollback effectué vers Node.js. Spring Boot désactivé." | slack-notify

# Logger l'incident
echo "$(date): Rollback to Node.js - Reason: $REASON" >> rollback.log
```

---

## 📊 Checklist de rollback

- [ ] **Spring Boot arrêté** (port 3000 libéré)
- [ ] **Backup restauré** (import OK)
- [ ] **Node.js démarré** (health check OK)
- [ ] **Angular fonctionne** (UI OK)
- [ ] **Counts validés** (stats identiques au backup)
- [ ] **Auth fonctionne** (login OK)
- [ ] **Notification envoyée** (équipe informée)
- [ ] **Log incident** (rollback.log màj)

---

## 🛡️ Prévention des pertes de données

### Backups automatiques

**Avant migration** :
```bash
# Backup complet
curl http://localhost:3000/api/admin/export > backups/backup-before-migration-$(date +%Y%m%d-%H%M%S).json

# Copier dans 2 endroits
cp backups/backup-before-migration-*.json /mnt/backup/
cp backups/backup-before-migration-*.json ~/Desktop/BACKUP-CRITICAL/
```

**Pendant migration** :
```bash
# Backup après chaque étape
curl http://localhost:3001/api/admin/export > backups/backup-after-step-X.json
```

### Validation continue

**Script de monitoring** (`monitor-migration.sh`):
```bash
#!/bin/bash

while true; do
  # Comparer counts Node vs Spring
  NODE_EVENTS=$(curl -s http://localhost:3000/api/admin/stats | jq '.stats.totalEvents')
  SPRING_EVENTS=$(curl -s http://localhost:3001/api/admin/stats | jq '.stats.totalEvents')

  if [ "$NODE_EVENTS" != "$SPRING_EVENTS" ]; then
    echo "⚠️ DATA MISMATCH DETECTED!"
    echo "Node: $NODE_EVENTS events"
    echo "Spring: $SPRING_EVENTS events"
    echo "ROLLBACK RECOMMENDED"
    exit 1
  fi

  echo "✅ Data in sync: $SPRING_EVENTS events"
  sleep 60
done
```

---

## 🔍 Diagnostic avant rollback

### Vérifier si rollback nécessaire

**Checklist** :
```bash
# 1. Comparer counts
diff <(curl -s http://localhost:3000/api/admin/stats) \
     <(curl -s http://localhost:3001/api/admin/stats)

# 2. Tester endpoints critiques
for endpoint in events releases games/typing-fr/leaderboard; do
  echo "Testing $endpoint..."
  curl -s http://localhost:3001/api/$endpoint > /dev/null && echo "✅ OK" || echo "❌ FAIL"
done

# 3. Tester Angular
curl -s http://localhost:4200 > /dev/null && echo "✅ Angular OK" || echo "❌ Angular FAIL"

# 4. Vérifier performance
time curl -s http://localhost:3001/api/events > /dev/null
# Si > 1s, problème de performance
```

### Décision

- **≥ 2 tests FAIL** → ROLLBACK IMMÉDIAT
- **1 test FAIL + critique** → ROLLBACK
- **1 test FAIL + non critique** → Tenter fix (1h max)
- **Tous tests OK** → Pas de rollback

---

## 📝 Template de rapport de rollback

```markdown
# Rapport de Rollback

**Date** : 2024-12-08 14:30:00
**Durée totale** : 5 minutes
**Décision par** : [Nom]

## Raison du rollback

[Décrire la raison principale : perte de données, bug critique, performance, etc.]

## Tests ayant échoué

- [ ] Events count (Node: 120, Spring: 118)
- [ ] Login endpoint (500 Internal Error)
- [ ] Performance (3s vs 50ms Node)

## Actions effectuées

1. Arrêt Spring Boot : 14:30:00
2. Restaur backup : 14:31:00
3. Démarrage Node : 14:32:00
4. Validation : 14:33:00
5. Notification : 14:34:00

## Données perdues

[Aucune / Décrire si pertes]

## Plan d'action

- [ ] Analyser logs Spring Boot
- [ ] Corriger bug identifié
- [ ] Retester en environnement de dev
- [ ] Planifier nouvelle tentative migration

## Leçons apprises

[Ce qui n'a pas marché, comment l'éviter la prochaine fois]
```

---

## 🔧 Rollback partiel (migration progressive)

### Option : Basculer seulement certains endpoints

**Nginx config** :
```nginx
location /api/events {
    proxy_pass http://localhost:3000; # Node.js
}

location /api/releases {
    proxy_pass http://localhost:3001; # Spring Boot (test)
}
```

**Avantages** :
- Tester Spring Boot en production sans tout risquer
- Rollback instantané (changer config Nginx)
- Validation progressive

---

## 🎯 Checklist avant migration (prévention)

Pour éviter d'avoir à rollback :

### Tests pré-migration

- [ ] **Tous les tests unitaires passent** (≥ 90% coverage)
- [ ] **Tous les tests d'intégration passent**
- [ ] **Tous les tests E2E passent** (43 endpoints)
- [ ] **Tests de compatibilité OK** (Node vs Spring)
- [ ] **Tests de performance OK** (≥ 95% Node)
- [ ] **Tests de charge OK** (100 users simultanés)
- [ ] **Angular fonctionne en dev** (vs Spring Boot)

### Backups pré-migration

- [ ] **Backup complet créé** (backup-before-migration.json)
- [ ] **Backup copié dans 2+ endroits** (local + remote)
- [ ] **Backup validé** (import test OK)
- [ ] **Procédure rollback testée** (dry-run)

### Documentation pré-migration

- [ ] **ROLLBACK_PROCEDURE.md à jour**
- [ ] **Équipe formée** (qui fait quoi en cas de problème)
- [ ] **Monitoring configuré** (alertes sur erreurs)
- [ ] **Contact d'urgence défini** (qui appeler)

---

## 📞 Contacts d'urgence

### Qui contacter en cas de problème

- **Décision de rollback** : Chef de projet
- **Exécution technique** : DevOps / Administrateur système
- **Validation fonctionnelle** : Product Owner
- **Communication** : Responsable DSI

### Escalade

1. **0-5 min** : Tentative de fix rapide
2. **5-15 min** : Décision rollback ou continue
3. **15-30 min** : Rollback si non résolu
4. **30+ min** : Post-mortem et plan d'action

---

## 🚀 Après le rollback

### Analyse de la cause

```bash
# Récupérer logs Spring Boot
docker logs event-planning-spring-boot > logs/spring-boot-failure.log

# Analyser erreurs
grep ERROR logs/spring-boot-failure.log
grep Exception logs/spring-boot-failure.log

# Analyser performance
grep "took" logs/spring-boot-failure.log | sort -n
```

### Tests post-mortem

```bash
# Reproduire bug en environnement de test
cd event-planning-spring-boot-test
mvn spring-boot:run

# Tester scénario qui a échoué
curl -X POST http://localhost:3002/api/events -d @test-payload.json
```

### Correction et nouvelle tentative

- [ ] Bug identifié et corrigé
- [ ] Tests ajoutés pour prévenir régression
- [ ] Validation en environnement de test
- [ ] Nouvelle migration planifiée
- [ ] Procédure rollback mise à jour

---

## 🎯 Objectif final

**Temps de rollback cible** : < 5 minutes
**Perte de données acceptable** : 0 (zéro)
**Disponibilité pendant rollback** : 99% (< 5 min downtime)

---

## ✅ Validation de la procédure

**Tester rollback AVANT migration** :
```bash
# Dry-run complet
1. Backup actuel
2. Arrêter Node.js
3. Démarrer Spring Boot (vide)
4. Simuler problème
5. Rollback vers Node.js
6. Valider fonctionnement
7. Mesurer durée (target < 5 min)
```

---

## 📝 Notes importantes

- ⚠️ **Ne jamais supprimer backups** jusqu'à validation complète (1 semaine post-migration)
- ⚠️ **Garder Node.js installé** pendant 1 mois après migration
- ⚠️ **Surveiller performance** pendant 48h post-migration
- ⚠️ **Prévoir rollback possible** jusqu'à validation finale
