# Configuration de l'Accès Administration

## Vue d'ensemble

Le backend Spring Boot contient **toutes les fonctionnalités d'administration** qui existaient dans le backend Node.js :

- ✅ Gestion des utilisateurs (liste, suppression)
- ✅ Statistiques système
- ✅ Export de la base de données (JSON)
- ✅ Import de la base de données (JSON)

## Accès au Menu Admin

Le menu **Admin** dans la sidebar n'est visible que si vous êtes connecté avec un utilisateur ayant l'email **`admin`**.

### Condition d'affichage
```typescript
// event-planning-app/src/app/components/shared/sidebar.component.ts:257-258
if (item.route === '/admin') {
  return this.currentUser?.email === 'admin';
}
```

## Créer l'Utilisateur Admin

### Méthode 1 : Via l'API (Recommandé)

1. **Démarrer le backend Spring Boot** :
   ```bash
   cd event-planning-spring-boot/event-planning-api
   ./mvnw spring-boot:run
   ```

2. **Créer l'utilisateur admin via cURL** :
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-admin-user
   ```

   Réponse attendue :
   ```json
   {
     "message": "Utilisateur admin créé avec succès",
     "email": "admin",
     "password": "admin123"
   }
   ```

3. **Se connecter à l'application Angular** avec :
   - **Email** : `admin`
   - **Password** : `admin123`

4. **Le menu Admin apparaît** dans la sidebar 🎉

### Méthode 2 : Via SQL Direct

Si vous préférez créer l'utilisateur directement dans MySQL :

1. **Se connecter à MySQL** :
   ```bash
   mysql -u eventplanning -p eventplanning
   ```

2. **Exécuter le script** :
   ```bash
   source create-admin-user.sql
   ```

   Ou exécuter manuellement :
   ```sql
   INSERT INTO app_user (
       id, email, password, first_name, last_name,
       theme_preference, widget_order, created_at, updated_at
   ) VALUES (
       'cadmin001',
       'admin',
       '$2a$10$rK5jQZ9X3bXqYVZxKqN0K.vPJZQKqYv5xQZ9X3bXqYVZxKqN0K.vP',
       'Admin',
       'Système',
       'light',
       '[]',
       NOW(),
       NOW()
   );
   ```

## Endpoints Administration Disponibles

Une fois connecté en tant qu'admin, vous avez accès à :

### 1. Liste des Utilisateurs
```
GET /api/admin/users
```

### 2. Supprimer un Utilisateur
```
DELETE /api/admin/users/:id
```

### 3. Statistiques
```
GET /api/admin/stats
```
Retourne : nombre d'utilisateurs, events, releases, historiques

### 4. Export de la Base de Données
```
GET /api/admin/export
```
Télécharge un fichier JSON avec toutes les données

### 5. Import de la Base de Données
```
POST /api/admin/import
Content-Type: application/json

{
  "metadata": { ... },
  "data": { ... }
}
```
**⚠️ ATTENTION** : Écrase toutes les données existantes !

### 6. Créer l'Utilisateur Admin
```
POST /api/admin/create-admin-user
```

## Architecture Frontend

Le composant Admin Angular se trouve dans :
```
event-planning-app/src/app/components/admin/admin.component.ts
```

Il communique avec le backend Spring Boot via :
```typescript
private readonly API_URL = 'http://localhost:3000/api/admin';
```

## Sécurité

### Guard Angular
```typescript
// event-planning-app/src/app/guards/admin.guard.ts
export const adminGuard = () => {
  if (currentUser && currentUser.email === 'admin') {
    return true;
  }
  router.navigate(['/home']);
  return false;
};
```

### Endpoints Protégés
Dans une version de production, tous les endpoints `/api/admin/*` devraient être protégés par :
- Authentification JWT
- Vérification du rôle admin côté serveur

## Troubleshooting

### Le menu Admin n'apparaît pas ?

1. **Vérifier que vous êtes connecté avec l'email `admin`** :
   - Ouvrir la console du navigateur
   - Taper : `sessionStorage.getItem('planning_user')`
   - Vérifier que `"email": "admin"`

2. **Vérifier que l'utilisateur admin existe dans la BDD** :
   ```sql
   SELECT * FROM app_user WHERE email = 'admin';
   ```

3. **Créer l'utilisateur admin** si nécessaire :
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-admin-user
   ```

### Erreur 404 sur les endpoints admin ?

1. **Vérifier que le backend Spring Boot tourne** :
   ```bash
   curl http://localhost:3000/api/admin/stats
   ```

2. **Vérifier les logs Spring Boot** pour des erreurs de démarrage

### L'export ne fonctionne pas ?

Vérifier que toutes les entités JPA sont bien configurées avec les relations bidirectionnelles.

## Migration depuis Node.js

✅ **Toutes les fonctionnalités** du backend Node.js ont été migrées vers Spring Boot
✅ Les **endpoints API sont identiques** (même structure `/api/admin/*`)
✅ Le **composant Angular** fonctionne sans modification
✅ Le **format d'export/import JSON** est compatible

---

**Équipe DSI Banque** | Backend Spring Boot Migration | Décembre 2024
