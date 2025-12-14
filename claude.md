# Ma Banque Tools - Guide Technique Essentiel

## Vue d'ensemble
Application Angular 20 + Spring Boot pour la DSI d'une banque.
- **Modules**: Calendrier (Timeline trimestrielle), Préparation des MEP (Squads, Features, Actions FF/MF)

## Stack Technique
- **Frontend**: Angular 20 standalone, Tailwind CSS, Material Icons, date-fns, RxJS. Port: :4200
- **Backend**: Java 25, Spring Boot 3.5.0, Spring Data JPA, MySQL. Port: :3000

## Architecture Rapide
### Composants Clés
```
components/
├── auth/login.component.ts                  # Auth JWT (email/password)
├── filters/filter-bar.component.ts          # Filtres par catégorie uniquement
├── home/home.component.ts                   # Page accueil avec nav Calendrier/Prépa MEP
├── modals/event-modal.component.ts          # Formulaire événements
├── releases/
│   ├── releases-list.component.ts           # Liste + Export Markdown/HTML
│   ├── release-detail.component.ts          # Détail avec squads (accordéon)
│   ├── feature-form.component.ts            # Formulaire features
│   └── action-form.component.ts             # Formulaire actions FF/MF
├── settings/settings.component.ts           # Thème + catégories custom
└── timeline/
    ├── quarterly-view.component.ts          # Vue trimestrielle (3 mois)
    └── timeline-container.component.ts      # Conteneur principal
layouts/
└── main-layout.component.ts                 # Layout principal avec sidebar (filtrage menu par permissions)
guards/
├── auth.guard.ts                            # Protection authentification globale
├── calendar.guard.ts                        # ⚠️ Protection routes CALENDAR (READ minimum requis)
├── releases.guard.ts                        # ⚠️ Protection routes RELEASES (READ minimum requis)
└── admin.guard.ts                           # ⚠️ Protection routes ADMIN (READ minimum requis)
directives/
└── has-permission.directive.ts              # ⚠️ Directive *hasPermission pour masquer éléments UI
interceptors/
└── auth.interceptor.ts                      # ⚠️ HTTP Interceptor (ajoute Authorization: Bearer <token>)
services/
├── event.service.ts, release.service.ts     # CRUD
├── auth.service.ts                          # ⚠️ Login, logout, stockage token (sessionStorage)
├── permission.service.ts                    # ⚠️ Gestion permissions (hasReadAccess, hasWriteAccess)
├── settings.service.ts, filter.service.ts   # Prefs & Filtres
├── timeline.service.ts                      # Nav
└── toast.service.ts                         # Notifications
```

### Backend (Spring Boot)
```
event-planning-spring-boot/event-planning-api/src/main/java/com/catsbanque/eventplanning/
├── MaBanqueToolsApiApplication.java       # Point d'entrée Spring Boot
├── config/
│   ├── CorsConfig.java                    # Configuration CORS
│   ├── SecurityConfig.java                # Spring Security (JWT, endpoints publics/protégés)
│   └── JwtAuthenticationFilter.java       # ⚠️ Filtre JWT + chargement permissions (CRITIQUE)
├── controller/
│   ├── EventController.java               # REST endpoints events (@PreAuthorize CALENDAR)
│   ├── ReleaseController.java             # REST endpoints releases (@PreAuthorize RELEASES)
│   ├── SettingsController.java            # REST endpoints settings
│   ├── AuthController.java                # Authentification (login, register, /me, preferences)
│   ├── PermissionController.java          # Gestion permissions (@PreAuthorize ADMIN)
│   ├── AdminController.java               # Gestion admin (users, stats, export/import)
│   ├── HistoryController.java             # Historique événements
│   ├── ReleaseHistoryController.java      # Historique releases
│   ├── GameController.java                # Jeu (Snake)
│   └── HealthController.java              # Health check
├── service/
│   ├── EventService.java                  # Logique métier events
│   ├── ReleaseService.java                # Logique métier releases
│   ├── SettingsService.java               # Logique métier settings
│   ├── AuthService.java                   # Auth & JWT (@PostConstruct admin par défaut)
│   ├── PermissionService.java             # ⚠️ Gestion permissions (getUserPermissions, setPermission)
│   ├── AdminService.java                  # Admin operations
│   ├── HistoryService.java                # Historique events
│   ├── ReleaseHistoryService.java         # Historique releases
│   └── GameService.java                   # Logique jeu
├── repository/
│   ├── EventRepository.java               # JPA Repository (Spring Data)
│   ├── ReleaseRepository.java
│   ├── SquadRepository.java
│   ├── FeatureRepository.java
│   ├── ActionRepository.java
│   ├── FeatureFlippingRepository.java
│   ├── SettingsRepository.java
│   ├── UserRepository.java
│   ├── UserPermissionRepository.java      # ⚠️ Repository permissions
│   ├── HistoryRepository.java
│   ├── ReleaseHistoryRepository.java
│   ├── GameRepository.java
│   └── GameScoreRepository.java
├── entity/
│   ├── Event.java                         # Entité JPA (@Entity) - CUID generation
│   ├── Release.java                       # Relations @OneToMany avec Squad - CUID generation
│   ├── Squad.java                         # Relations @ManyToOne/@OneToMany - CUID generation
│   ├── Feature.java                       # CUID generation
│   ├── Action.java                        # CUID generation
│   ├── FeatureFlipping.java              # @OneToOne avec Action
│   ├── Settings.java
│   ├── User.java                          # Auth utilisateurs (email, password BCrypt)
│   ├── UserPermission.java                # ⚠️ Permissions (module ENUM, level ENUM)
│   ├── PermissionModule.java              # ⚠️ ENUM: CALENDAR, RELEASES, ADMIN
│   ├── PermissionLevel.java               # ⚠️ ENUM: NONE, READ, WRITE
│   ├── History.java
│   ├── ReleaseHistory.java
│   ├── Game.java
│   └── GameScore.java
├── dto/
│   ├── EventDto.java                      # Data Transfer Objects
│   ├── ReleaseDto.java
│   ├── SquadDto.java
│   ├── FeatureDto.java
│   ├── ActionDto.java
│   ├── FeatureFlippingDto.java
│   ├── SettingsDto.java
│   ├── UserDto.java                       # ⚠️ Contient Map<PermissionModule, PermissionLevel>
│   ├── AuthResponse.java                  # ⚠️ {token, user}
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── UpdatePreferencesRequest.java      # {themePreference}
│   ├── UpdatePreferencesResponse.java     # {message, user}
│   ├── UpdateWidgetOrderRequest.java      # {widgetOrder: List<String>}
│   ├── UpdatePermissionsRequest.java      # {permissions: Map<module, level>}
│   ├── UserPermissionsResponse.java       # Liste permissions utilisateurs
│   ├── UserPermissionDto.java
│   ├── AdminUserDto.java
│   ├── DatabaseExportDto.java
│   └── ...
└── util/
    ├── JwtUtil.java                       # ⚠️ Gestion JWT (generateToken, validateToken, getUserIdFromToken)
    └── ...

resources/
└── application.properties                 # Configuration (MySQL, JPA, Security, JWT secret)
```

## Authentification & Permissions

### Architecture de Sécurité

L'application utilise un système d'authentification JWT (JSON Web Token) couplé à un système de permissions granulaires par module.

#### Composants Clés

**Backend:**
- `JwtAuthenticationFilter.java` - Filtre Spring Security qui intercepte chaque requête HTTP, extrait et valide le JWT, charge les permissions de l'utilisateur
- `SecurityConfig.java` - Configuration Spring Security (endpoints publics/protégés, CORS, CSRF désactivé pour API REST)
- `JwtUtil.java` - Utilitaire pour générer et valider les tokens JWT (secret: `your-secret-key-change-this-in-production`, expiration: 24h)
- `PermissionService.java` - Gestion des permissions utilisateur
- `AuthService.java` - Logique métier auth (login, register, gestion préférences)
- `AuthController.java` - Endpoints REST d'authentification

**Frontend:**
- `auth.interceptor.ts` - HTTP Interceptor Angular qui ajoute automatiquement le header `Authorization: Bearer <token>` à toutes les requêtes API
- `auth.service.ts` - Service Angular pour login/logout, stockage token dans sessionStorage

#### Tables de Sécurité

```sql
-- Table des utilisateurs
CREATE TABLE app_user (
    id VARCHAR(25) PRIMARY KEY,              -- CUID
    email VARCHAR(255) UNIQUE NOT NULL,      -- Identifiant de connexion
    password VARCHAR(255) NOT NULL,          -- Hash BCrypt (cost 10)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    theme_preference VARCHAR(10),            -- 'light' ou 'dark'
    widget_order TEXT,                       -- JSON array pour personnalisation dashboard
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

-- Table des permissions utilisateur
CREATE TABLE user_permissions (
    id VARCHAR(25) PRIMARY KEY,              -- CUID
    user_id VARCHAR(25) NOT NULL,            -- FK vers app_user
    module ENUM('CALENDAR', 'RELEASES', 'ADMIN') NOT NULL,
    permission_level ENUM('NONE', 'READ', 'WRITE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);
```

#### Système de Permissions

**3 Modules:**
- `CALENDAR` - Gestion du calendrier des événements
- `RELEASES` - Gestion de la préparation des MEP (releases, squads, features, actions)
- `ADMIN` - Administration (gestion utilisateurs, stats, export/import DB)

**3 Niveaux:**
- `NONE` - Aucun accès (module masqué dans l'UI)
- `READ` - Lecture seule
- `WRITE` - Lecture + création/modification/suppression

**Mapping Spring Security:**
Les permissions sont converties en `GrantedAuthority` avec le format: `PERMISSION_{MODULE}_{LEVEL}`

Exemples:
- `PERMISSION_CALENDAR_WRITE` - Accès complet au calendrier
- `PERMISSION_RELEASES_READ` - Lecture seule des releases
- `PERMISSION_ADMIN_WRITE` - Accès admin complet

#### Flux d'Authentification

**1. Login (POST /api/auth/login)**

```
Frontend                    Backend                     Database
   |                           |                            |
   |-- {email, password} ----->|                            |
   |                           |-- SELECT user BY email --->|
   |                           |<-- User entity ------------|
   |                           |                            |
   |                           |-- Verify BCrypt password   |
   |                           |                            |
   |                           |-- SELECT permissions ----->|
   |                           |<-- Permissions list -------|
   |                           |                            |
   |                           |-- Generate JWT token       |
   |                           |   (userId, email, exp)     |
   |                           |                            |
   |<-- {token, user, perms}---|                            |
   |                           |                            |
   |-- Store in sessionStorage |                            |
```

**2. Requêtes Authentifiées**

```
Frontend                    Interceptor                 Backend Filter              Controller
   |                           |                            |                            |
   |-- GET /api/events ------->|                            |                            |
   |                           |-- Add Header:              |                            |
   |                           |   Authorization: Bearer... |                            |
   |                           |--------------------------->|                            |
   |                           |                            |-- Extract JWT              |
   |                           |                            |-- Validate signature       |
   |                           |                            |-- Check expiration         |
   |                           |                            |-- Load user permissions -->|
   |                           |                            |   from DB                  |
   |                           |                            |                            |
   |                           |                            |-- Create Authentication    |
   |                           |                            |   with GrantedAuthorities: |
   |                           |                            |   - PERMISSION_CALENDAR_WRITE
   |                           |                            |   - PERMISSION_RELEASES_WRITE
   |                           |                            |   - PERMISSION_ADMIN_WRITE
   |                           |                            |   - ROLE_USER              |
   |                           |                            |                            |
   |                           |                            |-- SecurityContext.set ----->|
   |                           |                            |                            |
   |                           |                            |                            |-- @PreAuthorize check
   |                           |                            |                            |   hasPermission(...)
   |                           |                            |                            |
   |                           |                            |<-- OK / 403 Forbidden ------|
```

**Code: JwtAuthenticationFilter.java**

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) {
    String token = extractToken(request);
    if (token != null && jwtUtil.validateToken(token)) {
        String userId = jwtUtil.getUserIdFromToken(token);

        // ⚠️ CRITIQUE: Charger les permissions depuis la DB
        List<GrantedAuthority> authorities = loadUserAuthorities(userId);

        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(userId, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    filterChain.doFilter(request, response);
}

private List<GrantedAuthority> loadUserAuthorities(String userId) {
    List<GrantedAuthority> authorities = new ArrayList<>();

    // Charger les permissions depuis la table user_permissions
    Map<PermissionModule, PermissionLevel> permissions =
        permissionService.getUserPermissions(userId);

    // Convertir en GrantedAuthority
    for (Map.Entry<PermissionModule, PermissionLevel> entry : permissions.entrySet()) {
        String authority = String.format("PERMISSION_%s_%s",
                                        entry.getKey().name(),
                                        entry.getValue().name());
        authorities.add(new SimpleGrantedAuthority(authority));
    }

    // Ajouter ROLE_USER pour tous les utilisateurs authentifiés
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

    return authorities;
}
```

**Code: Controller avec @PreAuthorize**

```java
@RestController
@RequestMapping("/api/releases")
public class ReleaseController {

    // Lecture: Nécessite READ ou WRITE sur RELEASES
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<List<ReleaseDto>> getAllReleases() {
        // ...
    }

    // Création: Nécessite WRITE sur RELEASES
    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseDto> createRelease(@Valid @RequestBody CreateReleaseRequest request) {
        // ...
    }

    // Admin: Nécessite WRITE sur ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_ADMIN_WRITE')")
    public ResponseEntity<Void> deleteRelease(@PathVariable String id) {
        // ...
    }
}
```

#### Utilisateur Admin par Défaut

Au démarrage de l'application, un compte admin est automatiquement créé via `@PostConstruct`:

```java
@Service
public class AuthService {

    @PostConstruct
    public void initDefaultAdmin() {
        if (userRepository.findByEmail("admin").isPresent()) {
            return; // Admin existe déjà
        }

        // Créer l'admin
        User admin = User.builder()
            .email("admin")
            .password(passwordEncoder.encode("admin")) // BCrypt hash
            .firstName("Admin")
            .lastName("Système")
            .themePreference("light")
            .build();

        admin = userRepository.save(admin);

        // Donner WRITE sur tous les modules
        permissionService.setPermission(admin.getId(), PermissionModule.CALENDAR, PermissionLevel.WRITE);
        permissionService.setPermission(admin.getId(), PermissionModule.RELEASES, PermissionLevel.WRITE);
        permissionService.setPermission(admin.getId(), PermissionModule.ADMIN, PermissionLevel.WRITE);
    }
}
```

**Credentials Admin:**
- Email: `admin`
- Password: `admin`

#### Frontend - HTTP Interceptor

**Code: auth.interceptor.ts**

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('planning_auth_token');

  if (!token) {
    return next(req); // Pas de token → requête non authentifiée
  }

  // Cloner la requête et ajouter le header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
```

**Enregistrement dans main.ts:**

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]) // ⚠️ Enregistrer l'intercepteur
    ),
    // ...
  ]
});
```

#### Endpoints d'Authentification

```bash
# Login
POST /api/auth/login
Body: { "email": "admin", "password": "admin" }
Response: {
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "admin001",
    "email": "admin",
    "firstName": "Admin",
    "lastName": "Système",
    "themePreference": "light",
    "permissions": {
      "CALENDAR": "WRITE",
      "RELEASES": "WRITE",
      "ADMIN": "WRITE"
    }
  }
}

# Register (création compte)
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
Response: { "token": "...", "user": {...} }

# Get current user (JWT required)
GET /api/auth/me
Header: Authorization: Bearer <token>
Response: { "id": "...", "email": "...", "permissions": {...} }

# Update preferences (JWT required)
PUT /api/auth/preferences
Header: Authorization: Bearer <token>
Body: { "themePreference": "dark" }
Response: {
  "message": "Préférences mises à jour",
  "user": {...}
}

# Update widget order (JWT required)
PUT /api/auth/widget-order
Header: Authorization: Bearer <token>
Body: { "widgetOrder": ["widget1", "widget2", "widget3"] }
Response: {
  "message": "Ordre des widgets mis à jour",
  "user": {...}
}
```

#### Gestion des Permissions (Admin uniquement)

```bash
# Lister les permissions d'un utilisateur
GET /api/permissions/user/{userId}
Header: Authorization: Bearer <token>
Requires: PERMISSION_ADMIN_WRITE

# Mettre à jour les permissions
PUT /api/permissions/user/{userId}
Header: Authorization: Bearer <token>
Body: {
  "permissions": {
    "CALENDAR": "WRITE",
    "RELEASES": "READ",
    "ADMIN": "NONE"
  }
}
Requires: PERMISSION_ADMIN_WRITE
```

#### Sécurité

**Token JWT:**
- Algorithme: HS256 (HMAC with SHA-256)
- Secret: Défini dans `application.properties` (à changer en production!)
- Expiration: 24 heures
- Claims: userId, email, firstName, lastName, iat (issued at), exp (expiration)

**Mots de passe:**
- Hash: BCrypt
- Cost factor: 10 (2^10 = 1024 rounds)
- Salt: Généré automatiquement par BCrypt

**CORS:**
- Origin autorisé: `http://localhost:4200` (Angular dev server)
- Méthodes: GET, POST, PUT, DELETE, PATCH
- Headers: `Authorization`, `Content-Type`

**CSRF:**
- Désactivé pour l'API REST (stateless JWT auth)
- Activé uniquement si session-based auth

**Endpoints Publics:**
- `/api/auth/login`
- `/api/auth/register`
- `/api/health`

**Important:** Tous les autres endpoints nécessitent un JWT valide!

#### Dépannage Commun

**Erreur 403 Forbidden malgré connexion réussie:**
- ✅ Vérifier que le frontend envoie bien le header `Authorization: Bearer <token>`
- ✅ Vérifier que `authInterceptor` est enregistré dans `main.ts`
- ✅ Vérifier que `JwtAuthenticationFilter` charge bien les permissions depuis la DB (logs: "Authority ajoutée: PERMISSION_XXX_XXX")
- ✅ Vérifier que `@PreAuthorize` dans le controller correspond aux permissions de l'utilisateur

**Token expiré:**
- Le frontend doit détecter les erreurs 401 et rediriger vers `/login`
- Implémenter un refresh token si besoin de sessions longues

**Permissions non chargées:**
- Vérifier que la table `user_permissions` contient bien les entrées pour l'utilisateur
- Vérifier les logs Spring Boot: "Utilisateur authentifié via JWT: {userId} avec {N} authorities"

## Schéma de Base de Données (MySQL)

```mermaid
erDiagram
    %% Tables principales
    EVENT {
        string id PK "CUID (25 chars)"
        string title "NOT NULL"
        string date "ISO YYYY-MM-DD"
        string endDate "Optional end date"
        string startTime "HH:mm"
        string endTime "HH:mm"
        string color "NOT NULL"
        string icon "NOT NULL"
        string category "mep|hotfix|maintenance|etc"
        text description
        datetime created_at
        datetime updated_at
    }

    APP_RELEASE {
        string id PK "CUID (25 chars)"
        string name "NOT NULL"
        string version "NOT NULL, UNIQUE"
        datetime release_date "NOT NULL"
        string status "draft|in_progress|completed|cancelled"
        string type "release|hotfix"
        text description
        datetime created_at
        datetime updated_at
    }

    SQUAD {
        string id PK "CUID (25 chars)"
        string release_id FK "NOT NULL"
        int squad_number "1-6"
        string tonton_mep "MEP supervisor name"
        boolean is_completed "Calculated field"
        boolean features_empty_confirmed
        boolean pre_mep_empty_confirmed
        boolean post_mep_empty_confirmed
        datetime created_at
        datetime updated_at
    }

    FEATURE {
        string id PK "CUID (25 chars)"
        string squad_id FK "NOT NULL"
        string title "NOT NULL"
        text description
        datetime created_at
        datetime updated_at
    }

    ACTION {
        string id PK "CUID (25 chars)"
        string squad_id FK "NOT NULL"
        string phase "pre_mep|post_mep"
        string type "topic_creation|database_update|vault_credentials|feature_flipping|other"
        string title "NOT NULL"
        text description
        string status "pending|completed"
        int order_index "For ordering"
        datetime created_at
        datetime updated_at
    }

    FEATURE_FLIPPING {
        string id PK "CUID (25 chars)"
        string action_id FK "UNIQUE, NOT NULL"
        string flipping_type "memory_flipping|feature_flipping"
        string rule_name "NOT NULL"
        string theme
        string rule_action "create_rule|obsolete_rule|disable_rule|enable_rule"
        string rule_state "enabled|disabled (deprecated)"
        text target_clients "JSON array"
        text target_caisses "Free text"
        text target_os "JSON array"
        text target_versions "JSON version conditions"
        datetime created_at
        datetime updated_at
    }

    APP_USER {
        string id PK "CUID (25 chars)"
        string email "UNIQUE, NOT NULL"
        string password "BCrypt hashed"
        string first_name "NOT NULL"
        string last_name "NOT NULL"
        string theme_preference "light|dark"
        text widget_order "JSON array"
        datetime created_at
        datetime updated_at
    }

    USER_PERMISSION {
        string id PK "CUID (25 chars)"
        string user_id FK "NOT NULL"
        enum module "CALENDAR|RELEASES|ADMIN"
        enum permission_level "NONE|READ|WRITE"
        datetime created_at
        datetime updated_at
    }

    SETTINGS {
        string id PK "CUID (25 chars)"
        string theme "light|dark"
        text custom_categories "JSON array"
        datetime created_at
        datetime updated_at
    }

    HISTORY {
        string id PK "CUID (25 chars)"
        string action "create|update|delete"
        string event_id
        text event_data "JSON snapshot"
        text previous_data "JSON for rollback"
        string user_id FK
        string user_display_name "Prenom N."
        datetime timestamp
    }

    RELEASE_HISTORY {
        string id PK "CUID (25 chars)"
        string action "create|update|delete"
        string release_id
        text release_data "JSON snapshot"
        text previous_data "JSON for rollback"
        string user_id FK
        string user_display_name "Prenom N."
        datetime timestamp
    }

    GAME {
        string id PK "CUID (25 chars)"
        string slug "UNIQUE, typing-fr|typing-en"
        string name "NOT NULL"
        text description
        string icon "Material icon name"
        boolean is_active "Default true"
        datetime created_at
        datetime updated_at
    }

    GAME_SCORE {
        string id PK "CUID (25 chars)"
        string game_id FK "NOT NULL"
        string visitor_name "For non-auth players"
        string user_id FK "Optional"
        int score "Number of correct words"
        int wpm "Words per minute"
        double accuracy "Percentage"
        text metadata "JSON extra data"
        datetime created_at
    }

    %% Relations Releases → Squads → Features/Actions
    APP_RELEASE ||--o{ SQUAD : "has 6 squads"
    SQUAD ||--o{ FEATURE : "contains"
    SQUAD ||--o{ ACTION : "contains"
    ACTION ||--o| FEATURE_FLIPPING : "may have FF/MF"

    %% Relations Permissions & Auth
    APP_USER ||--o{ USER_PERMISSION : "has permissions"

    %% Relations History
    APP_USER ||--o{ HISTORY : "tracks event changes"
    APP_USER ||--o{ RELEASE_HISTORY : "tracks release changes"

    %% Relations Game
    GAME ||--o{ GAME_SCORE : "has scores"
    APP_USER ||--o{ GAME_SCORE : "submits scores"
```

### Notes sur le schéma
- **IDs**: Tous les IDs utilisent le format CUID (ex: `cmj0ml2y2dfwpa1`) généré via `generateCuid()` dans `@PrePersist`
  - ⚠️ **Important**: Ne jamais utiliser `UUID.randomUUID()` car cela génère 32 chars, trop long pour VARCHAR(25)
  - CUID génère ~17 chars, format: `c` + timestamp base36 + 8 chars aléatoires
- **Cascade**: Relations `@OneToMany` avec `CascadeType.ALL` et `orphanRemoval = true`
- **Lazy Loading**: Résolu via `@Query` avec `LEFT JOIN FETCH` dans les repositories
- **Indexes**: Définis sur les FK et champs fréquemment filtrés (date, category, status, etc.)
- **JSON Storage**: Certains champs (custom_categories, widget_order, targets) stockés en TEXT/JSON
- **Permissions**: Table `user_permissions` avec relation 1-N vers `app_user`, cascade delete ON DELETE CASCADE

## Modèles Essentiels
### Event
```typescript
interface Event {
  id?: string; title: string; date: string; // ISO YYYY-MM-DD
  startTime?: string; endTime?: string; color: string; icon: string;
  category: EventCategory; description?: string;
}
type EventCategory = 'mep' | 'hotfix' | 'maintenance' | 'pi_planning' | 'sprint_start' | 'code_freeze' | 'psi' | 'other';
```

### Release / Squad / Feature / Action
```typescript
interface Release {
  id?: string; name: string; description?: string; releaseDate: string; // ISO YYYY-MM-DD
  status: 'draft' | 'active' | 'completed'; squads: Squad[];
}
interface Squad {
  id?: string; releaseId?: string; squadNumber: number; tontonMep?: string;
  features: Feature[]; actions: Action[]; isCompleted: boolean; // Calculé
}
interface Feature { id?: string; squadId?: string; title: string; description?: string; }
interface Action {
  id?: string; squadId?: string; title: string; description?: string;
  isCompleted: boolean; phase: 'pre_mep' | 'post_mep'; flipping?: FeatureFlipping;
}
interface FeatureFlipping {
  flippingType: 'feature_flipping' | 'memory_flipping'; ruleName: string;
  ruleAction: 'create_rule' | 'obsolete_rule' | 'disable_rule' | 'enable_rule';
  targetClients: string; targetCaisses?: string; targetOS: string; targetVersions: string;
}
```

## API Endpoints (Spring Boot REST)
```
Base URL: http://localhost:3000/api

# Events
GET    /api/events                    # Liste événements (filtres: category, dateFrom, dateTo, search)
GET    /api/events/{id}               # Détail événement
POST   /api/events                    # Créer événement
PUT    /api/events/{id}               # Modifier événement
DELETE /api/events/{id}               # Supprimer événement

# Releases
GET    /api/releases                  # Liste releases (futures + 20 dernières passées)
GET    /api/releases/{id}             # Détail release (id ou version)
POST   /api/releases                  # Créer release
PUT    /api/releases/{id}             # Modifier release
DELETE /api/releases/{id}             # Supprimer release
PATCH  /api/releases/{id}/actions/{actionId}/toggle  # Toggle action completion

# Settings
GET    /api/settings                  # Récupérer paramètres (theme, customCategories)
PUT    /api/settings                  # Mettre à jour paramètres

# Auth (JWT)
POST   /api/auth/login                # Login (username, password) → JWT token
POST   /api/auth/register             # Inscription
GET    /api/auth/me                   # User courant (JWT required)

# Admin (JWT required, ROLE_ADMIN)
GET    /api/admin/users               # Liste utilisateurs
DELETE /api/admin/users/{id}          # Supprimer utilisateur
GET    /api/admin/stats               # Statistiques
GET    /api/admin/export              # Export DB (JSON)
POST   /api/admin/import              # Import DB (JSON)

# History
GET    /api/history/events            # Historique événements
GET    /api/history/releases          # Historique releases

# Game (Snake)
POST   /api/game/submit-score         # Soumettre score
GET    /api/game/leaderboard          # Classement
GET    /api/game/my-scores            # Mes scores (JWT required)

# Health
GET    /api/health                    # Health check
```

## Design System
### Palette & Classes
- **Primary**: Vert émeraude (#10b981). **Alert**: Amber doux (#f59e0b). **Dark**: `bg-gray-800`.
- **Gradients**: `bg-gradient-planning`, `bg-gradient-releases`.
- **Classes**: `.card` (bg-gray-50/900), `.card-releases` (bg-white/800), `.btn-primary`.
- **UI**: Filter bar sticky, Export dropdown z-50, Date MEP neutre.

## Fonctionnalités Clés

### Système de Permissions
⚠️ **CRITIQUE**: Toute nouvelle feature DOIT respecter le système de permissions !

**3 modules protégés** : CALENDAR, RELEASES, ADMIN
**3 niveaux** : NONE (pas d'accès), READ (lecture), WRITE (lecture + écriture)

**Comportement attendu selon le niveau** :
- **NONE** : Menu invisible dans sidebar + Redirection vers /home si accès direct + Backend 403
- **READ** : Menu visible + GET autorisé + POST/PUT/DELETE refusés (403)
- **WRITE** : Accès complet (lecture + écriture)

**Implémentation obligatoire** :
1. **Backend** : Ajouter `@PreAuthorize` sur tous les nouveaux endpoints
   ```java
   @GetMapping("/new-endpoint")
   @PreAuthorize("hasAnyAuthority('PERMISSION_CALENDAR_READ', 'PERMISSION_CALENDAR_WRITE')")
   public ResponseEntity<?> newEndpoint() { ... }
   ```

2. **Frontend routes** : Ajouter le guard approprié dans `app.routes.ts`
   ```typescript
   { path: 'new-route', component: ..., canActivate: [calendarGuard] }
   ```

3. **Frontend UI** : Utiliser la directive `*hasPermission` pour masquer boutons d'action
   ```html
   <button *hasPermission="'CALENDAR'; level: 'WRITE'" (click)="create()">Créer</button>
   ```

4. **Tests** : Exécuter `./test-permissions.sh` pour vérifier la non-régression

### Calendrier
- **Timeline trimestrielle**: Affiche 3 mois (T1-T4) en colonne verticale.
- **Navigation**: Boutons Précédent/Suivant (±3 mois), "Aujourd'hui", flèches clavier.
- **Jours fériés**: Grisés automatiquement (week-ends + fériés français).
- **Scroll depuis Accueil**: Navigation automatique vers le trimestre d'un événement.
- **Filtres**: Catégorie uniquement. Semaine commence Lundi.
- **Catégories custom**: 8 colonnes, JSON.
- **Permissions** : Module CALENDAR (routes protégées par `calendarGuard`)

### Préparation des MEP
- **Export**: Markdown/HTML avec détails FF/MF.
- **Squads**: Accordéon, indicateurs visuels (Vert/Amber).
- **Actions**: Pre/Post MEP, toggle.
- **FF/MF**: Clients, Caisses, OS, Versions.
- **Permissions** : Module RELEASES (routes protégées par `releasesGuard`)

## Points Techniques

### Frontend (Angular)
- **TimelineView**: Type unique `'quarter'` (Vue trimestrielle).
- **Navigation trimestrielle**: `nextPeriod()` / `previousPeriod()` avancent/reculent de 3 mois.
- **Jours fériés**: Algorithme Computus pour Pâques + fériés fixes français.
- **Scroll**: `Subject` (pas BehaviorSubject) pour `scrollToToday$`.
- **Dark Mode**: Classe `.dark` sur `html`.
- **Squad Complete**: `squad.actions.every(a => a.isCompleted)`.

### Backend (Spring Boot)
- **JPA Entities**: Relations bidirectionnelles `@OneToMany` / `@ManyToOne` avec cascade `CascadeType.ALL`.
- **DTOs**: Mapping manuel Entity ↔ DTO dans les services (pas de MapStruct).
- **Spring Security**: JWT token-based auth. Header: `Authorization: Bearer <token>`.
- **Permissions**: Système granulaire (NONE/READ/WRITE) sur 3 modules (CALENDAR/RELEASES/ADMIN).
  - `@PreAuthorize` sur tous les endpoints protégés
  - `JwtAuthenticationFilter` charge permissions depuis DB → GrantedAuthority
- **MySQL**: Base de données production. H2 pour tests (`@DataJpaTest`).
- **Validation**: `@Valid` sur les `@RequestBody`, annotations Jakarta Bean Validation.
- **CORS**: Configuré pour permettre Angular (localhost:4200).
- **Lombok**: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` sur entities/DTOs.
- **Tests**: JUnit 5, MockMvc pour integration tests, `@SpringBootTest` / `@DataJpaTest`.

## Scripts & Démarrage

### Frontend (Angular)
```bash
cd event-planning-app
npm install
npm start           # Démarre sur http://localhost:4200
```

### Backend (Spring Boot)
```bash
cd event-planning-spring-boot/event-planning-api

# Prérequis: MySQL installé et démarré
# Créer DB: eventplanning, user: eventplanning, password: eventplanning123

# Avec Maven Wrapper
./mvnw clean install          # Build & tests
./mvnw spring-boot:run        # Démarre sur http://localhost:3000/api

# Ou avec Maven
mvn clean install
mvn spring-boot:run

# Tests uniquement
./mvnw test
```

### Tests de Non-Régression Permissions
⚠️ **IMPORTANT**: À chaque nouvelle feature, exécuter les tests de non-régression du système de permissions !

```bash
# Script de test automatique
./test-permissions.sh

# Ce script teste :
# ✅ Login admin avec permissions WRITE sur tous les modules
# ✅ Modification des permissions via API admin
# ✅ Nouveau login renvoie permissions mises à jour dans JWT
# ✅ Accès refusé aux endpoints avec NONE (403)
# ✅ Accès autorisé avec READ/WRITE (200)
# ✅ Différence entre READ (GET OK, POST/PUT/DELETE KO) et WRITE (tout OK)
```

**Documentation complète** : Voir `PERMISSIONS_TESTING_GUIDE.md` pour :
- Scénarios de test détaillés
- Guide de test manuel UI Angular
- API de gestion des permissions
- Dépannage commun
- Exemples d'utilisation de la directive `*hasPermission`

**Checklist avant commit** :
- [ ] Guards protègent bien les routes sensibles
- [ ] Sidebar filtre les menus selon permissions
- [ ] Backend renvoie 403 pour accès non autorisés
- [ ] Script `./test-permissions.sh` passe tous les tests

### Configuration MySQL
```sql
CREATE DATABASE eventplanning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eventplanning'@'localhost' IDENTIFIED BY 'eventplanning123';
GRANT ALL PRIVILEGES ON eventplanning.* TO 'eventplanning'@'localhost';
FLUSH PRIVILEGES;
```

### Variables d'environnement (application.properties)
```properties
server.port=3000
spring.datasource.url=jdbc:mysql://localhost:3306/eventplanning
spring.datasource.username=eventplanning
spring.datasource.password=eventplanning123
spring.jpa.hibernate.ddl-auto=update
```

## Updates & Historique
- **Dec 2024 Updates**:
  - Renommé "Ma Banque Tools", Design unifié, Dark mode adouci, Export détaillé.
  - **Vue trimestrielle** (Dec 6): Fusion annuelle/mensuelle → Vue unique 3 mois en colonne.
  - Jours fériés grisés (sans badge), navigation T1-T4, scroll auto depuis Accueil.
  - **Renommage** (Dec 7): Planning → Calendrier (route: /calendar), Dashboard → Accueil (route: /home), Releases → Préparation des MEP (affichage uniquement).
  - **Migration Spring Boot** (Dec 10): Backend migré de Node.js/Express/Prisma/SQLite vers Java 25/Spring Boot 3.5.0/JPA/MySQL.
    - Architecture: Controller → Service → Repository (JPA).
    - Authentification: Spring Security + JWT.
    - Nouvelles fonctionnalités: Admin panel, Historique, Jeu Snake, Export/Import DB.
  - **Système de Permissions** (Dec 13):
    - Implémentation du système de permissions granulaires par module (CALENDAR, RELEASES, ADMIN).
    - 3 niveaux: NONE, READ, WRITE.
    - **Backend**:
      - JwtAuthenticationFilter charge les permissions depuis la DB et les convertit en GrantedAuthority.
      - @PreAuthorize sur tous les endpoints REST pour contrôle d'accès.
      - Endpoints de gestion: GET/PUT /api/admin/permissions/{userId}.
    - **Frontend**:
      - Guards Angular (`calendar.guard.ts`, `releases.guard.ts`, `admin.guard.ts`) bloquent accès aux routes.
      - Directive `*hasPermission` pour masquer/afficher éléments UI selon permissions.
      - Sidebar filtre automatiquement les items de menu (permission NONE → menu invisible).
      - HTTP Interceptor Angular (`auth.interceptor.ts`) ajoute automatiquement le token JWT.
    - **Tests**: Script `test-permissions.sh` pour tests de non-régression automatisés.
    - **Docs**: Guide complet dans `PERMISSIONS_TESTING_GUIDE.md`.
  - **Fix génération IDs** (Dec 13):
    - Correction bug: UUID.randomUUID() générait 32 chars → trop long pour VARCHAR(25).
    - Remplacement par CUID (17 chars) sur Release, Event, Squad, Feature, Action.
    - Format CUID: `c` + timestamp base36 + 8 chars aléatoires (ex: `cmj4426bcgi3rl8gy`).
- **Auth**: JWT token-based (remplace password "NMB"), admin par défaut (email: "admin", password: "admin").
- **Version**: Incluse dans nom release.
- **Cascade**: JPA cascade delete sur relations @OneToMany.
- **Permissions**: Système granulaire par module avec 3 niveaux (NONE/READ/WRITE).
  - ⚠️ **CRITIQUE** : Respecter le système de permissions sur toute nouvelle feature !
  - Voir section "Système de Permissions" ci-dessus pour implémentation obligatoire
  - Tests automatisés : `./test-permissions.sh`
  - Documentation : `PERMISSIONS_TESTING_GUIDE.md` + `PERMISSIONS_IMPLEMENTATION_SUMMARY.md`

---
**Équipe**: DSI Banque | **Stack**: Angular 20 + Spring Boot 3.5.0 + MySQL | **Auth**: JWT + Permissions granulaires
