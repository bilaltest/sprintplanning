# Guide de Test - Système de Permissions

## Vue d'ensemble

Le système de permissions est maintenant entièrement fonctionnel avec :
- **3 modules** : CALENDAR, RELEASES, ADMIN
- **3 niveaux** : NONE (pas d'accès), READ (lecture seule), WRITE (lecture + écriture)

## Architecture

### Frontend
1. **Guards** : Bloquent l'accès aux routes si permission insuffisante
   - `calendar.guard.ts` → Protège /calendar, /history, /settings
   - `releases.guard.ts` → Protège /releases, /releases/:id, /release-history
   - `admin.guard.ts` → Protège /admin

2. **Directive** : `*hasPermission` pour masquer/afficher des éléments UI
   - Usage : `<div *hasPermission="'CALENDAR'">...</div>`
   - Avec niveau : `<button *hasPermission="'RELEASES'; level: 'WRITE'">Créer</button>`

3. **Sidebar** : Filtrage automatique des items de menu selon permissions

### Backend
- `@PreAuthorize` sur tous les endpoints REST
- JWT Filter charge les permissions depuis la DB
- Conversion en `GrantedAuthority` : `PERMISSION_{MODULE}_{LEVEL}`

## Scénarios de Test

### Test 1 : Admin (WRITE sur tout)
**Setup :**
```bash
# Se connecter avec admin/admin
# L'admin a WRITE sur CALENDAR, RELEASES, ADMIN par défaut
```

**Résultat attendu :**
- ✅ Voit tous les menus : Accueil, Calendrier, Prépa MEP, Playground, Admin
- ✅ Peut accéder à toutes les routes
- ✅ Peut créer/modifier/supprimer sur tous les modules

### Test 2 : Utilisateur avec NONE sur CALENDAR
**Setup :**
```sql
-- Via l'interface Admin, créer un utilisateur "user1@test.com"
-- Donner les permissions suivantes :
-- CALENDAR: NONE
-- RELEASES: WRITE
-- ADMIN: NONE
```

**Résultat attendu :**
- ✅ Sidebar : Voit uniquement Accueil, Prépa MEP, Playground
- ❌ Sidebar : NE VOIT PAS Calendrier ni Admin
- ✅ Peut accéder à /home
- ✅ Peut accéder à /releases (WRITE)
- ❌ Redirigé vers /home si tente d'accéder à /calendar
- ❌ Redirigé vers /home si tente d'accéder à /admin
- ❌ URL directe vers /calendar → Redirigé vers /home

### Test 3 : Utilisateur avec READ sur RELEASES
**Setup :**
```sql
-- Créer utilisateur "user2@test.com"
-- CALENDAR: WRITE
-- RELEASES: READ
-- ADMIN: NONE
```

**Résultat attendu :**
- ✅ Sidebar : Voit Accueil, Calendrier, Prépa MEP, Playground
- ✅ Peut voir la liste des releases
- ❌ Boutons "Créer Release", "Modifier", "Supprimer" masqués ou désactivés
- ✅ Backend renvoie 403 si tente POST/PUT/DELETE sur /api/releases

### Test 4 : Utilisateur avec NONE partout (sauf exceptions)
**Setup :**
```sql
-- Créer utilisateur "user3@test.com"
-- CALENDAR: NONE
-- RELEASES: NONE
-- ADMIN: NONE
```

**Résultat attendu :**
- ✅ Sidebar : Voit uniquement Accueil, Playground
- ❌ Toute tentative d'accès à /calendar ou /releases → Redirigé vers /home

## API Admin - Gestion des Permissions

### Lister les permissions d'un utilisateur
```bash
TOKEN="<admin_jwt_token>"
USER_ID="<user_id>"

curl -X GET http://localhost:3000/api/admin/permissions/${USER_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

### Mettre à jour les permissions
```bash
TOKEN="<admin_jwt_token>"
USER_ID="<user_id>"

curl -X PUT http://localhost:3000/api/admin/permissions/${USER_ID} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "CALENDAR": "NONE",
      "RELEASES": "READ",
      "ADMIN": "NONE"
    }
  }'
```

## Test Manuel Rapide

### Étape 1 : Démarrer l'application
```bash
# Terminal 1 - Backend
cd event-planning-spring-boot/event-planning-api
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd event-planning-app
npm start
```

### Étape 2 : Se connecter en admin
1. Ouvrir http://localhost:4200
2. Se connecter : `admin` / `admin`
3. Vérifier que tous les menus sont visibles

### Étape 3 : Créer un utilisateur de test
1. Aller dans Admin → Gestion des utilisateurs
2. Créer un utilisateur : `test@test.com` / `password123`
3. Noter l'ID de l'utilisateur

### Étape 4 : Modifier les permissions via API
```bash
# Récupérer le token admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}' | jq -r '.token')

# Récupérer l'ID du user test
USER_ID=$(curl -s http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ${TOKEN}" | jq -r '.[] | select(.email=="test@test.com") | .id')

# Mettre NONE sur CALENDAR
curl -X PUT http://localhost:3000/api/admin/permissions/${USER_ID} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "CALENDAR": "NONE",
      "RELEASES": "WRITE",
      "ADMIN": "NONE"
    }
  }'
```

### Étape 5 : Tester avec le compte test
1. Se déconnecter
2. Se connecter : `test@test.com` / `password123`
3. **Vérifications** :
   - ❌ Le menu "Calendrier" ne doit PAS apparaître dans la sidebar
   - ✅ Le menu "Prépa MEP" doit apparaître
   - ❌ Tenter d'accéder à `http://localhost:4200/calendar` → Redirigé vers `/home`

## Directive *hasPermission - Exemples d'Utilisation

### Dans les composants
```typescript
import { HasPermissionDirective } from '@directives/has-permission.directive';

@Component({
  // ...
  imports: [CommonModule, HasPermissionDirective]
})
export class MyComponent {
  // ...
}
```

### Dans les templates
```html
<!-- Afficher seulement si READ ou WRITE sur CALENDAR -->
<div *hasPermission="'CALENDAR'">
  <p>Contenu visible uniquement avec permission CALENDAR</p>
</div>

<!-- Afficher seulement si WRITE sur RELEASES -->
<button *hasPermission="'RELEASES'; level: 'WRITE'" (click)="createRelease()">
  Créer une Release
</button>

<!-- Afficher seulement si READ sur ADMIN (pas WRITE) -->
<div *hasPermission="'ADMIN'; level: 'READ'">
  <p>Mode lecture seule admin</p>
</div>
```

## Dépannage

### Problème : Permissions non chargées au login
**Solution :** Vérifier que `AuthController.login()` renvoie bien les permissions dans la réponse :
```java
// AuthController.java
UserDto userDto = // ... conversion
Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(user.getId());
userDto.setPermissions(permissions);
```

### Problème : 403 Forbidden malgré permissions correctes
**Solution :** Vérifier les logs Spring Boot :
```
Authority ajoutée: PERMISSION_CALENDAR_WRITE
Authority ajoutée: PERMISSION_RELEASES_READ
Authority ajoutée: ROLE_USER
Utilisateur authentifié via JWT: cmj... avec 4 authorities
```

### Problème : Menu visible malgré NONE
**Solution :** Vérifier que `PermissionService` charge bien les permissions :
```typescript
// Dans la console navigateur
const permissionService = inject(PermissionService);
console.log(permissionService.getCurrentUserPermissions());
// Doit afficher: { CALENDAR: 'NONE', RELEASES: 'WRITE', ADMIN: 'NONE' }
```

## Checklist de Validation

- [ ] Admin voit tous les menus
- [ ] Utilisateur avec NONE sur CALENDAR ne voit pas le menu Calendrier
- [ ] Utilisateur avec NONE sur CALENDAR redirigé vers /home si accès direct à /calendar
- [ ] Utilisateur avec READ sur RELEASES voit la liste mais pas les boutons de modification
- [ ] Backend renvoie 403 si tentative d'action non autorisée
- [ ] Directive `*hasPermission` masque correctement les éléments UI
- [ ] Changement de permissions via API admin fonctionne (nécessite reconnexion)

## Notes Importantes

1. **Reconnexion requise** : Après modification des permissions, l'utilisateur doit se reconnecter pour que le nouveau JWT contienne les permissions à jour.

2. **Sécurité backend** : Les guards Angular ne sont PAS une sécurité suffisante. Le backend DOIT vérifier les permissions via `@PreAuthorize`.

3. **Performance** : Les permissions sont chargées une seule fois au login et stockées dans le JWT. Pas de requête DB à chaque endpoint.

4. **Default permissions** : Nouvel utilisateur créé sans permissions → NONE partout par défaut.
