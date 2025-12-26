# TinyMCE - Instructions de test

## 🎯 Ce qui a été fait

✅ Migration complète de Quill vers TinyMCE
✅ Correction de l'erreur "API key could not be validated"
✅ Configuration simplifiée (sans `base_url` ni `suffix`)
✅ Suppression des assets inutiles dans `public/tinymce/`

## 🚀 Comment tester MAINTENANT

### 1. Redémarrer le serveur Angular

```bash
cd mabanquetools-webapp

# Arrêter le serveur actuel (Ctrl+C si en cours)
# Puis relancer :
npm start
```

### 2. Ouvrir l'application

```
http://localhost:4200
```

### 3. Tester l'éditeur

1. Cliquer sur **Blog** dans le menu
2. Cliquer sur **Nouvel article**
3. **Vous devriez voir** l'éditeur TinyMCE s'afficher correctement

### ✅ Résultat attendu

L'éditeur doit s'afficher avec :
- Barre d'outils complète (gras, italique, couleurs, etc.)
- 17 plugins activés
- **AUCUN message d'erreur** concernant la clé API
- Interface propre sans publicités

## 🔧 Si l'erreur persiste

### Solution rapide

1. **Ouvrir** [blog-post-form.component.ts](mabanquetools-webapp/src/app/components/blog/blog-post-form.component.ts#L187)

2. **Vérifier** que cette ligne est présente :
   ```typescript
   license_key: 'gpl', // Version gratuite auto-hébergée (GPL)
   ```

3. **Vérifier** que ces lignes sont **ABSENTES** :
   ```typescript
   base_url: '/tinymce',  // ❌ NE DOIT PAS ÊTRE LÀ
   suffix: '.min',        // ❌ NE DOIT PAS ÊTRE LÀ
   ```

4. **Redémarrer** le serveur après toute modification

### Nettoyage complet (si nécessaire)

```bash
# Nettoyer complètement
rm -rf node_modules package-lock.json dist

# Réinstaller
npm install

# Relancer
npm start
```

## 📚 Documentation complète

Si vous voulez comprendre en détail :

1. **[TINYMCE_FIX_FINAL.md](TINYMCE_FIX_FINAL.md)** - Solution complète et résumé
2. **[TINYMCE_TROUBLESHOOTING.md](TINYMCE_TROUBLESHOOTING.md)** - Guide de dépannage détaillé
3. **[TINYMCE_MIGRATION.md](TINYMCE_MIGRATION.md)** - Guide de migration complet

## 💡 Points clés à retenir

### ✅ Configuration correcte actuelle

```typescript
editorConfig: any = {
  license_key: 'gpl', // ← Obligatoire pour la version gratuite
  height: 500,
  menubar: false,
  promotion: false,
  plugins: [ /* ... */ ],
  // ... autres options
};
```

### ❌ Ce qu'il NE faut PAS faire

- ❌ Copier les assets TinyMCE dans `public/`
- ❌ Utiliser `base_url` ou `suffix`
- ❌ Oublier `license_key: 'gpl'`

## 📞 Besoin d'aide ?

Si vous rencontrez toujours l'erreur après avoir :
1. ✅ Vérifié la présence de `license_key: 'gpl'`
2. ✅ Redémarré le serveur
3. ✅ Consulté les docs ci-dessus

Alors envoyez-moi :
- La console du navigateur (F12 → Console)
- La configuration actuelle de `editorConfig`

---

**Dernière mise à jour** : 26 Décembre 2024 - 19:15 CET
**Statut** : ✅ Prêt à tester
