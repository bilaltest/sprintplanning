# 🧪 Stratégie de Test - Migration Spring Boot

## Objectif

**Garantir ZÉRO régression fonctionnelle** lors de la migration Node.js → Spring Boot.

---

## 🎯 Pyramide de tests

```
                 /\
                /  \
               / E2E \          5% (43 endpoints)
              /--------\
             /  Integ   \       25% (Services + DB)
            /------------\
           /    Unit      \     70% (Logic + Entities)
          /----------------\
```

**Target coverage** : ≥ 90%

---

## 1️⃣ Tests Unitaires (70%)

### 1.1 Entity Tests

**Objectif** : Valider annotations JPA, contraintes, defaults.

**Exemple** (`UserTest.java`):
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testCreateUser_WithDefaults() {
        User user = new User();
        user.setEmail("test@ca-ts.fr");
        user.setPassword("hashed");
        user.setFirstName("Test");
        user.setLastName("User");

        User saved = userRepository.save(user);

        assertNotNull(saved.getId());
        assertEquals("light", saved.getThemePreference()); // Default
        assertEquals("[]", saved.getWidgetOrder()); // Default
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
    }

    @Test
    void testEmailUniqueness() {
        User user1 = createUser("test@ca-ts.fr");
        userRepository.save(user1);

        User user2 = createUser("test@ca-ts.fr"); // Duplicate

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.save(user2);
            userRepository.flush(); // Force constraint check
        });
    }

    @Test
    void testCascadeDelete() {
        User user = createUser("test@ca-ts.fr");
        History history = new History();
        history.setAction("create");
        history.setEventData("{}");
        user.getHistories().add(history);

        User saved = userRepository.save(user);
        String userId = saved.getId();

        userRepository.deleteById(userId);

        // Histories should be cascade deleted
        assertFalse(userRepository.findById(userId).isPresent());
    }
}
```

**Coverage** :
- [ ] Tous les champs avec defaults
- [ ] Contraintes UNIQUE
- [ ] Contraintes NOT NULL
- [ ] Relations @OneToMany / @ManyToOne
- [ ] Cascade DELETE / SET NULL
- [ ] Timestamps (@CreationTimestamp, @UpdateTimestamp)

**À tester pour chaque entité** :
- User
- Event
- Release
- Squad
- Feature
- Action
- FeatureFlipping
- Settings
- History
- ReleaseHistory
- Game
- GameScore

---

### 1.2 Service Tests (avec Mocks)

**Objectif** : Valider logique métier sans DB.

**Exemple** (`AuthServiceTest.java`):
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
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("jean.dupont@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(50L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("generated-id");
            return user;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("Compte créé avec succès", response.getMessage());
        assertNotNull(response.getUser());
        assertEquals("Jean", response.getUser().getFirstName());
        assertEquals("DUPONT", response.getUser().getLastName());
    }

    @Test
    void testRegister_InvalidEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid@gmail.com");
        request.setPassword("Password123");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("@ca-ts.fr"));
    }

    @Test
    void testRegister_WeakPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("abc"); // Trop court

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("8 caractères"));
    }

    @Test
    void testRegister_PasswordNoNumber() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("abcdefgh"); // Pas de chiffre

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("au moins une lettre et un chiffre"));
    }

    @Test
    void testRegister_MaxUsersReached() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.count()).thenReturn(200L); // Limite atteinte

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("200 max"));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("Password123");

        User user = new User();
        user.setId("user-123");
        user.setEmail("test@ca-ts.fr");
        user.setPassword("hashed");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("Connexion réussie", response.getMessage());
        assertNotNull(response.getToken());
        assertTrue(response.getToken().startsWith("token_user-123_"));
    }

    @Test
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@ca-ts.fr");
        request.setPassword("wrong");

        User user = new User();
        user.setPassword("hashed");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("incorrect"));
    }

    @Test
    void testLogin_UserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("notfound@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("incorrect"));
    }

    @Test
    void testExtractNameFromEmail_Standard() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("jean.dupont@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.register(request);

        assertEquals("Jean", response.getUser().getFirstName());
        assertEquals("DUPONT", response.getUser().getLastName());
    }

    @Test
    void testExtractNameFromEmail_WithExt() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("marie.martin-ext@ca-ts.fr");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.register(request);

        assertEquals("Marie", response.getUser().getFirstName());
        assertEquals("MARTIN", response.getUser().getLastName());
    }

    @Test
    void testExtractNameFromEmail_Admin() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("admin");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.register(request);

        assertEquals("Admin", response.getUser().getFirstName());
        assertEquals("System", response.getUser().getLastName());
    }
}
```

**Coverage** :
- [ ] Tous les cas nominaux
- [ ] Tous les cas d'erreur (validation, business rules)
- [ ] Edge cases (null, empty, limites)

**Services à tester** :
- AuthService (register, login)
- EventService (CRUD + archivage)
- ReleaseService (CRUD + relations + archivage)
- SquadService (update, completion)
- FeatureService (CRUD)
- ActionService (CRUD + toggle status)
- HistoryService (create, rollback)
- GameService (leaderboard, scores)
- AdminService (stats, export/import)

---

### 1.3 Repository Tests (Queries personnalisées)

**Objectif** : Valider queries complexes.

**Exemple** (`GameScoreRepositoryTest.java`):
```java
@DataJpaTest
class GameScoreRepositoryTest {

    @Autowired
    private GameScoreRepository gameScoreRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindLeaderboard() {
        // Setup: créer game
        Game game = new Game();
        game.setSlug("typing-fr");
        game.setName("Typing FR");
        game.setIcon("keyboard");
        game = gameRepository.save(game);

        // Setup: créer users
        User user1 = createUser("user1@ca-ts.fr");
        User user2 = createUser("user2@ca-ts.fr");
        userRepository.saveAll(List.of(user1, user2));

        // Setup: créer scores
        gameScoreRepository.save(createScore(game, user1, 100));
        gameScoreRepository.save(createScore(game, user1, 150)); // Meilleur
        gameScoreRepository.save(createScore(game, user2, 120));

        // Execute
        List<Object[]> leaderboard = gameScoreRepository.findLeaderboard(game.getId());

        // Verify
        assertEquals(2, leaderboard.size());
        assertEquals(150, leaderboard.get(0)[4]); // user1 best score
        assertEquals(120, leaderboard.get(1)[4]); // user2 best score
    }

    @Test
    void testFindByDateRange() {
        Event e1 = createEvent("2024-12-01");
        Event e2 = createEvent("2024-12-15");
        Event e3 = createEvent("2024-12-31");
        eventRepository.saveAll(List.of(e1, e2, e3));

        List<Event> events = eventRepository
            .findByDateBetween("2024-12-10", "2024-12-20");

        assertEquals(1, events.size());
        assertEquals(e2.getId(), events.get(0).getId());
    }

    @Test
    void testSearchByTitleOrDescription() {
        Event e1 = createEvent("MEP Release", "Description normale");
        Event e2 = createEvent("Hotfix", "Description avec release");
        Event e3 = createEvent("Autre", "Sans keyword");
        eventRepository.saveAll(List.of(e1, e2, e3));

        List<Event> events = eventRepository.searchByTitleOrDescription("release");

        assertEquals(2, events.size());
        assertTrue(events.stream().anyMatch(e -> e.getId().equals(e1.getId())));
        assertTrue(events.stream().anyMatch(e -> e.getId().equals(e2.getId())));
    }
}
```

**Queries à tester** :
- [ ] EventRepository.findByDateBetween
- [ ] EventRepository.searchByTitleOrDescription
- [ ] EventRepository.findEventsOlderThan (archivage)
- [ ] ReleaseRepository.findByReleaseDateAfter
- [ ] ReleaseRepository.findByVersion
- [ ] GameScoreRepository.findLeaderboard (query complexe)
- [ ] ActionRepository.findBySquadIdAndPhase

---

## 2️⃣ Tests d'Intégration (25%)

### 2.1 Service + Repository Integration

**Objectif** : Tester services avec vraie DB (H2).

**Exemple** (`EventServiceIntegrationTest.java`):
```java
@SpringBootTest
@Transactional
class EventServiceIntegrationTest {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Test
    void testCreateEvent_CreatesHistoryEntry() {
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("MEP Release");
        request.setDate("2024-12-15");
        request.setColor("#10b981");
        request.setIcon("rocket");
        request.setCategory("mep");

        EventDto created = eventService.createEvent(request);

        assertNotNull(created.getId());

        // Vérifier que History entry a été créée
        List<History> histories = historyRepository.findAll();
        assertEquals(1, histories.size());
        History history = histories.get(0);
        assertEquals("create", history.getAction());
        assertEquals(created.getId(), history.getEventId());
        assertNotNull(history.getEventData());
    }

    @Test
    void testUpdateEvent_CreatesHistoryWithPreviousData() {
        // Créer event initial
        Event event = new Event();
        event.setTitle("Old Title");
        event.setDate("2024-12-15");
        event.setColor("#fff");
        event.setIcon("icon");
        event.setCategory("mep");
        Event saved = eventRepository.save(event);

        // Update
        UpdateEventRequest request = new UpdateEventRequest();
        request.setTitle("New Title");
        request.setDate("2024-12-16");
        request.setColor("#000");
        request.setIcon("icon2");
        request.setCategory("hotfix");

        eventService.updateEvent(saved.getId(), request);

        // Vérifier History
        List<History> histories = historyRepository
            .findByAction("update");
        assertEquals(1, histories.size());
        History history = histories.get(0);
        assertNotNull(history.getPreviousData());
        assertTrue(history.getPreviousData().contains("Old Title"));
        assertTrue(history.getEventData().contains("New Title"));
    }

    @Test
    void testArchiveOldEvents() {
        // Créer event ancien (> 24 mois)
        Event oldEvent = new Event();
        oldEvent.setTitle("Old Event");
        oldEvent.setDate("2022-01-01"); // > 24 mois
        oldEvent.setColor("#fff");
        oldEvent.setIcon("icon");
        oldEvent.setCategory("mep");
        eventRepository.save(oldEvent);

        // Créer event récent
        Event recentEvent = new Event();
        recentEvent.setTitle("Recent Event");
        recentEvent.setDate("2024-12-01");
        recentEvent.setColor("#fff");
        recentEvent.setIcon("icon");
        recentEvent.setCategory("mep");
        eventRepository.save(recentEvent);

        // Appeler getAllEvents (déclenche archivage)
        eventService.getAllEvents(null, null, null, null);

        // Vérifier que seul le récent existe
        List<Event> remaining = eventRepository.findAll();
        assertEquals(1, remaining.size());
        assertEquals("Recent Event", remaining.get(0).getTitle());
    }
}
```

**Tests d'intégration à implémenter** :
- [ ] EventService (CRUD + History + Archivage)
- [ ] ReleaseService (CRUD + Relations + History + Archivage)
- [ ] AuthService (Register + Login avec vraie DB et BCrypt)
- [ ] GameService (Leaderboard avec calculs complexes)
- [ ] AdminService (Export/Import avec transaction)

---

### 2.2 Controller + Service Integration (MockMvc)

**Objectif** : Tester endpoints REST sans démarrer serveur.

**Exemple** (`EventControllerTest.java`):
```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Test
    void testGetAllEvents_ReturnsEvents() throws Exception {
        // Setup
        Event event = new Event();
        event.setTitle("MEP Release");
        event.setDate("2024-12-15");
        event.setColor("#10b981");
        event.setIcon("rocket");
        event.setCategory("mep");
        eventRepository.save(event);

        // Execute & Verify
        mockMvc.perform(get("/api/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].title").value("MEP Release"))
            .andExpect(jsonPath("$[0].category").value("mep"));
    }

    @Test
    void testGetAllEvents_WithCategoryFilter() throws Exception {
        eventRepository.save(createEvent("Event 1", "mep"));
        eventRepository.save(createEvent("Event 2", "hotfix"));
        eventRepository.save(createEvent("Event 3", "mep"));

        mockMvc.perform(get("/api/events?category=mep"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void testGetEventById_NotFound() throws Exception {
        mockMvc.perform(get("/api/events/nonexistent"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error.message").value("Event not found"))
            .andExpect(jsonPath("$.error.status").value(404));
    }

    @Test
    void testCreateEvent_Success() throws Exception {
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("New Event");
        request.setDate("2024-12-20");
        request.setColor("#10b981");
        request.setIcon("icon");
        request.setCategory("mep");

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.title").value("New Event"));
    }

    @Test
    void testCreateEvent_ValidationError() throws Exception {
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle(""); // Vide (invalid)
        request.setDate("invalid-date"); // Format invalide
        request.setColor("");
        request.setIcon("");
        request.setCategory("");

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    void testCreateEvent_TitleTooLong() throws Exception {
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("A".repeat(31)); // Max 30
        request.setDate("2024-12-20");
        request.setColor("#fff");
        request.setIcon("icon");
        request.setCategory("mep");

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteEvent_Success() throws Exception {
        Event event = eventRepository.save(createEvent("To Delete", "mep"));

        mockMvc.perform(delete("/api/events/" + event.getId()))
            .andExpect(status().isNoContent());

        assertFalse(eventRepository.findById(event.getId()).isPresent());
    }
}
```

**Controllers à tester** (avec MockMvc) :
- [ ] AuthController (5 endpoints)
- [ ] EventController (7 endpoints)
- [ ] ReleaseController (13 endpoints)
- [ ] SettingsController (2 endpoints)
- [ ] HistoryController (3 endpoints)
- [ ] GameController (6 endpoints)
- [ ] AdminController (4 endpoints)
- [ ] HealthController (1 endpoint)

---

## 3️⃣ Tests End-to-End (5%)

### 3.1 Tests avec RestAssured (vrai serveur)

**Objectif** : Tester l'application complète (démarrage serveur).

**Exemple** (`EventE2ETest.java`):
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EventE2ETest {

    @LocalServerPort
    private int port;

    @Autowired
    private EventRepository eventRepository;

    private String baseUrl;

    @BeforeEach
    void setup() {
        baseUrl = "http://localhost:" + port + "/api";
        RestAssured.port = port;
        eventRepository.deleteAll();
    }

    @Test
    void testFullEventLifecycle() {
        // 1. Create event
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("MEP Release");
        request.setDate("2024-12-15");
        request.setColor("#10b981");
        request.setIcon("rocket");
        request.setCategory("mep");

        String eventId = given()
            .contentType(ContentType.JSON)
            .body(request)
        .when()
            .post(baseUrl + "/events")
        .then()
            .statusCode(201)
            .body("title", equalTo("MEP Release"))
            .extract().path("id");

        // 2. Get event by ID
        given()
        .when()
            .get(baseUrl + "/events/" + eventId)
        .then()
            .statusCode(200)
            .body("title", equalTo("MEP Release"))
            .body("category", equalTo("mep"));

        // 3. Update event
        UpdateEventRequest updateRequest = new UpdateEventRequest();
        updateRequest.setTitle("MEP Release Updated");
        updateRequest.setDate("2024-12-16");
        updateRequest.setColor("#10b981");
        updateRequest.setIcon("rocket");
        updateRequest.setCategory("hotfix");

        given()
            .contentType(ContentType.JSON)
            .body(updateRequest)
        .when()
            .put(baseUrl + "/events/" + eventId)
        .then()
            .statusCode(200)
            .body("title", equalTo("MEP Release Updated"))
            .body("category", equalTo("hotfix"));

        // 4. Delete event
        given()
        .when()
            .delete(baseUrl + "/events/" + eventId)
        .then()
            .statusCode(204);

        // 5. Verify deleted
        given()
        .when()
            .get(baseUrl + "/events/" + eventId)
        .then()
            .statusCode(404);
    }

    @Test
    void testCORS() {
        given()
            .header("Origin", "http://localhost:4200")
        .when()
            .options(baseUrl + "/events")
        .then()
            .statusCode(200)
            .header("Access-Control-Allow-Origin", "http://localhost:4200")
            .header("Access-Control-Allow-Credentials", "true");
    }
}
```

**Scénarios E2E critiques** :
- [ ] Auth flow complet (register → login → use token)
- [ ] Event CRUD complet + History
- [ ] Release avec relations (create → add squads → add features → add actions → delete)
- [ ] Game leaderboard avec scores multiples
- [ ] Admin export/import cycle complet
- [ ] CORS avec Angular origin

---

### 3.2 Tests de Compatibilité (Node.js vs Spring Boot)

**Objectif** : Comparer réponses des 2 backends.

**Méthodologie** :
1. Démarrer Node.js backend (port 3000)
2. Démarrer Spring Boot backend (port 3001)
3. Envoyer mêmes requêtes aux 2
4. Comparer réponses JSON (structure, valeurs)

**Exemple** (`CompatibilityTest.java`):
```java
@Test
void testEventCreation_NodeVsSpring() {
    CreateEventRequest request = new CreateEventRequest();
    request.setTitle("Test Event");
    request.setDate("2024-12-15");
    request.setColor("#10b981");
    request.setIcon("icon");
    request.setCategory("mep");

    // Node.js response
    Response nodeResponse = given()
        .port(3000)
        .contentType(ContentType.JSON)
        .body(request)
    .when()
        .post("/api/events")
    .then()
        .extract().response();

    // Spring Boot response
    Response springResponse = given()
        .port(3001)
        .contentType(ContentType.JSON)
        .body(request)
    .when()
        .post("/api/events")
    .then()
        .extract().response();

    // Compare status codes
    assertEquals(nodeResponse.getStatusCode(), springResponse.getStatusCode());

    // Compare JSON structure (ignore IDs and timestamps)
    JSONAssert.assertEquals(
        nodeResponse.getBody().asString(),
        springResponse.getBody().asString(),
        new CustomComparator(
            JSONCompareMode.LENIENT,
            new Customization("id", (o1, o2) -> true), // Ignore IDs
            new Customization("createdAt", (o1, o2) -> true), // Ignore timestamps
            new Customization("updatedAt", (o1, o2) -> true)
        )
    );
}
```

**Tests de compatibilité** :
- [ ] Tous les 43 endpoints
- [ ] Tous les status codes
- [ ] Tous les formats d'erreur
- [ ] Tous les payloads de réponse

---

## 4️⃣ Tests de Performance

### 4.1 Load Testing (Gatling)

**Objectif** : Valider que Spring Boot ≥ Node.js en performance.

**Scénario** (`EventLoadTest.scala`):
```scala
class EventLoadTest extends Simulation {

  val httpProtocol = http
    .baseUrl("http://localhost:3000")
    .acceptHeader("application/json")

  val scn = scenario("Event Load Test")
    .exec(http("Get All Events")
      .get("/api/events")
      .check(status.is(200)))
    .pause(1)
    .exec(http("Create Event")
      .post("/api/events")
      .body(StringBody("""{"title":"Test","date":"2024-12-15","color":"#fff","icon":"icon","category":"mep"}"""))
      .check(status.is(201)))
    .pause(1)

  setUp(
    scn.inject(
      rampUsers(100) during (30.seconds) // 100 users en 30s
    )
  ).protocols(httpProtocol)
}
```

**Métriques à comparer** :
- [ ] Response time P50 (médiane)
- [ ] Response time P95
- [ ] Response time P99
- [ ] Throughput (req/s)
- [ ] Error rate

**Benchmark target** :
- Node.js : baseline
- Spring Boot : ≥ 95% de Node.js (acceptable)
- Spring Boot : ≥ 100% de Node.js (excellent)

---

### 4.2 Memory & CPU Profiling

**Objectif** : Valider consommation ressources.

**Outils** :
- Node.js : `node --inspect`, Chrome DevTools
- Spring Boot : Actuator metrics, JProfiler

**Métriques** :
- [ ] Memory usage (heap)
- [ ] CPU usage (%)
- [ ] GC pauses (Spring Boot)
- [ ] Thread count

---

## 5️⃣ Tests de Régression

### 5.1 Collection Postman

**Objectif** : Suite de tests réutilisable.

**Étapes** :
1. Exporter collection Postman actuelle (Node.js)
2. Ajouter assertions sur chaque endpoint
3. Exécuter contre Spring Boot
4. Vérifier 100% de succès

**Exemple d'assertion Postman** :
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has correct structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('title');
    pm.expect(jsonData.category).to.eql('mep');
});
```

---

### 5.2 Snapshot Testing

**Objectif** : Détecter changements involontaires de format.

**Approche** :
1. Créer snapshots JSON des réponses Node.js
2. Comparer réponses Spring Boot avec snapshots
3. Fail si différence détectée

**Outil** : JSON-diff, JSONAssert

---

## 6️⃣ Checklist de Validation Finale

### Avant de déployer en prod

- [ ] **Unit tests** : ≥ 90% coverage
- [ ] **Integration tests** : Tous les services testés
- [ ] **E2E tests** : 43 endpoints validés
- [ ] **Compatibility tests** : 100% identique à Node.js
- [ ] **Performance tests** : ≥ 95% de Node.js
- [ ] **Load tests** : 100 users simultanés OK
- [ ] **CORS tests** : Angular fonctionne
- [ ] **Error format tests** : Format identique
- [ ] **Regression tests** : Postman collection 100% success
- [ ] **Memory tests** : Pas de leak
- [ ] **Security tests** : Bcrypt, auth, CORS

---

## 7️⃣ CI/CD Integration

### Pipeline GitHub Actions

```yaml
name: Spring Boot Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'

    - name: Run Unit Tests
      run: mvn test

    - name: Run Integration Tests
      run: mvn verify -Pintegration-tests

    - name: Generate Coverage Report
      run: mvn jacoco:report

    - name: Check Coverage Threshold
      run: mvn jacoco:check

    - name: Run E2E Tests
      run: mvn verify -Pe2e-tests

    - name: Upload Coverage to Codecov
      uses: codecov/codecov-action@v3
```

---

## 8️⃣ Documentation des Tests

### README.md du projet

```markdown
# Running Tests

## Unit Tests
mvn test

## Integration Tests
mvn verify -Pintegration-tests

## E2E Tests
mvn verify -Pe2e-tests

## All Tests
mvn verify -Pall-tests

## Coverage Report
mvn jacoco:report
open target/site/jacoco/index.html
```

---

## 🎯 Résumé

| Type de test | Quantité | Coverage | Priorité |
|--------------|----------|----------|----------|
| Unit (Entities) | 12 | 100% | Highest |
| Unit (Services) | 9 | 90%+ | Highest |
| Unit (Repositories) | 7 | 100% | High |
| Integration (Services) | 5 | 90%+ | High |
| Integration (Controllers) | 8 | 100% | Highest |
| E2E | 6 scénarios | N/A | High |
| Compatibility | 43 endpoints | 100% | Highest |
| Performance | 5 scénarios | N/A | Medium |
| Regression (Postman) | 43 endpoints | 100% | Highest |

**Total tests** : ~150-200 tests

**Objectif global** : **ZÉRO régression** + **≥ 90% coverage** + **100% compatibilité API**
