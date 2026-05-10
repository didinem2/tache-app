import { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, writeBatch, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { TASK_IDS } from '../data/planning.js'

export const SEED_SEMAINES = [
  { num: 19, label: '4 – 10 mai 2026',        mois: 5, annee: 2026, elisaPresente: true  },
  { num: 20, label: '11 – 17 mai 2026',       mois: 5, annee: 2026, elisaPresente: false },
  { num: 21, label: '18 – 24 mai 2026',       mois: 5, annee: 2026, elisaPresente: true  },
  { num: 22, label: '25 – 31 mai 2026',       mois: 5, annee: 2026, elisaPresente: false },
  { num: 23, label: '1 – 7 juin 2026',        mois: 6, annee: 2026, elisaPresente: true  },
  { num: 24, label: '8 – 14 juin 2026',       mois: 6, annee: 2026, elisaPresente: false },
  { num: 25, label: '15 – 21 juin 2026',      mois: 6, annee: 2026, elisaPresente: true  },
  { num: 26, label: '22 – 28 juin 2026',      mois: 6, annee: 2026, elisaPresente: false },
  { num: 27, label: '29 juin – 5 juil. 2026', mois: 6, annee: 2026, elisaPresente: true  },
]

const SEED_TACHES_MENSUELLES = [
  { id: 'salle_de_bain',  label: 'Nettoyer la salle de bain' },
  { id: 'chambre',        label: 'Nettoyer sa chambre' },
  { id: 'poubelles',      label: 'Sortir les poubelles' },
  { id: 'lave_vaisselle', label: 'Vider le lave-vaisselle' },
]

const PlanningContext = createContext(null)

export function PlanningProvider({ children }) {
  const [semaines, setSemaines] = useState([])
  const [loadingSemaines, setLoadingSemaines] = useState(true)
  const [tachesMensuelles, setTachesMensuelles] = useState([])
  const [archivedMonths, setArchivedMonths] = useState([])

  const loading = loadingSemaines

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'semaines'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => a.num - b.num)
      setSemaines(data)
      setLoadingSemaines(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'tachesMensuelles'),
      snapshot => setTachesMensuelles(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      _err => {},
    )
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config', 'planning'),
      snapshot => {
        if (snapshot.exists()) {
          setArchivedMonths(snapshot.data().archivedMonths ?? [])
        }
      },
      _err => {},
    )
    return unsub
  }, [])

  function getSemaine(num) {
    return semaines.find(s => s.num === num)
  }

  function elisaPresente(num) {
    return getSemaine(num)?.elisaPresente ?? false
  }

  function tachesHebdoNathys(num) {
    const s = getSemaine(num)
    const def = s?.nathysOccurrences ?? (elisaPresente(num) ? 3 : 4)
    const mt = s?.nathysMettreTable ?? def
    const dt = s?.nathysDebarrasserTable ?? def
    const tasks = []
    if (mt > 0) tasks.push({ id: 'mettre_table',      label: TASK_IDS.mettre_table,      occurrences: mt })
    if (dt > 0) tasks.push({ id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: dt })
    return tasks
  }

  function tachesHebdoElisa(num) {
    if (!elisaPresente(num)) return []
    const s = getSemaine(num)
    const def = s?.elisaOccurrences ?? 4
    const mt = s?.elisaMettreTable ?? def
    const dt = s?.elisaDebarrasserTable ?? def
    const tasks = []
    if (mt > 0) tasks.push({ id: 'mettre_table',      label: TASK_IDS.mettre_table,      occurrences: mt })
    if (dt > 0) tasks.push({ id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: dt })
    return tasks
  }

  function getSemaineMois(num) {
    const s = getSemaine(num)
    return s ? { mois: s.mois, annee: s.annee } : null
  }

  function getMoisPlanning() {
    const seen = new Set()
    const result = []
    for (const s of semaines) {
      const key = `${s.mois}-${s.annee}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push({ mois: s.mois, annee: s.annee })
      }
    }
    return result
  }

  function getWeeksForMonth(mois, annee) {
    return semaines
      .filter(s => s.mois === mois && s.annee === annee)
      .map(s => s.num)
  }

  function getNumsSemaines() {
    return semaines.map(s => s.num)
  }

  function isMonthArchived(mois, annee) {
    return archivedMonths.includes(`${mois}-${annee}`)
  }

  // ── Semaines CRUD ─────────────────────────────────────────────────────────

  async function addSemaine(data) {
    await addDoc(collection(db, 'semaines'), data)
  }

  async function updateSemaine(id, data) {
    await updateDoc(doc(db, 'semaines', id), data)
  }

  async function deleteSemaine(id) {
    await deleteDoc(doc(db, 'semaines', id))
  }

  async function seedSemaines() {
    const batch = writeBatch(db)
    SEED_SEMAINES.forEach(s => {
      batch.set(doc(collection(db, 'semaines')), s)
    })
    await batch.commit()
  }

  // ── Tâches mensuelles ─────────────────────────────────────────────────────

  function getTachesMensuellesMois(mois, annee) {
    return tachesMensuelles.filter(t => t.mois === mois && t.annee === annee)
  }

  async function addTacheMensuelle(label, mois, annee) {
    await addDoc(collection(db, 'tachesMensuelles'), { label, mois, annee })
  }

  async function deleteTacheMensuelle(id) {
    await deleteDoc(doc(db, 'tachesMensuelles', id))
  }

  async function seedTachesMensuelles(mois, annee) {
    if (getTachesMensuellesMois(mois, annee).length > 0) return
    const batch = writeBatch(db)
    SEED_TACHES_MENSUELLES.forEach(t => {
      batch.set(doc(collection(db, 'tachesMensuelles')), { label: t.label, mois, annee })
    })
    await batch.commit()
  }

  // ── Archivage des mois ────────────────────────────────────────────────────

  async function archiveMonth(mois, annee) {
    const key = `${mois}-${annee}`
    const next = archivedMonths.includes(key) ? archivedMonths : [...archivedMonths, key]
    await setDoc(doc(db, 'config', 'planning'), { archivedMonths: next }, { merge: true })
  }

  async function unarchiveMonth(mois, annee) {
    const key = `${mois}-${annee}`
    await setDoc(doc(db, 'config', 'planning'), {
      archivedMonths: archivedMonths.filter(k => k !== key),
    }, { merge: true })
  }

  return (
    <PlanningContext.Provider value={{
      semaines, tachesMensuelles, archivedMonths, loading,
      getSemaine, elisaPresente,
      tachesHebdoNathys, tachesHebdoElisa,
      getSemaineMois, getMoisPlanning, getWeeksForMonth, getNumsSemaines,
      getTachesMensuellesMois,
      isMonthArchived, archiveMonth, unarchiveMonth,
      addSemaine, updateSemaine, deleteSemaine, seedSemaines,
      addTacheMensuelle, deleteTacheMensuelle, seedTachesMensuelles,
    }}>
      {children}
    </PlanningContext.Provider>
  )
}

export function usePlanning() {
  return useContext(PlanningContext)
}
