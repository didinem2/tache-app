# Application Suivi des Tâches Familiales

## Objectif
Application web de suivi des tâches ménagères pour 2 enfants (Nathys 16 ans, Elisa 12 ans) avec une vue parents. Chaque utilisateur a sa propre page d'accès sans mot de passe.

---

## Stack technique (100% gratuit)

- **Frontend** : React + Vite
- **Stockage** : localStorage
- **Auth** : Aucune — routes distinctes par profil
- **Hébergement** : GitHub Pages ou Vercel (gratuit)
- **Historique** : Exportable en Excel (.xlsx) via `xlsx` (SheetJS)
- **Dates** : `date-fns` pour le calcul du numéro de semaine ISO

---

## Architecture du projet

```
/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Home.jsx            ← Accueil avec 4 boutons de profil
│   │   ├── Nathys.jsx          ← Vue Nathys (semaine auto, sans navigation)
│   │   ├── Elisa.jsx           ← Vue Elisa (semaine auto, sans navigation)
│   │   ├── Parents.jsx         ← Vue parents (lecture seule, historique, export)
│   │   └── Test.jsx            ← Compte test avec navigation libre (S14–S18)
│   ├── components/
│   │   ├── TaskList.jsx        ← Checklist hebdo + reports de semaines précédentes
│   │   ├── MonthlySummary.jsx  ← Encart tâches mensuelles avec progression
│   │   ├── WeekSelector.jsx    ← Sélecteur de semaine (utilisé uniquement dans Test)
│   │   ├── HistoryTable.jsx    ← Tableau historique filtrable
│   │   └── ExportButton.jsx    ← Export Excel (SheetJS)
│   ├── data/
│   │   ├── planning.js         ← Planning S19–S27 + planning test S14–S18
│   │   └── storage.js          ← Fonctions lecture/écriture localStorage
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

---

## Routes

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home.jsx | 4 boutons : Nathys, Elisa, Parents, Compte Test |
| `/nathys` | Nathys.jsx | Tâches de Nathys — semaine courante automatique |
| `/elisa` | Elisa.jsx | Tâches d'Elisa — semaine courante automatique |
| `/parents` | Parents.jsx | Vue globale, historique filtrable, export Excel |
| `/test` | Test.jsx | Compte test avec navigation libre entre S14 et S18 |

---

## Données — Planning S19 à S27 (été 2025)

### Règle générale

- **Semaines impaires** (S19, S21, S23, S25, S27) → Elisa EST présente
- **Semaines paires** (S20, S22, S24, S26) → Elisa N'EST PAS présente (Nathys fait plus)

### Tâches hebdomadaires

#### Nathys — Semaines PAIRES (sans Elisa)
| Tâche | Nb fois |
|-------|---------|
| Essuyer la table + mettre la table | 4 |
| Débarrasser la table + essuyer après | 4 |

#### Nathys — Semaines IMPAIRES (avec Elisa)
| Tâche | Nb fois |
|-------|---------|
| Essuyer la table + mettre la table | 3 |
| Débarrasser la table + essuyer après | 3 |

#### Elisa — Semaines IMPAIRES uniquement (présente)
| Tâche | Nb fois |
|-------|---------|
| Essuyer la table + mettre la table | 4 |
| Débarrasser la table + essuyer après | 4 |

### Tâches mensuelles (Nathys ET Elisa — chacun)
- Nettoyer la salle de bain : 1 fois/mois
- Nettoyer sa chambre : 1 fois/mois
- Sortir les poubelles : 1 fois/mois
- Vider le lave-vaisselle : 1 fois/mois

> Les tâches mensuelles ne sont pas attachées à une semaine précise. L'utilisateur peut les cocher n'importe quand dans le mois.

---

## Compte Test (S14–S18, avril 2026)

Profil de test basé sur le planning de Nathys, calé sur un mois complet d'avril 2026.

| Semaine | Dates | Nb fois/tâche |
|---------|-------|---------------|
| S14 | 31 mars – 5 avril 2026 | 4× (paire) |
| S15 | 6 – 12 avril 2026 | 3× (impaire) |
| S16 | 13 – 19 avril 2026 | 4× (paire) |
| S17 | 20 – 26 avril 2026 | 3× (impaire) |
| S18 | 27 avril – 3 mai 2026 | 4× (paire) |

Fonctionnalités propres au compte test :
- Navigation libre entre semaines (◀ ▶)
- Bouton 🗑 pour réinitialiser la semaine affichée
- Bouton 🗑 Tout pour effacer toutes les données du compte test
- Données isolées sous `user: 'test'` — sans impact sur Nathys/Elisa

---

## Fonctionnalités par page

### Pages Nathys et Elisa

- **Semaine automatique** : détectée depuis la date du jour, clampée sur la plage S19–S27. Aucune navigation possible — la semaine est fixe.
- **Encart "Semaine complétée"** : badge vert ✅ qui remplace la barre de progression quand toutes les tâches hebdomadaires (y compris les reports) de la semaine courante sont cochées.
- **Encart "Tâches du mois"** : toujours visible, affiche les 4 tâches mensuelles avec cases à cocher et barre de progression.
- **Encart "Argent de poche"** 💰 : apparaît uniquement quand **tout est validé** — toutes les semaines S19–S27 entièrement cochées ET les 4 tâches mensuelles cochées. Message : *Bravo, tu auras ton argent de poche !*
- **Report automatique** : les tâches hebdomadaires non cochées des semaines précédentes remontent dans la semaine courante, groupées par tâche avec l'étiquette `Report S{n}`. Quand une case de report est cochée, elle est enregistrée sur la semaine d'origine (pas la semaine courante).

**Spécificité Elisa** : seules les semaines impaires affichent des tâches hebdomadaires. En semaine paire, seules les tâches mensuelles sont actives.

### Page Parents (`/parents`)

- Tableau récapitulatif S19–S27 : tâches cochées / attendues par enfant par semaine
- Récapitulatif des tâches mensuelles du mois en cours
- Bouton Actualiser pour recharger les données
- Historique complet avec filtres par enfant, semaine et tâche
- Bouton **Exporter en Excel** → fichier `.xlsx` avec deux feuilles :
  - Feuille 1 : Résumé par semaine
  - Feuille 2 : Historique détaillé (enfant, tâche, date/heure)

---

## Structure des données (localStorage)

```javascript
// Clé : "tasks_history"
// Valeur : tableau d'objets
[
  // Tâche hebdomadaire
  {
    id: "uuid-...",
    user: "nathys",           // "nathys" | "elisa" | "test"
    week: 19,                  // numéro de semaine ISO
    task: "mettre_table",      // identifiant de la tâche
    occurrence: 1,             // 1ère, 2ème, 3ème... fois dans la semaine
    type: "hebdo",
    completedAt: "2025-05-08T19:32:00Z",
    completed: true
  },
  // Tâche mensuelle
  {
    id: "uuid-...",
    user: "nathys",
    task: "salle_de_bain",
    type: "mensuel",
    mois: 5,                   // mois calendaire (1–12)
    annee: 2025,
    completedAt: "2025-05-10T10:00:00Z",
    completed: true
  }
]
```

### Identifiants des tâches (task IDs)
```javascript
const TASK_IDS = {
  mettre_table:      "Essuyer la table + mettre la table",
  debarrasser_table: "Débarrasser la table + essuyer après",
  salle_de_bain:     "Nettoyer la salle de bain",
  chambre:           "Nettoyer sa chambre",
  poubelles:         "Sortir les poubelles",
  lave_vaisselle:    "Vider le lave-vaisselle",
}
```

---

## Fonctions storage.js

| Fonction | Description |
|----------|-------------|
| `getHistory()` | Lit tout l'historique depuis localStorage |
| `toggleHebdo(user, week, taskId, occurrence, checked)` | Coche/décoche une occurrence hebdomadaire |
| `toggleMensuel(user, taskId, checked)` | Coche/décoche une tâche mensuelle (mois courant) |
| `isHebdoChecked(user, week, taskId, occurrence)` | Vérifie si une occurrence est cochée |
| `isMensuelChecked(user, taskId)` | Vérifie si une tâche mensuelle est cochée ce mois |
| `getCurrentWeek()` | Retourne le numéro de semaine ISO courant |
| `clearWeek(user, week)` | Efface les tâches hebdomadaires d'une semaine (test) |
| `clearUser(user)` | Efface toutes les données d'un utilisateur (test) |

---

## Planning semaines — référence calendrier 2025

| Semaine | Dates | Elisa présente ? |
|---------|-------|-----------------|
| S19 | 5 – 11 mai 2025 | ✅ OUI |
| S20 | 12 – 18 mai 2025 | ❌ NON |
| S21 | 19 – 25 mai 2025 | ✅ OUI |
| S22 | 26 mai – 1 juin 2025 | ❌ NON |
| S23 | 2 – 8 juin 2025 | ✅ OUI |
| S24 | 9 – 15 juin 2025 | ❌ NON |
| S25 | 16 – 22 juin 2025 | ✅ OUI |
| S26 | 23 – 29 juin 2025 | ❌ NON |
| S27 | 30 juin – 6 juil. 2025 | ✅ OUI |

---

## Commandes

```bash
# Installer les dépendances
npm install

# Développement local
npm run dev
# → http://localhost:5173/suivi-taches/

# Build production
npm run build

# Prévisualisation du build
npm run preview
```

### Dépendances
```bash
npm install react react-dom react-router-dom xlsx date-fns
npm install -D vite @vitejs/plugin-react
```

### Configuration GitHub Pages (vite.config.js)
```javascript
export default {
  base: '/suivi-taches/',  // nom du repo GitHub
}
```

---

## Notes importantes

1. **Pas de système d'authentification** — usage familial, sécurité non requise.
2. **Les données sont stockées en localStorage** — elles persistent entre les sessions sur le même navigateur. Pour une synchronisation multi-appareils, envisager Supabase (gratuit jusqu'à 500 Mo) ou Google Sheets API.
3. **Interface mobile-first** — conçue pour être utilisée depuis un téléphone.
4. **Langue** : Français partout dans l'interface.
5. **Tâches mensuelles** : non réinitialisées chaque semaine — liées au mois calendaire courant.
6. **Report automatique** : une tâche non cochée en S19 remonte en S20, S21, etc. jusqu'à ce qu'elle soit cochée. Elle reste enregistrée sur sa semaine d'origine.
7. **Argent de poche** : l'encart 💰 n'apparaît que lorsque la totalité des tâches (toutes les semaines + tâches mensuelles) est validée.
8. **Compte test** : données isolées sous `user: 'test'`, sans interaction avec les comptes réels.
