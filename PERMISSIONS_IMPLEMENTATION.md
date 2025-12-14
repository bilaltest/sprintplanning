# Guide d'implémentation des permissions

Ce document explique comment implémenter le système de permissions dans les composants Angular de l'application.

## Architecture

### Backend
- `PermissionModule` : ENUM avec 3 modules (`CALENDAR`, `RELEASES`, `ADMIN`)
- `PermissionLevel` : ENUM avec 3 niveaux (`NONE`, `READ`, `WRITE`)
- Les permissions sont chargées via JWT et stockées dans le contexte de sécurité Spring

### Frontend
- `PermissionService` : Service Angular pour gérer les permissions
- `CanAccessDirective` : Directive pour désactiver automatiquement les boutons

## Utilisation de la directive `appCanAccess`

### Import dans le composant
```typescript
import { CanAccessDirective } from '@directives/can-access.directive';

@Component({
  // ...
  imports: [CommonModule, FormsModule, CanAccessDirective],
})
```

### Exemples d'utilisation dans le template

#### Bouton de création (requiert WRITE)
```html
<button
  appCanAccess="CALENDAR"
  accessLevel="write"
  (click)="openCreateModal()"
  class="btn btn-primary"
>
  <span class="material-icons">add</span>
  <span>Créer un événement</span>
</button>
```

#### Bouton de modification (requiert WRITE)
```html
<button
  appCanAccess="RELEASES"
  accessLevel="write"
  (click)="editRelease(release)"
  class="btn btn-secondary"
>
  <span class="material-icons">edit</span>
  <span>Modifier</span>
</button>
```

#### Bouton de suppression (requiert WRITE)
```html
<button
  appCanAccess="ADMIN"
  accessLevel="write"
  (click)="deleteUser(user)"
  class="btn btn-danger"
>
  <span class="material-icons">delete</span>
  <span>Supprimer</span>
</button>
```

#### Bouton de consultation (requiert seulement READ)
```html
<button
  appCanAccess="CALENDAR"
  accessLevel="read"
  (click)="viewEventDetails(event)"
  class="btn btn-secondary"
>
  <span class="material-icons">visibility</span>
  <span>Voir les détails</span>
</button>
```

## Utilisation du PermissionService dans le TypeScript

### Import
```typescript
import { PermissionService } from '@services/permission.service';

constructor(private permissionService: PermissionService) {}
```

### Vérifier les permissions
```typescript
// Vérifier si l'utilisateur a au moins READ
if (this.permissionService.hasReadAccess('CALENDAR')) {
  // Afficher les données
}

// Vérifier si l'utilisateur a WRITE
if (this.permissionService.hasWriteAccess('RELEASES')) {
  // Permettre la modification
}

// Récupérer toutes les permissions
const permissions = this.permissionService.getCurrentUserPermissions();
// permissions = { CALENDAR: 'WRITE', RELEASES: 'READ', ADMIN: 'NONE' }
```

### Affichage conditionnel
```html
<!-- Masquer complètement un bouton si pas de permissions -->
<button
  *ngIf="permissionService.hasWriteAccess('CALENDAR')"
  (click)="createEvent()"
>
  Créer un événement
</button>

<!-- OU utiliser la directive pour griser le bouton -->
<button
  appCanAccess="CALENDAR"
  accessLevel="write"
  (click)="createEvent()"
>
  Créer un événement
</button>
```

## Composants à modifier

### 1. Calendrier (CALENDAR module)
**Fichiers:**
- `quarterly-view.component.ts`
- `timeline-container.component.ts`
- `event-modal.component.ts`

**Boutons concernés:**
- Créer un événement → `appCanAccess="CALENDAR" accessLevel="write"`
- Modifier un événement → `appCanAccess="CALENDAR" accessLevel="write"`
- Supprimer un événement → `appCanAccess="CALENDAR" accessLevel="write"`

**Exemple:**
```html
<!-- Dans quarterly-view.component.ts -->
<button
  appCanAccess="CALENDAR"
  accessLevel="write"
  (click)="openCreateEventModal()"
  class="btn btn-primary"
>
  <span class="material-icons">add_circle</span>
  <span>Nouvel événement</span>
</button>
```

### 2. Préparation des MEP (RELEASES module)
**Fichiers:**
- `releases-list.component.ts`
- `release-detail.component.ts`
- `feature-form.component.ts`
- `action-form.component.ts`

**Boutons concernés:**
- Créer une release → `appCanAccess="RELEASES" accessLevel="write"`
- Modifier une release → `appCanAccess="RELEASES" accessLevel="write"`
- Supprimer une release → `appCanAccess="RELEASES" accessLevel="write"`
- Ajouter une feature → `appCanAccess="RELEASES" accessLevel="write"`
- Ajouter une action → `appCanAccess="RELEASES" accessLevel="write"`
- Toggle action (FF/MF) → `appCanAccess="RELEASES" accessLevel="write"`
- Export → `appCanAccess="RELEASES" accessLevel="read"` (lecture seule suffit)

**Exemple:**
```html
<!-- Dans releases-list.component.ts -->
<button
  appCanAccess="RELEASES"
  accessLevel="write"
  (click)="openCreateReleaseModal()"
  class="btn btn-primary"
>
  <span class="material-icons">rocket_launch</span>
  <span>Nouvelle release</span>
</button>

<!-- Export (lecture seule) -->
<button
  appCanAccess="RELEASES"
  accessLevel="read"
  (click)="exportRelease()"
  class="btn btn-secondary"
>
  <span class="material-icons">download</span>
  <span>Exporter</span>
</button>
```

### 3. Administration (ADMIN module)
**Fichiers:**
- `admin.component.ts` (déjà implémenté ✅)
- `settings.component.ts`

**Boutons concernés:**
- Supprimer un utilisateur → `appCanAccess="ADMIN" accessLevel="write"`
- Modifier les permissions → `appCanAccess="ADMIN" accessLevel="write"`
- Export DB → `appCanAccess="ADMIN" accessLevel="write"`
- Import DB → `appCanAccess="ADMIN" accessLevel="write"`

### 4. Settings (accessible à tous)
**Fichiers:**
- `settings.component.ts`

**Note:** Les paramètres personnels (thème, catégories) sont accessibles à tous les utilisateurs. Pas besoin de directive de permissions ici.

## Comportement de la directive

Quand un utilisateur n'a pas les permissions requises:
1. Le bouton est **désactivé** (`disabled="true"`)
2. Le bouton est **grisé** (classes `opacity-50` et `cursor-not-allowed`)
3. Un **tooltip** s'affiche au survol expliquant pourquoi le bouton est désactivé
4. Les **clics sont bloqués** (preventDefault + stopPropagation)

**Exemple de tooltip:**
- Module CALENDAR → "Vous n'avez pas les permissions pour modifier le module Calendrier"
- Module RELEASES → "Vous n'avez pas les permissions pour modifier le module Préparation des MEP"
- Module ADMIN → "Vous n'avez pas les permissions pour modifier le module Administration"

## Checklist d'implémentation

### Pour chaque composant:
1. [ ] Importer `CanAccessDirective` dans le decorator `@Component({ imports: [...] })`
2. [ ] Ajouter la directive `appCanAccess` sur tous les boutons de création/modification/suppression
3. [ ] Spécifier le bon module (`CALENDAR`, `RELEASES`, ou `ADMIN`)
4. [ ] Spécifier le niveau d'accès (`read` ou `write`)
5. [ ] Tester avec différents niveaux de permissions

### Composants prioritaires (par ordre):
1. ✅ `admin.component.ts` - Interface de gestion des permissions
2. `quarterly-view.component.ts` - Boutons de création d'événements
3. `event-modal.component.ts` - Boutons de sauvegarde/suppression
4. `releases-list.component.ts` - Boutons de création de release
5. `release-detail.component.ts` - Boutons d'ajout features/actions
6. `feature-form.component.ts` - Boutons de sauvegarde
7. `action-form.component.ts` - Boutons de sauvegarde

## Test des permissions

Pour tester les permissions:
1. Se connecter en tant qu'admin (email: `admin`, password: `admin`)
2. Aller dans Administration
3. Cliquer sur "Permissions" pour un utilisateur
4. Modifier les niveaux de permissions (NONE, READ, WRITE)
5. Se déconnecter et se reconnecter avec cet utilisateur
6. Vérifier que les boutons sont bien grisés/désactivés selon les permissions

## Code complet de référence

Voir:
- `event-planning-app/src/app/services/permission.service.ts`
- `event-planning-app/src/app/directives/can-access.directive.ts`
- `event-planning-app/src/app/components/admin/admin.component.ts` (exemple complet)
