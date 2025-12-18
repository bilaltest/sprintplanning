# Quick Start Guide

## Installation en 3 minutes

### 1️⃣ Prérequis

Vérifiez que Node.js est installé :
```bash
node --version
# Devrait afficher v18.x.x ou supérieur
```

**Si Node.js n'est pas installé :**
- macOS : `brew install node`
- Windows : Télécharger sur https://nodejs.org/
- Linux : `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`

### 2️⃣ Installation

```bash
# Aller dans le dossier du projet
cd event-planning-app

# Installer les dépendances (2-5 minutes)
npm install
```

### 3️⃣ Lancement

```bash
# Démarrer le serveur de développement
npm start

# Attendre le message :
# ** Angular Live Development Server is listening on localhost:4200 **
```

### 4️⃣ Accès

Ouvrir dans votre navigateur :
```
http://localhost:4200
```

**C'est tout ! L'application est prête.**

---

## Premier Usage

### Créer votre premier événement

1. Cliquer sur **"Nouvel événement"** (bouton vert en haut à droite)
2. Remplir le formulaire :
   - **Titre** : "Mise en production Q1"
   - **Date** : Choisir une date
   - **Catégorie** : Cliquer sur "Mise en production" (vert)
   - **Description** : (optionnel) "Déploiement nouvelle version"
3. Cliquer sur **"Créer"**

Votre événement apparaît dans le calendrier !

### Naviguer dans le planning

- **Flèches ← →** : Changer de mois/trimestre/année
- **Vue sélecteur** : Basculer entre Année / Trimestre / Mois
- **Bouton "Aujourd'hui"** : Revenir à la date actuelle

### Filtrer les événements

1. Dans la barre de filtres :
   - **Recherche** : Taper "mise en production"
   - **Catégories** : Cliquer sur les badges colorés
   - **Période** : Sélectionner une plage de dates

2. Cliquer **"Réinitialiser"** pour effacer les filtres

### Exporter le planning

1. Cliquer sur **"Exporter"**
2. Choisir le format :
   - **PDF** : Idéal pour impression
   - **PNG** : Image haute qualité
   - **JSON** : Sauvegarde données
   - **CSV** : Import Excel

---

## Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `←` | Période précédente |
| `→` | Période suivante |

---

## Paramètres Rapides

### Activer le thème sombre

1. Cliquer sur l'icône 🌙 en haut à droite
   **OU**
2. Aller dans **Paramètres** → Choisir "Sombre"

### Changer la langue

1. Aller dans **Paramètres**
2. Section "Langue"
3. Choisir **Français** ou **English**

### Changer le premier jour de la semaine

1. Aller dans **Paramètres**
2. Section "Calendrier"
3. Choisir **Lundi** (Europe) ou **Dimanche** (US)

---

## Données de Démo

Pour tester l'application, vous pouvez créer quelques événements types :

### Événements MEP (vert)
- "Déploiement Prod v2.1" - Date future
- "Mise en production Q1" - Date passée

### Événements Incident (rouge)
- "Incident base de données" - Aujourd'hui
- "Crash serveur" - Date passée

### Événements Maintenance (orange)
- "Maintenance serveurs" - Weekend prochain
- "Mise à jour sécurité" - Date future

**Conseil** : Créer 10-15 événements pour voir le rendu complet.

---

## Fonctionnalités Avancées

### Annuler une action (Rollback)

1. Aller dans **Historique**
2. Voir les 20 dernières modifications
3. Cliquer sur le bouton **↩** pour annuler
4. Confirmer l'annulation

L'événement est restauré !

### Dupliquer un événement

```typescript
// Fonctionnalité disponible via service (UI à venir)
await eventService.duplicateEvent(eventId, newDate);
```

### Personnaliser les couleurs

1. Aller dans **Paramètres**
2. Section "Apparence"
3. Choisir couleurs personnalisées (UI à venir)

---

## Troubleshooting

### L'application ne démarre pas

```bash
# Solution 1 : Vérifier Node.js
node --version

# Solution 2 : Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port 4200 déjà utilisé

```bash
# Lancer sur un autre port
ng serve --port 4300
```

### Événements disparus

Vérifier IndexedDB :
1. Ouvrir DevTools (F12)
2. Onglet "Application"
3. Storage → IndexedDB → EventPlanningDB
4. Vérifier table "events"

**Réinitialiser la base :**
```javascript
// Dans la console DevTools
indexedDB.deleteDatabase('EventPlanningDB');
location.reload();
```

---

## Prochaines Étapes

### Explorer toutes les fonctionnalités

- ✅ Créer des événements dans toutes les catégories
- ✅ Tester les 3 vues (Année/Trimestre/Mois)
- ✅ Utiliser les filtres combinés
- ✅ Exporter en PDF et PNG
- ✅ Tester le rollback
- ✅ Basculer entre thème clair/sombre

### Personnaliser l'application

- Modifier `tailwind.config.js` pour changer les couleurs
- Ajouter de nouvelles catégories dans `event.model.ts`
- Créer vos propres templates d'événements

### Contribuer

- Lire `ARCHITECTURE.md` pour comprendre le code
- Ajouter des tests unitaires
- Implémenter le drag & drop
- Traduire en anglais (i18n)

---

## Ressources Utiles

### Documentation
- [README.md](README.md) - Guide complet
- [INSTALLATION.md](INSTALLATION.md) - Installation détaillée
- [ARCHITECTURE.md](ARCHITECTURE.md) - Documentation technique
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Résumé du projet

### Technologies
- [Angular Docs](https://angular.dev)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Dexie.js](https://dexie.org)
- [date-fns](https://date-fns.org)

### Support
Contacter l'équipe DSI pour toute question.

---

**Bon planning !** 📅
