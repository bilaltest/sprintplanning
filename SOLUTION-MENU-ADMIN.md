# Solution : Menu Administration Invisible

## Le Problème Identifié

Vous aviez migré votre backend de Node.js vers Spring Boot, mais le menu **Admin** n'apparaissait pas dans la sidebar malgré une connexion avec "admin".

### Causes Identifiées

1. **Deux utilisateurs admin différents** existaient dans la base de données :
   - `admin@mabanque.fr` (ancien, créé par Node.js)
   - `admin` (nouveau, créé par Spring Boot)

2. **Condition d'affichage stricte** dans la sidebar :
   ```typescript
   // sidebar.component.ts:258
   return this.currentUser?.email === 'admin';
   ```
   ⚠️ Le menu ne s'affiche QUE si l'email est exactement `'admin'` (sans suffixe)

3. **Mot de passe non conforme** :
   - Le mot de passe initial "NMB" (3 caractères) ne respectait pas les règles du backend Spring Boot
   - Règles : minimum 8 caractères, alphanumérique, avec lettres ET chiffres

## La Solution Appliquée

### 1. Suppression de l'ancien utilisateur

```sql
DELETE FROM app_user WHERE email = 'admin@mabanque.fr';
DELETE FROM app_user WHERE email = 'admin' AND id != 'cadmin001';
```

### 2. Mot de passe conforme

Changement du mot de passe admin de "NMB" vers **"admin123"** :
- ✅ 8 caractères minimum
- ✅ Alphanumérique
- ✅ Contient des lettres et des chiffres

### 3. Fichiers Modifiés

- `AdminService.java:288` → Mot de passe : `admin123`
- `AdminController.java:113` → Documentation : `admin123`
- `ADMIN-SETUP.md` → Documentation mise à jour
- `create-admin.sh` → Script mis à jour
- `check-admin.sh` → Script de diagnostic mis à jour

## Comment Créer l'Utilisateur Admin Maintenant

### Étape 1 : Redémarrer le Backend Spring Boot

```bash
cd event-planning-spring-boot/event-planning-api
./mvnw spring-boot:run
```

### Étape 2 : Créer l'Utilisateur Admin

**Option A - Script automatique** (Recommandé) :
```bash
cd event-planning-spring-boot
./create-admin.sh
```

**Option B - Via cURL** :
```bash
curl -X POST http://localhost:3000/api/admin/create-admin-user
```

**Option C - Via le script de diagnostic** :
```bash
./check-admin.sh
```

### Étape 3 : Se Connecter

Connectez-vous à l'application Angular avec :

```
Email:    admin
Password: admin123
```

### Étape 4 : Vérifier

Le menu **Admin** doit maintenant apparaître dans la sidebar ! 🎉

## Vérification en Cas de Problème

### 1. Vérifier dans la Console du Navigateur

Après connexion, ouvrez DevTools (F12) et tapez :

```javascript
JSON.parse(sessionStorage.getItem('planning_user'))
```

Vérifiez que le champ `email` est bien `"admin"` (sans suffixe).

### 2. Vérifier dans la Base de Données

```bash
mysql -u eventplanning -peventplanning123 eventplanning
```

```sql
SELECT id, email, first_name, last_name FROM app_user WHERE email = 'admin';
```

Résultat attendu :
```
+-------------+-------+------------+-----------+
| id          | email | first_name | last_name |
+-------------+-------+------------+-----------+
| cadmin001   | admin | Admin      | Système   |
+-------------+-------+------------+-----------+
```

⚠️ **Il ne doit y avoir qu'UN SEUL utilisateur avec l'email "admin"**

### 3. Test de Connexion API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}' | python3 -m json.tool
```

Réponse attendue :
```json
{
    "message": "Connexion réussie",
    "token": "token_cadmin001_...",
    "user": {
        "id": "cadmin001",
        "email": "admin",
        "firstName": "Admin",
        "lastName": "Système",
        ...
    }
}
```

## Points Importants

### Règles de Validation des Mots de Passe

Le backend Spring Boot impose des règles strictes :

```java
// AuthService.java:154-174
- Minimum 8 caractères
- Alphanumérique uniquement (pas de caractères spéciaux)
- Doit contenir au moins une lettre ET un chiffre
```

Exemples valides : `admin123`, `Password1`, `Test2024`
Exemples invalides : `admin` (trop court), `NMB` (trop court), `Password!` (caractère spécial)

### Email Admin Sans Suffixe

L'email admin doit être **exactement** `"admin"` (sans `@mabanque.fr` ou autre suffixe).

La condition dans `sidebar.component.ts` est stricte :
```typescript
return this.currentUser?.email === 'admin';
```

### Extraction du Nom depuis l'Email

Le backend gère le cas spécial "admin" :

```java
// AuthService.java:182-184
if ("admin".equalsIgnoreCase(email)) {
    return new NamePair("Admin", "System");
}
```

## Résumé des Identifiants Admin

```
┌──────────────────────────────────┐
│   IDENTIFIANTS ADMINISTRATEUR    │
├──────────────────────────────────┤
│ Email:    admin                  │
│ Password: admin123               │
│                                  │
│ Nom affiché: Admin Système       │
└──────────────────────────────────┘
```

## Scripts Disponibles

- `create-admin.sh` → Créer l'utilisateur admin automatiquement
- `check-admin.sh` → Diagnostic complet de l'utilisateur admin
- `create-admin-user.sql` → Script SQL manuel (non recommandé)

## Fonctionnalités Admin Disponibles

Une fois connecté en tant qu'admin, vous avez accès à :

✅ **Gestion des Utilisateurs**
- Liste complète des utilisateurs
- Suppression d'utilisateurs
- Statistiques d'activité

✅ **Statistiques Système**
- Nombre d'utilisateurs
- Nombre d'événements
- Nombre de releases
- Nombre d'entrées d'historique

✅ **Sauvegarde & Restauration**
- Export complet de la BDD en JSON
- Import depuis un fichier JSON (⚠️ écrase les données)

---

**Date** : Décembre 2024
**Backend** : Spring Boot (Java 21)
**Frontend** : Angular 20
**Base de données** : MySQL 8.0
