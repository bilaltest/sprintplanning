# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2025-01-28

### Ajouté

#### Core Features
- Timeline multi-vues (Année, Trimestre, Mois)
- Navigation fluide entre périodes (flèches clavier, boutons)
- CRUD complet pour les événements
- 12 catégories d'événements prédéfinies
- Couleurs et icônes personnalisables (15 icônes Material)
- Support multi-événements par jour

#### Filtrage & Recherche
- Filtre par catégories (multi-sélection)
- Filtre par période (date début/fin)
- Recherche texte en temps réel (debounce 300ms)
- Bouton réinitialiser filtres
- Indicateur visuel filtres actifs

#### Import/Export
- Export PDF (snapshot visuel via html2canvas + jsPDF)
- Export PNG (image haute résolution)
- Export JSON (données brutes)
- Export CSV (compatible Excel)
- Import JSON pour restauration

#### Paramètres
- Thème clair/sombre avec toggle
- Sélection langue FR/EN (structure i18n prête)
- Configuration premier jour semaine (Lundi/Dimanche)
- Réinitialisation paramètres par défaut

#### Historique & Rollback
- Historique des 20 dernières modifications
- Affichage détaillé (create/update/delete)
- Fonction rollback (annulation d'action)
- Timestamps relatifs (il y a X minutes)
- Effacement complet historique

#### Architecture
- Angular 20+ (standalone components)
- TypeScript 5.7 en mode strict
- TailwindCSS 4.0 avec design system personnalisé
- IndexedDB via Dexie.js (4 tables)
- date-fns pour manipulation dates
- RxJS BehaviorSubject pour state management

#### Documentation
- README.md complet (fonctionnalités, stack, usage)
- INSTALLATION.md détaillé (étapes d'installation)
- ARCHITECTURE.md technique (patterns, flux de données)
- PROJECT_SUMMARY.md récapitulatif
- QUICK_START.md guide rapide
- CHANGELOG.md (ce fichier)

#### Configuration
- package.json avec scripts npm
- tsconfig.json strict mode
- angular.json optimisé (budgets, lazy loading)
- tailwind.config.js (palette Crédit Agricole moderne)
- jest.config.js (tests unitaires configurés)
- .gitignore complet
- .editorconfig (standards de code)
- .nvmrc (version Node.js)

### Sécurité
- Validation inputs (maxlength HTML)
- Protection XSS (Angular sanitization)
- Gestion quota IndexedDB
- Pas de dépendances vulnérables

### Performance
- Lazy loading routes
- Debounce search (300ms)
- TrackBy dans *ngFor
- Budgets de build configurés

## [À venir] - Roadmap

### [1.1.0] - Q1 2025 (Prévu)

#### Ajouté
- Drag & drop événements entre jours
- Templates d'événements réutilisables
- Tests unitaires (objectif 80%+ coverage)
- Virtual scrolling (liste > 100 événements)
- OnPush change detection

### [1.2.0] - Q2 2025 (Prévu)

#### Ajouté
- PWA avec Service Worker
- Mode offline complet
- Notifications navigateur
- Import CSV
- Export iCal (Google Calendar)

### [2.0.0] - Q3 2025 (Futur)

#### Ajouté
- Backend optionnel (API REST)
- Authentification utilisateurs
- Sync multi-devices
- Mode collaboration
- Raccourcis clavier avancés

---

## Format du Changelog

### Types de changements
- `Ajouté` : nouvelles fonctionnalités
- `Modifié` : modifications fonctionnalités existantes
- `Déprécié` : fonctionnalités bientôt supprimées
- `Supprimé` : fonctionnalités supprimées
- `Corrigé` : corrections de bugs
- `Sécurité` : vulnérabilités corrigées

---

**Maintenu par l'équipe DSI**
