# Guide de Gestion des Microservices

## Vue d'ensemble

Ce guide décrit la fonctionnalité de gestion des microservices accessible depuis la page **Release Note**. Cette fonctionnalité permet aux utilisateurs avec la permission `RELEASES_WRITE` de :

- Consulter la liste des microservices existants
- Créer de nouveaux microservices
- Modifier des microservices existants
- Désactiver des microservices (soft delete)

## Architecture

### Backend (Spring Boot)

#### Entité `Microservice`

```java
@Entity
@Table(name = "microservice")
public class Microservice {
    @Id
    private String id;              // CUID (25 chars)

    @Column(nullable = false, unique = true)
    private String name;            // Nom unique du microservice

    @Column(nullable = false)
    private String squad;           // 'Squad 1' à 'Squad 6'

    private String solution;        // Nom de la solution (optionnel)

    private Integer displayOrder;   // Ordre d'affichage (défaut: 0)

    @Column(nullable = false)
    private Boolean isActive = true; // Actif/Inactif (soft delete)

    private String description;     // Description optionnelle

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

#### Controller `MicroserviceController`

Tous les endpoints nécessitent une authentification JWT et la permission `RELEASES`:

**Endpoints de lecture (READ ou WRITE requis):**
- `GET /api/microservices` - Liste des microservices actifs (avec `?releaseId=xxx` pour pré-charger les tags N-1)
- `GET /api/microservices/squad/{squad}` - Microservices actifs par squad
- `GET /api/microservices/{id}` - Détail d'un microservice

**Endpoints d'écriture (WRITE requis):**
- `POST /api/microservices` - Créer un microservice
- `PUT /api/microservices/{id}` - Modifier un microservice
- `DELETE /api/microservices/{id}` - Soft delete (marque comme inactif)
- `GET /api/microservices/all` - Liste complète (incluant inactifs)
- `DELETE /api/microservices/{id}/hard` - Hard delete (⚠️ utiliser avec précaution!)

**Exemple de création:**

```bash
curl -X POST http://localhost:3000/api/microservices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Catalogue",
    "squad": "Squad 2",
    "solution": "s5277-zm038",
    "displayOrder": 5,
    "description": "Gestion du catalogue produits"
  }'
```

**Exemple de modification:**

```bash
curl -X PUT http://localhost:3000/api/microservices/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Catalogue v2",
    "squad": "Squad 3",
    "isActive": true
  }'
```

### Frontend (Angular)

#### Service `MicroserviceService`

```typescript
@Injectable({ providedIn: 'root' })
export class MicroserviceService {
  private apiUrl = `${environment.apiUrl}/microservices`;

  getAllActive(releaseId?: string): Observable<Microservice[]> {
    // GET /api/microservices?releaseId=xxx
  }

  getBySquad(squad: string): Observable<Microservice[]> {
    // GET /api/microservices/squad/{squad}
  }

  create(request: CreateMicroserviceRequest): Observable<Microservice> {
    // POST /api/microservices
  }

  update(id: string, request: UpdateMicroserviceRequest): Observable<Microservice> {
    // PUT /api/microservices/{id}
  }

  delete(id: string): Observable<void> {
    // DELETE /api/microservices/{id} (soft delete)
  }
}
```

#### Composant `MicroserviceManagementModalComponent`

Modal Angular Material utilisée pour créer/modifier des microservices.

**Formulaire réactif avec validation:**

```typescript
this.form = this.fb.group({
  name: ['', Validators.required],        // Requis
  squad: ['', Validators.required],       // Requis
  solution: [''],                         // Optionnel
  displayOrder: [0],                      // Optionnel (défaut: 0)
  description: [''],                      // Optionnel
  isActive: [true]                        // Edit mode uniquement
});
```

**Ouverture du modal depuis `ReleaseNoteComponent`:**

```typescript
// Mode création
openAddMicroserviceModal(): void {
  const dialogRef = this.dialog.open(MicroserviceManagementModalComponent, {
    width: '600px',
    data: { mode: 'create' }
  });

  dialogRef.afterClosed().subscribe((result: Microservice | undefined) => {
    if (result) {
      this.loadMicroservices(); // Recharge la liste
      this.toastService.success('Microservice ajouté avec succès');
    }
  });
}

// Mode édition
openEditMicroserviceModal(microservice: Microservice): void {
  const dialogRef = this.dialog.open(MicroserviceManagementModalComponent, {
    width: '600px',
    data: { mode: 'edit', microservice }
  });

  dialogRef.afterClosed().subscribe((result: Microservice | undefined) => {
    if (result) {
      this.loadMicroservices();
      this.toastService.success('Microservice modifié avec succès');
    }
  });
}
```

## Intégration dans la Page Release Note

### Bouton "Nouveau microservice"

Le bouton est accessible dans la modal d'ajout d'une entrée de release note :

**Template HTML (ligne 440-447 de release-note.component.ts):**

```html
<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
  <span>Nom du microservice</span>
  <button
    type="button"
    (click)="openAddMicroserviceModal()"
    class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center space-x-1"
  >
    <span class="material-icons text-sm">add_circle</span>
    <span>Nouveau microservice</span>
  </button>
</label>
```

### Workflow Utilisateur

1. **Accéder à la page Release Note** → `/releases/{releaseId}/release-note`
2. **Cliquer sur "Ajouter ligne"** → Ouvre la modal d'ajout d'entrée
3. **Dans la modal, cliquer sur "Nouveau microservice"** → Ouvre la modal de gestion des microservices
4. **Remplir le formulaire:**
   - Nom du microservice (requis)
   - Squad (requis, sélection 1-6)
   - Solution (optionnel, texte libre)
   - Ordre d'affichage (optionnel, nombre)
   - Description (optionnel, textarea)
5. **Cliquer sur "Créer"** → Le microservice est créé et ajouté au référentiel
6. **Retour automatique à la modal d'ajout d'entrée** → Le nouveau microservice apparaît dans la liste déroulante

### Auto-remplissage des Champs

Lorsqu'un microservice est sélectionné dans la modal d'ajout d'entrée, certains champs sont auto-remplis :

```typescript
onMicroserviceChange(): void {
  const microservice = this.getSelectedMicroservice();
  if (microservice) {
    // Auto-fill squad from microservice
    this.newEntry.squad = microservice.squad;

    // Auto-fill previousTag (Tag N-1) depuis le microservice (déjà pré-chargé)
    this.newEntry.previousTag = microservice.previousTag || '';
  }
}
```

**Champs auto-remplis:**
- **Squad** → Depuis `microservice.squad`
- **Tag N-1** → Depuis `microservice.previousTag` (calculé depuis la release précédente)
- **Solution** → Affiché dans le dropdown (lecture seule)

## Permissions

### Backend: `@PreAuthorize`

Tous les endpoints du `MicroserviceController` sont protégés par des annotations Spring Security :

```java
// Lecture (READ ou WRITE)
@PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
public ResponseEntity<List<MicroserviceDto>> getAllActive() { ... }

// Création/Modification/Suppression (WRITE uniquement)
@PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
public ResponseEntity<MicroserviceDto> create(@Valid @RequestBody CreateMicroserviceRequest request) { ... }
```

### Frontend: Directive `*hasPermission`

Le bouton "Nouveau microservice" n'est affiché que si l'utilisateur a la permission `RELEASES_WRITE` :

```typescript
hasWriteAccess(): boolean {
  return this.permissionService.hasWriteAccess('RELEASES');
}
```

**Dans le template:**

```html
<button *ngIf="hasWriteAccess()" (click)="openAddMicroserviceModal()">
  Nouveau microservice
</button>
```

## Tests de Non-Régression

### Script de Test Automatique

Un script Bash complet est fourni pour tester tous les endpoints :

```bash
./test-microservice-management.sh
```

**Scénarios testés:**
1. ✅ Authentification admin avec `RELEASES_WRITE`
2. ✅ `GET /api/microservices` (liste active)
3. ✅ `POST /api/microservices` (création)
4. ✅ `GET /api/microservices/{id}` (détail)
5. ✅ `PUT /api/microservices/{id}` (modification)
6. ✅ `DELETE /api/microservices/{id}` (soft delete)
7. ✅ Vérification que le microservice n'apparaît plus dans la liste active
8. ✅ `GET /api/microservices/all` (liste complète incluant inactifs)
9. ✅ `DELETE /api/microservices/{id}/hard` (hard delete pour nettoyage)

**Résultat attendu:**

```
==========================================
✓ TOUS LES TESTS RÉUSSIS
==========================================

Résumé des fonctionnalités testées:
  ✓ Authentification admin avec RELEASES_WRITE
  ✓ GET /api/microservices (liste active)
  ✓ POST /api/microservices (création)
  ✓ GET /api/microservices/{id} (détail)
  ✓ PUT /api/microservices/{id} (modification)
  ✓ DELETE /api/microservices/{id} (soft delete)
  ✓ GET /api/microservices/all (liste complète)
  ✓ DELETE /api/microservices/{id}/hard (hard delete)
```

### Tests Manuels Frontend

**Checklist de tests UI:**

- [ ] Se connecter avec un utilisateur `RELEASES_WRITE`
- [ ] Naviguer vers `/releases/{releaseId}/release-note`
- [ ] Cliquer sur "Ajouter ligne"
- [ ] Vérifier que le bouton "Nouveau microservice" apparaît
- [ ] Cliquer sur "Nouveau microservice"
- [ ] Vérifier que la modal s'ouvre correctement
- [ ] Remplir le formulaire avec des valeurs valides
- [ ] Cliquer sur "Créer"
- [ ] Vérifier que le toast de succès apparaît
- [ ] Vérifier que le nouveau microservice apparaît dans la liste déroulante
- [ ] Sélectionner le nouveau microservice
- [ ] Vérifier que la squad et le tag N-1 sont auto-remplis
- [ ] Créer l'entrée de release note
- [ ] Vérifier que l'entrée apparaît dans le tableau

**Vérification des permissions:**

- [ ] Se déconnecter
- [ ] Se connecter avec un utilisateur `RELEASES_READ` (pas WRITE)
- [ ] Naviguer vers `/releases/{releaseId}/release-note`
- [ ] Vérifier que le bouton "Nouveau microservice" n'apparaît PAS
- [ ] Tenter d'appeler directement `POST /api/microservices` via API
- [ ] Vérifier que le backend renvoie `403 Forbidden`

## Données Initiales (Seed Data)

Au démarrage de l'application, 12 microservices par défaut sont créés via `@PostConstruct` dans `MicroserviceService` :

**Squad 1:**
- Service Opérations (s2267-zm005)
- Service Collecte Opérations (s2267-zc008)
- Service Budget (s2268-zm020)

**Squad 2:**
- Service Catalogue des Offres (s2267-zm038)

**Squad 3:**
- Service Authentification (s1069-zm001)
- Service Authorisation (s1886-zm006)
- Service Gateway (s1069-ze001)

**Squad 4:**
- Service Transfo Compte (s1578-zt001)
- Service Collecte PCL (s1578-zc001)

**Squad 5:**
- Service Comperso (s2077-zm012)
- Service Widget (s5111-zm037)

**Squad 6:**
- Service Aggregation (s2320-zm026)

Ces données servent de référentiel de base pour faciliter la saisie des release notes.

## Optimisations Performance

### Tag N-1 Pré-chargé

Pour éviter N requêtes API lors du chargement de la page Release Note, les tags N-1 sont pré-calculés côté backend :

**Frontend:**
```typescript
this.microserviceService.getAllActive(releaseId).subscribe(microservices => {
  // Chaque microservice a déjà son previousTag pré-chargé
});
```

**Backend (MicroserviceService):**
```java
public List<MicroserviceDto> getAllActive(String releaseId) {
  List<Microservice> microservices = repository.findAllActive();

  if (releaseId != null) {
    // Pré-charger tous les tags N-1 en une seule requête
    Map<String, String> previousTags = releaseNoteService.getAllPreviousTags(releaseId);

    return microservices.stream()
      .map(ms -> {
        MicroserviceDto dto = toDto(ms);
        dto.setPreviousTag(previousTags.get(ms.getId()));
        return dto;
      })
      .collect(Collectors.toList());
  }

  return microservices.stream().map(this::toDto).collect(Collectors.toList());
}
```

**Gain de performance:**
- Avant : N appels API (1 par microservice) = ~12 appels
- Après : 1 seul appel API groupé = **gain de 91.7%**

## Schéma de Base de Données

```sql
CREATE TABLE microservice (
    id VARCHAR(25) PRIMARY KEY,              -- CUID
    name VARCHAR(255) UNIQUE NOT NULL,       -- Nom unique
    squad VARCHAR(50) NOT NULL,              -- 'Squad 1' à 'Squad 6'
    solution VARCHAR(255),                   -- Nom de la solution
    display_order INT DEFAULT 0,             -- Ordre d'affichage
    is_active BOOLEAN DEFAULT TRUE NOT NULL, -- Actif/Inactif (soft delete)
    description TEXT,                        -- Description optionnelle
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,

    INDEX idx_microservice_squad (squad),
    INDEX idx_microservice_is_active (is_active),
    INDEX idx_microservice_display_order (display_order)
);

-- Relation avec release_note_entry
CREATE TABLE release_note_entry (
    id VARCHAR(25) PRIMARY KEY,
    release_id VARCHAR(25) NOT NULL,
    microservice_id VARCHAR(25),             -- FK vers microservice (preferred)
    microservice VARCHAR(255),               -- Legacy: free text (fallback)
    squad VARCHAR(50) NOT NULL,
    part_en_mep BOOLEAN DEFAULT FALSE,
    deploy_order INT,
    tag VARCHAR(50),
    previous_tag VARCHAR(50),
    parent_version VARCHAR(50),
    changes JSON,                            -- Array of {jiraId, description}
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,

    FOREIGN KEY (release_id) REFERENCES app_release(id) ON DELETE CASCADE,
    FOREIGN KEY (microservice_id) REFERENCES microservice(id) ON DELETE SET NULL,
    INDEX idx_release_note_entry_release_id (release_id),
    INDEX idx_release_note_entry_microservice_id (microservice_id)
);
```

**Relations:**
- `ReleaseNoteEntry.microserviceId` → `Microservice.id` (FK optionnelle, ON DELETE SET NULL)
- Si un microservice est supprimé (hard delete), les entrées de release note gardent le nom en texte libre via le champ `microservice`

## Dépannage

### Erreur 403 lors de la création

**Symptôme:**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

**Causes possibles:**
1. L'utilisateur n'a pas la permission `RELEASES_WRITE`
2. Le token JWT est expiré
3. Le token JWT est manquant ou invalide

**Solution:**
1. Vérifier les permissions de l'utilisateur via `GET /api/permissions/user/{userId}`
2. Vérifier que le HTTP Interceptor Angular ajoute bien le header `Authorization: Bearer <token>`
3. Vérifier que le `JwtAuthenticationFilter` charge bien les permissions depuis la DB
4. Consulter les logs Spring Boot: "Utilisateur authentifié via JWT: {userId} avec {N} authorities"

### Le nouveau microservice n'apparaît pas dans la liste

**Symptôme:**
Le microservice est créé avec succès (status 201), mais n'apparaît pas dans la liste déroulante.

**Causes possibles:**
1. Le frontend n'a pas rechargé la liste après création
2. Le microservice a été créé mais marqué comme inactif
3. Le microservice a été créé dans une autre squad

**Solution:**
1. Vérifier que `loadMicroservices()` est appelé dans `dialogRef.afterClosed()`
2. Vérifier `isActive = true` dans la réponse de création
3. Vérifier que la liste déroulante groupe bien par squad

### Erreur "Microservice name already exists"

**Symptôme:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Un microservice avec ce nom existe déjà"
}
```

**Cause:**
Le nom du microservice doit être unique dans toute la base de données.

**Solution:**
Choisir un nom différent ou réactiver le microservice existant s'il était désactivé.

## Évolutions Futures

### Gestion par Page Dédiée

Actuellement, la gestion des microservices est accessible uniquement depuis la page Release Note. Une évolution possible serait de créer une page dédiée `/admin/microservices` avec :

- [ ] Tableau complet de tous les microservices (actifs + inactifs)
- [ ] Filtres avancés (par squad, par solution, par statut)
- [ ] Édition inline
- [ ] Import/Export CSV
- [ ] Historique des modifications

### Validation Avancée

- [ ] Empêcher la suppression d'un microservice utilisé dans des release notes
- [ ] Suggestion de noms basée sur les microservices existants
- [ ] Validation de la syntaxe des solutions (format `sXXXX-zmXXX`)

### Statistiques

- [ ] Nombre d'utilisations par microservice
- [ ] Release notes par microservice
- [ ] Microservices les plus fréquemment déployés

---

**Auteur:** DSI Banque
**Version:** 1.0
**Date:** 14 décembre 2024
