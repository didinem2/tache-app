// Semaines impaires (S19,S21,S23,S25,S27) : Elisa présente
// Semaines paires  (S20,S22,S24,S26)       : Elisa absente

export const SEMAINES = [19, 20, 21, 22, 23, 24, 25, 26, 27]

export const TASK_IDS = {
  mettre_table: 'Essuyer la table + mettre la table',
  debarrasser_table: 'Débarrasser la table + essuyer après',
  salle_de_bain: 'Nettoyer la salle de bain',
  chambre: 'Nettoyer sa chambre',
  poubelles: 'Sortir les poubelles',
  lave_vaisselle: 'Vider le lave-vaisselle',
}

export const TACHES_MENSUELLES = [
  { id: 'salle_de_bain', label: TASK_IDS.salle_de_bain },
  { id: 'chambre', label: TASK_IDS.chambre },
  { id: 'poubelles', label: TASK_IDS.poubelles },
  { id: 'lave_vaisselle', label: TASK_IDS.lave_vaisselle },
]

// Retourne true si Elisa est présente cette semaine
export function elisaPresente(semaine) {
  return semaine % 2 !== 0
}

// Retourne les tâches hebdomadaires pour Nathys selon la semaine
export function tachesHebdoNathys(semaine) {
  const nb = elisaPresente(semaine) ? 3 : 4
  return [
    { id: 'mettre_table', label: TASK_IDS.mettre_table, occurrences: nb },
    { id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: nb },
  ]
}

// Retourne les tâches hebdomadaires pour Elisa (semaines impaires uniquement)
export function tachesHebdoElisa(semaine) {
  if (!elisaPresente(semaine)) return []
  return [
    { id: 'mettre_table', label: TASK_IDS.mettre_table, occurrences: 4 },
    { id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: 4 },
  ]
}

// Planning compte test — avril 2026 (S14 à S18)
// Même règle que Nathys : semaines paires → 4×, impaires → 3×
export const TEST_SEMAINES = [14, 15, 16, 17, 18]

export const TEST_CALENDRIER = {
  14: '31 mars – 5 avril 2026',
  15: '6 – 12 avril 2026',
  16: '13 – 19 avril 2026',
  17: '20 – 26 avril 2026',
  18: '27 avril – 3 mai 2026',
}

export function tachesHebdoTest(semaine) {
  const nb = semaine % 2 !== 0 ? 3 : 4
  return [
    { id: 'mettre_table', label: TASK_IDS.mettre_table, occurrences: nb },
    { id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: nb },
  ]
}

// Calendrier de référence S19-S27 2025
export const CALENDRIER = {
  19: '5 – 11 mai 2025',
  20: '12 – 18 mai 2025',
  21: '19 – 25 mai 2025',
  22: '26 mai – 1 juin 2025',
  23: '2 – 8 juin 2025',
  24: '9 – 15 juin 2025',
  25: '16 – 22 juin 2025',
  26: '23 – 29 juin 2025',
  27: '30 juin – 6 juil. 2025',
}
