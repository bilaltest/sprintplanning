# 🚀 Instructions de Démarrage - Menu Admin

## ⚠️ Situation Actuelle

L'erreur 400 "Email ou mot de passe incorrect" se produit car :
- ✅ L'ancien utilisateur admin (avec mot de passe "NMB") a été **supprimé**
- ⚠️ Le backend Spring Boot tourne avec l'**ancien code**
- 🔄 Il faut **redémarrer** le backend pour charger le nouveau code

## 📋 Étapes à Suivre

### Étape 1 : Arrêter le Backend Actuel

Dans le terminal où tourne Spring Boot, faites **Ctrl+C** pour l'arrêter.

### Étape 2 : Redémarrer le Backend avec le Nouveau Code

```bash
cd event-planning-spring-boot/event-planning-api
./mvnw spring-boot:run
```

Attendez le message : `Started MaBanqueToolsApiApplication in X seconds`

### Étape 3 : Créer l'Utilisateur Admin

Dans un **nouveau terminal** :

```bash
cd /Users/bilal/Documents/Projets\ perso/Claude/Planning/event-planning-spring-boot
./create-admin.sh
```

Vous devriez voir :
```
✅ Utilisateur admin créé avec succès !

==========================================
  Informations de connexion
==========================================
Email:    admin
Password: admin123
==========================================
```

### Étape 4 : Se Connecter à l'Application Angular

1. Ouvrez l'application Angular (http://localhost:4200)
2. Connectez-vous avec :
   - **Email** : `admin`
   - **Password** : `admin123`

### Étape 5 : Vérifier le Menu Admin

Le menu **Admin** doit maintenant apparaître dans la sidebar ! 🎉

## 🔍 Vérification Rapide

Si le menu n'apparaît toujours pas, ouvrez la Console DevTools (F12) et tapez :

```javascript
JSON.parse(sessionStorage.getItem('planning_user'))
```

Vérifiez que :
- `email` est exactement `"admin"` (sans suffixe)
- Les autres champs sont présents (`id`, `firstName`, `lastName`, etc.)

## 🛠️ En Cas de Problème

### Le backend ne démarre pas ?

Vérifiez que MySQL est bien démarré et accessible :
```bash
/usr/local/mysql/bin/mysql -u eventplanning -peventplanning123 eventplanning -e "SELECT 1;"
```

### L'utilisateur admin n'est pas créé ?

Vérifiez manuellement :
```bash
/usr/local/mysql/bin/mysql -u eventplanning -peventplanning123 eventplanning -e "SELECT id, email, first_name FROM app_user WHERE email = 'admin';"
```

Devrait retourner :
```
+-------------+-------+------------+
| id          | email | first_name |
+-------------+-------+------------+
| cadmin001   | admin | Admin      |
+-------------+-------+------------+
```

### La connexion échoue encore ?

Utilisez le script de diagnostic :
```bash
cd /Users/bilal/Documents/Projets\ perso/Claude/Planning
./check-admin.sh
```

Ce script vérifie :
1. ✅ Backend accessible
2. ✅ Utilisateur admin créé
3. ✅ Connexion fonctionnelle avec admin/admin123
4. ✅ Email retourné correct

## 📝 Résumé des Identifiants

```
┌──────────────────────────────────┐
│   IDENTIFIANTS ADMINISTRATEUR    │
├──────────────────────────────────┤
│ Email:    admin                  │
│ Password: admin123               │
│                                  │
│ ⚠️  Ancien password "NMB" ne     │
│     fonctionne plus !            │
└──────────────────────────────────┘
```

## ✨ Après Connexion

Une fois connecté en tant qu'admin, vous aurez accès à :

- 👥 **Gestion des utilisateurs** (liste, suppression)
- 📊 **Statistiques** (users, events, releases, historique)
- 💾 **Export/Import BDD** (sauvegarde complète en JSON)

---

**Note Importante** : Le mot de passe a été changé de "NMB" vers "admin123" pour respecter les règles de validation du backend Spring Boot (minimum 8 caractères, alphanumérique, avec lettres ET chiffres).
