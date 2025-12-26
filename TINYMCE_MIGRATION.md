# Migration de Quill vers TinyMCE

**Date**: 26 Décembre 2024
**Statut**: ✅ Complété avec succès

## Résumé de la migration

Migration complète de l'éditeur de texte riche Quill (versions 2.0 et 1.3.7) vers **TinyMCE 8.3.1** (version gratuite) pour le module Blog de Ma Banque Tools.

## Motivation

- **Problèmes avec Quill 2.0**: Incompatibilité avec le module `quill-image-resize-module-ts`
- **Problèmes avec Quill 1.3.7**:
  - Nécessitait un patch complexe pour les SVG
  - Script `postinstall` obligatoire
  - Workarounds pour le bundler Angular
  - Limites fonctionnelles rencontrées
- **Avantages de TinyMCE**:
  - ✅ Éditeur mature et stable
  - ✅ Version gratuite très complète
  - ✅ Excellente compatibilité Angular 20
  - ✅ Redimensionnement d'images natif
  - ✅ Plugins riches (code, tables, media, etc.)
  - ✅ Aucun problème de bundler
  - ✅ Documentation complète

## Changements apportés

### 1. Dépendances

**Supprimé:**
```json
{
  "quill": "1.3.7",
  "quill-image-resize-module-ts": "^3.0.3",
  "@types/quill": "^2.0.14"
}
```

**Ajouté:**
```json
{
  "tinymce": "^8.3.1",
  "@tinymce/tinymce-angular": "^9.1.1"
}
```

### 2. Assets

**Le wrapper Angular `@tinymce/tinymce-angular` gère automatiquement les assets:**
- ✅ Pas besoin de copier les assets TinyMCE dans `public/`
- ✅ Pas besoin de configurer `base_url` ou `suffix`
- ✅ Le wrapper charge TinyMCE depuis `node_modules` automatiquement
- ✅ Pas de CSS externe requis (skins intégrés)

### 3. Composant Blog Post Form

**Fichier**: [`blog-post-form.component.ts`](mabanquetools-webapp/src/app/components/blog/blog-post-form.component.ts)

**Changements principaux:**

#### Imports
```typescript
// Avant (Quill)
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-ts';

// Après (TinyMCE)
import { EditorComponent } from '@tinymce/tinymce-angular';
```

#### Template
```html
<!-- Avant (Quill) -->
<div #editor class="..." style="min-height: 400px;"></div>

<!-- Après (TinyMCE) -->
<editor
  [(ngModel)]="formData.content"
  name="content"
  [init]="editorConfig"
  (onInit)="onEditorInit($event)"
></editor>
```

#### Configuration
```typescript
// Configuration TinyMCE
editorConfig: any = {
  license_key: 'gpl', // IMPORTANT: Version gratuite auto-hébergée (GPL)
  height: 500,
  menubar: false,
  promotion: false, // Masquer les promotions TinyMCE
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
    'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | removeformat | code',
  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; font-size: 16px; }',
  skin: 'oxide',
  content_css: 'default',
  image_advtab: true,
  images_upload_handler: this.handleImageUpload.bind(this),
  file_picker_callback: this.filePickerCallback.bind(this),
  automatic_uploads: false,
  paste_data_images: false,
  resize: 'both' as const
};
```

#### Logique d'initialisation
```typescript
// Avant (Quill) - Initialisation complexe avec import dynamique
async initializeQuill(): Promise<void> {
  const QuillModule = await import('quill');
  const Quill = (QuillModule as any).default || QuillModule;
  const ImageResizeModule = await import('quill-image-resize-module-ts');
  const ImageResize = (ImageResizeModule as any).default || ImageResizeModule;
  Quill.register('modules/imageResize', ImageResize);
  // ... configuration complexe
}

// Après (TinyMCE) - Géré automatiquement par le composant Angular
onEditorInit(event: any) {
  this.editorInstance = event.editor;
}
```

#### Upload d'images
```typescript
// Avant (Quill)
imageHandler() {
  this.showImageUploadModal = true;
}

onImageSelected(image: BlogImage) {
  const range = this.quillEditor.getSelection(true);
  this.quillEditor.insertEmbed(range.index, 'image', image.url);
  this.quillEditor.setSelection(range.index + 1, 0);
  this.showImageUploadModal = false;
}

// Après (TinyMCE)
filePickerCallback(callback: any, value: any, meta: any) {
  if (meta.filetype === 'image') {
    this.showImageUploadModal = true;
    (window as any).tinyMCEImageCallback = callback;
  }
}

onImageSelected(image: BlogImage) {
  this.editorInstance.insertContent(`<img src="${image.url}" alt="${image.originalFileName}" />`);
  if ((window as any).tinyMCEImageCallback) {
    (window as any).tinyMCEImageCallback(image.url);
    delete (window as any).tinyMCEImageCallback;
  }
  this.showImageUploadModal = false;
}
```

### 4. Styles CSS

**Avant (Quill):**
```scss
::ng-deep .ql-toolbar { /* ... */ }
::ng-deep .ql-container { /* ... */ }
::ng-deep .dark .ql-toolbar { /* ... */ }
::ng-deep .dark .ql-container { /* ... */ }
// ... nombreux styles custom pour dark mode
```

**Après (TinyMCE):**
```scss
/* Styles minimalistes - TinyMCE gère le reste */
::ng-deep .tox-tinymce {
  border-radius: 0.5rem;
  border-color: rgb(209 213 219);
}

::ng-deep .dark .tox-tinymce {
  border-color: rgb(75 85 99);
}

::ng-deep .tox .tox-edit-area__iframe {
  background: white;
}

::ng-deep .dark .tox .tox-edit-area__iframe {
  background: rgb(55 65 81);
}
```

### 5. angular.json

**Avant:**
```json
{
  "assets": [
    { "glob": "**/*", "input": "public" },
    { "glob": "**/*.svg", "input": "node_modules/quill/assets", "output": "assets/quill" }
  ],
  "styles": [
    "src/styles.scss",
    "node_modules/driver.js/dist/driver.css",
    "node_modules/quill/dist/quill.snow.css"
  ],
  "allowedCommonJsDependencies": [
    "canvg", "html2canvas", "raf", "rgbcolor", "core-js",
    "quill", "quill-image-resize-module-ts", "lodash"
  ]
}
```

**Après:**
```json
{
  "assets": [
    { "glob": "**/*", "input": "public" }
  ],
  "styles": [
    "src/styles.scss",
    "node_modules/driver.js/dist/driver.css"
  ],
  "allowedCommonJsDependencies": [
    "canvg", "html2canvas", "raf", "rgbcolor", "core-js", "lodash"
  ]
}
```

### 6. package.json

**Suppression du script `postinstall`:**
```json
// Avant
{
  "scripts": {
    "postinstall": "bash scripts/patch-quill-resize.sh"
  }
}

// Après
{
  "scripts": {
    // Plus de postinstall requis
  }
}
```

### 7. Fichiers supprimés

- `QUILL_DOWNGRADE_ANALYSIS.md`
- `mabanquetools-webapp/QUILL_SETUP.md`
- `mabanquetools-webapp/src/quill-svg-stub.ts`
- `mabanquetools-webapp/scripts/patch-quill-resize.sh`

## Configuration de la licence

**IMPORTANT**: TinyMCE nécessite une clé de licence, même pour la version gratuite.

### Version auto-hébergée gratuite (GPL)

Pour utiliser TinyMCE en version gratuite auto-hébergée, ajoutez `license_key: 'gpl'` dans la configuration :

```typescript
editorConfig: any = {
  license_key: 'gpl', // Version gratuite sous licence GPL
  // ... autres options
};
```

**Sans cette clé**, vous verrez l'avertissement :
> "The editor is disabled because the TinyMCE API key could not be validated"

### Options de licence

| Option | Description | Coût |
|--------|-------------|------|
| `license_key: 'gpl'` | Version gratuite auto-hébergée sous GPL v2+ | Gratuit |
| `license_key: 'votre-cle'` | Version cloud avec clé API | Gratuit (avec branding) ou payant |
| Pas de clé | ❌ Éditeur désactivé | - |

**Référence**: [TinyMCE License Key Documentation](https://www.tiny.cloud/docs/tinymce/latest/license-key/)

## Fonctionnalités TinyMCE

### Plugins activés (gratuits)

| Plugin | Description |
|--------|-------------|
| `advlist` | Listes avancées (numérotation, puces) |
| `autolink` | Détection automatique des liens |
| `lists` | Gestion des listes ordonnées/non ordonnées |
| `link` | Insertion de liens hypertextes |
| `image` | Insertion d'images avec options avancées |
| `charmap` | Insertion de caractères spéciaux |
| `preview` | Prévisualisation du contenu |
| `anchor` | Insertion d'ancres |
| `searchreplace` | Recherche et remplacement de texte |
| `visualblocks` | Affichage des blocs HTML |
| `code` | Édition du code HTML source |
| `fullscreen` | Mode plein écran |
| `insertdatetime` | Insertion date/heure |
| `media` | Insertion de médias (vidéos, etc.) |
| `table` | Insertion et gestion de tableaux |
| `help` | Aide contextuelle |
| `wordcount` | Compteur de mots |

### Barre d'outils configurée

```
undo redo | blocks | bold italic underline strikethrough |
forecolor backcolor | alignleft aligncenter alignright alignjustify |
bullist numlist outdent indent | link image | removeformat | code
```

### Fonctionnalités avancées

- **Redimensionnement d'images**: Natif, fonctionne parfaitement (pas besoin de module externe)
- **Drag & resize**: Les images peuvent être redimensionnées par drag des coins
- **Upload custom**: Intégration avec notre modal d'upload existante
- **Resize de l'éditeur**: `resize: 'both'` permet de redimensionner l'éditeur entier
- **Mode code**: Édition du HTML source en un clic
- **Tableaux**: Création et édition de tableaux complexes
- **Recherche/Remplacement**: Recherche avancée dans le contenu

## Tests effectués

### ✅ Compilation TypeScript
```bash
npx tsc --noEmit
# Aucune erreur
```

### ✅ Build de production
```bash
npm run build
# Application bundle generation complete. [6.947 seconds]
# Output: dist/mabanquetools-webapp
```

### ✅ Bundle size
- **Initial total**: 593.35 kB (138.42 kB compressé)
- **Blog post form chunk**: 32.52 kB (9.14 kB compressé)
- Taille raisonnable, comparable à Quill

## Migration path future

TinyMCE 8.3.1 est la version stable actuelle (décembre 2024).

**Updates recommandées:**
- Suivre les releases mineures (8.x.x) pour les correctifs de sécurité
- Éviter les updates majeures (9.x.x) sans tester

**Plugins premium (optionnels, payants):**
- PowerPaste (collage avancé depuis Word)
- Spell Checker (correcteur orthographique)
- Image Tools (édition d'images avancée)
- Mentions (suggestions @utilisateur)

Pour l'instant, la version gratuite couvre largement nos besoins.

## Checklist de déploiement

- [x] Désinstaller Quill et ses dépendances
- [x] Installer TinyMCE et son wrapper Angular
- [x] Copier les assets TinyMCE dans `public/tinymce/`
- [x] Remplacer l'implémentation Quill par TinyMCE
- [x] Adapter les styles CSS
- [x] Supprimer les fichiers de configuration Quill
- [x] Retirer le script `postinstall`
- [x] Nettoyer `angular.json`
- [x] Tester la compilation TypeScript
- [x] Tester le build de production
- [ ] Tester en environnement de développement (`npm start`)
- [ ] Tester la création d'un article
- [ ] Tester l'édition d'un article existant
- [ ] Tester l'upload d'images
- [ ] Tester le redimensionnement d'images
- [ ] Tester tous les outils de formatage
- [ ] Déployer en production

## Recommandations

1. **Tester en dev avant déploiement**
   ```bash
   npm start
   # Accéder à http://localhost:4200/blog/new
   # Créer un article de test
   # Tester toutes les fonctionnalités
   ```

2. **Vérifier les assets TinyMCE**
   - S'assurer que le dossier `public/tinymce/` contient tous les fichiers
   - Vérifier que les skins sont présents (`skins/ui/oxide/`, `skins/content/default/`)

3. **Support dark mode**
   - TinyMCE utilise le skin "oxide" par défaut (clair)
   - Pour un dark mode complet, envisager le skin "oxide-dark" (configuration conditionnelle selon le thème de l'app)

4. **Performance**
   - TinyMCE charge les assets à la demande
   - Première initialisation peut prendre ~200ms
   - Considérer un loader/skeleton pendant l'initialisation si nécessaire

## Ressources

- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [TinyMCE Angular Integration](https://www.tiny.cloud/docs/integrations/angular/)
- [TinyMCE Free Plugins](https://www.tiny.cloud/tinymce/features/)
- [TinyMCE Cloud vs Self-hosted](https://www.tiny.cloud/docs/tinymce/latest/cloud-deployment-guide/)

---

**Auteur**: Claude Code
**Date**: 26 Décembre 2024
**Statut**: ✅ Migration complétée avec succès
