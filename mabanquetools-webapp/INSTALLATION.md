# Guide d'Installation Détaillé

## Prérequis Système

### 1. Installer Node.js

#### macOS
```bash
# Via Homebrew (recommandé)
brew install node

# Ou télécharger depuis https://nodejs.org/
```

#### Windows
```bash
# Télécharger l'installateur depuis https://nodejs.org/
# Choisir la version LTS (Long Term Support)
```

#### Linux (Ubuntu/Debian)
```bash
# Via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Vérifier l'installation

```bash
node --version  # Devrait afficher v18.x.x ou supérieur
npm --version   # Devrait afficher v9.x.x ou supérieur
```

## Installation du Projet

### Étape 1 : Récupérer le Code

```bash
# Si vous avez un ZIP, extraire le contenu
unzip event-planning-app.zip
cd event-planning-app

# OU via Git
git clone <repository-url>
cd event-planning-app
```

### Étape 2 : Installer les Dépendances

```bash
# Installer toutes les dépendances Node
npm install

# Cela va télécharger :
# - Angular 20
# - TypeScript 5.7
# - TailwindCSS 4.0
# - Dexie.js
# - date-fns
# - html2canvas + jsPDF
# - Et toutes les dépendances de développement
```

**Note** : Cette étape peut prendre 2-5 minutes selon votre connexion internet.

### Étape 3 : Lancer l'Application

```bash
# Démarrer le serveur de développement
npm start

# Attendez le message :
# ** Angular Live Development Server is listening on localhost:4200 **
```

### Étape 4 : Ouvrir dans le Navigateur

Ouvrir votre navigateur et aller à :
```
http://localhost:4200
```

L'application devrait se charger automatiquement.

## Problèmes Courants

### Erreur : "command not found: npm"

**Solution** : Node.js n'est pas installé ou pas dans le PATH
```bash
# Réinstaller Node.js
# Vérifier le PATH
echo $PATH  # macOS/Linux
echo %PATH%  # Windows
```

### Erreur : "EACCES: permission denied"

**Solution macOS/Linux** :
```bash
# NE PAS utiliser sudo avec npm install
# À la place, configurer npm pour utiliser un dossier local
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Erreur : "Port 4200 is already in use"

**Solution** :
```bash
# Arrêter le processus qui utilise le port 4200
# OU lancer sur un autre port
ng serve --port 4300
```

### Erreur de Build TailwindCSS

**Solution** :
```bash
# Réinstaller TailwindCSS
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```

### Erreur "Module not found"

**Solution** :
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## Build de Production

### Créer un Build Optimisé

```bash
npm run build

# Les fichiers seront générés dans le dossier dist/
# Prêts pour être déployés sur un serveur web
```

### Tester le Build de Production

```bash
# Installer un serveur HTTP simple
npm install -g http-server

# Servir les fichiers
cd dist/event-planning-app
http-server -p 8080

# Ouvrir http://localhost:8080
```

## Déploiement

### Option 1 : Serveur Web (Apache/Nginx)

1. Copier le contenu de `dist/event-planning-app` sur le serveur
2. Configurer le serveur pour servir `index.html` pour toutes les routes

**Nginx** :
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache** (.htaccess) :
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Option 2 : GitHub Pages

```bash
# Installer angular-cli-ghpages
npm install -g angular-cli-ghpages

# Build et déployer
ng build --base-href "/event-planning-app/"
npx angular-cli-ghpages --dir=dist/event-planning-app
```

### Option 3 : Netlify

1. Connecter le repository GitHub à Netlify
2. Build command : `npm run build`
3. Publish directory : `dist/event-planning-app`

## Configuration Avancée

### Variables d'Environnement

Modifier `src/environments/environment.ts` :
```typescript
export const environment = {
  production: false,
  version: '1.0.0',
  appName: 'Planning DSI',
  // Ajouter vos variables ici
};
```

### Personnaliser le Port

```bash
# Dans package.json
"start": "ng serve --port 4300"
```

### Activer HTTPS en Dev

```bash
ng serve --ssl
# Ouvrir https://localhost:4200
```

## Support et Aide

### Logs de Debug

```bash
# Lancer avec logs détaillés
ng serve --verbose
```

### Vérifier l'IndexedDB

1. Ouvrir DevTools (F12)
2. Onglet "Application"
3. Storage → IndexedDB → EventPlanningDB
4. Vérifier les tables : events, templates, preferences, history

### Réinitialiser l'Application

```bash
# Supprimer les données IndexedDB
# Dans DevTools → Application → IndexedDB → EventPlanningDB → Bouton "Delete database"

# Ou via code console
indexedDB.deleteDatabase('EventPlanningDB');
location.reload();
```

## Ressources

- [Documentation Angular](https://angular.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Dexie.js Guide](https://dexie.org)
- [date-fns Docs](https://date-fns.org)

---

**Besoin d'aide ?** Contactez l'équipe DSI.
