# Audit Backend Spring Boot - Ma Banque Tools
**Date**: 11 Décembre 2024
**Version**: Spring Boot 3.5.0, Java 25
**Audit par**: Claude Code

---

## Résumé Exécutif

### Points Forts ✅
- Architecture propre suivant les patterns Spring Boot (Controller → Service → Repository)
- Bonne couverture de tests (JUnit 5, @DataJpaTest, MockMvc)
- Utilisation appropriée de Lombok pour réduire le boilerplate
- Gestion des erreurs centralisée avec @RestControllerAdvice
- Indexation correcte des tables (Event, Release)
- CORS configuré correctement pour Angular

### Points Critiques 🔴 (À corriger immédiatement)
1. **SÉCURITÉ MAJEURE**: Spring Security désactivé (`.anyRequest().permitAll()`)
2. **TOKEN NON SÉCURISÉ**: Token format `token_userId_timestamp` sans signature
3. **CUID FAIBLE**: Génération d'ID prédictible (collision possible)
4. **N+1 QUERIES**: Problèmes potentiels sur Release/Squad/Feature/Action
5. **ARCHIVAGE SYNCHRONE**: Bloque les requêtes GET (devrait être async)

### Points à Améliorer ⚠️
- Validation inconsistante entre couches
- Pas de rate limiting
- Logs de sécurité insuffisants
- Configuration hardcodée (secrets en clair)
- Pas de cache pour les requêtes fréquentes

---

## 1. SÉCURITÉ 🔐

### 🔴 CRITIQUE - Spring Security Désactivé
**Fichier**: `SecurityConfig.java:23`

**Problème**:
```java
.anyRequest().permitAll() // Temporairement tout public pour setup
```

**Impact**:
- Aucune authentification requise sur les endpoints protégés
- Admin endpoints accessibles sans rôle ROLE_ADMIN
- N'importe qui peut créer/modifier/supprimer des données

**Solution**:
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/auth/**").permitAll()
            .requestMatchers("/health").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    return http.build();
}
```

**Action**: Implémenter un `JwtAuthenticationFilter` pour valider les tokens.

---

### 🔴 CRITIQUE - Token JWT Non Sécurisé
**Fichier**: `TokenUtil.java:85-87`, `AuthService.java:121`

**Problème**:
```java
String token = String.format("token_%s_%d", userId, System.currentTimeMillis());
```

**Impact**:
- Token non signé → facilement forgeable
- Pas d'expiration → token valide à vie
- Pas de claims → impossible de stocker rôles/permissions
- Prédictible → attaquant peut générer des tokens valides

**Solution**: Utiliser une vraie bibliothèque JWT (jjwt)
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
```

```java
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24h par défaut
    private long jwtExpiration;

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(user.getId())
            .claim("email", user.getEmail())
            .claim("roles", user.getRoles())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

**Configuration** (`application.properties`):
```properties
jwt.secret=${JWT_SECRET:votre-secret-super-long-minimum-64-caracteres-pour-hs512}
jwt.expiration=86400000
```

---

### 🔴 CRITIQUE - CUID Generation Faible
**Fichier**: `Event.java:68-72`, `Release.java:66-70`

**Problème**:
```java
private String generateCuid() {
    long timestamp = System.currentTimeMillis();
    int random = (int) (Math.random() * Integer.MAX_VALUE);
    return "c" + Long.toString(timestamp, 36) + Integer.toString(random, 36);
}
```

**Impact**:
- Collision possible avec `Math.random()`
- Prédictible (timestamp visible)
- Pas cryptographiquement sécurisé

**Solution**: Utiliser UUID v7 ou une lib CUID2
```java
// Option 1: UUID v7 (Java 21+)
private String generateCuid() {
    return "c" + UUID.randomUUID().toString().replace("-", "");
}

// Option 2: CUID2 (recommandé)
// Ajouter: implementation 'io.github.thibaultmeyer:cuid:2.0.1'
private String generateCuid() {
    return CUID2.generate();
}
```

---

### ⚠️ MOYEN - CORS Trop Permissif
**Fichier**: `CorsConfig.java:21-23`

**Problème**:
```java
config.addAllowedOrigin("http://localhost:4200"); // OK pour dev
config.addAllowedHeader("*"); // Trop permissif
config.addAllowedMethod("*"); // Trop permissif
```

**Recommandation**: Restreindre en production
```java
@Value("${cors.allowed-origins:http://localhost:4200}")
private String allowedOrigins;

@Bean
public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();

    config.setAllowCredentials(true);
    Arrays.stream(allowedOrigins.split(","))
        .forEach(config::addAllowedOrigin);

    // Restreindre les headers
    config.setAllowedHeaders(Arrays.asList(
        "Authorization", "Content-Type", "Accept", "X-Requested-With"
    ));

    // Restreindre les méthodes
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE"));

    config.setMaxAge(3600L); // Cache preflight 1h

    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}
```

---

### ⚠️ MOYEN - Validation Inconsistante
**Fichier**: `EventController.java`, `ReleaseController.java`

**Problème**: Certains endpoints manquent `@Valid`
```java
@PutMapping
public ResponseEntity<SettingsDto> updateSettings(@RequestBody Map<String, String> body) {
    // Pas de validation!
}
```

**Solution**: Créer un DTO avec validation
```java
@Data
public class UpdateSettingsRequest {
    @NotNull
    @Pattern(regexp = "^(light|dark)$", message = "Theme must be 'light' or 'dark'")
    private String theme;

    @JsonRawValue // Pour JSON string
    private String customCategories;
}

@PutMapping
public ResponseEntity<SettingsDto> updateSettings(
    @Valid @RequestBody UpdateSettingsRequest request
) {
    // ...
}
```

---

### ⚠️ MOYEN - Pas de Rate Limiting
**Impact**: Vulnérable aux attaques brute-force sur `/auth/login`

**Solution**: Ajouter Bucket4j
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
```

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final LoadingCache<String, Bucket> cache = Caffeine.newBuilder()
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build(key -> createNewBucket());

    private Bucket createNewBucket() {
        return Bucket.builder()
            .addLimit(Bandwidth.simple(20, Duration.ofMinutes(1))) // 20 req/min
            .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String key = getClientIP(request);
        Bucket bucket = cache.get(key);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.getWriter().write("{\"error\": \"Too many requests\"}");
        }
    }
}
```

---

## 2. PERFORMANCE ⚡

### 🔴 CRITIQUE - N+1 Queries Problem
**Fichier**: `ReleaseService.java:92-100`

**Problème**: Sans `@EntityGraph`, chaque Squad/Feature/Action génère une requête
```java
public ReleaseDto getReleaseByIdOrVersion(String idOrVersion) {
    Release release = releaseRepository.findByVersion(idOrVersion)
        .orElse(null);
    // Si la release a 5 squads, 10 features, 20 actions → 35+ requêtes!
}
```

**Solution**: Utiliser `@EntityGraph` (déjà fait dans repository, bien!)
```java
// ReleaseRepository.java:53-60
@EntityGraph(attributePaths = {"squads", "squads.features", "squads.actions", "squads.actions.flipping"})
Optional<Release> findByVersion(String version);
```

**Vérification**: Activer les logs SQL pour confirmer
```properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

---

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

**Impact**:
- Chaque GET `/api/events` déclenche un DELETE
- Latence élevée pour l'utilisateur
- Locks de base de données

**Solution**: Utiliser @Scheduled
```java
@Service
public class ArchiveScheduler {

    private final EventRepository eventRepository;
    private final ReleaseRepository releaseRepository;

    // Tous les jours à 3h du matin
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void archiveOldData() {
        archiveOldEvents();
        archivePastReleases();
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

**Activer scheduling**:
```java
@SpringBootApplication
@EnableScheduling // Ajouter!
public class MaBanqueToolsApiApplication {
    // ...
}
```

---

### ⚠️ MOYEN - Pas de Cache
**Problème**: Requêtes répétitives (Settings, Events du jour) sans cache

**Solution**: Ajouter Spring Cache
```xml
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
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("settings", "events");
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .maximumSize(1000));
        return cacheManager;
    }
}
```

```java
@Service
public class SettingsService {

    @Cacheable("settings")
    public SettingsDto getSettings() {
        // ...
    }

    @CacheEvict(value = "settings", allEntries = true)
    public SettingsDto updateSettings(String theme, String customCategories) {
        // ...
    }
}
```

---

### ⚠️ FAIBLE - Pagination Manquante
**Fichier**: `EventService.java:92`, `ReleaseService.java:84`

**Problème**: `findAll()` retourne toutes les lignes
```java
List<Event> events = eventRepository.findAll(); // Peut être 10,000+ events
```

**Solution**: Ajouter pagination
```java
@GetMapping
public ResponseEntity<Page<EventDto>> getAllEvents(
    @RequestParam(required = false) String category,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size,
    Pageable pageable
) {
    Page<EventDto> events = eventService.getAllEvents(category, PageRequest.of(page, size));
    return ResponseEntity.ok(events);
}
```

---

## 3. GESTION DES ERREURS 🚨

### ✅ Bon - GlobalExceptionHandler
Le `GlobalExceptionHandler` est bien implémenté avec gestion centralisée.

### ⚠️ MOYEN - Logs de Sécurité Insuffisants

**Ajouter**:
```java
@Service
public class AuditService {

    public void logSecurityEvent(String event, String userId, String details) {
        log.warn("SECURITY [{}] user={} details={}", event, userId, details);
    }
}

// Dans AuthService
public AuthResponse login(LoginRequest request) {
    try {
        // ...
    } catch (BadRequestException e) {
        auditService.logSecurityEvent("LOGIN_FAILED", request.getEmail(), e.getMessage());
        throw e;
    }
}
```

---

## 4. CONFIGURATION ⚙️

### 🔴 CRITIQUE - Secrets Hardcodés
**Fichier**: `application.properties:11-14`

```properties
spring.datasource.username=eventplanning
spring.datasource.password=eventplanning123  # EN CLAIR!
```

**Solution**: Variables d'environnement
```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/eventplanning}
spring.datasource.username=${DB_USERNAME:eventplanning}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

**Démarrage**:
```bash
export DB_PASSWORD=secret123
export JWT_SECRET=votre-secret-super-long-64-chars
./mvnw spring-boot:run
```

---

### ⚠️ MOYEN - Profils Non Configurés
**Créer** `application-dev.properties`, `application-prod.properties`

```properties
# application-dev.properties
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
logging.level.com.catsbanque=DEBUG

# application-prod.properties
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate
logging.level.com.catsbanque=INFO
server.error.include-message=never
server.error.include-stacktrace=never
```

---

## 5. ARCHITECTURE & CODE 🏗️

### ✅ Excellents Points
- Séparation Controller/Service/Repository respectée
- DTOs utilisés correctement (pas d'exposition des entities)
- Lombok bien utilisé
- Transactions bien gérées (`@Transactional`)
- Tests structurés

### ⚠️ MOYEN - Mapping Manuel Entity ↔ DTO
**Fichier**: Tous les DTOs

**Problème**: Mapping répétitif et verbeux
```java
public static EventDto fromEntity(Event entity) {
    EventDto dto = new EventDto();
    dto.setId(entity.getId());
    dto.setTitle(entity.getTitle());
    // 15 lignes de mapping...
}
```

**Solution**: MapStruct (optionnel, mais recommandé pour 84 fichiers)
```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
```

```java
@Mapper(componentModel = "spring")
public interface EventMapper {
    EventDto toDto(Event entity);
    Event toEntity(CreateEventRequest request);
    List<EventDto> toDtoList(List<Event> entities);
}
```

---

## 6. RECOMMANDATIONS PRIORITAIRES 🎯

### Urgence P0 (Cette semaine)
1. ✅ Activer Spring Security avec JWT filter
2. ✅ Remplacer token custom par JWT signé (jjwt)
3. ✅ Déplacer archivage vers @Scheduled
4. ✅ Externaliser secrets en variables d'environnement

### Priorité P1 (Ce mois)
5. ✅ Implémenter rate limiting sur /auth/login
6. ✅ Ajouter cache Caffeine pour Settings/Events
7. ✅ Ajouter pagination sur GET /events et /releases
8. ✅ Créer profils dev/prod

### Nice to Have P2
9. ⭐ MapStruct pour mappings
10. ⭐ Observability (Micrometer + Prometheus)
11. ⭐ Health checks avancés (DB, externe APIs)

---

## 7. CHECKLIST DE MISE EN PRODUCTION 📋

- [ ] JWT avec signature et expiration
- [ ] Spring Security activé (pas de .permitAll())
- [ ] Rate limiting sur endpoints sensibles
- [ ] Secrets en variables d'environnement
- [ ] Profil prod configuré (logs, ddl-auto=validate)
- [ ] HTTPS activé (TLS 1.3)
- [ ] CORS restreint aux domaines autorisés
- [ ] Archivage en tâche planifiée
- [ ] Monitoring (actuator + prometheus)
- [ ] Backup base de données automatisé
- [ ] Tests de charge (JMeter/Gatling)
- [ ] Documentation API (Swagger/OpenAPI)

---

## Conclusion

Votre backend est **solide dans l'ensemble** avec une architecture propre, mais présente des **failles de sécurité critiques** qui doivent être corrigées avant toute mise en production.

**Score global**: 6.5/10

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| Architecture | 8/10 | Excellente séparation des couches |
| Sécurité | 3/10 | Critiques: JWT, Spring Security désactivé |
| Performance | 6/10 | N+1 queries, archivage synchrone |
| Qualité Code | 8/10 | Propre, tests, Lombok |
| Configuration | 5/10 | Secrets hardcodés, pas de profils |

**Temps estimé correction P0**: 2-3 jours
**Temps estimé P1**: 3-5 jours

---
**Fin de l'audit** - Pour toute question: cf. CLAUDE.md
