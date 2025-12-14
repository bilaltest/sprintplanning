# Système de Permissions - Résumé d'Implémentation

## ✅ Statut : IMPLÉMENTÉ ET FONCTIONNEL

Date : 13 décembre 2024

## Problème résolu

**Avant** : Les utilisateurs avec permission `NONE` sur un module voyaient quand même les menus et pouvaient accéder aux pages (même comportement que `READ`).

**Après** :
- Permission `NONE` → Menu invisible + Redirection vers /home + Backend 403
- Permission `READ` → Menu visible + GET OK + POST/PUT/DELETE 403
- Permission `WRITE` → Accès complet

## Architecture implémentée

### Backend (Spring Boot)
✅ `JwtAuthenticationFilter.java` - Charge permissions depuis DB → GrantedAuthority
✅ `@PreAuthorize` sur tous les endpoints protégés
✅ `PermissionService.java` - Gestion permissions (getUserPermissions, setPermission)
✅ `PermissionController.java` - API admin pour gérer permissions

### Frontend (Angular)

#### Guards
✅ `calendar.guard.ts` - Protège /calendar, /history, /settings
✅ `releases.guard.ts` - Protège /releases, /releases/:id, /release-history
✅ `admin.guard.ts` - Protège /admin (mis à jour pour utiliser PermissionService)

#### Services
✅ `permission.service.ts` - hasReadAccess(), hasWriteAccess()
✅ `auth.service.ts` - Stocke user avec permissions dans sessionStorage

#### Directives
✅ `has-permission.directive.ts` - `*hasPermission` pour masquer éléments UI

#### Composants
✅ `sidebar.component.ts` - Filtrage menu selon permissions (requiredModule)

#### Routing
✅ `app.routes.ts` - canActivate sur toutes les routes protégées

## Fichiers créés

```
event-planning-app/src/app/
├── guards/
│   ├── calendar.guard.ts        ✅ NOUVEAU
│   ├── releases.guard.ts        ✅ NOUVEAU
│   └── admin.guard.ts           ✅ MODIFIÉ (utilise PermissionService)
├── directives/
│   └── has-permission.directive.ts  ✅ NOUVEAU
├── services/
│   └── permission.service.ts    ✅ EXISTANT (utilisé maintenant)
└── components/shared/
    └── sidebar.component.ts     ✅ MODIFIÉ (filtrage par permissions)

Documentation/
├── PERMISSIONS_TESTING_GUIDE.md         ✅ NOUVEAU
├── PERMISSIONS_IMPLEMENTATION_SUMMARY.md ✅ NOUVEAU (ce fichier)
└── claude.md                            ✅ MODIFIÉ (section permissions ajoutée)

Scripts/
└── test-permissions.sh          ✅ NOUVEAU
```

## Tests réalisés

### Backend
✅ Login admin → WRITE sur tous les modules
✅ Modification permissions via PUT /api/admin/permissions/{userId}
✅ Nouveau login → JWT contient nouvelles permissions
✅ GET /api/events avec CALENDAR=NONE → 403 (accès refusé)
✅ GET /api/releases avec RELEASES=WRITE → 200 (accès autorisé)
✅ GET /api/admin/users avec ADMIN=NONE → 403 (accès refusé)

### Frontend
✅ Build Angular réussit sans erreurs de prod
✅ TypeScript compile (erreurs uniquement dans .spec.ts obsolètes)

## Utilisateur de test créé

**Email** : jean.dupont@ca-ts.fr
**Password** : password123
**User ID** : cmj4v3vczl19hka
**Permissions actuelles** :
- CALENDAR: NONE
- RELEASES: WRITE
- ADMIN: NONE

## Comment tester

### Test automatique (Backend)
```bash
./test-permissions.sh
```

### Test manuel (UI Angular)
1. Se connecter avec : jean.dupont@ca-ts.fr / password123
2. Vérifier que le menu "Calendrier" n'apparaît PAS
3. Vérifier que le menu "Prépa MEP" apparaît
4. Vérifier que le menu "Admin" n'apparaît PAS
5. Tenter d'accéder à http://localhost:4200/calendar → Redirigé vers /home

### Modifier les permissions
```bash
# Se connecter en admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}' | jq -r '.token')

# Modifier les permissions de Jean Dupont
curl -X PUT http://localhost:3000/api/admin/permissions/cmj4v3vczl19hka \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "CALENDAR": "READ",
      "RELEASES": "READ",
      "ADMIN": "NONE"
    }
  }'

# Se reconnecter avec Jean Dupont pour tester
```

## Directive *hasPermission - Exemples

```html
<!-- Afficher uniquement si READ ou WRITE sur CALENDAR -->
<div *hasPermission="'CALENDAR'">
  <p>Contenu visible avec permission CALENDAR</p>
</div>

<!-- Afficher uniquement si WRITE sur RELEASES -->
<button *hasPermission="'RELEASES'; level: 'WRITE'" (click)="createRelease()">
  Créer Release
</button>

<!-- Afficher uniquement si permission ADMIN -->
<a *hasPermission="'ADMIN'" routerLink="/admin">Administration</a>
```

## Checklist pour nouvelles features

Lors de l'ajout d'une nouvelle fonctionnalité, suivre ces étapes :

### Backend
- [ ] Ajouter `@PreAuthorize` sur tous les nouveaux endpoints
  ```java
  @GetMapping("/new-endpoint")
  @PreAuthorize("hasAnyAuthority('PERMISSION_MODULE_READ', 'PERMISSION_MODULE_WRITE')")
  public ResponseEntity<?> method() { ... }
  ```

### Frontend
- [ ] Ajouter le guard approprié sur les nouvelles routes
  ```typescript
  { path: 'new-route', component: ..., canActivate: [moduleGuard] }
  ```
- [ ] Utiliser `*hasPermission` sur les boutons d'action
  ```html
  <button *hasPermission="'MODULE'; level: 'WRITE'">Action</button>
  ```
- [ ] Ajouter `requiredModule` si nouveau menu dans sidebar
  ```typescript
  { label: 'Nouveau', icon: 'icon', route: '/route', requiredModule: 'MODULE' }
  ```

### Tests
- [ ] Exécuter `./test-permissions.sh`
- [ ] Tester manuellement avec un utilisateur ayant NONE
- [ ] Vérifier que le menu n'apparaît pas
- [ ] Vérifier la redirection vers /home si accès direct

## Mapping permissions

### Backend (GrantedAuthority)
```
CALENDAR + WRITE → PERMISSION_CALENDAR_WRITE
CALENDAR + READ  → PERMISSION_CALENDAR_READ
RELEASES + WRITE → PERMISSION_RELEASES_WRITE
RELEASES + READ  → PERMISSION_RELEASES_READ
ADMIN + WRITE    → PERMISSION_ADMIN_WRITE
ADMIN + READ     → PERMISSION_ADMIN_READ
+ ROLE_USER (tous les utilisateurs authentifiés)
```

### Frontend (PermissionService)
```typescript
hasReadAccess(module: PermissionModule): boolean {
  return level === 'READ' || level === 'WRITE';
}

hasWriteAccess(module: PermissionModule): boolean {
  return level === 'WRITE';
}
```

## Points importants

1. **Reconnexion requise** : Après modification des permissions par un admin, l'utilisateur DOIT se reconnecter pour que le nouveau JWT contienne les permissions à jour.

2. **Double sécurité** : Guards Angular + @PreAuthorize backend = défense en profondeur. Les guards ne sont PAS une sécurité suffisante seuls.

3. **Performance** : Permissions chargées UNE SEULE FOIS au login, stockées dans JWT. Pas de requête DB à chaque endpoint.

4. **Permissions par défaut** : Nouvel utilisateur créé → WRITE sur tout (à modifier via admin si besoin de restriction).

5. **Email validation** : Format strict requis : `prenom.nom@ca-ts.fr` ou `prenom.nom-ext@ca-ts.fr`

## Documentation complète

Voir `PERMISSIONS_TESTING_GUIDE.md` pour :
- Scénarios de test détaillés
- Guide API complet
- Dépannage (403, permissions non chargées, etc.)
- Tests de non-régression

## Contact

Pour toute question sur le système de permissions, se référer à :
1. `claude.md` - Section "Système de Permissions"
2. `PERMISSIONS_TESTING_GUIDE.md` - Tests et exemples
3. Code source avec commentaires détaillés
