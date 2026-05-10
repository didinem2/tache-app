# Application Suivi des Tâches Familiales

## Objectif
Application web de suivi des tâches ménagères pour 2 enfants (Nathys 16 ans, Elisa 12 ans) avec une vue parents. Chaque utilisateur a sa propre page d'accès protégée par un code PIN.

---

## Stack technique (100% gratuit)

- **Frontend** : React + Vite
- **Stockage** : Firebase Firestore (synchronisation temps réel multi-appareils)
- **Auth** : Aucune — routes distinctes par profil, PIN par profil (sessionStorage)
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
│   │   ├── HistoryContext.jsx  ← État global Firestore (historique des coches)
│   │   └── PlanningContext.jsx ← État global Firestore (semaines, tâches mensuelles, archivage)
│   ├── pages/
│   │   ├── Home.jsx            ← Accueil avec boutons de profil
│   │   ├── Nathys.jsx          ← Vue Nathys (semaine auto, sans navigation)
│   │   ├── Elisa.jsx           ← Vue Elisa (semaine auto, sans navigation)
│   │   ├── Parents.jsx         ← Vue surveillance (récap, historique, export)
│   │   ├── Admin.jsx           ← Administration du planning (semaines + tâches)
│   │   └── Test.jsx            ← Compte test avec navigation libre
│   ├── components/
│   │   ├── TaskList.jsx        ← Checklist hebdo + reports de semaines précédentes
│   │   ├── MonthlySummary.jsx  ← Encart tâches mensuelles avec progression
│   │   ├── PinGate.jsx         ← Garde d'accès par code PIN (sessionStorage)
│   │   ├── HistoryTable.jsx    ← Tableau historique filtrable
│   │   └── ExportButton.jsx    ← Export Excel (SheetJS)
│   ├── data/
│   │   ├── planning.js         ← TASK_IDS, MOIS_NOMS, moisSuivantLabel()
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
| `/` | Home.jsx | Boutons de profil |
| `/nathys` | Nathys.jsx | Tâches de Nathys — semaine courante automatique |
| `/elisa` | Elisa.jsx | Tâches d'Elisa — semaine courante automatique |
| `/parents` | Parents.jsx | Surveillance, historique, export Excel |
| `/admin` | Admin.jsx | Administration du planning (protégé PIN parents) |
| `/test` | Test.jsx | Compte test avec navigation libre |

---

## Planning — géré dynamiquement via Firestore

Le planning n'est plus un fichier statique. Les semaines sont stockées dans la collection Firestore **`semaines`** et administrées depuis `/admin`.

### Structure d'un document `semaines`

```javascript
{
  id: "auto-generated",
  num: 19,                      // numéro de semaine ISO
  label: "4 – 10 mai 2026",    // dates affichées
  mois: 5,                      // mois calendaire (1–12)
  annee: 2026,
  elisaPresente: true,          // Elisa est-elle là cette semaine ?

  // Occurrences par tâche (optionnels — valeur par défaut si absent)
  nathysMettreTable: 3,         // nb fois "Mettre table" pour Nathys cette semaine
  nathysDebarrasserTable: 3,    // nb fois "Débarrasser" pour Nathys cette semaine
  elisaMettreTable: 4,          // nb fois "Mettre table" pour Elisa cette semaine
  elisaDebarrasserTable: 4,     // nb fois "Débarrasser" pour Elisa cette semaine
}
```

### Règle par défaut (si les champs d'occurrences sont absents)

- Nathys : 3× si Elisa présente, 4× si Elisa absente
- Elisa : 4× (uniquement les semaines où `elisaPresente: true`)

Mettre une occurrence à **0** = semaine sans tâche (vacances, etc.).

### Planning initial — S19 à S27 (mai–juin 2026)

| Semaine | Dates | Elisa présente ? |
|---------|-------|-----------------|
| S19 | 4 – 10 mai 2026 | ✅ OUI |
| S20 | 11 – 17 mai 2026 | ❌ NON |
| S21 | 18 – 24 mai 2026 | ✅ OUI |
| S22 | 25 – 31 mai 2026 | ❌ NON |
| S23 | 1 – 7 juin 2026 | ✅ OUI |
| S24 | 8 – 14 juin 2026 | ❌ NON |
| S25 | 15 – 21 juin 2026 | ✅ OUI |
| S26 | 22 – 28 juin 2026 | ❌ NON |
| S27 | 29 juin – 5 juil. 2026 | ✅ OUI |

---

## Tâches mensuelles — gérées par mois via Firestore

Les tâches mensuelles sont stockées dans la collection **`tachesMensuelles`**, chaque document étant rattaché à un mois précis. Modifier les tâches de juin n'impacte pas mai.

### Structure d'un document `tachesMensuelles`

```javascript
{
  id: "auto-generated",
  label: "Nettoyer la salle de bain",
  mois: 5,       // mois concerné (1–12)
  annee: 2026,   // année concernée
}
```

### Tâches par défaut (bouton "Initialiser" dans Admin)

- Nettoyer la salle de bain
- Nettoyer sa chambre
- Sortir les poubelles
- Vider le lave-vaisselle

> Le bouton "Initialiser les 4 tâches par défaut" n'est visible que si le mois n'a aucune tâche mensuelle configurée.

---

## Page Admin (`/admin`)

Accessible depuis `/parents` via le bouton 🔧, protégée par le même PIN parents.

### Fonctionnalités

- **Ajout de semaine** : formulaire avec numéro, dates, mois, année, présence Elisa
- **Initialisation rapide** : bouton "Initialiser mai–juin 2026" pour pré-remplir S19–S27
- **Occurrences par tâche** : pour chaque semaine, 4 inputs indépendants :
  - 🌸 Nathys → Mettre table `[n]` | Débarrasser `[n]`
  - ⭐ Elisa → Mettre table `[n]` | Débarrasser `[n]` *(uniquement si Elisa présente)*
  - Sauvegarde automatique via debounce 600 ms (fiable sur mobile)
- **Toggle Elisa présente** : bouton par semaine
- **Suppression de semaine** : double confirmation
- **Tâches mensuelles par mois** : dans chaque section de mois, liste des tâches avec ajout/suppression + bouton "Initialiser les 4 tâches par défaut"
- **Archivage de mois** : bouton 📦 Archiver par mois — masque les mois terminés de la vue admin. Bouton "Désarchiver" pour les remettre. Les mois archivés sont comptés et accessibles via "Voir les mois archivés (n)".

---

## Fonctionnalités par page

### Pages Nathys et Elisa

- **Semaine automatique** : détectée depuis la date du jour, clampée sur les semaines configurées. Aucune navigation possible.
- **Barre de progression** : tâches cochées / attendues (semaine courante + reports).
- **Encart "Semaine complétée"** ✅ : remplace la barre de progression quand toutes les tâches hebdomadaires de la semaine courante sont cochées.
- **Encart "Tâches du mois"** : tâches mensuelles du mois en cours avec cases à cocher et barre de progression.
- **Encart "Argent de poche"** 💰 : apparaît uniquement quand **tout est validé** — toutes les semaines entièrement cochées ET toutes les tâches mensuelles du mois cochées.
- **Report automatique** : les tâches hebdomadaires non cochées des semaines précédentes remontent dans la semaine courante, avec l'étiquette `Report S{n}`. Cochées sur la semaine d'origine.

**Spécificité Elisa** : seules les semaines avec `elisaPresente: true` affichent des tâches hebdomadaires.

### Page Parents (`/parents`) — Compte surveillance

- **Navigation mensuelle** ◀ ▶ pour passer d'un mois à l'autre
- **Tableau récapitulatif Nathys** : cochées / attendues par semaine (calcul selon les occurrences configurées dans Admin)
- **Tableau récapitulatif Elisa** : idem, uniquement pour les semaines où elle est présente
- **Tâches mensuelles** : `n / total` pour chaque enfant
- **Argent de poche donné** : case à cocher "💰 Argent de poche donné" par enfant par mois, avec la date enregistrée. Stocké dans la collection `argentDonne` de Firestore.
- **Historique complet** : filtrable par enfant, semaine, tâche
- **Export Excel** → fichier `.xlsx`

---

## Stockage — Firebase Firestore

### Collections et documents

#### Collection `history` — coches utilisateurs

```javascript
// Tâche hebdomadaire
{
  user: "nathys",           // "nathys" | "elisa" | "test"
  week: 19,                  // numéro de semaine ISO
  task: "mettre_table",      // identifiant de la tâche
  occurrence: 1,             // 1ère, 2ème, 3ème... fois dans la semaine
  type: "hebdo",
  completedAt: "2026-05-08T19:32:00Z",
  completed: true
}

// Tâche mensuelle
{
  user: "nathys",
  task: "auto-generated-id", // ID du document dans tachesMensuelles
  type: "mensuel",
  mois: 5,
  annee: 2026,
  completedAt: "2026-05-10T10:00:00Z",
  completed: true
}
```

#### Collection `semaines` — planning

Voir structure ci-dessus (section "Planning").

#### Collection `tachesMensuelles` — tâches mensuelles

Voir structure ci-dessus (section "Tâches mensuelles").

#### Document `config/planning` — configuration globale

```javascript
{
  archivedMonths: ["5-2026", "4-2026"]  // mois archivés (format "mois-annee")
}
```

#### Collection `argentDonne` — argent de poche

```javascript
{
  user: "nathys",
  mois: 5,
  annee: 2026,
  donne: true,
  le: "2026-06-01T10:00:00Z"  // date où la case a été cochée
}
```

### Règles Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Contexte PlanningContext (`src/context/PlanningContext.jsx`)

Gère les semaines, les tâches mensuelles et l'archivage en temps réel.

```javascript
const {
  semaines, tachesMensuelles, archivedMonths, loading,
  getSemaine, elisaPresente,
  tachesHebdoNathys, tachesHebdoElisa,
  getSemaineMois, getMoisPlanning, getWeeksForMonth, getNumsSemaines,
  getTachesMensuellesMois,        // ← filtre les tâches mensuelles par mois/annee
  isMonthArchived, archiveMonth, unarchiveMonth,
  addSemaine, updateSemaine, deleteSemaine, seedSemaines,
  addTacheMensuelle, deleteTacheMensuelle, seedTachesMensuelles,
} = usePlanning()
```

| Fonction | Description |
|----------|-------------|
| `tachesHebdoNathys(week)` | Retourne les tâches hebdo de Nathys avec leurs occurrences configurées |
| `tachesHebdoElisa(week)` | Idem pour Elisa (retourne `[]` si Elisa absente) |
| `getTachesMensuellesMois(mois, annee)` | Tâches mensuelles du mois concerné uniquement |
| `getMoisPlanning()` | Liste des mois distincts couverts par les semaines |
| `isMonthArchived(mois, annee)` | Vrai si le mois est archivé |
| `archiveMonth / unarchiveMonth` | Archive ou désarchive un mois |

### Contexte HistoryContext (`src/context/HistoryContext.jsx`)

```javascript
const {
  history, loading,
  isHebdoChecked, isMensuelChecked,
  toggleHebdo, toggleMensuel,
  isArgentDonne, getArgentDonneLe, toggleArgentDonne,
  clearWeek, clearUser
} = useHistory()
```

---

## Composant PinGate

Protège chaque page par un code PIN stocké en sessionStorage (effacé à la fermeture du navigateur). Le PIN est défini directement dans le composant.

```jsx
<PinGate user="parents">
  {/* contenu de la page */}
</PinGate>
```

Profils protégés : `"nathys"`, `"elisa"`, `"parents"`.

---

## Identifiants des tâches hebdomadaires

```javascript
const TASK_IDS = {
  mettre_table:      "Essuyer la table + mettre la table",
  debarrasser_table: "Débarrasser la table + essuyer après",
}
```

---

## Compte Test

Profil de test basé sur le planning de Nathys, avec navigation libre entre semaines.

Fonctionnalités propres au compte test :
- Navigation libre entre semaines (◀ ▶)
- Bouton 🗑 pour réinitialiser la semaine affichée
- Bouton 🗑 Tout pour effacer toutes les données du compte test
- Données isolées sous `user: 'test'` — sans impact sur Nathys/Elisa

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
  base: '/tache-app/',
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

Déclenché automatiquement à chaque push sur `main`. Build sur Ubuntu, déploiement sur GitHub Pages.

### Commandes Git

```bash
# Mises à jour
git add .
git commit -m "description"
git push
```

---

## Commandes locales

```bash
npm install        # installer les dépendances
npm run dev        # développement → http://localhost:5173/tache-app/
npm run build      # build production
npm run preview    # prévisualisation du build
```

### Dépendances

```bash
# Production
npm install react react-dom react-router-dom firebase xlsx date-fns

# Développement
npm install -D vite @vitejs/plugin-react
```

---

## Notes importantes

1. **Pas de système d'authentification** — usage familial, PIN simple par profil via sessionStorage.
2. **Firebase Firestore** synchronise les données en temps réel entre tous les appareils.
3. **Interface mobile-first** — conçue pour être utilisée depuis un téléphone. La sauvegarde des occurrences utilise un debounce 600 ms sur `onChange` (plus fiable que `onBlur` sur mobile).
4. **Langue** : Français partout dans l'interface.
5. **Tâches mensuelles** : rattachées à un mois précis (mois + annee dans Firestore). Modifier juin n'impacte pas mai.
6. **Report automatique** : une tâche non cochée en S{n} remonte dans les semaines suivantes jusqu'à ce qu'elle soit cochée. Elle reste enregistrée sur sa semaine d'origine.
7. **Argent de poche** : l'encart 💰 n'apparaît que lorsque la totalité des tâches (toutes les semaines + tâches mensuelles du mois) est validée.
8. **Occurrences par tâche** : chaque tâche hebdomadaire (mettre table / débarrasser) a ses propres occurrences configurables indépendamment par utilisateur et par semaine. Valeur 0 = semaine sans tâche.
9. **Archivage** : les mois terminés peuvent être archivés dans Admin pour ne plus encombrer la vue. L'archivage est stocké dans `config/planning` (Firestore).
10. **Clé Firebase** : visible dans le code source (dépôt public). Sécurité reposant sur les règles Firestore.
