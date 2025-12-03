# Design System - Event Planning App

## 🎨 Direction Artistique

L'application utilise une identité visuelle différenciée pour les deux modules :
- **Planning** : Ton calme et apaisant (vert menthe + bleu ciel)
- **Releases** : Ton énergique et dynamique (violet + indigo + touches vertes CA)

---

## Palette de Couleurs

### Vert Crédit Agricole (Identité)
```css
ca-500: #00a859  /* Vert officiel CA */
```
Utilisé comme accent pour rappeler l'identité de marque.

### Module Planning (Calme/Apaisant)

#### Primary - Vert Menthe Moderne
```css
planning-500: #10b981  /* Emerald */
planning-600: #059669
```

#### Secondary - Bleu Ciel
```css
planning-blue-500: #3b82f6  /* Blue */
```

**Usage** :
- Header avec gradient subtil `bg-gradient-planning`
- Boutons `.btn-planning`
- Cards `.card-planning`
- Modales `.modal-content-planning`
- Filter bar avec `.glass-planning`

### Module Releases (Énergique/Dynamique)

#### Primary - Vert Sapin/Foncé
```css
releases-500: #047857  /* Vert sapin foncé */
releases-600: #065f46
releases-700: #064e3b
```

#### Secondary - Vert Émeraude
```css
releases-secondary-500: #10b981
```

#### Alert/Urgence - Orange Vif
```css
releases-alert-500: #f97316  /* Orange */
releases-alert-600: #ea580c
```

**Usage** :
- Header avec gradient vert foncé→émeraude→orange `bg-gradient-releases`
- Boutons énergiques `.btn-releases` avec gradient vert sapin et scale au hover
- Cards avec bordure gauche verte `.card-releases`
- Squads complétées `.card-releases-squad-complete` (gradient vert)
- Squads incomplètes `.card-releases-squad-incomplete` (gradient orange)

---

## Gradients

### Planning - Subtils et Apaisants
```css
/* Header */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Cards hover */
background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
```

### Releases - Énergiques et Assumés (Vert/Orange)
```css
/* Header principal - Vert foncé → Émeraude → Orange */
background: linear-gradient(135deg, #047857 0%, #10b981 50%, #f97316 100%);

/* Cards releases - Gradient vert clair */
background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);

/* Squad incomplète - Gradient orange */
background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
border-left: 4px solid #f97316;

/* Squad complétée - Gradient vert */
background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
border-left: 4px solid #10b981;

/* Boutons CTA - Gradient vert sapin */
background: linear-gradient(135deg, #047857 0%, #065f46 100%);
box-shadow: 0 4px 14px rgba(4, 120, 87, 0.4);
```

---

## Glassmorphism

Appliqué **uniquement** sur les éléments clés pour préserver les performances :

### Classes Disponibles

#### Général
```css
.glass {
  backdrop-blur: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-strong {
  backdrop-blur: 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

#### Module Planning
```css
.glass-planning {
  backdrop-blur: 12px;
  background: rgba(240, 253, 244, 0.8);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
```
**Utilisé sur** : Filter bar, modales

#### Module Releases
```css
.glass-releases {
  backdrop-blur: 12px;
  background: rgba(240, 253, 244, 0.8);
  border: 1px solid rgba(4, 120, 87, 0.2);
}
```
**Utilisé sur** : Modales releases

---

## Composants

### Boutons

#### Planning
```html
<!-- Primary -->
<button class="btn-planning">Action</button>

<!-- Outline -->
<button class="btn-planning-outline">Action</button>
```

#### Releases
```html
<!-- Primary avec gradient + scale -->
<button class="btn-releases">Action MEP</button>

<!-- Outline -->
<button class="btn-releases-outline">Action</button>

<!-- Alert/Urgence -->
<button class="btn-releases-alert">Action urgente</button>
```

**Effets** :
- Releases : `transform hover:scale-105` pour dynamisme
- Shadow progressive : `shadow-md hover:shadow-lg`

### Cards

#### Planning
```html
<!-- Card standard -->
<div class="card-planning">...</div>

<!-- Card avec gradient subtil -->
<div class="card-planning-feature">...</div>
```

#### Releases
```html
<!-- Card release avec bordure gauche -->
<div class="card-releases">...</div>

<!-- Squad complétée -->
<div class="card-releases-squad-complete">...</div>

<!-- Squad incomplète -->
<div class="card-releases-squad-incomplete">...</div>
```

**Effets** :
- Releases cards : `hover:scale-[1.02]` pour effet de lift
- Border gauche colorée 4px pour accentuation

### Modales

#### Planning
```html
<div class="modal-overlay">
  <div class="modal-content-planning">
    <!-- Header avec glassmorphism -->
    <div class="glass-planning border-b-2 border-planning-300">
      ...
    </div>
  </div>
</div>
```

#### Releases
```html
<div class="modal-overlay">
  <div class="modal-content-releases">
    <div class="glass-releases border-b-2 border-releases-300">
      ...
    </div>
  </div>
</div>
```

---

## Headers

### Planning Layout
```html
<header class="bg-gradient-planning sticky top-0 z-40 shadow-lg">
  <!-- Gradient vert subtil -->
  <!-- Texte blanc -->
  <!-- Hover: bg-white/10 -->
</header>
```

### Releases Layout
```html
<header class="bg-gradient-releases sticky top-0 z-40 shadow-xl">
  <!-- Gradient tricolore vert foncé→émeraude→orange -->
  <!-- Texte blanc -->
  <!-- Icône rocket avec rotation au hover -->
  <!-- Hover: bg-white/10 + shadow-md -->
</header>
```

---

## Animations & Transitions

### Standard
```css
transition-all duration-200  /* Par défaut */
```

### Effets Spéciaux Releases
```css
/* Scale au hover */
hover:scale-105
hover:scale-[1.02]

/* Rotation icône */
group-hover:rotate-12

/* Shadow progressive */
shadow-md hover:shadow-lg
```

---

## Mode Sombre

Tous les composants supportent le mode sombre via classes conditionnelles :

```css
/* Planning */
bg-planning-500 dark:bg-planning-600
text-planning-700 dark:text-planning-300

/* Releases */
bg-releases-500 dark:bg-releases-600
text-releases-700 dark:text-releases-300

/* Glassmorphism adapté */
.glass-planning → bg ajusté automatiquement
.glass-releases → bg ajusté automatiquement
```

---

## Utilisation des Couleurs

### Règles Générales

1. **Planning** : Couleurs douces, transitions subtiles, ambiance zen
2. **Releases** : Couleurs vives, contrastes marqués, énergie et urgence
3. **Vert CA** : Utilisé en accent sur les deux modules pour cohérence de marque

### Mapping Sémantique

| Statut | Planning | Releases |
|--------|----------|----------|
| Succès | planning-500 (vert) | planning-500 (vert) |
| En cours | planning-blue-500 (bleu) | releases-500 (violet) |
| Attention | - | releases-alert-500 (amber) |
| Urgent | - | releases-alert-600 (amber foncé) |

---

## Performance

### Optimisations Appliquées

1. **Glassmorphism limité** : Uniquement headers, modales, filter bar
2. **Backdrop-blur modéré** : 12px (pas 40px) pour fluidité
3. **Transitions courtes** : 200ms standard
4. **Scale minimal** : 1.02-1.05 max pour éviter reflows

### À Éviter

❌ `backdrop-blur` partout
❌ `filter` ou `backdrop-filter` sur éléments scrollables
❌ Transitions > 300ms
❌ Scale > 1.1

---

## Accessibilité

### Contrastes Respectés

- Textes sur backgrounds : WCAG AA minimum
- Planning : Couleurs douces mais lisibles
- Releases : Couleurs vives avec contraste suffisant

### États Interactifs

- `:hover` : Changement visuel clair
- `:focus` : Ring visible (ring-2)
- `:active` : Feedback immédiat

---

## Guide de Développement

### Choisir la Bonne Classe

**Pour Planning** :
```html
<button class="btn-planning">OK</button>
<div class="card-planning">...</div>
<div class="modal-content-planning">...</div>
```

**Pour Releases** :
```html
<button class="btn-releases">Déployer</button>
<div class="card-releases">...</div>
<div class="modal-content-releases">...</div>
```

### Ajouter un Nouveau Composant

1. Définir si Planning (calme) ou Releases (énergique)
2. Utiliser les couleurs du module correspondant
3. Appliquer glassmorphism **seulement si nécessaire**
4. Tester en dark mode
5. Vérifier la performance (pas de lag au scroll)

---

## Exemples Concrets

### Bouton d'Action Planning
```html
<button class="btn-planning flex items-center space-x-2">
  <span class="material-icons">add</span>
  <span>Ajouter événement</span>
</button>
```

### Bouton d'Action Releases
```html
<button class="btn-releases flex items-center space-x-2">
  <span class="material-icons">rocket_launch</span>
  <span>Lancer MEP</span>
</button>
```

### Card Squad Complétée
```html
<div class="card-releases-squad-complete p-6">
  <div class="flex items-center space-x-2">
    <span class="material-icons text-planning-600">check_circle</span>
    <h3>Squad 1</h3>
  </div>
</div>
```

### Card Squad Incomplète
```html
<div class="card-releases-squad-incomplete p-6">
  <div class="flex items-center space-x-2">
    <span class="material-icons text-releases-alert-600">pending</span>
    <h3>Squad 2</h3>
  </div>
</div>
```

---

## Changelog Design

### Version Actuelle (Janvier 2025)

✅ Système de couleurs différencié Planning/Releases
✅ **Planning** : Vert menthe + Bleu ciel (ambiance calme)
✅ **Releases** : Vert sapin/foncé + Orange (énergique, rappel nature + urgence)
✅ Gradients subtils (Planning) vs énergiques (Releases)
✅ Glassmorphism ciblé sur éléments clés
✅ Boutons avec effets dynamiques (scale, shadow)
✅ Cards avec bordures colorées et gradients
✅ Headers avec gradients personnalisés
✅ Mode sombre optimisé
✅ Performance préservée (pas de lag)
✅ Application renommée "Ma Banque Tools"
✅ Suppression des compteurs sur page home (UI épurée)

---

## Ressources

- **Tailwind Config** : `/event-planning-app/tailwind.config.js`
- **Styles Globaux** : `/event-planning-app/src/styles.scss`
- **Composants Planning** : `/event-planning-app/src/app/layouts/planning-layout.component.ts`
- **Composants Releases** : `/event-planning-app/src/app/layouts/releases-layout.component.ts`
