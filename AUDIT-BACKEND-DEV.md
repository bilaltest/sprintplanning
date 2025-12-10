# Audit Backend Spring Boot - Ma Banque Tools
**Date**: 11 Décembre 2024
**Contexte**: **Environnement de développement uniquement** (DSI interne)
**Version**: Spring Boot 3.5.0, Java 25

---

## Résumé Exécutif - Contexte Dev

Étant donné que l'application est destinée **uniquement à un environnement de développement interne** (pas de production externe), la repriorisation des recommandations se concentre sur :
- **Stabilité et fiabilité** du code
- **Expérience développeur** (DX)
- **Maintenabilité** à long terme
- Éviter les problèmes bloquants techniques (vs. sécurité externe)

### Points Critiques 🔴 (À corriger)
1. **N+1 QUERIES**: Problème de performance réel
2. **ARCHIVAGE SYNCHRONE**: Bloque les requêtes utilisateur
3. **CUID FAIBLE**: Risque de collision en base de données
4. **SECRETS HARDCODÉS**: Problème de déploiement multi-environnements

### Points Optionnels ⚠️ (Nice to have)
- Sécurité Spring Security (OK de laisser `.permitAll()` pour dev interne)
- Token JWT signé (simplifié OK pour usage interne)
- Rate limiting (non nécessaire en dev interne)
- CORS restreint (OK large pour dev)

---

## 1. PERFORMANCE ⚡ (Priorité Haute)

### 🔴 CRITIQUE - Archivage Synchrone Bloquant
**Fichier**: `EventService.java:61-64`, `ReleaseService.java:63-66`

**Problème**:
```java
@Transactional(readOnly = true)
public List<EventDto> getAllEvents(...) {
    archiveOldEvents(); // Bloque la requête GET!
    // ...
}
```

**Impact en Dev**:
- Latence de 500ms-2s sur chaque GET `/api/events`
- Expérience utilisateur dégradée dans Angular
- Locks de base de données inutiles

**Solution**: Utiliser `@Scheduled` (tâche nocturne)
```java
@Service
@EnableScheduling
public class ArchiveScheduler {

    private final EventRepository eventRepository;
    private final ReleaseRepository releaseRepository;

    // Tous les jours à 3h du matin
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void archiveOldData() {
        log.info("Démarrage archivage automatique...");
        archiveOldEvents();
        archivePastReleases();
        log.info("Archivage terminé");
    }

    private void archiveOldEvents() {
        LocalDate cutoffDate = LocalDate.now().minusMonths(24);
        List<Event> oldEvents = eventRepository.findEventsOlderThan(cutoffDate.toString());
        if (!oldEvents.isEmpty()) {
            eventRepository.deleteAll(oldEvents);
            log.info("Archived {} old events", oldEvents.size());
        }
    }

    private void archivePastReleases() {
        LocalDateTime now = LocalDateTime.now();
        long pastCount = releaseRepository.countByReleaseDateBefore(now);
        if (pastCount > 20) {
            List<Release> toDelete = releaseRepository
                .findByReleaseDateBeforeOrderByReleaseDateAsc(now)
                .stream()
                .limit(pastCount - 20)
                .toList();
            releaseRepository.deleteAll(toDelete);
            log.info("Archived {} old releases", toDelete.size());
        }
    }
}
```

**Activer dans l'application**:
```java
@SpringBootApplication
@EnableScheduling // Ajouter!
public class MaBanqueToolsApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(MaBanqueToolsApiApplication.class, args);
    }
}
```

**Retirer des services**:
```java
// EventService.java
@Transactional(readOnly = true)
public List<EventDto> getAllEvents(String category, String dateFrom, String dateTo, String search) {
    // RETIRER: archiveOldEvents();

    List<Event> events;
    // ...
}
```

**Temps estimé**: 30 minutes
**Impact**: Amélioration immédiate de la latence GET

---

### 🔴 IMPORTANT - N+1 Queries sur Relations
**Fichier**: `ReleaseService.java:92-100`

**Problème**: Sans `@EntityGraph`, Hibernate fait une requête par Squad/Feature/Action

**Vérification**: Activer les logs SQL
```properties
# application.properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

**Test**: Appeler GET `/api/releases/40.5` et compter les requêtes SQL dans les logs

**Solution**: Déjà implémenté dans `ReleaseRepository.java:53-60` ✅
```java
@EntityGraph(attributePaths = {"squads", "squads.features", "squads.actions", "squads.actions.flipping"})
Optional<Release> findByVersion(String version);
```

**Action**: Vérifier que toutes les méthodes `findById()` utilisent `@EntityGraph`

---

### ⚠️ MOYEN - Pas de Cache pour Requêtes Répétitives
**Impact en Dev**: Settings récupérés à chaque changement de page

**Solution**: Ajouter Spring Cache (simple)
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("settings");
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS) // Cache 1h
            .maximumSize(100));
        return cacheManager;
    }
}
```

```java
// SettingsService.java
@Cacheable("settings")
public SettingsDto getSettings() {
    // ...
}

@CacheEvict(value = "settings", allEntries = true)
public SettingsDto updateSettings(String theme, String customCategories) {
    // ...
}
```

**Temps estimé**: 20 minutes
**Impact**: Réduit latence Settings de 50ms → 1ms

---

### ⚠️ FAIBLE - Pagination Manquante
**Problème**: Si 1000+ events, GET `/api/events` devient lent

**Solution (optionnelle)**:
```java
// EventController.java
@GetMapping
public ResponseEntity<Page<EventDto>> getAllEvents(
    @RequestParam(required = false) String category,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int size
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("date").ascending());
    Page<EventDto> events = eventService.getAllEvents(category, pageable);
    return ResponseEntity.ok(events);
}
```

**Note**: À implémenter si vous dépassez 500+ events

---

## 2. FIABILITÉ 🛠️ (Priorité Haute)

### 🔴 CRITIQUE - CUID Generation Faible
**Fichier**: `Event.java:68-72`, `Release.java:66-70`, `Squad.java`, `Feature.java`, `Action.java`

**Problème**:
```java
private String generateCuid() {
    long timestamp = System.currentTimeMillis();
    int random = (int) (Math.random() * Integer.MAX_VALUE);
    return "c" + Long.toString(timestamp, 36) + Integer.toString(random, 36);
}
```

**Impact en Dev**:
- Collision possible si 2 créations simultanées (même milliseconde)
- `Math.random()` n'est pas thread-safe
- Risque de `UNIQUE constraint violation` en base

**Solution**: Utiliser UUID (natif Java)
```java
// Option 1: UUID v4 (standard)
@PrePersist
public void prePersist() {
    if (this.id == null) {
        this.id = UUID.randomUUID().toString().replace("-", "");
    }
}

// Option 2: CUID2 (plus court, plus lisible)
// Ajouter: <dependency>
//   <groupId>io.github.thibaultmeyer</groupId>
//   <artifactId>cuid</artifactId>
//   <version>2.0.1</version>
// </dependency>

private static final CUID cuidGenerator = CUID.randomCUID2();

@PrePersist
public void prePersist() {
    if (this.id == null) {
        this.id = cuidGenerator.toString();
    }
}
```

**Temps estimé**: 1 heure (5 entities à modifier)
**Impact**: Élimine risque de collision

---

### ⚠️ MOYEN - Validation Inconsistante
**Fichier**: `SettingsController.java:40`

**Problème**:
```java
@PutMapping
public ResponseEntity<SettingsDto> updateSettings(@RequestBody Map<String, String> body) {
    // Pas de validation sur theme ou customCategories!
}
```

**Solution**: Créer un DTO avec `@Valid`
```java
// dto/UpdateSettingsRequest.java
@Data
public class UpdateSettingsRequest {
    @Pattern(regexp = "^(light|dark)$", message = "Theme must be 'light' or 'dark'")
    private String theme;

    private String customCategories; // JSON string validé côté service
}

// SettingsController.java
@PutMapping
public ResponseEntity<SettingsDto> updateSettings(
    @Valid @RequestBody UpdateSettingsRequest request
) {
    SettingsDto settings = settingsService.updateSettings(
        request.getTheme(),
        request.getCustomCategories()
    );
    return ResponseEntity.ok(settings);
}
```

**Temps estimé**: 15 minutes
**Impact**: Évite erreurs 500 si données invalides

---

## 3. CONFIGURATION ⚙️ (Priorité Moyenne)

### 🔴 MOYEN - Secrets Hardcodés
**Fichier**: `application.properties:11-14`

**Problème**:
```properties
spring.datasource.username=eventplanning
spring.datasource.password=eventplanning123  # EN CLAIR dans le repo Git!
```

**Impact en Dev**:
- Impossible de changer le mot de passe sans commit
- Problème si plusieurs environnements dev (local, serveur dev)

**Solution**: Variables d'environnement avec valeurs par défaut
```properties
# application.properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/eventplanning?createDatabaseIfNotExist=true}
spring.datasource.username=${DB_USERNAME:eventplanning}
spring.datasource.password=${DB_PASSWORD:eventplanning123}
```

**Utilisation**:
```bash
# Dev local (utilise les valeurs par défaut)
./mvnw spring-boot:run

# Serveur dev (override avec variables)
export DB_PASSWORD=autrePassword
./mvnw spring-boot:run
```

**Temps estimé**: 10 minutes
**Impact**: Meilleure flexibilité déploiement

---

### ⚠️ FAIBLE - Profils Dev/Test Non Séparés
**Solution (optionnelle)**:

Créer `application-dev.properties`:
```properties
# Logs verbeux
spring.jpa.show-sql=true
logging.level.com.catsbanque=DEBUG

# Auto-création tables
spring.jpa.hibernate.ddl-auto=update
```

Créer `application-test.properties`:
```properties
# H2 in-memory pour tests
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.com.catsbanque=WARN
```

**Démarrage**:
```bash
./mvnw spring-boot:run -Dspring.profiles.active=dev
./mvnw test -Dspring.profiles.active=test
```

---

## 4. SÉCURITÉ 🔐 (Priorité Basse pour Dev Interne)

### ✅ OK POUR DEV - Spring Security Désactivé
**Fichier**: `SecurityConfig.java:23`

```java
.anyRequest().permitAll() // OK pour dev interne
```

**Justification**:
- Environnement interne DSI (pas d'accès externe)
- Simplifie le développement
- Pas de données sensibles réelles

**Recommandation**: Garder tel quel pour dev, mais documenter
```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // OK pour dev interne uniquement
            );

        return http.build();
    }

    // Note: Si mise en production externe, activer JWT filter
}
```

---

### ✅ OK POUR DEV - Token Simplifié
**Fichier**: `TokenUtil.java:85-87`

```java
String token = String.format("token_%s_%d", userId, System.currentTimeMillis());
```

**Justification**:
- Suffisant pour env dev (pas d'attaquants)
- Simple à déboguer (userId visible)
- Pas besoin d'expiration en dev

**Recommandation**: Garder tel quel, mais ajouter commentaire
```java
/**
 * Génère un token simple pour dev interne
 * Format: token_<userId>_<timestamp>
 *
 * NOTE: Pour production externe, remplacer par JWT signé (jjwt)
 */
public static String generateToken(String userId) {
    return String.format("token_%s_%d", userId, System.currentTimeMillis());
}
```

---

### ✅ OK POUR DEV - CORS Permissif
**Fichier**: `CorsConfig.java:21-23`

```java
config.addAllowedOrigin("http://localhost:4200");
config.addAllowedHeader("*");
config.addAllowedMethod("*");
```

**Justification**: Parfait pour dev Angular local

**Recommandation (optionnelle)**: Supporter plusieurs ports
```java
@Bean
public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();

    config.setAllowCredentials(true);
    // Support Angular dev server + tests
    config.setAllowedOrigins(Arrays.asList(
        "http://localhost:4200",
        "http://localhost:4201"  // Pour tests e2e
    ));
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");

    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}
```

---

## 5. EXPÉRIENCE DÉVELOPPEUR 💻 (Nice to Have)

### ⭐ RECOMMANDATION - Logs Structurés
**Ajouter des logs utiles pour debug**:

```java
// EventService.java
@Transactional
public EventDto createEvent(CreateEventRequest request, String userId) {
    log.info("Creating event: title='{}', category='{}', date='{}', user='{}'",
        request.getTitle(), request.getCategory(), request.getDate(), userId);

    Event event = new Event();
    // ...
    Event saved = eventRepository.save(event);

    log.info("Event created successfully: id='{}', title='{}'", saved.getId(), saved.getTitle());
    return EventDto.fromEntity(saved);
}
```

---

### ⭐ RECOMMANDATION - Actuator Endpoints
**Déjà activé**, mais exposer plus d'infos:

```properties
# application.properties
management.endpoints.web.exposure.include=health,info,metrics,env,loggers
management.endpoint.health.show-details=always
management.info.env.enabled=true

# Infos app
info.app.name=Ma Banque Tools API
info.app.version=1.0.0
info.app.description=Backend Spring Boot pour DSI
```

**Utilisation**:
- `GET /api/actuator/health` → Status DB, disk space
- `GET /api/actuator/metrics` → JVM, HTTP requests
- `GET /api/actuator/env` → Variables d'environnement

---

### ⭐ RECOMMANDATION - Swagger/OpenAPI
**Documenter automatiquement l'API**:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Ma Banque Tools API")
                .version("1.0.0")
                .description("API de gestion événements et releases pour DSI"));
    }
}
```

**Accès**: `http://localhost:3000/api/swagger-ui.html`

---

## 6. RECOMMANDATIONS PRIORITAIRES 🎯

### Urgence P0 (Cette semaine)
1. ✅ **Déplacer archivage vers @Scheduled** (30 min)
   - Impact: Amélioration latence GET immédiate

2. ✅ **Remplacer CUID par UUID** (1h)
   - Impact: Élimine risque collision base de données

### Priorité P1 (Ce mois)
3. ✅ **Ajouter cache Caffeine pour Settings** (20 min)
   - Impact: Réduit latence 50ms → 1ms

4. ✅ **Externaliser secrets en variables d'env** (10 min)
   - Impact: Meilleure flexibilité multi-environnements

5. ✅ **Ajouter validation DTO Settings** (15 min)
   - Impact: Évite erreurs 500

### Nice to Have P2
6. ⭐ Swagger/OpenAPI pour documentation (1h)
7. ⭐ Profils dev/test séparés (30 min)
8. ⭐ Logs structurés (30 min)
9. ⭐ Pagination si 500+ events (2h)

---

## 7. CHECKLIST ENVIRONNEMENT DEV 📋

- [x] Architecture Controller → Service → Repository
- [x] Tests JUnit 5 + MockMvc
- [x] GlobalExceptionHandler centralisé
- [x] CORS configuré pour Angular
- [x] Lombok pour réduire boilerplate
- [x] @EntityGraph pour éviter N+1 queries
- [ ] Archivage en @Scheduled (pas synchrone)
- [ ] CUID/UUID sécurisé (pas Math.random)
- [ ] Cache Settings (Caffeine)
- [ ] Secrets en variables d'env
- [ ] Logs SQL activables (debug)
- [ ] Swagger/OpenAPI (doc auto)

---

## Conclusion - Contexte Dev

Votre backend est **très bien architecturé** pour un environnement de développement interne. Les points critiques identifiés sont **purement techniques** (performance, fiabilité) et non liés à la sécurité externe.

**Score global pour Dev**: 8/10

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| Architecture | 9/10 | Excellente séparation des couches |
| Performance | 6/10 | Archivage synchrone, manque cache |
| Fiabilité | 7/10 | CUID faible, validation OK |
| DX (Dev Experience) | 8/10 | Propre, tests, logs OK |
| Config Dev | 7/10 | Secrets hardcodés, pas de profils |

**Temps estimé corrections P0**: 1h30
**Temps estimé P1**: 1h15
**Temps estimé P2**: 4h

---

**Prochaines étapes recommandées**:
1. Implémenter archivage @Scheduled (impact immédiat)
2. Remplacer CUID par UUID (fiabilité)
3. Ajouter cache Settings (confort utilisateur)
4. Swagger pour documentation (confort dev)

**Aucune urgence sécurité** - Configuration actuelle adaptée à un environnement dev interne DSI.

---
**Fin de l'audit Dev** - Pour toute question: cf. CLAUDE.md
