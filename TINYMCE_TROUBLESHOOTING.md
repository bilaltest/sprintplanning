# TinyMCE - Guide de dépannage

## Erreur : "The editor is disabled because the TinyMCE API key could not be validated"

### Cause

Cette erreur se produit lorsque TinyMCE ne peut pas valider la clé de licence.

### Solution

✅ **Assurer que `license_key: 'gpl'` est présent dans la configuration**

```typescript
editorConfig: any = {
  license_key: 'gpl', // IMPORTANT : Ne pas oublier cette ligne !
  height: 500,
  // ... autres options
};
```

### Vérifications

1. **Ouvrir** [blog-post-form.component.ts](mabanquetools-webapp/src/app/components/blog/blog-post-form.component.ts:187)

2. **Vérifier** que la ligne `license_key: 'gpl'` est présente dans `editorConfig`

3. **Redémarrer** le serveur de développement après toute modification :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   npm start
   ```

## Configuration correcte (2024-12-26)

### ✅ Configuration simplifiée

```typescript
// TinyMCE configuration
editorConfig: any = {
  license_key: 'gpl', // Version gratuite auto-hébergée (GPL)
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

### ❌ Configurations incorrectes

**NE PAS UTILISER :**

```typescript
// ❌ Sans license_key
editorConfig: any = {
  height: 500,
  // ... autres options
};

// ❌ Avec base_url (le wrapper Angular gère les assets automatiquement)
editorConfig: any = {
  license_key: 'gpl',
  base_url: '/tinymce', // ❌ Ne pas utiliser
  suffix: '.min',       // ❌ Ne pas utiliser
  // ...
};

// ❌ Avec une clé API cloud (nécessite un compte payant)
editorConfig: any = {
  license_key: 'votre-cle-api', // ❌ Sauf si vous avez un compte TinyMCE Cloud
  // ...
};
```

## Gestion des assets

### ✅ Wrapper Angular (Recommandé)

Le wrapper `@tinymce/tinymce-angular` charge **automatiquement** TinyMCE depuis `node_modules`.

**Avantages :**
- ✅ Pas de copie d'assets nécessaire
- ✅ Pas de configuration de chemin
- ✅ Updates simplifiées (juste `npm update tinymce`)

**Configuration :**
```typescript
// Aucune config de chemin requise
editorConfig: any = {
  license_key: 'gpl',
  // ... pas de base_url, pas de suffix
};
```

### ❌ Copie manuelle des assets (Non recommandé)

**Ne pas faire :**
```bash
# ❌ Pas nécessaire avec le wrapper Angular
cp -r node_modules/tinymce/* public/tinymce/
```

**Si vous avez déjà copié les assets :**
```bash
# Supprimer le dossier
rm -rf public/tinymce
```

## Autres erreurs courantes

### Erreur : "Cannot read property 'insertContent' of undefined"

**Cause** : `this.editorInstance` n'est pas encore initialisé.

**Solution** : Vérifier que `onEditorInit` est bien appelé :

```typescript
onEditorInit(event: any) {
  this.editorInstance = event.editor;
  console.log('TinyMCE initialized:', this.editorInstance); // Debug
}
```

### Erreur : "Failed to load plugin: xxx"

**Cause** : Plugin non disponible dans la version gratuite.

**Solution** : Vérifier la liste des [plugins gratuits](https://www.tiny.cloud/tinymce/features/) et retirer les plugins premium de la configuration.

**Plugins gratuits disponibles :**
- advlist, autolink, lists, link, image, charmap, preview
- anchor, searchreplace, visualblocks, code, fullscreen
- insertdatetime, media, table, help, wordcount

### Warning : "This domain is not registered with TinyMCE Cloud"

**Cause** : TinyMCE pense que vous utilisez le cloud.

**Solution** : Assurer que `license_key: 'gpl'` est défini et que vous **n'avez pas** de `api_key` dans la configuration.

### Éditeur s'affiche mais est vide

**Cause** : Le binding `[(ngModel)]` ne fonctionne pas.

**Solution** : Vérifier que `FormsModule` est importé dans le composant :

```typescript
@Component({
  // ...
  imports: [CommonModule, FormsModule, EditorComponent, ImageUploadModalComponent],
  // ...
})
```

## Tests de diagnostic

### 1. Vérifier que TinyMCE est installé

```bash
npm list tinymce @tinymce/tinymce-angular
```

**Résultat attendu :**
```
mabanquetools-backend@1.0.0
├── @tinymce/tinymce-angular@9.1.1
└── tinymce@8.3.1
```

### 2. Vérifier la console du navigateur

1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Console**
3. Chercher les erreurs TinyMCE

**Erreurs à rechercher :**
- `Failed to load...` → Problème de chargement de plugin
- `Invalid license key` → Problème de clé de licence
- `Cannot read property...` → Problème d'initialisation

### 3. Vérifier l'initialisation de l'éditeur

Ajouter des logs de debug dans le composant :

```typescript
onEditorInit(event: any) {
  this.editorInstance = event.editor;
  console.log('✅ TinyMCE initialized successfully!');
  console.log('Editor instance:', this.editorInstance);
  console.log('Config used:', this.editorConfig);
}
```

### 4. Test minimal

Créer un composant de test minimal :

```typescript
// test-tinymce.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-test-tinymce',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorComponent],
  template: `
    <h1>Test TinyMCE</h1>
    <editor
      [(ngModel)]="content"
      [init]="{ license_key: 'gpl', height: 300 }"
    ></editor>
    <pre>{{ content }}</pre>
  `
})
export class TestTinyMCEComponent {
  content = '<p>Test</p>';
}
```

Si ce composant minimal fonctionne, le problème vient de la configuration avancée.

## Checklist de dépannage

- [ ] `license_key: 'gpl'` est présent dans `editorConfig`
- [ ] Pas de `base_url` ou `suffix` dans la config
- [ ] `EditorComponent` est importé depuis `@tinymce/tinymce-angular`
- [ ] `FormsModule` est importé dans le composant
- [ ] Le serveur de développement a été redémarré après les modifications
- [ ] La console du navigateur ne montre pas d'erreurs
- [ ] Les packages `tinymce` et `@tinymce/tinymce-angular` sont installés
- [ ] Le dossier `public/tinymce/` a été supprimé (si présent)

## Support et ressources

- **Documentation officielle** : https://www.tiny.cloud/docs/
- **Angular Integration** : https://www.tiny.cloud/docs/integrations/angular/
- **License Key Guide** : https://www.tiny.cloud/docs/tinymce/latest/license-key/
- **GitHub Issues** : https://github.com/tinymce/tinymce-angular/issues

---

**Dernière mise à jour** : 26 Décembre 2024
**Auteur** : Claude Code
