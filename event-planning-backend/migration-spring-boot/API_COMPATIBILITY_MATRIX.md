# 🔗 Matrice de Compatibilité API

## Objectif

Ce document garantit que **chaque endpoint Spring Boot est 100% compatible** avec l'API Node.js actuelle.

**Règle d'or** : Angular ne doit **RIEN changer**. Même URL, même payload, même format de réponse.

---

## 📋 Méthodologie de validation

Pour chaque endpoint :
1. ✅ **URL identique** (méthode HTTP + path)
2. ✅ **Request payload identique** (mêmes champs, mêmes types)
3. ✅ **Response format identique** (structure JSON identique)
4. ✅ **Status codes identiques** (200, 201, 404, 500, etc.)
5. ✅ **Error format identique** (`{"error": {"message": "...", "status": 400}}`)

---

## 1️⃣ Auth Endpoints (5 endpoints) - ✅ 3/5 implémentés (60%)

### POST /api/auth/register ✅

**Node.js** (`auth.routes.js:10`):
```javascript
POST /api/auth/register
Body: { email: string, password: string }
Response 201: { message: string, user: UserDto }
Response 400: { error: string }
Response 409: { error: string } // Email exists
Response 403: { error: string } // Max users
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`AuthController.java:event-planning-spring-boot/event-planning-api/src/main/java/com/catsbanque/eventplanning/controller/AuthController.java:21`)
```java
@PostMapping("/auth/register")
ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest)
// IDENTIQUE
```

**Validation** : ✅ **VALIDÉ**
- [x] Email format validé (`prenom.nom@ca-ts.fr`)
- [x] Password ≥ 8 chars, alphanumérique
- [x] Limite 200 users appliquée
- [x] Response format identique
- [x] Status codes identiques

---

### POST /api/auth/login ✅

**Node.js** (`auth.routes.js:15`):
```javascript
POST /api/auth/login
Body: { email: string, password: string }
Response 200: { message: string, token: string, user: UserDto }
Response 401: { error: string }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`AuthController.java:59`)
```java
@PostMapping("/auth/login")
ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest)
```

**Token format** : `token_<userId>_<timestamp>` (IDENTIQUE)

**Validation** : ✅ **VALIDÉ**
- [x] Token format `token_xxx_yyy`
- [x] Bcrypt verification
- [x] Response format identique

---

### GET /api/auth/me ✅

**Node.js** (`auth.routes.js:22`):
```javascript
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response 200: { user: UserDto }
Response 401: { error: string }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`AuthController.java:89`)
```java
@GetMapping("/auth/me")
ResponseEntity<CurrentUserResponse> getCurrentUser(HttpServletRequest request)
```

**Validation** : ✅ **VALIDÉ**
- [x] Token extraction depuis header
- [x] Format `Bearer token_xxx_yyy`
- [x] Response user sans password

---

### PUT /api/auth/preferences

**Node.js** (`auth.routes.js:28`):
```javascript
PUT /api/auth/preferences
Body: { themePreference: "light" | "dark" }
Response 200: { message: string, user: UserDto }
```

**Spring Boot**:
```java
@PutMapping("/auth/preferences")
ResponseEntity<UserResponse> updatePreferences(@Valid @RequestBody PreferencesRequest)
```

**Validation** :
- [ ] Enum validation (light/dark)
- [ ] User mis à jour
- [ ] Response format identique

---

### PUT /api/auth/widget-order

**Node.js** (`auth.routes.js:34`):
```javascript
PUT /api/auth/widget-order
Body: { widgetOrder: string[] }
Response 200: { message: string, user: UserDto }
```

**Spring Boot**:
```java
@PutMapping("/auth/widget-order")
ResponseEntity<UserResponse> updateWidgetOrder(@Valid @RequestBody WidgetOrderRequest)
```

**Validation** :
- [ ] Array de strings
- [ ] Stocké en JSON string (comme Prisma)

---

## 2️⃣ Event Endpoints (7 endpoints) - ✅ 7/7 implémentés (100%)

### GET /api/events ✅

**Node.js** (`event.routes.js:24`):
```javascript
GET /api/events?category=mep&dateFrom=2024-12-01&dateTo=2024-12-31&search=release
Response 200: Event[]
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`EventController.java:50`)
```java
@GetMapping("/events")
ResponseEntity<List<EventDto>> getAllEvents(
    @RequestParam(required = false) String category,
    @RequestParam(required = false) String dateFrom,
    @RequestParam(required = false) String dateTo,
    @RequestParam(required = false) String search
)
```

**Validation** : ✅ **VALIDÉ**
- [x] Query params optionnels
- [x] Filtrage par category
- [x] Filtrage par date range
- [x] Recherche texte (title + description)
- [x] Tri par date ASC

---

### GET /api/events/stats ✅

**Node.js** (`event.routes.js:25`):
```javascript
GET /api/events/stats
Response 200: { upcoming: number, recent: Event[] }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`EventController.java:81`)
```java
@GetMapping("/events/stats")
ResponseEntity<EventStatsDto> getEventStats()
```

**Validation** : ✅ **VALIDÉ**
- [x] upcoming count
- [x] recent events (3 derniers)

---

### GET /api/events/:id ✅

**Node.js** (`event.routes.js:26`):
```javascript
GET /api/events/clr123abc
Response 200: Event
Response 404: { error: { message: "Event not found", status: 404 }}
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`EventController.java:98`)
```java
@GetMapping("/events/{id}")
ResponseEntity<EventDto> getEventById(@PathVariable String id)
```

**Validation** : ✅ **VALIDÉ**
- [x] 404 si inexistant
- [x] Format erreur identique

---

### POST /api/events ✅

**Node.js** (`event.routes.js:27`):
```javascript
POST /api/events
Body: { title, date, color, icon, category, startTime?, endTime?, description? }
Response 201: Event
Response 400: { errors: ValidationError[] }
```

**Validation rules** (`event.routes.js:16-22`):
- title: max 30 chars
- date: format YYYY-MM-DD
- category, color, icon: required

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`EventController.java:112`)
```java
@PostMapping("/events")
ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto)
```

**Validation** : ✅ **VALIDÉ**
- [x] Validation rules identiques
- [x] Response 201 avec event créé

---

### PUT /api/events/:id ✅

**Node.js** (`event.routes.js:28`):
```javascript
PUT /api/events/clr123
Body: { title, date, color, icon, category, ... }
Response 200: Event
Response 404: { error: ... }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`EventController.java:125`)
```java
@PutMapping("/events/{id}")
ResponseEntity<EventDto> updateEvent(@PathVariable String id, @Valid @RequestBody EventDto eventDto)
```

**Validation** : ✅ **VALIDÉ**
- [x] Validation identique à POST
- [x] 404 si inexistant

---

### DELETE /api/events/:id ✅

**Node.js** (`event.routes.js:29`):
```javascript
DELETE /api/events/clr123
Response 204: (no content)
Response 404: { error: ... }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`EventController.java:141`)
```java
@DeleteMapping("/events/{id}")
ResponseEntity<Void> deleteEvent(@PathVariable String id)
```

**Validation** : ✅ **VALIDÉ**
- [x] Status 204 (no content)
- [x] 404 si inexistant

---

## 3️⃣ Release Endpoints (13 endpoints) - ✅ 7/13 implémentés (54%)

### GET /api/releases ✅

**Node.js** (`release.routes.js:20`):
```javascript
GET /api/releases
Response 200: Release[] (with squads, features, actions, flipping)
// Includes:
// - Toutes les releases à venir
// - Les 20 dernières releases passées
```

**Logique spécifique** (`release.controller.js:75-147`):
- Include squads → features + actions → flipping
- Squads triés par squadNumber ASC
- Actions triées par order ASC

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:52`)
```java
@GetMapping("/releases")
ResponseEntity<List<ReleaseDto>> getReleases()
```

**Validation** : ✅ **VALIDÉ**
- [x] Releases avec squads complets
- [x] Relations chargées (EAGER)
- [x] Tri correct (squads by number)

---

### GET /api/releases/stats ✅

**Node.js** (`release.routes.js:21`):
```javascript
GET /api/releases/stats
Response 200: { upcoming: number, recent: Release[] }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:64`)
```java
@GetMapping("/releases/stats")
ResponseEntity<ReleaseStatsDto> getReleaseStats()
```

**Validation** : ✅ **VALIDÉ**
- [x] upcoming count
- [x] recent releases (3 derniers)

---

### GET /api/releases/:id ✅

**Node.js** (`release.routes.js:22`):
```javascript
GET /api/releases/clr123
Response 200: Release (full with relations)
Response 404: { error: "Release not found" }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:79`)
```java
@GetMapping("/releases/{id}")
ResponseEntity<ReleaseDto> getReleaseById(@PathVariable String id)
```

**Validation** : ✅ **VALIDÉ**
- [x] Relations complètes chargées
- [x] 404 si inexistant

---

### POST /api/releases ✅

**Node.js** (`release.routes.js:23`):
```javascript
POST /api/releases
Body: { name, version, releaseDate, type?, description? }
Response 201: Release (with 6 squads auto-created)
```

**Logique spécifique** (`release.controller.js:220-275`):
- Créer 6 squads automatiquement (squadNumber 1-6)
- Status = "draft" par défaut

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:92`)
```java
@PostMapping("/releases")
ResponseEntity<ReleaseDto> createRelease(@Valid @RequestBody ReleaseDto releaseDto)
```

**Validation** : ✅ **VALIDÉ**
- [x] 6 squads créées automatiquement
- [x] Defaults (status=draft)
- [x] Response 201

---

### PUT /api/releases/:id ✅

**Node.js** (`release.routes.js:24`):
```javascript
PUT /api/releases/clr123
Body: { name?, version?, releaseDate?, type?, description?, status? }
Response 200: Release
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:112`)
```java
@PutMapping("/releases/{id}")
ResponseEntity<ReleaseDto> updateRelease(@PathVariable String id, @Valid @RequestBody ReleaseDto releaseDto)
```

**Validation** : ✅ **VALIDÉ**
- [x] Update partial (champs optionnels)
- [x] Relations chargées dans response

---

### DELETE /api/releases/:id ✅

**Node.js** (`release.routes.js:25`):
```javascript
DELETE /api/releases/clr123
Response 204
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:131`)
```java
@DeleteMapping("/releases/{id}")
ResponseEntity<Void> deleteRelease(@PathVariable String id)
```

**Validation** : ✅ **VALIDÉ**
- [x] Cascade delete (squads, features, actions, flipping)
- [x] Status 204

---

### PATCH /api/releases/:releaseId/actions/:actionId/toggle ✅

**Node.js** (`release.routes.js:35`):
```javascript
PATCH /api/releases/:releaseId/actions/:actionId/toggle
Response 200: Release (updated)
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`ReleaseController.java:145`)
```java
@PatchMapping("/releases/{releaseId}/actions/{actionId}/toggle")
ResponseEntity<ReleaseDto> toggleAction(@PathVariable String releaseId, @PathVariable String actionId)
```

**Validation** : ✅ **VALIDÉ**
- [x] Toggle action completed
- [x] Return release complet

---

### POST /api/releases/squads/:squadId/features

**Node.js** (`release.routes.js:27`):
```javascript
POST /api/releases/squads/clr123/features
Body: { title, description? }
Response 201: Feature
```

**Spring Boot**:
```java
@PostMapping("/releases/squads/{squadId}/features")
ResponseEntity<FeatureDto> addFeature(@PathVariable String squadId, @Valid @RequestBody CreateFeatureRequest)
```

**Validation** :
- [ ] Feature liée au squad
- [ ] Response 201

---

### PUT /api/releases/features/:id

**Node.js** (`release.routes.js:28`):
```javascript
PUT /api/releases/features/clr123
Body: { title, description? }
Response 200: Feature
```

**Validation** :
- [ ] Update feature
- [ ] 404 si inexistant

---

### DELETE /api/releases/features/:id

**Node.js** (`release.routes.js:29`):
```javascript
DELETE /api/releases/features/clr123
Response 204
```

**Validation** :
- [ ] Cascade OK (pas de relations)
- [ ] Status 204

---

### POST /api/releases/squads/:squadId/actions

**Node.js** (`release.routes.js:32`):
```javascript
POST /api/releases/squads/clr123/actions
Body: {
  phase: "pre_mep" | "post_mep",
  type: "feature_flipping" | "memory_flipping" | "other" | ...,
  title: string,
  description?: string,
  order?: number,
  flipping?: {
    flippingType: string,
    ruleName: string,
    theme?: string,
    ruleAction: string,
    ruleState?: string,
    targetClients: string[],
    targetCaisses?: string,
    targetOS: string[],
    targetVersions: object[]
  }
}
Response 201: Action (with flipping if applicable)
```

**Logique spécifique** (`release.controller.js:459-502`):
- Si type = feature_flipping OU memory_flipping, créer FeatureFlipping
- targetClients, targetOS, targetVersions stockés en JSON string
- order = 0 par défaut
- status = "pending" par défaut

**Spring Boot**:
```java
@PostMapping("/releases/squads/{squadId}/actions")
ResponseEntity<ActionDto> addAction(@PathVariable String squadId, @Valid @RequestBody CreateActionRequest) {
    Action action = new Action();
    // ... set fields
    action.setOrder(request.getOrder() != null ? request.getOrder() : 0);
    action.setStatus("pending");

    // Create flipping if applicable
    if (("feature_flipping".equals(request.getType()) || "memory_flipping".equals(request.getType()))
        && request.getFlipping() != null) {

        FeatureFlipping flipping = new FeatureFlipping();
        flipping.setActionId(action.getId());
        // ... set flipping fields
        // JSON serialization
        flipping.setTargetClients(objectMapper.writeValueAsString(request.getFlipping().getTargetClients()));
        flipping.setTargetOS(objectMapper.writeValueAsString(request.getFlipping().getTargetOS()));
        flipping.setTargetVersions(objectMapper.writeValueAsString(request.getFlipping().getTargetVersions()));

        action.setFlipping(flipping);
    }

    Action saved = actionRepository.save(action);
    // ...
}
```

**Validation** :
- [ ] Flipping créé si type FF/MF
- [ ] JSON serialization correcte
- [ ] Defaults (order=0, status=pending)
- [ ] Response 201 avec flipping

---

### PUT /api/releases/actions/:id

**Node.js** (`release.routes.js:33`):
```javascript
PUT /api/releases/actions/clr123
Body: { phase?, type?, title?, description?, status?, order?, flipping? }
Response 200: Action (with flipping)
```

**Logique spécifique** (`release.controller.js:506-576`):
- Update action
- Update flipping existant OU créer si inexistant

**Spring Boot**:
```java
@PutMapping("/releases/actions/{id}")
ResponseEntity<ActionDto> updateAction(@PathVariable String id, @Valid @RequestBody UpdateActionRequest) {
    Action action = actionRepository.findById(id).orElseThrow();
    // ... update action fields

    // Update or create flipping
    if (("feature_flipping".equals(action.getType()) || "memory_flipping".equals(action.getType()))
        && request.getFlipping() != null) {

        if (action.getFlipping() != null) {
            // Update existing
            FeatureFlipping flipping = action.getFlipping();
            // ... update fields
            featureFlippingRepository.save(flipping);
        } else {
            // Create new
            FeatureFlipping flipping = new FeatureFlipping();
            flipping.setActionId(id);
            // ... set fields
            action.setFlipping(flipping);
        }
    }

    Action saved = actionRepository.save(action);
    // ...
}
```

**Validation** :
- [ ] Update action
- [ ] Update ou create flipping
- [ ] JSON serialization
- [ ] Response avec flipping

---

### DELETE /api/releases/actions/:id

**Node.js** (`release.routes.js:34`):
```javascript
DELETE /api/releases/actions/clr123
Response 204
```

**Validation** :
- [ ] Cascade delete flipping (onDelete Cascade)
- [ ] Status 204

---

### PUT /api/releases/squads/:squadId

**Node.js** (`release.routes.js:37`):
```javascript
PUT /api/releases/squads/clr123
Body: {
  tontonMep?: string,
  isCompleted?: boolean,
  featuresEmptyConfirmed?: boolean,
  preMepEmptyConfirmed?: boolean,
  postMepEmptyConfirmed?: boolean
}
Response 200: Squad
```

**Spring Boot**:
```java
@PutMapping("/releases/squads/{squadId}")
ResponseEntity<SquadDto> updateSquad(@PathVariable String squadId, @Valid @RequestBody UpdateSquadRequest)
```

**Validation** :
- [ ] Update partial (champs optionnels)
- [ ] Response 200

---

## 4️⃣ Settings Endpoints (2 endpoints) - ✅ 2/2 implémentés (100%)

### GET /api/settings ✅

**Node.js** (`settings.routes.js:6`):
```javascript
GET /api/settings
Response 200: Settings (or create default if not exists)
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`SettingsController.java:26`)
```java
@GetMapping("/settings")
ResponseEntity<SettingsDto> getSettings()
```

**Validation** : ✅ **VALIDÉ**
- [x] Retourne settings existant
- [x] Créer avec defaults si inexistant

---

### PUT /api/settings ✅

**Node.js** (`settings.routes.js:7`):
```javascript
PUT /api/settings
Body: { theme?, customCategories? }
Response 200: Settings
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`SettingsController.java:39`)
```java
@PutMapping("/settings")
ResponseEntity<SettingsDto> updateSettings(@RequestBody SettingsDto settingsDto)
```

**Validation** : ✅ **VALIDÉ**
- [x] Update ou create
- [x] customCategories stocké en JSON string

---

## 5️⃣ History Endpoints (3 endpoints)

### GET /api/history

**Node.js** (`history.routes.js:6`):
```javascript
GET /api/history?limit=50&offset=0
Response 200: History[]
```

**Spring Boot**:
```java
@GetMapping("/history")
ResponseEntity<List<HistoryDto>> getHistory(
    @RequestParam(defaultValue = "50") int limit,
    @RequestParam(defaultValue = "0") int offset
)
```

**Validation** :
- [ ] Pagination (limit/offset)
- [ ] Tri DESC par timestamp

---

### POST /api/history/:id/rollback

**Node.js** (`history.routes.js:7`):
```javascript
POST /api/history/clr123/rollback
Response 200: Event (restored)
```

**Validation** :
- [ ] Rollback depuis previousData
- [ ] Response = event restauré

---

### DELETE /api/history

**Node.js** (`history.routes.js:8`):
```javascript
DELETE /api/history
Response 204
```

**Validation** :
- [ ] Clear all history
- [ ] Status 204

---

## 6️⃣ Game Endpoints (6 endpoints) - ✅ 6/6 implémentés (100%)

### GET /api/games ✅

**Node.js** (`game.routes.js:14`):
```javascript
GET /api/games
Response 200: Game[] (isActive = true)
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`GameController.java:36`)
```java
@GetMapping("/games")
ResponseEntity<List<Game>> getAllGames()
```

**Validation** : ✅ **VALIDÉ**
- [x] Filtrer isActive = true
- [x] Tri par createdAt ASC

---

### POST /api/games/init ✅

**Node.js** (`game.routes.js:17`):
```javascript
POST /api/games/init
Response 200: Game[] (5 games created/updated)
```

**Logique** (`game.controller.js:233-281`):
- Upsert 5 games : typing-fr, typing-en, memory-game, math-rush, flappy-dsi

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`GameController.java:46`)
```java
@PostMapping("/games/init")
ResponseEntity<List<Game>> initGames()
```

**Validation** : ✅ **VALIDÉ**
- [x] Upsert (update if exists, create if not)
- [x] 5 games corrects

---

### GET /api/games/:slug ✅

**Node.js** (`game.routes.js:20`):
```javascript
GET /api/games/typing-fr
Response 200: Game
Response 404: { error: ... }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`GameController.java:57`)
```java
@GetMapping("/games/{slug}")
ResponseEntity<Game> getGameBySlug(@PathVariable String slug)
```

**Validation** : ✅ **VALIDÉ**
- [x] Recherche par slug
- [x] 404 si inexistant

---

### GET /api/games/:slug/leaderboard ✅

**Node.js** (`game.routes.js:23`):
```javascript
GET /api/games/typing-fr/leaderboard
Response 200: Leaderboard[] (top 10)
```

**Logique complexe** (`game.controller.js:52-98`):
- Query SQL avec subquery (meilleur score par user)
- LEFT JOIN app_user (FIXED)
- Format: rank, score, wpm, accuracy, user, visitorName
- LIMIT 10

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`GameController.java:71` + `GameService.java:67`)
```java
@GetMapping("/games/{slug}/leaderboard")
ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String slug)
// Native query with LEFT JOIN app_user
```

**Validation** : ✅ **VALIDÉ**
- [x] Query complexe correcte (SQL 1452 fixed)
- [x] TOP 10 seulement
- [x] Rank calculé (1 à 10)
- [x] LEFT JOIN app_user

---

### POST /api/games/:slug/scores ✅

**Node.js** (`game.routes.js:26`):
```javascript
POST /api/games/typing-fr/scores
Body: { score: number, wpm?: number, accuracy?: number, metadata?: object }
Response 201: GameScore (with rank, newPersonalBest)
```

**Logique** (`game.controller.js:105-183`):
- Auth requise (userId depuis token)
- Calculer rank (position dans leaderboard)
- Flag newPersonalBest

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`GameController.java:86` + `GameService.java:118`)
```java
@PostMapping("/games/{slug}/scores")
ResponseEntity<SubmitScoreResponse> submitScore(
    @PathVariable String slug,
    HttpServletRequest request,
    @Valid @RequestBody SubmitScoreRequest submitRequest
)
```

**Validation** : ✅ **VALIDÉ**
- [x] Auth requise (token extraction)
- [x] Rank calculé
- [x] newPersonalBest flag
- [x] Response 201

---

### GET /api/games/:slug/my-scores ✅

**Node.js** (`game.routes.js:29`):
```javascript
GET /api/games/typing-fr/my-scores
Response 200: { scores: GameScore[], bestScore: number, gamesPlayed: number }
```

**Spring Boot**: ✅ **IMPLÉMENTÉ** (`GameController.java:110` + `GameService.java:187`)
```java
@GetMapping("/games/{slug}/my-scores")
ResponseEntity<MyScoresResponse> getMyScores(
    @PathVariable String slug,
    HttpServletRequest request
)
```

**Validation** : ✅ **VALIDÉ**
- [x] Auth requise
- [x] 10 derniers scores
- [x] bestScore calculé
- [x] gamesPlayed = count

---

## 7️⃣ Admin Endpoints (4 endpoints)

### GET /api/admin/users

**Node.js** (`admin.routes.js`):
```javascript
GET /api/admin/users
Response 200: { users: User[] } (without passwords, with _count.histories)
```

**Validation** :
- [ ] Passwords exclus
- [ ] Count histories
- [ ] Tri DESC par createdAt

---

### DELETE /api/admin/users/:id

**Node.js** (`admin.controller.js:44-83`):
```javascript
DELETE /api/admin/users/clr123
Response 200: { message: string, deletedUser: User }
```

**Logique spécifique** :
- Update History.userDisplayName = "Deleted User" AVANT delete
- onDelete SetNull sur userId (schema.prisma:49)

**Validation** :
- [ ] History updated (userDisplayName = "Deleted User")
- [ ] User deleted
- [ ] 404 si inexistant

---

### GET /api/admin/stats

**Node.js** (`admin.controller.js:89-115`):
```javascript
GET /api/admin/stats
Response 200: {
  stats: {
    totalUsers: number,
    totalEvents: number,
    totalReleases: number,
    totalHistoryEntries: number
  }
}
```

**Validation** :
- [ ] 4 counts en parallèle
- [ ] Format exact

---

### GET /api/admin/export

**Node.js** (`admin.controller.js:121-191`):
```javascript
GET /api/admin/export
Response 200: JSON file
Headers:
  Content-Type: application/json
  Content-Disposition: attachment; filename="ma-banque-tools-backup-YYYY-MM-DD.json"
```

**Format export** :
```json
{
  "metadata": {
    "exportDate": "2024-12-08T14:30:00",
    "version": "1.0",
    "totalRecords": { ... }
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

**Validation** :
- [ ] Include toutes les relations
- [ ] Metadata correcte
- [ ] Headers download

---

### POST /api/admin/import

**Node.js** (`admin.controller.js:198-318`):
```javascript
POST /api/admin/import
Body: { metadata: {...}, data: {...} }
Response 200: { message: string, importedRecords: {...} }
```

**Logique complexe** :
- TRANSACTION atomique
- DELETE ALL dans l'ordre (contraintes FK)
- INSERT dans l'ordre (users → events → releases → history)
- Validation version = "1.0"

**Validation** :
- [ ] Transaction atomique
- [ ] Ordre suppression correct
- [ ] Ordre insertion correct
- [ ] Validation version
- [ ] 400 si format invalide

---

## 8️⃣ Health Endpoint (1 endpoint)

### GET /api/health

**Node.js** (`server.js:47-49`):
```javascript
GET /api/health
Response 200: { status: "ok", timestamp: "2024-12-08T14:30:00" }
```

**Spring Boot**:
```java
@GetMapping("/health")
Map<String, String> health() {
    return Map.of(
        "status", "ok",
        "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
    );
}
```

**Validation** :
- [ ] Format exact
- [ ] Timestamp ISO 8601
- [ ] Pas d'auth requise

---

## 📊 Récapitulatif

| Module | Endpoints | Validés | % | Status |
|--------|-----------|---------|---|--------|
| Auth | 5 | 3 | 60% | 🔄 En cours |
| Events | 7 | 7 | 100% | ✅ Complet |
| Releases | 13 | 7 | 54% | 🔄 En cours |
| Settings | 2 | 2 | 100% | ✅ Complet |
| History | 3 | 0 | 0% | 📋 À faire |
| Games | 6 | 6 | 100% | ✅ Complet |
| Admin | 4 | 0 | 0% | 📋 À faire |
| Health | 1 | 0 | 0% | 📋 À faire |
| **TOTAL** | **43** | **25** | **58%** | 🔄 **En cours** |

### ✅ Modules 100% complétés (Décembre 2024)
1. **Events** (7/7) - CRUD + Stats + Filtres
2. **Settings** (2/2) - GET/PUT avec defaults
3. **Games** (6/6) - Init + Leaderboard + Scores + My Scores

### 🔄 Modules partiellement implémentés
1. **Auth** (3/5) - Login, Register, /me ✅ | Preferences, Widget-order 📋
2. **Releases** (7/13) - CRUD + Stats + Toggle ✅ | Features/Actions CRUD 📋

### 📋 Modules à implémenter
1. **History** (0/3) - GET, Rollback, DELETE
2. **Admin** (0/4) - Users, Stats, Export/Import
3. **Health** (0/1) - Simple health check

---

## ✅ Checklist de validation par endpoint

Pour chaque endpoint, valider :

1. **Méthode HTTP** : GET/POST/PUT/DELETE identique
2. **URL path** : Identique (avec paramètres)
3. **Query params** : Noms et types identiques
4. **Request body** : Structure JSON identique
5. **Validation rules** : Mêmes contraintes
6. **Response format** : Structure JSON identique
7. **Status codes** : 200, 201, 204, 400, 404, 500 identiques
8. **Error format** : `{"error": {"message": "...", "status": X}}` identique
9. **Side effects** : History, archivage, cascade identiques
10. **Performance** : Temps de réponse équivalent

---

## 🧪 Méthode de test

Pour chaque endpoint :

```bash
# 1. Exporter collection Postman Node.js actuelle
# 2. Tester contre Spring Boot
# 3. Comparer responses (diff JSON)
# 4. Valider status codes
# 5. Valider side effects (DB queries)
```

**Outil recommandé** : Postman Collection Runner avec assertions automatiques.

---

## 🎯 Objectif final

**Règle absolue** : Angular ne doit **RIEN changer**. Si un seul appel API échoue ou retourne un format différent, la migration est **BLOQUÉE**.

✅ = Validation OK
🔴 = Pas encore testé
❌ = Régression détectée
