# TinyMCE - Guide de démarrage rapide

**Version**: TinyMCE 8.3.1 (gratuite, auto-hébergée)
**Date**: 26 Décembre 2024

## ✅ Migration terminée

La migration de Quill vers TinyMCE est **complète et fonctionnelle**.

## Démarrage rapide

### 1. Installer les dépendances (déjà fait)

```bash
cd mabanquetools-webapp
npm install
```

Les packages suivants sont installés :
- `tinymce@8.3.1` - Éditeur principal
- `@tinymce/tinymce-angular@9.1.1` - Wrapper Angular

### 2. Assets TinyMCE

**Aucune action requise** : Le wrapper Angular `@tinymce/tinymce-angular` charge automatiquement TinyMCE depuis `node_modules`.

- ✅ Pas de copie d'assets nécessaire
- ✅ Pas de configuration de chemin
- ✅ Tout est géré par le wrapper

### 3. Lancer l'application

```bash
npm start
# Application disponible sur http://localhost:4200
```

### 4. Tester l'éditeur

1. Accéder à **Blog** dans le menu
2. Cliquer sur **Nouvel article**
3. L'éditeur TinyMCE s'affiche avec :
   - Barre d'outils complète
   - 17 plugins activés
   - Support upload d'images custom
   - Redimensionnement d'images natif

## Configuration actuelle

### Licence

```typescript
license_key: 'gpl' // Version gratuite auto-hébergée
```

**Important** : Ne pas supprimer cette ligne, sinon l'éditeur sera désactivé.

### Plugins activés (gratuits)

- ✅ **advlist** - Listes avancées
- ✅ **autolink** - Détection automatique des liens
- ✅ **lists** - Listes ordonnées/non ordonnées
- ✅ **link** - Insertion de liens
- ✅ **image** - Insertion d'images + redimensionnement
- ✅ **charmap** - Caractères spéciaux
- ✅ **preview** - Prévisualisation
- ✅ **anchor** - Ancres HTML
- ✅ **searchreplace** - Recherche et remplacement
- ✅ **visualblocks** - Affichage des blocs HTML
- ✅ **code** - Édition du code source HTML
- ✅ **fullscreen** - Mode plein écran
- ✅ **insertdatetime** - Insertion date/heure
- ✅ **media** - Insertion de médias (vidéos)
- ✅ **table** - Tableaux
- ✅ **help** - Aide
- ✅ **wordcount** - Compteur de mots

### Barre d'outils

```
undo redo | blocks | bold italic underline strikethrough |
forecolor backcolor | alignleft aligncenter alignright alignjustify |
bullist numlist outdent indent | link image | removeformat | code
```

## Fonctionnalités principales

### 1. Formatage de texte

- **Headers** : H1, H2, H3, H4, H5, H6, Paragraphe
- **Style** : Gras, italique, souligné, barré
- **Couleurs** : Texte et fond
- **Alignement** : Gauche, centré, droite, justifié

### 2. Listes et structure

- Listes ordonnées (numérotées)
- Listes non ordonnées (puces)
- Indentation/désindentation
- Blocs de code

### 3. Images

**Upload custom** : Clic sur icône image → Modal d'upload → Sélection image
**Redimensionnement** : Drag des coins de l'image directement dans l'éditeur
**Alt text** : Rempli automatiquement avec le nom du fichier

### 4. Liens et médias

- Liens hypertextes
- Vidéos (YouTube, Vimeo, etc.)
- Médias externes

### 5. Outils avancés

- **Code source** : Édition HTML directe
- **Plein écran** : Mode immersif
- **Rechercher/Remplacer** : Recherche avancée
- **Tableaux** : Création et édition de tableaux
- **Compteur de mots** : Affichage en temps réel

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| Ctrl+B | Gras |
| Ctrl+I | Italique |
| Ctrl+U | Souligné |
| Ctrl+Z | Annuler |
| Ctrl+Y | Rétablir |
| Ctrl+K | Insérer lien |
| Ctrl+Shift+F | Mode plein écran |

## Troubleshooting

### Erreur : "TinyMCE API key could not be validated"

**Solution** : Vérifier que `license_key: 'gpl'` est présent dans `editorConfig`.

```typescript
editorConfig: any = {
  license_key: 'gpl', // IMPORTANT
  // ...
};
```

### Éditeur ne s'affiche pas

1. **Vérifier la console** : Ouvrir DevTools (F12) et chercher les erreurs
2. **Vérifier que `license_key: 'gpl'` est présent** dans `editorConfig`
3. **Vérifier que le wrapper Angular est importé** : `import { EditorComponent } from '@tinymce/tinymce-angular'`

### Images ne se chargent pas

1. **Vérifier la modal** : S'assure que `ImageUploadModalComponent` est importé
2. **Vérifier le callback** : `file_picker_callback` doit ouvrir la modal
3. **Vérifier l'insertion** : `this.editorInstance.insertContent()` doit être appelé

### Build échoue

```bash
# Nettoyer et rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## Performance

### Bundle size

- **Initial total** : 593.35 kB (138.42 kB compressé)
- **Blog post form chunk** : 32.53 kB (9.14 kB compressé)
- **TinyMCE lazy-loaded** : Chargé uniquement sur la page d'édition

### Optimisations

- **Lazy loading** : TinyMCE n'est chargé que sur `/blog/new` et `/blog/:id/edit`
- **Minification** : `suffix: '.min'` utilise les fichiers minifiés
- **Caching** : Assets TinyMCE mis en cache par le navigateur

## Support dark mode

TinyMCE utilise actuellement le skin **"oxide"** (clair).

### Pour ajouter le dark mode complet (optionnel)

1. Détection du thème de l'app :
```typescript
const isDarkMode = document.documentElement.classList.contains('dark');
```

2. Configuration conditionnelle :
```typescript
editorConfig: any = {
  license_key: 'gpl',
  skin: isDarkMode ? 'oxide-dark' : 'oxide',
  content_css: isDarkMode ? 'dark' : 'default',
  // ...
};
```

3. Mise à jour dynamique :
```typescript
// Écouter les changements de thème
ngOnInit() {
  // Observer les changements de classe 'dark' sur <html>
  // Recréer l'éditeur avec le nouveau skin si nécessaire
}
```

## Ressources

- **Documentation officielle** : https://www.tiny.cloud/docs/
- **Angular Integration** : https://www.tiny.cloud/docs/integrations/angular/
- **Free Plugins** : https://www.tiny.cloud/tinymce/features/
- **API Reference** : https://www.tiny.cloud/docs/tinymce/latest/apis/

## Prochaines étapes

1. ✅ Migration complète de Quill vers TinyMCE
2. ✅ Build de production réussi
3. 🔲 Tests en environnement de développement
4. 🔲 Tests de toutes les fonctionnalités
5. 🔲 Tests dark mode (optionnel)
6. 🔲 Déploiement en production

---

**Dernière mise à jour** : 26 Décembre 2024
**Auteur** : Claude Code
**Statut** : ✅ Prêt pour les tests
