# Application Suivi des Tâches Familiales

## Objectif
Application web de suivi des tâches ménagères pour 2 enfants (Nathys 16 ans, Elisa 12 ans) avec une vue parents. Chaque utilisateur a sa propre page d'accès sans mot de passe.

---

## Stack technique (100% gratuit)

- **Frontend** : React + Vite
- **Stockage** : Firebase Firestore (synchronisation temps réel multi-appareils)
- **Auth** : Aucune — routes distinctes par profil
- **Hébergement** : GitHub Pages (déploiement automatique via GitHub Actions)
- **Historique** : Exportable en Excel (.xlsx) via `xlsx` (SheetJS)
- **Dates** : `date-fns` pour le calcul du numéro de semaine ISO

---

## Architecture du projet

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Déploiement automatique GitHub Pages
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── HistoryContext.jsx  ← État global Firestore (onSnapshot temps réel)
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
│   │   └── storage.js          ← Utilitaire : getCurrentWeek()
│   ├── firebase.js             ← Configuration et initialisation Firebase
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
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
- Historique complet avec filtres par enfant, semaine et tâche
- Bouton **Exporter en Excel** → fichier `.xlsx` avec deux feuilles :
  - Feuille 1 : Résumé par semaine
  - Feuille 2 : Historique détaillé (enfant, tâche, date/heure)

---

## Stockage — Firebase Firestore

### Configuration (`src/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "...",
  authDomain: "suivi-taches-44fc1.firebaseapp.com",
  projectId: "suivi-taches-44fc1",
  storageBucket: "suivi-taches-44fc1.firebasestorage.app",
  messagingSenderId: "...",
  appId: "...",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

### Structure de la collection Firestore

Collection : **`history`** — un document par tâche cochée.

```javascript
// Tâche hebdomadaire
{
  id: "auto-generated",
  user: "nathys",           // "nathys" | "elisa" | "test"
  week: 19,                  // numéro de semaine ISO
  task: "mettre_table",      // identifiant de la tâche
  occurrence: 1,             // 1ère, 2ème, 3ème... fois dans la semaine
  type: "hebdo",
  completedAt: "2025-05-08T19:32:00Z",
  completed: true
}

// Tâche mensuelle
{
  id: "auto-generated",
  user: "nathys",
  task: "salle_de_bain",
  type: "mensuel",
  mois: 5,                   // mois calendaire (1–12)
  annee: 2025,
  completedAt: "2025-05-10T10:00:00Z",
  completed: true
}
```

### Règles Firestore (console Firebase → Firestore → Règles)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /history/{doc} {
      allow read, write: if true;
    }
  }
}
```

### Contexte React (`src/context/HistoryContext.jsx`)

L'abonnement `onSnapshot` écoute la collection `history` en temps réel. Toutes les pages et composants accèdent aux données via le hook `useHistory()` :

```javascript
const { history, loading, isHebdoChecked, isMensuelChecked,
        toggleHebdo, toggleMensuel, clearWeek, clearUser } = useHistory()
```

| Fonction | Description |
|----------|-------------|
| `history` | Tableau de toutes les entrées (mis à jour en temps réel) |
| `isHebdoChecked(user, week, taskId, occurrence)` | Vérifie si une occurrence est cochée |
| `isMensuelChecked(user, taskId)` | Vérifie si une tâche mensuelle est cochée ce mois |
| `toggleHebdo(user, week, taskId, occurrence, checked)` | Coche/décoche une occurrence hebdomadaire |
| `toggleMensuel(user, taskId, checked)` | Coche/décoche une tâche mensuelle |
| `clearWeek(user, week)` | Efface les tâches hebdomadaires d'une semaine (test) |
| `clearUser(user)` | Efface toutes les données d'un utilisateur (test) |

---

## Identifiants des tâches

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

## Déploiement — GitHub Pages

### Informations du dépôt

| | |
|---|---|
| Dépôt | github.com/didinem2/tache-app |
| URL en ligne | https://didinem2.github.io/tache-app/ |
| Branche principale | `main` |
| Déploiement | Automatique via GitHub Actions à chaque `git push` |

### Configuration Vite (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/tache-app/',   // correspond au nom du dépôt GitHub
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore'],
        },
      },
    },
  },
})
```

### Workflow GitHub Actions (`.github/workflows/deploy.yml`)

Déclenché automatiquement à chaque push sur `main`. Build sur Ubuntu, déploiement sur GitHub Pages via les actions officielles GitHub.

```yaml
name: Deploy sur GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Configuration GitHub Pages (une seule fois)

Sur github.com/didinem2/tache-app → **Settings** → **Pages** :
- Source : **GitHub Actions** (et non "Deploy from a branch")

### Commandes Git

```cmd
# Premier déploiement
git init
git add .
git commit -m "message"
git branch -M main
git remote add origin https://github.com/didinem2/tache-app.git
git push -u origin main

# Mises à jour suivantes
git add .
git commit -m "description de la modification"
git push
```

### .gitignore

```
node_modules
dist
.env
.env.local
```

> ⚠️ Ne jamais committer `node_modules` — il est exclu par `.gitignore`.

---

## Commandes locales

```cmd
# Installer les dépendances
npm install

# Développement local
npm run dev
# → http://localhost:5173/tache-app/

# Build production
npm run build

# Prévisualisation du build
npm run preview
```

### Dépendances

```bash
# Production
npm install react react-dom react-router-dom firebase xlsx date-fns

# Développement
npm install -D vite @vitejs/plugin-react gh-pages
```

---

## Notes importantes

1. **Pas de système d'authentification** — usage familial, sécurité non requise.
2. **Firebase Firestore** synchronise les données en temps réel entre tous les appareils. Si Nathys coche une tâche depuis son téléphone, les parents la voient immédiatement.
3. **Interface mobile-first** — conçue pour être utilisée depuis un téléphone.
4. **Langue** : Français partout dans l'interface.
5. **Tâches mensuelles** : non réinitialisées chaque semaine — liées au mois calendaire courant.
6. **Report automatique** : une tâche non cochée en S19 remonte en S20, S21, etc. jusqu'à ce qu'elle soit cochée. Elle reste enregistrée sur sa semaine d'origine.
7. **Argent de poche** : l'encart 💰 n'apparaît que lorsque la totalité des tâches (toutes les semaines + tâches mensuelles) est validée.
8. **Compte test** : données isolées sous `user: 'test'`, sans interaction avec les comptes réels.
9. **Clé Firebase** : la configuration Firebase est visible dans le code source (dépôt public). C'est normal — la sécurité repose sur les règles Firestore, pas sur la confidentialité des clés.
