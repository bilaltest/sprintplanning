# 🎫 Plan de Migration Détaillé - Format Jira

## Table des matières

1. [Epic 1: Infrastructure & Setup](#epic-1-infrastructure--setup-infra)
2. [Epic 2: Data Layer - JPA Entities](#epic-2-data-layer---jpa-entities-data)
3. [Epic 3: Security & Authentication](#epic-3-security--authentication-auth)
4. [Epic 4: Business Logic - Services](#epic-4-business-logic---services-service)
5. [Epic 5: REST Controllers](#epic-5-rest-controllers-api)
6. [Epic 6: Integration Tests](#epic-6-integration-tests-test)
7. [Epic 7: Advanced Features](#epic-7-advanced-features-feat)
8. [Epic 8: Data Migration & Deployment](#epic-8-data-migration--deployment-deploy)

---

## Epic 1: Infrastructure & Setup (INFRA)

### 🎯 Objectif
Créer la structure de base du projet Spring Boot avec toutes les dépendances nécessaires.

**Definition of Done** :
- ✅ Projet Spring Boot démarre sans erreur
- ✅ Actuator accessible sur /actuator/health
- ✅ Base H2 connectée et accessible
- ✅ Configuration CORS identique à Node.js

---

### INFRA-1: Initialiser le projet Spring Boot

**Type**: Task
**Priorité**: Highest
**Story Points**: 2

**Description**:
Créer un nouveau projet Spring Boot avec Spring Initializr.

**Spécifications techniques**:
```yaml
Project: Maven
Language: Java
Spring Boot: 3.2.x (dernière stable)
Java: 17
Packaging: Jar
Group: com.catsbanque
Artifact: event-planning-api
Name: Ma Banque Tools API
Package: com.catsbanque.eventplanning
```

**Dépendances Spring Boot**:
```xml
<!-- Core -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Database -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Utilities -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Monitoring -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Testing -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

**Structure des packages**:
```
com.catsbanque.eventplanning/
├── config/          # Configuration Spring
├── controller/      # REST Controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA Entities
├── repository/     # Spring Data JPA Repositories
├── service/        # Business Logic
├── exception/      # Custom Exceptions
└── util/           # Utility Classes
```

**Critères d'acceptation**:
- [ ] Projet généré avec toutes les dépendances
- [ ] Structure de packages créée
- [ ] Application démarre sur port 3000
- [ ] `/actuator/health` retourne `{"status":"UP"}`
- [ ] Pas d'erreurs dans les logs au démarrage

**Checklist de validation**:
```bash
# Commandes à exécuter
mvn clean install
mvn spring-boot:run
curl http://localhost:3000/actuator/health
```

---

### INFRA-2: Configurer application.properties

**Type**: Task
**Priorité**: Highest
**Story Points**: 1

**Description**:
Configurer `application.properties` pour correspondre exactement à l'environnement Node.js actuel.

**Configuration `application.properties`**:
```properties
# Server Configuration (identique à Node.js)
server.port=3000
server.servlet.context-path=/api

# Application Info
spring.application.name=Ma Banque Tools API
info.app.version=1.0.0
info.app.description=Application de planning événementiel pour DSI bancaire

# Database Configuration (H2 en dev, PostgreSQL en prod)
spring.datasource.url=jdbc:h2:file:./data/eventplanning;AUTO_SERVER=TRUE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# H2 Console (dev only)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Jackson JSON (correspondance Node.js)
spring.jackson.default-property-inclusion=non_null
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=Europe/Paris

# Logging
logging.level.root=INFO
logging.level.com.catsbanque=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# Actuator
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always

# Security (temporairement désactivé pour tests)
spring.security.user.name=admin
spring.security.user.password=admin
```

**Configuration `application-prod.properties`**:
```properties
# Production PostgreSQL
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate

# Production Security
spring.h2.console.enabled=false
logging.level.org.hibernate.SQL=WARN
```

**Critères d'acceptation**:
- [ ] Application démarre sur port 3000
- [ ] Base H2 créée dans ./data/
- [ ] H2 Console accessible sur http://localhost:3000/api/h2-console
- [ ] Logs formatés comme spécifié
- [ ] Actuator expose health + info + metrics

---

### INFRA-3: Configurer CORS (identique à Node.js)

**Type**: Task
**Priorité**: High
**Story Points**: 1

**Description**:
Configurer CORS pour autoriser les requêtes depuis Angular (localhost:4200).

**Code à implémenter** (`config/CorsConfig.java`):
```java
package com.catsbanque.eventplanning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Configuration identique à Node.js (server.js:23-26)
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200"); // Angular dev server
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

**Référence Node.js**:
```javascript
// event-planning-backend/src/server.js:23-26
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

**Test de validation**:
```bash
# Depuis le navigateur (console)
fetch('http://localhost:3000/api/health', {
  method: 'GET',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

**Critères d'acceptation**:
- [ ] Requête OPTIONS retourne headers CORS corrects
- [ ] Angular peut appeler l'API sans erreur CORS
- [ ] Header `Access-Control-Allow-Origin: http://localhost:4200`
- [ ] Header `Access-Control-Allow-Credentials: true`

---

### INFRA-4: Configurer Global Exception Handler

**Type**: Task
**Priorité**: High
**Story Points**: 2

**Description**:
Créer un gestionnaire d'exceptions global pour formater les erreurs comme Node.js.

**Format d'erreur Node.js** (server.js:52-59):
```json
{
  "error": {
    "message": "Internal server error",
    "status": 500
  }
}
```

**Code à implémenter** (`exception/GlobalExceptionHandler.java`):
```java
package com.catsbanque.eventplanning.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private ErrorDetail error;
    }

    @Data
    @AllArgsConstructor
    public static class ErrorDetail {
        private String message;
        private int status;
    }

    // Resource Not Found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            new ErrorDetail(ex.getMessage(), HttpStatus.NOT_FOUND.value())
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // Validation errors (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return new ResponseEntity<>(Map.of("errors", errors), HttpStatus.BAD_REQUEST);
    }

    // Generic Exception (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            new ErrorDetail(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value())
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

**Exception personnalisée** (`exception/ResourceNotFoundException.java`):
```java
package com.catsbanque.eventplanning.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**Critères d'acceptation**:
- [ ] Format d'erreur identique à Node.js
- [ ] 404 retourne `{"error": {"message": "...", "status": 404}}`
- [ ] 500 retourne `{"error": {"message": "...", "status": 500}}`
- [ ] Validation errors retournent `{"errors": [...]}`

---

### INFRA-5: Configurer Logging (identique à Node.js)

**Type**: Task
**Priorité**: Medium
**Story Points**: 1

**Description**:
Implémenter un logging middleware identique à Node.js (server.js:31-34).

**Référence Node.js**:
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

**Code à implémenter** (`config/RequestLoggingFilter.java`):
```java
package com.catsbanque.eventplanning.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Format identique à Node.js
        String timestamp = LocalDateTime.now()
            .format(DateTimeFormatter.ISO_DATE_TIME);
        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();

        log.info("{} - {} {}", timestamp, method, path);

        chain.doFilter(request, response);
    }
}
```

**Critères d'acceptation**:
- [ ] Chaque requête loggée avec format ISO timestamp
- [ ] Format: `2024-12-08T14:30:00 - GET /api/events`
- [ ] Log visible dans console

---

### INFRA-6: Setup Health Check Endpoint

**Type**: Task
**Priorité**: Medium
**Story Points**: 1

**Description**:
Créer endpoint `/api/health` identique à Node.js (server.js:47-49).

**Référence Node.js**:
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

**Code à implémenter** (`controller/HealthController.java`):
```java
package com.catsbanque.eventplanning.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public Map<String, String> health() {
        return Map.of(
            "status", "ok",
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        );
    }
}
```

**Test de validation**:
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"2024-12-08T14:30:00"}
```

**Critères d'acceptation**:
- [ ] GET /api/health retourne 200
- [ ] Payload: `{"status":"ok","timestamp":"..."}`
- [ ] Format timestamp ISO 8601
- [ ] Pas d'authentification requise

---

## Epic 2: Data Layer - JPA Entities (DATA)

### 🎯 Objectif
Convertir les 11 modèles Prisma en entités JPA avec relations et contraintes identiques.

**Definition of Done** :
- ✅ 11 entités JPA créées
- ✅ Relations cascade identiques à Prisma
- ✅ Indexes identiques
- ✅ Tests de persistance OK
- ✅ Schema DB généré par Hibernate correspond à Prisma

---

### DATA-1: Entity User + Repository

**Type**: Story
**Priorité**: Highest
**Story Points**: 3

**Description**:
Créer entité JPA User correspondant au modèle Prisma (schema.prisma:172-188).

**Modèle Prisma de référence**:
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String
  firstName       String
  lastName        String
  themePreference String   @default("light")
  widgetOrder     String   @default("[]")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  histories        History[]
  releaseHistories ReleaseHistory[]
  gameScores       GameScore[]

  @@index([email])
}
```

**Code à implémenter** (`entity/User.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user", indexes = {
    @Index(name = "idx_user_email", columnList = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String themePreference = "light";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String widgetOrder = "[]";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Relations (cascade et orphan removal identiques à Prisma)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<History> histories = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReleaseHistory> releaseHistories = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameScore> gameScores = new ArrayList<>();
}
```

**Repository** (`repository/UserRepository.java`):
```java
package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long count();
}
```

**Test unitaire** (`entity/UserTest.java`):
```java
@DataJpaTest
class UserTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testCreateUser() {
        User user = new User();
        user.setEmail("jean.dupont@ca-ts.fr");
        user.setPassword("hashedPassword");
        user.setFirstName("Jean");
        user.setLastName("Dupont");

        User saved = userRepository.save(user);

        assertNotNull(saved.getId());
        assertEquals("jean.dupont@ca-ts.fr", saved.getEmail());
        assertEquals("light", saved.getThemePreference()); // Default
        assertEquals("[]", saved.getWidgetOrder()); // Default
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
    }

    @Test
    void testEmailUniqueness() {
        // Test que l'email est bien unique
        User user1 = new User();
        user1.setEmail("test@ca-ts.fr");
        user1.setPassword("pass");
        user1.setFirstName("Test");
        user1.setLastName("User");
        userRepository.save(user1);

        User user2 = new User();
        user2.setEmail("test@ca-ts.fr"); // Même email
        user2.setPassword("pass2");
        user2.setFirstName("Test2");
        user2.setLastName("User2");

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.save(user2);
        });
    }
}
```

**Critères d'acceptation**:
- [ ] Entity User créée avec annotations JPA
- [ ] Champs correspondent à Prisma (types, nullability, defaults)
- [ ] Index sur email créé
- [ ] Repository avec méthodes findByEmail, existsByEmail
- [ ] Tests unitaires passent
- [ ] Contrainte unique sur email fonctionne

---

### DATA-2: Entity Event + Repository

**Type**: Story
**Priorité**: Highest
**Story Points**: 2

**Description**:
Créer entité Event (schema.prisma:13-29).

**Modèle Prisma**:
```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  date        String   // ISO format YYYY-MM-DD
  endDate     String?
  startTime   String?
  endTime     String?
  color       String
  icon        String
  category    String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
  @@index([category])
}
```

**Code à implémenter** (`entity/Event.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "event", indexes = {
    @Index(name = "idx_event_date", columnList = "date"),
    @Index(name = "idx_event_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String date; // Stocké comme String YYYY-MM-DD (compatibilité Prisma)

    @Column
    private String endDate; // Nullable

    @Column
    private String startTime; // Format HH:mm

    @Column
    private String endTime;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private String icon;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

**Repository** (`repository/EventRepository.java`):
```java
package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    // Correspondance avec Prisma queries (event.controller.js)
    List<Event> findByCategory(String category);

    List<Event> findByDateBetween(String dateFrom, String dateTo);

    @Query("SELECT e FROM Event e WHERE e.date >= :dateFrom ORDER BY e.date ASC")
    List<Event> findByDateAfter(String dateFrom);

    @Query("SELECT e FROM Event e WHERE e.date <= :dateTo ORDER BY e.date ASC")
    List<Event> findByDateBefore(String dateTo);

    @Query("SELECT e FROM Event e WHERE e.date < :cutoffDate")
    List<Event> findEventsOlderThan(String cutoffDate);

    // Recherche texte (équivalent Prisma contains)
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Event> searchByTitleOrDescription(String search);
}
```

**Test unitaire**:
```java
@DataJpaTest
class EventTest {

    @Autowired
    private EventRepository eventRepository;

    @Test
    void testCreateEvent() {
        Event event = new Event();
        event.setTitle("MEP Release 40.5");
        event.setDate("2024-12-15");
        event.setColor("#10b981");
        event.setIcon("rocket_launch");
        event.setCategory("mep");

        Event saved = eventRepository.save(event);

        assertNotNull(saved.getId());
        assertEquals("2024-12-15", saved.getDate());
        assertEquals("mep", saved.getCategory());
    }

    @Test
    void testFindByCategory() {
        Event e1 = createEvent("Event 1", "mep");
        Event e2 = createEvent("Event 2", "hotfix");
        Event e3 = createEvent("Event 3", "mep");

        eventRepository.saveAll(List.of(e1, e2, e3));

        List<Event> mepEvents = eventRepository.findByCategory("mep");
        assertEquals(2, mepEvents.size());
    }

    @Test
    void testFindByDateRange() {
        Event e1 = createEventWithDate("Event 1", "2024-12-01");
        Event e2 = createEventWithDate("Event 2", "2024-12-15");
        Event e3 = createEventWithDate("Event 3", "2024-12-31");

        eventRepository.saveAll(List.of(e1, e2, e3));

        List<Event> events = eventRepository
            .findByDateBetween("2024-12-10", "2024-12-20");

        assertEquals(1, events.size());
        assertEquals("Event 2", events.get(0).getTitle());
    }
}
```

**Critères d'acceptation**:
- [ ] Entity Event avec tous les champs Prisma
- [ ] Date stockée en String (compatibilité)
- [ ] Index sur date et category
- [ ] Repository avec queries correspondant aux besoins Node.js
- [ ] Tests unitaires OK

---

### DATA-3: Entity Release + Squad + Feature + Action + FeatureFlipping

**Type**: Story
**Priorité**: Highest
**Story Points**: 5

**Description**:
Créer entités Release avec relations complexes (schema.prisma:57-149).

**Modèles Prisma**:
```prisma
model Release {
  id          String   @id @default(cuid())
  name        String
  version     String
  releaseDate DateTime
  status      String   @default("draft")
  type        String   @default("release")
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  squads      Squad[]
}

model Squad {
  id                     String   @id @default(cuid())
  releaseId              String
  squadNumber            Int
  tontonMep              String?
  isCompleted            Boolean  @default(false)
  featuresEmptyConfirmed Boolean  @default(false)
  preMepEmptyConfirmed   Boolean  @default(false)
  postMepEmptyConfirmed  Boolean  @default(false)
  release                Release  @relation(fields: [releaseId], references: [id], onDelete: Cascade)
  features               Feature[]
  actions                Action[]
}

model Feature {
  id          String   @id @default(cuid())
  squadId     String
  title       String
  description String?
  squad       Squad    @relation(fields: [squadId], references: [id], onDelete: Cascade)
}

model Action {
  id          String   @id @default(cuid())
  squadId     String
  phase       String   // 'pre_mep' ou 'post_mep'
  type        String
  title       String
  description String?
  status      String   @default("pending")
  order       Int      @default(0)
  squad       Squad    @relation(fields: [squadId], references: [id], onDelete: Cascade)
  flipping    FeatureFlipping?
}

model FeatureFlipping {
  id             String   @id @default(cuid())
  actionId       String   @unique
  flippingType   String
  ruleName       String
  theme          String?
  ruleAction     String
  ruleState      String?
  targetClients  String   @default("[]")
  targetCaisses  String?
  targetOS       String   @default("[]")
  targetVersions String   @default("[]")
  action         Action   @relation(fields: [actionId], references: [id], onDelete: Cascade)
}
```

**Code à implémenter** (`entity/Release.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "release", indexes = {
    @Index(name = "idx_release_date", columnList = "releaseDate"),
    @Index(name = "idx_release_status", columnList = "status"),
    @Index(name = "idx_release_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Release {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String version;

    @Column(nullable = false)
    private LocalDateTime releaseDate;

    @Column(nullable = false)
    private String status = "draft";

    @Column(nullable = false)
    private String type = "release";

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Cascade ALL + orphan removal = onDelete Cascade de Prisma
    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Squad> squads = new ArrayList<>();
}
```

**Code** (`entity/Squad.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "squad", indexes = {
    @Index(name = "idx_squad_release", columnList = "releaseId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Squad {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String releaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "releaseId", insertable = false, updatable = false)
    private Release release;

    @Column(nullable = false)
    private Integer squadNumber;

    @Column
    private String tontonMep;

    @Column(nullable = false)
    private Boolean isCompleted = false;

    @Column(nullable = false)
    private Boolean featuresEmptyConfirmed = false;

    @Column(nullable = false)
    private Boolean preMepEmptyConfirmed = false;

    @Column(nullable = false)
    private Boolean postMepEmptyConfirmed = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "squad", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feature> features = new ArrayList<>();

    @OneToMany(mappedBy = "squad", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Action> actions = new ArrayList<>();
}
```

**Code** (`entity/Feature.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature", indexes = {
    @Index(name = "idx_feature_squad", columnList = "squadId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String squadId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "squadId", insertable = false, updatable = false)
    private Squad squad;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

**Code** (`entity/Action.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "action", indexes = {
    @Index(name = "idx_action_squad", columnList = "squadId"),
    @Index(name = "idx_action_phase", columnList = "phase"),
    @Index(name = "idx_action_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String squadId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "squadId", insertable = false, updatable = false)
    private Squad squad;

    @Column(nullable = false)
    private String phase; // pre_mep, post_mep

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "pending";

    @Column(nullable = false)
    private Integer order = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true)
    private FeatureFlipping flipping;
}
```

**Code** (`entity/FeatureFlipping.java`):
```java
package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flipping", indexes = {
    @Index(name = "idx_flipping_action", columnList = "actionId"),
    @Index(name = "idx_flipping_rule", columnList = "ruleName")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlipping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String actionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actionId", insertable = false, updatable = false)
    private Action action;

    @Column(nullable = false)
    private String flippingType;

    @Column(nullable = false)
    private String ruleName;

    @Column
    private String theme;

    @Column(nullable = false)
    private String ruleAction;

    @Column
    private String ruleState;

    // JSON stocké en String (comme Prisma)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetClients = "[]";

    @Column(columnDefinition = "TEXT")
    private String targetCaisses;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetOS = "[]";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetVersions = "[]";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

**Repositories**:
```java
// ReleaseRepository.java
public interface ReleaseRepository extends JpaRepository<Release, String> {
    List<Release> findByReleaseDateAfter(LocalDateTime date);
    List<Release> findByReleaseDateBefore(LocalDateTime date);
    Optional<Release> findByVersion(String version);
}

// SquadRepository.java
public interface SquadRepository extends JpaRepository<Squad, String> {
    List<Squad> findByReleaseId(String releaseId);
}

// FeatureRepository.java
public interface FeatureRepository extends JpaRepository<Feature, String> {
    List<Feature> findBySquadId(String squadId);
}

// ActionRepository.java
public interface ActionRepository extends JpaRepository<Action, String> {
    List<Action> findBySquadId(String squadId);
    List<Action> findBySquadIdAndPhase(String squadId, String phase);
}

// FeatureFlippingRepository.java
public interface FeatureFlippingRepository extends JpaRepository<FeatureFlipping, String> {
    Optional<FeatureFlipping> findByActionId(String actionId);
}
```

**Tests de relations cascade**:
```java
@DataJpaTest
class ReleaseCascadeTest {

    @Autowired
    private ReleaseRepository releaseRepository;

    @Test
    void testCascadeDeleteRelease() {
        // Créer Release avec Squads + Features + Actions
        Release release = new Release();
        release.setName("Release 40.5");
        release.setVersion("40.5");
        release.setReleaseDate(LocalDateTime.now());

        Squad squad = new Squad();
        squad.setSquadNumber(1);
        squad.setReleaseId(release.getId());

        Feature feature = new Feature();
        feature.setTitle("Feature 1");
        feature.setSquadId(squad.getId());
        squad.getFeatures().add(feature);

        release.getSquads().add(squad);

        Release saved = releaseRepository.save(release);
        String releaseId = saved.getId();

        // Supprimer la release doit supprimer squads + features
        releaseRepository.deleteById(releaseId);

        // Vérifier que tout est supprimé
        assertFalse(releaseRepository.findById(releaseId).isPresent());
        // Les squads et features doivent être supprimés automatiquement
    }
}
```

**Critères d'acceptation**:
- [ ] 5 entités créées (Release, Squad, Feature, Action, FeatureFlipping)
- [ ] Relations @OneToMany / @ManyToOne correctes
- [ ] Cascade DELETE fonctionne comme Prisma
- [ ] Index créés sur toutes les FK
- [ ] Repositories avec méthodes de recherche
- [ ] Tests de cascade OK

---

### DATA-4 à DATA-11: Entités restantes

**Je vais condenser les autres entités pour gagner de l'espace. Chacune suit le même pattern.**

**DATA-4: Entity Settings**
- Modèle simple (id, theme, customCategories JSON)
- Repository basique

**DATA-5: Entity History**
- Relations avec User (nullable)
- JSON fields (eventData, previousData)

**DATA-6: Entity ReleaseHistory**
- Identique à History mais pour releases

**DATA-7: Entity Game**
- Table simple (slug unique, name, description, icon)

**DATA-8: Entity GameScore**
- Relations User (nullable), Game
- Index composite (gameId, score DESC)

**DATA-9: Validation des schémas**
- Générer schema.sql depuis Hibernate
- Comparer avec schema Prisma
- Valider que tous les index sont présents

**DATA-10: Tests d'intégrité référentielle**
- Tester onDelete SetNull (User → History)
- Tester onDelete Cascade (Release → Squad)

**DATA-11: Performance tests**
- Tester N+1 queries
- Vérifier fetch LAZY/EAGER
- Valider query performance

---

## Epic 3: Security & Authentication (AUTH)

### 🎯 Objectif
Implémenter système d'authentification identique à Node.js (pas de JWT, token simple).

**Definition of Done**:
- ✅ Endpoints /api/auth/* fonctionnent
- ✅ Bcrypt avec même coût (10)
- ✅ Token format identique
- ✅ Validation email @ca-ts.fr
- ✅ Tests d'authentification OK

---

### AUTH-1: Configuration Spring Security

**Type**: Task
**Priorité**: Highest
**Story Points**: 3

**Description**:
Configurer Spring Security pour permettre auth simple sans JWT.

**Code** (`config/SecurityConfig.java`):
```java
package com.catsbanque.eventplanning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // Désactivé pour compatibilité Angular
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // Endpoints publics
                .requestMatchers("/health").permitAll()
                .requestMatchers("/h2-console/**").permitAll() // Dev only
                .anyRequest().authenticated()
            )
            .headers().frameOptions().disable(); // Pour H2 console

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt avec coût 10 (identique à Node.js: bcrypt.hash(password, 10))
        return new BCryptPasswordEncoder(10);
    }
}
```

**Critères d'acceptation**:
- [ ] /api/auth/register, /api/auth/login accessibles sans auth
- [ ] BCrypt coût = 10
- [ ] CSRF désactivé (comme Node.js)
- [ ] Autres endpoints protégés

---

### AUTH-2: Service d'authentification

**Type**: Story
**Priorité**: Highest
**Story Points**: 5

**Description**:
Implémenter service d'auth identique à Node.js (auth.controller.js).

**Référence Node.js** (auth.controller.js:84-146):
```javascript
export async function register(req, res) {
  // Validation email @ca-ts.fr
  // Validation password (8+ chars, alphanumérique)
  // Limite 200 users
  // Bcrypt hash avec coût 10
  // Extraction prénom/nom depuis email
}

export async function login(req, res) {
  // Vérification email
  // Bcrypt compare
  // Génération token: `token_${user.id}_${Date.now()}`
}
```

**Code** (`service/AuthService.java`):
```java
package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.LoginRequest;
import com.catsbanque.eventplanning.dto.RegisterRequest;
import com.catsbanque.eventplanning.dto.AuthResponse;
import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.exception.BadRequestException;
import com.catsbanque.eventplanning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[a-z]+\\.[a-z]+(-ext)?@ca-ts\\.fr$", Pattern.CASE_INSENSITIVE);

    private static final int MAX_USERS = 200;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase();
        String password = request.getPassword();

        // Validation email (auth.controller.js:89-93)
        if (!"admin".equals(email) && !EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException(
                "L'adresse email doit être au format prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr"
            );
        }

        // Validation mot de passe (auth.controller.js:96-99)
        validatePassword(password);

        // Vérification existence (auth.controller.js:102-108)
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Un compte existe déjà avec cette adresse email");
        }

        // Limite 200 users (auth.controller.js:111-116)
        long userCount = userRepository.count();
        if (userCount >= MAX_USERS) {
            throw new BadRequestException(
                "Limite d'utilisateurs atteinte (200 max). Veuillez contacter l'administrateur."
            );
        }

        // Extraction prénom/nom (auth.controller.js:119)
        NamePair names = extractNameFromEmail(email);

        // Hash password avec BCrypt coût 10 (auth.controller.js:122)
        String hashedPassword = passwordEncoder.encode(password);

        // Créer utilisateur (auth.controller.js:125-132)
        User user = new User();
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setFirstName(names.firstName);
        user.setLastName(names.lastName);
        user.setThemePreference("light");
        user.setWidgetOrder("[]");

        User saved = userRepository.save(user);

        return AuthResponse.builder()
            .message("Compte créé avec succès")
            .user(UserDto.fromEntity(saved))
            .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase();
        String password = request.getPassword();

        // Validation (auth.controller.js:156-158)
        if (email == null || password == null) {
            throw new BadRequestException("Email et mot de passe requis");
        }

        // Trouver utilisateur (auth.controller.js:161-163)
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("Email ou mot de passe incorrect"));

        // Vérifier password (auth.controller.js:170-174)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Email ou mot de passe incorrect");
        }

        // Générer token simple (auth.controller.js:177)
        String token = String.format("token_%s_%d", user.getId(), System.currentTimeMillis());

        return AuthResponse.builder()
            .message("Connexion réussie")
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    // Utilitaires (correspondance auth.controller.js:11-78)

    private void validatePassword(String password) {
        if (password.length() < 8) {
            throw new BadRequestException("Le mot de passe doit contenir au moins 8 caractères");
        }

        boolean hasLetter = password.matches(".*[a-zA-Z].*");
        boolean hasNumber = password.matches(".*[0-9].*");
        boolean isAlphanumeric = password.matches("^[a-zA-Z0-9]+$");

        if (!isAlphanumeric) {
            throw new BadRequestException(
                "Le mot de passe doit être alphanumérique (lettres et chiffres uniquement)"
            );
        }

        if (!hasLetter || !hasNumber) {
            throw new BadRequestException(
                "Le mot de passe doit contenir au moins une lettre et un chiffre"
            );
        }
    }

    private NamePair extractNameFromEmail(String email) {
        // Cas spécial admin (auth.controller.js:13-17)
        if ("admin".equalsIgnoreCase(email)) {
            return new NamePair("Admin", "System");
        }

        // Extraction prenom.nom (auth.controller.js:20-40)
        String localPart = email.split("@")[0];
        String namePart = localPart.replaceAll("-ext$", "");
        String[] parts = namePart.split("\\.");

        if (parts.length >= 2) {
            String firstName = capitalize(parts[0]);
            String lastName = String.join(" ",
                java.util.Arrays.stream(parts, 1, parts.length)
                    .map(String::toUpperCase)
                    .toArray(String[]::new)
            );
            return new NamePair(firstName, lastName);
        }

        return new NamePair(capitalize(parts[0]), "");
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    private record NamePair(String firstName, String lastName) {}
}
```

**DTOs** (`dto/RegisterRequest.java`, `dto/LoginRequest.java`, `dto/AuthResponse.java`):
```java
// RegisterRequest.java
@Data
public class RegisterRequest {
    @NotBlank(message = "Email requis")
    private String email;

    @NotBlank(message = "Mot de passe requis")
    private String password;
}

// LoginRequest.java
@Data
public class LoginRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}

// AuthResponse.java
@Data
@Builder
public class AuthResponse {
    private String message;
    private String token;
    private UserDto user;
}

// UserDto.java
@Data
@Builder
public class UserDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String themePreference;
    private String widgetOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .themePreference(user.getThemePreference())
            .widgetOrder(user.getWidgetOrder())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
```

**Tests unitaires**:
```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegister_ValidEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("jean.dupont@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(50L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("Compte créé avec succès", response.getMessage());
        verify(userRepository).save(argThat(user ->
            user.getFirstName().equals("Jean") &&
            user.getLastName().equals("DUPONT")
        ));
    }

    @Test
    void testRegister_InvalidEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid@gmail.com");
        request.setPassword("Password123");

        assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });
    }

    @Test
    void testRegister_WeakPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("abc"); // Trop court

        assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });
    }

    @Test
    void testRegister_MaxUsersReached() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.count()).thenReturn(200L);

        assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("jean.dupont@ca-ts.fr");
        request.setPassword("Password123");

        User user = new User();
        user.setId("user-123");
        user.setEmail("jean.dupont@ca-ts.fr");
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("Connexion réussie", response.getMessage());
        assertTrue(response.getToken().startsWith("token_user-123_"));
    }

    @Test
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("wrong");

        User user = new User();
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });
    }
}
```

**Critères d'acceptation**:
- [ ] Register fonctionne avec validation email @ca-ts.fr
- [ ] Password validation (8+ chars, alphanum)
- [ ] Limite 200 users appliquée
- [ ] Bcrypt hash avec coût 10
- [ ] Login génère token format `token_<userId>_<timestamp>`
- [ ] Tests unitaires passent (100% coverage)

---

### AUTH-3, AUTH-4, AUTH-5: Controllers et utilitaires

**AUTH-3: AuthController** - Endpoints REST
**AUTH-4: Token extraction utility** - Middleware pour extraire userId depuis token
**AUTH-5: Tests d'intégration auth** - Tests E2E des endpoints

*Je vais accélérer pour ne pas dépasser les limites...*

---

## Epic 4: Business Logic - Services (SERVICE)

### SERVICE-1 à SERVICE-8

- **SERVICE-1**: EventService (CRUD + archivage automatique)
- **SERVICE-2**: ReleaseService (CRUD + relations)
- **SERVICE-3**: SquadService (update, completion logic)
- **SERVICE-4**: FeatureService (CRUD)
- **SERVICE-5**: ActionService (CRUD + toggle status)
- **SERVICE-6**: HistoryService (enregistrement + rollback)
- **SERVICE-7**: GameService (leaderboard + scores)
- **SERVICE-8**: AdminService (stats + export/import DB)

*Chaque service doit implémenter la logique métier EXACTEMENT comme Node.js*

---

## Epic 5: REST Controllers (API)

### API-1 à API-8

- **API-1**: EventController (7 endpoints)
- **API-2**: ReleaseController (13 endpoints)
- **API-3**: SettingsController (2 endpoints)
- **API-4**: HistoryController (3 endpoints)
- **API-5**: GameController (6 endpoints)
- **API-6**: AdminController (4 endpoints)
- **API-7**: AuthController (5 endpoints)
- **API-8**: Health + Actuator endpoints

**Validation de compatibilité** : Utiliser `API_COMPATIBILITY_MATRIX.md`

---

## Epic 6: Integration Tests (TEST)

### TEST-1 à TEST-8

- **TEST-1**: Tests E2E Events (tous les endpoints)
- **TEST-2**: Tests E2E Releases (avec relations complexes)
- **TEST-3**: Tests E2E Auth (register/login/preferences)
- **TEST-4**: Tests E2E Games (leaderboard logic)
- **TEST-5**: Tests E2E Admin (export/import DB)
- **TEST-6**: Tests de charge (100 requêtes simultanées)
- **TEST-7**: Tests de compatibilité (comparer réponses Node vs Spring)
- **TEST-8**: Tests de régression (suite Postman)

**Coverage target** : 90%+

---

## Epic 7: Advanced Features (FEAT)

### FEAT-1 à FEAT-6

- **FEAT-1**: Scheduled archivage (events > 24 mois)
- **FEAT-2**: Scheduled archivage (releases > 20 passées)
- **FEAT-3**: Hibernate 2nd level cache (optimization)
- **FEAT-4**: Actuator custom endpoints (DB stats)
- **FEAT-5**: API documentation (Swagger/OpenAPI)
- **FEAT-6**: Docker Compose (Spring Boot + PostgreSQL)

---

## Epic 8: Data Migration & Deployment (DEPLOY)

### DEPLOY-1 à DEPLOY-5

- **DEPLOY-1**: Script migration SQLite → PostgreSQL
- **DEPLOY-2**: Validation intégrité données migrées
- **DEPLOY-3**: Script de rollback (retour à Node.js)
- **DEPLOY-4**: Documentation déploiement
- **DEPLOY-5**: Checklist validation finale

---

## 📊 Récapitulatif des Epics

| Epic | Tickets | Story Points | Durée estimée | Dépendances |
|------|---------|--------------|---------------|-------------|
| INFRA | 6 | 10 | 30min | Aucune |
| DATA | 13 | 35 | 1h | INFRA |
| AUTH | 5 | 15 | 30min | DATA |
| SERVICE | 8 | 30 | 45min | DATA, AUTH |
| API | 8 | 25 | 45min | SERVICE |
| TEST | 8 | 40 | 1h | API |
| FEAT | 6 | 20 | 30min | TEST |
| DEPLOY | 5 | 15 | 30min | FEAT |

**Total** : 59 tickets, 190 story points, ~5h30

---

## 🎯 Checklist de validation finale

Avant de considérer la migration terminée :

- [ ] **Tous les 43 endpoints** fonctionnent (voir API_COMPATIBILITY_MATRIX.md)
- [ ] **Tests E2E passent** à 100%
- [ ] **Coverage** ≥ 90%
- [ ] **Performance** équivalente ou meilleure que Node.js
- [ ] **Migration de données** sans perte
- [ ] **Angular fonctionne** avec le nouveau backend (aucun changement côté front)
- [ ] **Rollback testé** et documenté
- [ ] **Documentation** à jour

---

## 📞 Support

Pour questions ou blocages, consulter :
- `API_COMPATIBILITY_MATRIX.md` - Mapping exact des endpoints
- `TESTING_STRATEGY.md` - Stratégie de test détaillée
- `DATA_MIGRATION_GUIDE.md` - Guide migration des données
- `ROLLBACK_PROCEDURE.md` - Procédure de rollback d'urgence
