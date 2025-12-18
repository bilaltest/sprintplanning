# 🚀 COMMENCEZ ICI

Bienvenue dans **Planning DSI** - votre application de gestion d'événements !

## ⚡ Installation Rapide (3 minutes)

### Étape 1 : Installer Node.js (si pas déjà fait)

**Vérifier si Node.js est installé :**
```bash
node --version
```

Si vous voyez `v18.x.x` ou supérieur → **Passez à l'étape 2**

Sinon, installez Node.js :
- **macOS** : `brew install node`
- **Windows** : https://nodejs.org/ (télécharger installateur LTS)
- **Linux** : `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`

### Étape 2 : Installer les dépendances

```bash
cd event-planning-app
npm install
```

⏱️ Cela prend 2-5 minutes (télécharge ~200 MB)

### Étape 3 : Lancer l'application

```bash
npm start
```

Attendez le message :
```
** Angular Live Development Server is listening on localhost:4200 **
```

### Étape 4 : Ouvrir dans le navigateur

```
http://localhost:4200
```

**✅ C'est tout ! L'application fonctionne.**

---

## 📚 Documentation

Lisez les guides dans cet ordre :

1. **[QUICK_START.md](QUICK_START.md)** ← Commencez ici !
   - Premier usage
   - Créer un événement
   - Naviguer dans le planning
   - Raccourcis clavier

2. **[README.md](README.md)** ← Guide complet
   - Toutes les fonctionnalités
   - Stack technique
   - Architecture
   - Personnalisation

3. **[INSTALLATION.md](INSTALLATION.md)** ← Si problème
   - Troubleshooting
   - Déploiement
   - Configuration avancée

4. **[ARCHITECTURE.md](ARCHITECTURE.md)** ← Pour développeurs
   - Design patterns
   - Flux de données
   - Modèles
   - Tests

5. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** ← Vue d'ensemble
   - Statistiques projet
   - Fichiers créés
   - Roadmap
   - Checklist

---

## 🎯 Fonctionnalités Principales

### ✅ Ce qui fonctionne dès maintenant

- **Timeline 3 vues** : Année / Trimestre / Mois
- **Gestion événements** : Créer, Modifier, Supprimer
- **12 catégories** : MEP, Incident, Maintenance, etc.
- **Filtres avancés** : Recherche, période, catégories
- **Export** : PDF, PNG, JSON, CSV
- **Historique** : 20 dernières actions + rollback
- **Paramètres** : Thème sombre, langue, calendrier
- **100% local** : Pas de backend, données dans le navigateur

### ⏳ À venir (roadmap)

- Drag & drop événements
- Templates réutilisables
- Tests unitaires
- PWA offline
- Mode collaboration

---

## 🔧 Commandes Utiles

```bash
# Développement
npm start              # Lancer serveur dev (port 4200)
npm run build          # Build production

# Tests (structure prête, à écrire)
npm test               # Lancer tests Jest
npm run test:coverage  # Rapport coverage

# Utilitaires
npm run lint           # Vérifier code
```

---

## 📁 Structure du Projet

```
event-planning-app/
├── 📄 START_HERE.md           ← Vous êtes ici !
├── 📄 QUICK_START.md          ← Guide démarrage rapide
├── 📄 README.md               ← Documentation complète
├── 📄 INSTALLATION.md         ← Guide installation
├── 📄 ARCHITECTURE.md         ← Doc technique
├── 📄 PROJECT_SUMMARY.md      ← Résumé projet
├── 📄 CHANGELOG.md            ← Historique versions
│
├── 📦 package.json            ← Dépendances
├── ⚙️ angular.json            ← Config Angular
├── ⚙️ tsconfig.json           ← Config TypeScript
├── 🎨 tailwind.config.js      ← Thème & couleurs
│
└── src/
    ├── 🏠 main.ts             ← Point d'entrée
    ├── 🌐 index.html          ← HTML racine
    ├── 🎨 styles.scss         ← Styles globaux
    │
    └── app/
        ├── 🧩 components/     ← Composants UI
        │   ├── timeline/      ← Vues année/trimestre/mois
        │   ├── modals/        ← Modal création/édition
        │   ├── filters/       ← Barre filtres
        │   ├── settings/      ← Page paramètres
        │   └── history/       ← Page historique
        │
        ├── 🔧 services/       ← Logique métier
        │   ├── event.service.ts      ← CRUD événements
        │   ├── filter.service.ts     ← Filtres
        │   ├── export.service.ts     ← Export PDF/PNG/JSON/CSV
        │   ├── history.service.ts    ← Rollback
        │   ├── settings.service.ts   ← Préférences
        │   └── database.service.ts   ← IndexedDB
        │
        └── 📊 models/         ← Types TypeScript
            ├── event.model.ts
            ├── filter.model.ts
            ├── settings.model.ts
            └── history.model.ts
```

---

## 🆘 Problèmes Courants

### L'application ne démarre pas

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port 4200 déjà utilisé

```bash
# Utiliser un autre port
ng serve --port 4300
```

### Événements disparus

Ouvrir DevTools (F12) → Application → IndexedDB → EventPlanningDB

**Réinitialiser la base :**
```javascript
indexedDB.deleteDatabase('EventPlanningDB');
location.reload();
```

Plus de solutions dans [INSTALLATION.md](INSTALLATION.md)

---

## 🎓 Apprendre le Code

### Pour les débutants

1. Lire [README.md](README.md) pour comprendre les fonctionnalités
2. Créer quelques événements pour tester
3. Explorer le code dans `src/app/components/`

### Pour les développeurs

1. Lire [ARCHITECTURE.md](ARCHITECTURE.md) en détail
2. Analyser le flux de données (diagrammes inclus)
3. Regarder les services dans `src/app/services/`
4. Étudier les modèles TypeScript

### Pour contribuer

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Écrire des tests : `src/**/*.spec.ts`
3. Suivre les conventions de code (`.editorconfig`)
4. Documenter les changements dans `CHANGELOG.md`

---

## 🌟 Prochaines Étapes

### 1. Tester l'application (15 min)

- Créer 5-10 événements variés
- Tester les 3 vues
- Utiliser les filtres
- Exporter en PDF
- Activer thème sombre

### 2. Personnaliser (30 min)

- Modifier couleurs dans `tailwind.config.js`
- Ajouter une nouvelle catégorie dans `event.model.ts`
- Changer le logo dans `app.component.ts`

### 3. Développer (1h+)

- Lire [ARCHITECTURE.md](ARCHITECTURE.md)
- Implémenter drag & drop
- Ajouter tests unitaires
- Créer templates d'événements

---

## 📞 Support

**Questions ?** → Contacter l'équipe DSI

**Bug trouvé ?** → Créer une issue GitHub

**Suggestion ?** → Modifier `CHANGELOG.md` et proposer une PR

---

## ✅ Checklist Premier Lancement

- [ ] Node.js installé (v18+)
- [ ] Dépendances installées (`npm install`)
- [ ] Application lancée (`npm start`)
- [ ] Page ouverte (http://localhost:4200)
- [ ] Premier événement créé
- [ ] Filtres testés
- [ ] Export PDF réussi
- [ ] Thème sombre activé
- [ ] Documentation lue (au moins README.md)

---

**🎉 Bon planning !**

Développé avec ❤️ pour la DSI Bancaire
