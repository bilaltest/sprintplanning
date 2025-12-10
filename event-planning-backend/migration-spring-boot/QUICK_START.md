# 🚀 Quick Start - Migration Spring Boot

## Pour démarrer la migration MAINTENANT

### 1️⃣ Prérequis (5 min)

```bash
# Vérifier Java
java -version  # Doit être ≥ 17

# Vérifier Maven
mvn -version   # Doit être ≥ 3.8

# Backup actuel
curl http://localhost:3000/api/admin/export > backups/backup-$(date +%Y%m%d).json
```

### 2️⃣ Créer le projet (10 min)

```bash
# Aller sur https://start.spring.io/
# OU utiliser CLI :
spring init \
  --dependencies=web,data-jpa,h2,postgresql,lombok,validation,actuator \
  --group=com.catsbanque \
  --artifact=event-planning-api \
  --name="Ma Banque Tools API" \
  --package-name=com.catsbanque.eventplanning \
  event-planning-spring-boot

cd event-planning-spring-boot
```

### 3️⃣ Suivre le plan (5h30)

#### Epic 1: Infrastructure (30 min)
```bash
# Ouvrir MIGRATION_PLAN.md
# Suivre tickets INFRA-1 à INFRA-6
```

#### Epic 2: Data Layer (1h)
```bash
# Suivre tickets DATA-1 à DATA-11
# Créer 11 entités JPA
```

#### Epic 3: Security (30 min)
```bash
# Suivre tickets AUTH-1 à AUTH-5
# Implémenter authentification
```

#### Epic 4-8: Services, Controllers, Tests, Features (3h30)
```bash
# Suivre plan détaillé dans MIGRATION_PLAN.md
```

### 4️⃣ Validation (1h)

```bash
# Ouvrir VALIDATION_CHECKLIST.md
# Cocher tous les items (152 au total)

# Tests critiques
mvn test                    # Tests unitaires
mvn verify                  # Tests intégration
npm run test:compatibility  # Compatibilité Node vs Spring
```

### 5️⃣ Migration des données (15 min)

```bash
# Suivre DATA_MIGRATION_GUIDE.md
curl http://localhost:3000/api/admin/export > backup.json
curl -X POST http://localhost:3001/api/admin/import -d @backup.json
```

### 6️⃣ Go Live (5 min)

```bash
# Arrêter Node.js
pm2 stop event-planning-api

# Démarrer Spring Boot
pm2 start spring-boot-app.jar --name event-planning-api-spring

# Valider
curl http://localhost:3000/api/health
```

---

## 📚 Documents clés

| Document | Usage | Durée lecture |
|----------|-------|---------------|
| **README.md** | Vue d'ensemble | 5 min |
| **MIGRATION_PLAN.md** | Plan détaillé (59 tickets) | 30 min |
| **API_COMPATIBILITY_MATRIX.md** | Compatibilité 43 endpoints | 20 min |
| **TESTING_STRATEGY.md** | Stratégie de test | 15 min |
| **DATA_MIGRATION_GUIDE.md** | Migration données | 10 min |
| **ROLLBACK_PROCEDURE.md** | Procédure rollback | 10 min |
| **VALIDATION_CHECKLIST.md** | Checklist finale (152 items) | 20 min |

---

## 🎯 Ordre de lecture recommandé

### Phase Préparation (1h)
1. README.md (vue d'ensemble)
2. MIGRATION_PLAN.md (plan détaillé)
3. TESTING_STRATEGY.md (comment tester)

### Phase Implémentation (5h30)
4. MIGRATION_PLAN.md (Epic par Epic)
5. API_COMPATIBILITY_MATRIX.md (référence constante)

### Phase Validation (1h)
6. VALIDATION_CHECKLIST.md (checker tous les items)
7. DATA_MIGRATION_GUIDE.md (migrer données)

### Phase Sécurité (30 min)
8. ROLLBACK_PROCEDURE.md (tester rollback)

---

## ⚡ Raccourcis

### Tests rapides
```bash
# Test complet (3 min)
mvn clean verify

# Test compatibilité (5 min)
npm run test:compatibility

# Test charge (2 min)
mvn gatling:test -Dgatling.simulationClass=EventLoadTest
```

### Validation rapide
```bash
# Vérifier que tout fonctionne
./scripts/quick-validation.sh

# Expected output:
# ✅ Health check OK
# ✅ 43 endpoints OK
# ✅ Angular OK
# ✅ Performance OK
```

### Rollback rapide (< 5 min)
```bash
./scripts/rollback.sh
```

---

## 🆘 En cas de problème

| Problème | Solution | Doc |
|----------|----------|-----|
| Endpoint cassé | Consulter API_COMPATIBILITY_MATRIX.md | [Lien](#) |
| Test échoue | Consulter TESTING_STRATEGY.md | [Lien](#) |
| Perte de données | ROLLBACK immédiat | ROLLBACK_PROCEDURE.md |
| Performance dégradée | Profiler + Optimiser | MIGRATION_PLAN.md |
| Bug bloquant | Rollback + Analyse | ROLLBACK_PROCEDURE.md |

---

## 📞 Contacts

- **Questions techniques** : Consulter MIGRATION_PLAN.md
- **Problème bloquant** : Exécuter ROLLBACK_PROCEDURE.md
- **Validation** : Suivre VALIDATION_CHECKLIST.md

---

## 🎓 Tips

### Éviter les pièges courants

1. **Ne pas oublier les index** : Vérifier que tous les `@@index` Prisma sont convertis en `@Index` JPA
2. **Cascade correctement** : onDelete Cascade → CascadeType.ALL + orphanRemoval
3. **JSON en String** : targetClients, targetOS, targetVersions restent en String (comme Prisma)
4. **Bcrypt coût 10** : BCryptPasswordEncoder(10) pour compatibilité Node.js
5. **Token format** : `token_<userId>_<timestamp>` exactement

### Optimisations

1. **Lazy loading** : @ManyToOne(fetch = FetchType.LAZY) par défaut
2. **Query optimization** : @Query avec JOIN FETCH pour éviter N+1
3. **Connection pool** : HikariCP avec max-pool-size=10
4. **Cache** : Hibernate 2nd level cache pour leaderboards

---

## ✅ Checklist ultra-rapide

Avant de dire "c'est fini" :

- [ ] 43 endpoints fonctionnent
- [ ] Tests ≥ 90% coverage
- [ ] Angular fonctionne sans changement
- [ ] Performance ≥ 95% Node.js
- [ ] Migration données OK (0 perte)
- [ ] Rollback testé (< 5 min)
- [ ] Backup sauvegardé (2+ endroits)
- [ ] Documentation à jour

---

## 🚀 Let's go!

```bash
# Étape 1 : Lire le plan
cat MIGRATION_PLAN.md | less

# Étape 2 : Créer le projet
spring init ...

# Étape 3 : Coder (5h30)
# Suivre MIGRATION_PLAN.md Epic par Epic

# Étape 4 : Valider (1h)
./scripts/full-validation.sh

# Étape 5 : Migrer (15 min)
./scripts/migrate-data.sh

# Étape 6 : Go Live! 🎉
./scripts/go-live.sh
```

**Durée totale estimée** : ~7h (avec pauses)

Bonne migration ! 💪
