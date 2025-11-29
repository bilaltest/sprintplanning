# Guide: Ajouter ou Modifier des Catégories d'Événements

Ce guide explique comment ajouter de nouvelles catégories d'événements ou modifier les catégories existantes dans l'application Planning DSI.

## 📋 Table des matières

1. [Catégories actuelles](#catégories-actuelles)
2. [Ajouter une nouvelle catégorie](#ajouter-une-nouvelle-catégorie)
3. [Modifier une catégorie existante](#modifier-une-catégorie-existante)
4. [Supprimer une catégorie](#supprimer-une-catégorie)
5. [Liste des icônes Material disponibles](#liste-des-icônes-material-disponibles)

## 🎨 Catégories actuelles

L'application contient actuellement 8 catégories prédéfinies :

| Catégorie | Label | Couleur | Icône | Description |
|-----------|-------|---------|-------|-------------|
| `mep` | MEP | `#22c55e` (vert) | `rocket_launch` | Mise en production |
| `hotfix` | Hotfix | `#ef4444` (rouge) | `local_fire_department` | Correction urgente |
| `maintenance` | Maintenance | `#f97316` (orange) | `build` | Maintenance planifiée |
| `pi_planning` | PI Planning | `#3b82f6` (bleu) | `event` | Planification d'incrément |
| `sprint_start` | Début de Sprint | `#8b5cf6` (violet) | `flag` | Démarrage de sprint |
| `code_freeze` | Code Freeze | `#06b6d4` (cyan) | `ac_unit` | Gel du code |
| `psi` | PSI | `#1f2937` (gris foncé) | `assessment` | Program Increment Inspection |
| `other` | Autre | `#6b7280` (gris) | `label` | Autre type d'événement |

## ➕ Ajouter une nouvelle catégorie

### Étape 1: Modifier le modèle Event

**Fichier**: `src/app/models/event.model.ts`

```typescript
// 1. Ajouter votre catégorie dans le type EventCategory
export type EventCategory =
  | 'mep'
  | 'hotfix'
  | 'maintenance'
  | 'pi_planning'
  | 'sprint_start'
  | 'code_freeze'
  | 'psi'
  | 'other'
  | 'ma_nouvelle_categorie';  // ← Ajouter ici

// 2. Ajouter le label dans EVENT_CATEGORY_LABELS
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  mep: 'MEP',
  hotfix: 'Hotfix',
  maintenance: 'Maintenance',
  pi_planning: 'PI Planning',
  sprint_start: 'Début de Sprint',
  code_freeze: 'Code Freeze',
  psi: 'PSI',
  other: 'Autre',
  ma_nouvelle_categorie: 'Mon Nouveau Type'  // ← Ajouter ici
};

// 3. Ajouter la configuration par défaut dans CATEGORY_DEFAULTS
export const CATEGORY_DEFAULTS: Record<EventCategory, { color: string; icon: string }> = {
  mep: { color: '#22c55e', icon: 'rocket_launch' },
  hotfix: { color: '#ef4444', icon: 'local_fire_department' },
  maintenance: { color: '#f97316', icon: 'build' },
  pi_planning: { color: '#3b82f6', icon: 'event' },
  sprint_start: { color: '#8b5cf6', icon: 'flag' },
  code_freeze: { color: '#06b6d4', icon: 'ac_unit' },
  psi: { color: '#1f2937', icon: 'assessment' },
  other: { color: '#6b7280', icon: 'label' },
  ma_nouvelle_categorie: {
    color: '#ec4899',           // ← Couleur (format hex)
    icon: 'star'                 // ← Icône Material Icons
  }
};

// 4. Si vous utilisez des couleurs spécifiques en dark mode, ajouter dans CATEGORY_COLORS_DARK
export const CATEGORY_COLORS_DARK: Record<EventCategory, string> = {
  mep: '#22c55e',
  hotfix: '#ef4444',
  maintenance: '#f97316',
  pi_planning: '#3b82f6',
  sprint_start: '#8b5cf6',
  code_freeze: '#06b6d4',
  psi: '#374151',  // Couleur adaptée pour dark mode
  other: '#9ca3af',
  ma_nouvelle_categorie: '#f472b6'  // ← Couleur pour dark mode (optionnel)
};
```

### Étape 2: Ajouter la couleur dans Tailwind (optionnel mais recommandé)

**Fichier**: `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        event: {
          mep: '#22c55e',
          hotfix: '#ef4444',
          maintenance: '#f97316',
          pi_planning: '#3b82f6',
          sprint_start: '#8b5cf6',
          code_freeze: '#06b6d4',
          psi: '#1f2937',
          other: '#6b7280',
          ma_nouvelle_categorie: '#ec4899'  // ← Ajouter ici
        }
      }
    }
  }
}
```

### Étape 3: Mettre à jour les filtres (si nécessaire)

**Fichier**: `src/app/components/filters/filter-bar.component.ts`

La liste des catégories est déjà dynamique et se met à jour automatiquement à partir du type `EventCategory`.

Si vous avez besoin d'une couleur spéciale en dark mode pour les icônes de filtre (comme pour PSI), ajoutez la logique dans `getCategoryIconColor()`:

```typescript
getCategoryIconColor(category: EventCategory): string {
  // Gestion spéciale pour certaines catégories en dark mode
  if (category === 'psi' || category === 'ma_nouvelle_categorie') {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#9ca3af' : CATEGORY_DEFAULTS[category].color;
  }
  return CATEGORY_DEFAULTS[category].color;
}
```

### Étape 4: Tester

```bash
# 1. Compiler l'application
npm start

# 2. Vérifier que :
# - La nouvelle catégorie apparaît dans le modal de création
# - La nouvelle catégorie apparaît dans les filtres avec son icône
# - Les événements s'affichent avec la bonne couleur et icône
# - Le dark mode fonctionne correctement
```

## ✏️ Modifier une catégorie existante

### Changer la couleur

**Fichier**: `src/app/models/event.model.ts`

```typescript
export const CATEGORY_DEFAULTS: Record<EventCategory, { color: string; icon: string }> = {
  // ...
  psi: {
    color: '#3b82f6',  // ← Changer la couleur (ancien: '#1f2937')
    icon: 'assessment'
  },
  // ...
};
```

### Changer l'icône

**Fichier**: `src/app/models/event.model.ts`

```typescript
export const CATEGORY_DEFAULTS: Record<EventCategory, { color: string; icon: string }> = {
  // ...
  mep: {
    color: '#22c55e',
    icon: 'publish'  // ← Changer l'icône (ancien: 'rocket_launch')
  },
  // ...
};
```

### Changer le label

**Fichier**: `src/app/models/event.model.ts`

```typescript
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  // ...
  pi_planning: 'Planification PI',  // ← Changer le label (ancien: 'PI Planning')
  // ...
};
```

## ❌ Supprimer une catégorie

⚠️ **Attention** : Supprimer une catégorie peut causer des problèmes si des événements existants utilisent cette catégorie.

### Option 1: Migration recommandée

1. Migrer les événements existants vers une autre catégorie
2. Supprimer la catégorie du code

```typescript
// Exemple de migration (à exécuter une seule fois)
async migrateCategory() {
  const events = await this.eventService.getEvents();
  const eventsToMigrate = events.filter(e => e.category === 'ancienne_categorie');

  for (const event of eventsToMigrate) {
    await this.eventService.updateEvent(event.id!, {
      ...event,
      category: 'nouvelle_categorie'
    });
  }
}
```

### Option 2: Supprimer directement

**Fichier**: `src/app/models/event.model.ts`

```typescript
// 1. Retirer du type EventCategory
export type EventCategory =
  | 'mep'
  | 'hotfix'
  // ❌ Ne plus inclure 'maintenance'
  | 'pi_planning'
  // ...

// 2. Retirer de EVENT_CATEGORY_LABELS
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  mep: 'MEP',
  hotfix: 'Hotfix',
  // ❌ maintenance: 'Maintenance',  // Supprimer cette ligne
  pi_planning: 'PI Planning',
  // ...
};

// 3. Retirer de CATEGORY_DEFAULTS
export const CATEGORY_DEFAULTS: Record<EventCategory, { color: string; icon: string }> = {
  // ❌ Ne plus inclure maintenance
};

// 4. Retirer de CATEGORY_COLORS_DARK
export const CATEGORY_COLORS_DARK: Record<EventCategory, string> = {
  // ❌ Ne plus inclure maintenance
};
```

**Fichier**: `tailwind.config.js`

```javascript
colors: {
  event: {
    // ❌ maintenance: '#f97316',  // Supprimer cette ligne
  }
}
```

## 🎨 Liste des icônes Material disponibles

Voici les icônes Material Icons les plus pertinentes pour un planning d'événements :

### Événements généraux
- `event` - Calendrier générique
- `event_available` - Événement disponible
- `event_busy` - Événement occupé
- `event_note` - Note d'événement
- `calendar_today` - Calendrier aujourd'hui
- `schedule` - Horloge/planning

### Actions/États
- `rocket_launch` - Lancement (MEP)
- `flag` - Démarrage
- `check_circle` - Validation
- `error` - Erreur
- `warning` - Avertissement
- `info` - Information
- `cancel` - Annulation

### Technique
- `code` - Code
- `bug_report` - Bug
- `build` - Construction
- `settings` - Paramètres
- `developer_mode` - Mode développeur
- `terminal` - Terminal
- `storage` - Stockage
- `cloud_upload` - Upload
- `cloud_download` - Download

### Feu/Urgent
- `local_fire_department` - Pompiers (hotfix)
- `whatshot` - Chaud/urgent
- `priority_high` - Priorité haute
- `notification_important` - Important

### Freeze/Gel
- `ac_unit` - Flocon (freeze)
- `severe_cold` - Froid intense
- `lock` - Verrouillé

### Réunions/Planning
- `groups` - Groupes de personnes
- `meeting_room` - Salle de réunion
- `assessment` - Évaluation (PSI)
- `analytics` - Analytique
- `insights` - Insights

### Autres
- `star` - Étoile
- `bookmark` - Marque-page
- `label` - Label
- `lightbulb` - Idée
- `celebration` - Célébration

### Comment trouver plus d'icônes

1. Visitez [Google Fonts - Material Icons](https://fonts.google.com/icons)
2. Cherchez une icône
3. Copiez le nom (exemple: `rocket_launch`)
4. Utilisez-le dans `CATEGORY_DEFAULTS`

## 📚 Exemples complets

### Exemple 1: Ajouter une catégorie "Demo"

```typescript
// event.model.ts
export type EventCategory =
  | 'mep' | 'hotfix' | 'maintenance' | 'pi_planning'
  | 'sprint_start' | 'code_freeze' | 'psi' | 'other'
  | 'demo';  // ✅ Nouvelle catégorie

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  // ... catégories existantes
  demo: 'Démo Client'  // ✅ Label
};

export const CATEGORY_DEFAULTS: Record<EventCategory, { color: string; icon: string }> = {
  // ... catégories existantes
  demo: {
    color: '#10b981',      // ✅ Vert émeraude
    icon: 'present_to_all' // ✅ Icône présentation
  }
};
```

### Exemple 2: Modifier MEP en "Release"

```typescript
// event.model.ts
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  mep: 'Release',  // ✅ Changé de 'MEP' à 'Release'
  // ...
};

export const CATEGORY_DEFAULTS: Record<EventCategory, { color: string; icon: string }> = {
  mep: {
    color: '#10b981',  // ✅ Vert émeraude (au lieu de vert lime)
    icon: 'publish'    // ✅ Icône publish (au lieu de rocket_launch)
  },
  // ...
};
```

## ⚠️ Points d'attention

1. **Validation TypeScript** : Le type `EventCategory` est strict. Ajoutez toujours votre catégorie dans le type union.

2. **Cohérence** : Assurez-vous d'ajouter la catégorie dans **tous** les objets :
   - `EventCategory` (type)
   - `EVENT_CATEGORY_LABELS` (labels)
   - `CATEGORY_DEFAULTS` (couleur + icône)
   - `CATEGORY_COLORS_DARK` (si besoin)
   - `tailwind.config.js` (optionnel)

3. **Nommage** : Utilisez `snake_case` pour les clés de catégories (ex: `pi_planning`, pas `piPlanning`).

4. **Couleurs** : Utilisez des couleurs en format hexadécimal `#RRGGBB`.

5. **Icônes** : Vérifiez que l'icône existe sur [Material Icons](https://fonts.google.com/icons).

6. **Accessibilité** : Assurez-vous que les couleurs ont un bon contraste en mode clair ET sombre.

## 🔄 Migration depuis IndexedDB

Si votre application utilisait IndexedDB (version 1.0), les événements existants conserveront leurs anciennes catégories. Le backend acceptera n'importe quelle catégorie, mais l'UI n'affichera que les catégories définies dans le code.

Pour migrer, vous pouvez :
1. Exporter les données en JSON
2. Modifier les catégories dans le JSON
3. Importer via l'API backend

## 📞 Support

Pour toute question sur les catégories, contactez l'équipe DSI.

---

**Guide mis à jour le 29/11/2025**
