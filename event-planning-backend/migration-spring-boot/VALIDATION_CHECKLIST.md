# ✅ Checklist de Validation Finale

## Objectif

Valider que la migration Node.js → Spring Boot est **100% réussie** avant mise en production.

---

## 📋 Checklist Globale

### 1. Infrastructure ✅

- [ ] Projet Spring Boot démarre sans erreur
- [ ] Port 3000 accessible
- [ ] Base H2 (dev) ou PostgreSQL (prod) connectée
- [ ] Actuator health endpoint répond
- [ ] CORS configuré (origin: http://localhost:4200)
- [ ] Logs formatés correctement
- [ ] Configuration dev/prod séparée

**Commandes de validation** :
```bash
mvn spring-boot:run
curl http://localhost:3000/api/health
curl http://localhost:3000/api/actuator/health
```

---

### 2. Data Layer (Entités JPA) ✅

- [ ] 11 entités créées (User, Event, Release, Squad, Feature, Action, FeatureFlipping, Settings, History, ReleaseHistory, Game, GameScore)
- [ ] Annotations JPA correctes (@Entity, @Table, @Column)
- [ ] Relations @OneToMany / @ManyToOne configurées
- [ ] Cascade DELETE / SET NULL identiques à Prisma
- [ ] Indexes créés sur toutes les colonnes indexées
- [ ] Champs nullable/non-nullable corrects
- [ ] Defaults corrects (status, themePreference, etc.)
- [ ] Timestamps auto-gérés (@CreationTimestamp, @UpdateTimestamp)

**Commandes de validation** :
```bash
# Générer schema.sql depuis Hibernate
mvn hibernate:export

# Comparer avec schema Prisma
diff schema.sql prisma/schema.prisma.sql
```

---

### 3. Repositories ✅

- [ ] 11 repositories créés (extends JpaRepository)
- [ ] Méthodes de recherche personnalisées (findByEmail, findByCategory, etc.)
- [ ] Queries complexes (leaderboard, searchByTitle, etc.)
- [ ] Tests unitaires de chaque repository

**Tests à exécuter** :
```bash
mvn test -Dtest=*RepositoryTest
```

---

### 4. Security & Authentication ✅

- [ ] Spring Security configuré (CSRF désactivé)
- [ ] BCrypt avec coût 10
- [ ] Endpoints /api/auth/* publics
- [ ] Token format identique (`token_<userId>_<timestamp>`)
- [ ] Validation email @ca-ts.fr
- [ ] Validation password (8+ chars, alphanum)
- [ ] Limite 200 users appliquée
- [ ] Extraction prénom/nom depuis email

**Tests à exécuter** :
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -d '{"email":"test@ca-ts.fr","password":"Password123"}' \
  -H "Content-Type: application/json"

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"test@ca-ts.fr","password":"Password123"}' \
  -H "Content-Type: application/json"

# Vérifier token format
```

---

### 5. Business Services ✅

- [ ] EventService (CRUD + archivage automatique)
- [ ] ReleaseService (CRUD + relations + archivage)
- [ ] SquadService (update, completion)
- [ ] FeatureService (CRUD)
- [ ] ActionService (CRUD + toggle)
- [ ] HistoryService (create, rollback)
- [ ] GameService (leaderboard, scores)
- [ ] AdminService (stats, export/import)
- [ ] AuthService (register, login)

**Tests à exécuter** :
```bash
mvn test -Dtest=*ServiceTest
```

---

### 6. REST Controllers (43 endpoints) ✅

#### Auth (5 endpoints)

- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me
- [ ] PUT /api/auth/preferences
- [ ] PUT /api/auth/widget-order

#### Events (7 endpoints)

- [ ] GET /api/events
- [ ] GET /api/events/:id
- [ ] POST /api/events
- [ ] PUT /api/events/:id
- [ ] DELETE /api/events/:id
- [ ] DELETE /api/events
- [ ] POST /api/events/bulk

#### Releases (13 endpoints)

- [ ] GET /api/releases
- [ ] GET /api/releases/:id
- [ ] POST /api/releases
- [ ] PUT /api/releases/:id
- [ ] DELETE /api/releases/:id
- [ ] POST /api/releases/squads/:squadId/features
- [ ] PUT /api/releases/features/:id
- [ ] DELETE /api/releases/features/:id
- [ ] POST /api/releases/squads/:squadId/actions
- [ ] PUT /api/releases/actions/:id
- [ ] DELETE /api/releases/actions/:id
- [ ] PUT /api/releases/squads/:squadId

#### Settings (2 endpoints)

- [ ] GET /api/settings
- [ ] PUT /api/settings

#### History (3 endpoints)

- [ ] GET /api/history
- [ ] POST /api/history/:id/rollback
- [ ] DELETE /api/history

#### Games (6 endpoints)

- [ ] GET /api/games
- [ ] POST /api/games/init
- [ ] GET /api/games/:slug
- [ ] GET /api/games/:slug/leaderboard
- [ ] POST /api/games/:slug/scores
- [ ] GET /api/games/:slug/my-scores

#### Admin (4 endpoints)

- [ ] GET /api/admin/users
- [ ] DELETE /api/admin/users/:id
- [ ] GET /api/admin/stats
- [ ] GET /api/admin/export
- [ ] POST /api/admin/import

#### Health (1 endpoint)

- [ ] GET /api/health

**Tests à exécuter** :
```bash
mvn test -Dtest=*ControllerTest
```

---

### 7. Compatibilité API (100%) ✅

Pour **chaque endpoint**, valider :

- [ ] **URL identique** (méthode + path)
- [ ] **Query params identiques**
- [ ] **Request body identique**
- [ ] **Response format identique**
- [ ] **Status codes identiques**
- [ ] **Error format identique** (`{"error": {"message": "...", "status": X}}`)
- [ ] **Validation rules identiques**
- [ ] **Side effects identiques** (history, archivage, cascade)

**Tests à exécuter** :
```bash
# Comparer réponses Node.js vs Spring Boot
npm run test:compatibility
```

**Référence** : `API_COMPATIBILITY_MATRIX.md`

---

### 8. Tests Unitaires ✅

- [ ] Coverage ≥ 90%
- [ ] Tous les tests passent
- [ ] Entities testées (12 tests)
- [ ] Services testés (9 tests avec mocks)
- [ ] Repositories testés (7 tests avec H2)

**Tests à exécuter** :
```bash
mvn test
mvn jacoco:report
open target/site/jacoco/index.html
```

**Seuil minimum** : 90% coverage

---

### 9. Tests d'Intégration ✅

- [ ] Service + Repository (5 tests)
- [ ] Controller + Service (MockMvc, 8 tests)
- [ ] Tous les tests passent

**Tests à exécuter** :
```bash
mvn verify -Pintegration-tests
```

---

### 10. Tests End-to-End ✅

- [ ] Auth flow complet (register → login → use token)
- [ ] Event CRUD + History
- [ ] Release avec relations (create → squads → features → actions → delete)
- [ ] Game leaderboard avec scores multiples
- [ ] Admin export/import cycle complet
- [ ] CORS avec Angular origin

**Tests à exécuter** :
```bash
mvn verify -Pe2e-tests
```

---

### 11. Migration des Données ✅

- [ ] Export Node.js OK (backup créé)
- [ ] Import Spring Boot OK (counts identiques)
- [ ] Validation counts (users, events, releases, history)
- [ ] Validation relations (cascade intact)
- [ ] Validation données spécifiques (users, releases)
- [ ] Aucune perte de données

**Commandes de validation** :
```bash
# Export Node.js
curl http://localhost:3000/api/admin/export > backup.json

# Import Spring Boot
curl -X POST http://localhost:3001/api/admin/import -d @backup.json

# Comparer counts
diff <(curl -s http://localhost:3000/api/admin/stats) \
     <(curl -s http://localhost:3001/api/admin/stats)
```

**Référence** : `DATA_MIGRATION_GUIDE.md`

---

### 12. Performance ✅

- [ ] Response time ≥ 95% de Node.js
- [ ] GET /api/events : < 100ms
- [ ] POST /api/auth/login : < 200ms
- [ ] GET /api/releases : < 150ms
- [ ] GET /api/games/:slug/leaderboard : < 100ms
- [ ] Pas de N+1 queries
- [ ] Connection pool configuré (HikariCP)

**Tests à exécuter** :
```bash
# Load test avec Gatling
mvn gatling:test

# Ou avec Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/events
```

---

### 13. Tests de Charge ✅

- [ ] 100 users simultanés : OK
- [ ] Throughput ≥ 100 req/s
- [ ] Error rate < 1%
- [ ] Response time P95 < 500ms
- [ ] Response time P99 < 1000ms

**Tests à exécuter** :
```bash
mvn gatling:test -Dgatling.simulationClass=EventLoadTest
```

---

### 14. Angular Integration ✅

- [ ] Angular démarre sans erreur
- [ ] Login fonctionne
- [ ] Calendrier affiche les événements
- [ ] Releases affichent les squads
- [ ] Games affichent le leaderboard
- [ ] Export releases fonctionne
- [ ] Aucun changement côté front requis
- [ ] CORS OK (pas d'erreurs console)

**Tests à exécuter** :
```bash
# Démarrer Angular avec Spring Boot backend
cd event-planning-app
npm start

# Ouvrir http://localhost:4200
# Tester tous les scénarios utilisateur
```

---

### 15. Logging & Monitoring ✅

- [ ] Logs formatés correctement
- [ ] Chaque requête loggée (timestamp + method + path)
- [ ] Erreurs loggées avec stacktrace
- [ ] Actuator endpoints exposés
- [ ] Métriques disponibles (/actuator/metrics)
- [ ] Health check détaillé (/actuator/health)

**Commandes de validation** :
```bash
curl http://localhost:3000/api/actuator/health
curl http://localhost:3000/api/actuator/metrics
curl http://localhost:3000/api/actuator/metrics/http.server.requests
```

---

### 16. Advanced Features ✅

- [ ] Scheduled archivage events (> 24 mois)
- [ ] Scheduled archivage releases (> 20 passées)
- [ ] Hibernate 2nd level cache (optionnel)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Docker Compose (Spring Boot + PostgreSQL)

**Tests à exécuter** :
```bash
# Tester scheduled tasks
# (attendre exécution ou trigger manuellement)

# Vérifier Swagger UI
open http://localhost:3000/swagger-ui.html
```

---

### 17. Documentation ✅

- [ ] README.md à jour
- [ ] MIGRATION_PLAN.md complet
- [ ] API_COMPATIBILITY_MATRIX.md rempli
- [ ] TESTING_STRATEGY.md à jour
- [ ] DATA_MIGRATION_GUIDE.md validé
- [ ] ROLLBACK_PROCEDURE.md testé
- [ ] Javadoc sur services/controllers

---

### 18. Security ✅

- [ ] Aucun mot de passe en clair dans logs
- [ ] Aucun secret dans code source (git)
- [ ] BCrypt pour passwords
- [ ] Token sécurisé (pas de JWT simple pour simplifier)
- [ ] CORS limité à localhost:4200
- [ ] SQL injection impossible (JPA paramétré)
- [ ] XSS impossible (Spring escaping auto)

**Tests à exécuter** :
```bash
# Tester injection SQL
curl -X POST http://localhost:3000/api/events \
  -d '{"title":"Test'; DROP TABLE event;--","date":"2024-12-15","color":"#fff","icon":"icon","category":"mep"}' \
  -H "Content-Type: application/json"

# Doit retourner 400 Bad Request (validation)
```

---

### 19. Rollback Preparedness ✅

- [ ] Backup complet créé (backup-before-migration.json)
- [ ] Backup copié dans 2+ endroits
- [ ] Procédure rollback testée (dry-run)
- [ ] Rollback < 5 minutes
- [ ] Node.js backend toujours disponible
- [ ] Documentation rollback à jour

**Tests à exécuter** :
```bash
# Dry-run rollback complet
./test-rollback.sh
```

**Référence** : `ROLLBACK_PROCEDURE.md`

---

### 20. Production Readiness ✅

- [ ] Configuration prod séparée (application-prod.properties)
- [ ] PostgreSQL configuré (pas H2)
- [ ] Variables d'environnement externalisées
- [ ] Logs en fichier (pas seulement console)
- [ ] Health check automatique (monitoring)
- [ ] Alerts configurées (erreurs, performance)
- [ ] Backup automatique quotidien
- [ ] Plan de maintenance défini

**Configuration prod à valider** :
```properties
# application-prod.properties
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=validate # PAS update!
spring.h2.console.enabled=false
logging.level.org.hibernate.SQL=WARN
```

---

## 📊 Récapitulatif

| Catégorie | Items | Complétés | % |
|-----------|-------|-----------|---|
| Infrastructure | 7 | 0 | 0% |
| Data Layer | 8 | 0 | 0% |
| Repositories | 4 | 0 | 0% |
| Security | 8 | 0 | 0% |
| Services | 9 | 0 | 0% |
| Controllers | 43 | 0 | 0% |
| Compatibilité API | 43 | 0 | 0% |
| Tests Unitaires | 4 | 0 | 0% |
| Tests Intégration | 2 | 0 | 0% |
| Tests E2E | 6 | 0 | 0% |
| Migration Données | 6 | 0 | 0% |
| Performance | 6 | 0 | 0% |
| Tests Charge | 5 | 0 | 0% |
| Angular | 8 | 0 | 0% |
| Logging | 6 | 0 | 0% |
| Advanced Features | 5 | 0 | 0% |
| Documentation | 7 | 0 | 0% |
| Security | 7 | 0 | 0% |
| Rollback | 6 | 0 | 0% |
| Production | 8 | 0 | 0% |

**Total** : 152 items

---

## 🎯 Critères de Go/No-Go Production

### ✅ GO (autorisation mise en prod)

**Tous ces critères DOIVENT être validés** :

- ✅ **100% des 43 endpoints fonctionnent**
- ✅ **Tests ≥ 90% coverage**
- ✅ **Migration données sans perte**
- ✅ **Angular fonctionne sans changement**
- ✅ **Performance ≥ 95% de Node.js**
- ✅ **Tests de charge OK (100 users)**
- ✅ **Rollback testé < 5 min**
- ✅ **Backup sauvegardé (2+ endroits)**

### ❌ NO-GO (blocage mise en prod)

**Un seul de ces critères suffit à bloquer** :

- ❌ Perte de données détectée
- ❌ Endpoint critique cassé
- ❌ Angular ne fonctionne plus
- ❌ Performance < 80% de Node.js
- ❌ Tests coverage < 80%
- ❌ Rollback non testé
- ❌ Backup manquant ou corrompu

---

## 📝 Sign-off Final

### Validations requises

- [ ] **Développeur** : Tous les tests passent
- [ ] **Tech Lead** : Code review OK
- [ ] **QA** : Tests manuels OK
- [ ] **Product Owner** : Fonctionnalités validées
- [ ] **DevOps** : Infrastructure prête
- [ ] **DSI** : Autorisation de déploiement

### Signatures

```
Développeur : ___________________ Date : ___________
Tech Lead   : ___________________ Date : ___________
QA          : ___________________ Date : ___________
Product Owner: __________________ Date : ___________
DevOps      : ___________________ Date : ___________
DSI         : ___________________ Date : ___________
```

---

## 🚀 Après validation

### Mise en production

```bash
# 1. Backup final
curl http://localhost:3000/api/admin/export > backup-prod-final.json

# 2. Arrêter Node.js
pm2 stop event-planning-api

# 3. Démarrer Spring Boot
pm2 start spring-boot-app.jar --name event-planning-api-spring

# 4. Valider
curl http://localhost:3000/api/health

# 5. Tester Angular
open https://ma-banque-tools.prod.ca-ts.fr
```

### Monitoring post-prod

- [ ] Surveiller logs (1ère heure)
- [ ] Vérifier métriques (1er jour)
- [ ] Comparer performance (1ère semaine)
- [ ] Garder Node.js disponible (1 mois)

---

## 📞 Contact

En cas de problème lors de la validation :
- Consulter `MIGRATION_PLAN.md` pour détails techniques
- Consulter `ROLLBACK_PROCEDURE.md` en cas de blocage
- Contacter Tech Lead / DevOps

---

**Date de création** : 2024-12-08
**Dernière mise à jour** : 2024-12-08
**Version** : 1.0
