import { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, writeBatch,
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

const PlanningContext = createContext(null)

export function PlanningProvider({ children }) {
  const [semaines, setSemaines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'semaines'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => a.num - b.num)
      setSemaines(data)
      setLoading(false)
    })
    return unsub
  }, [])

  function getSemaine(num) {
    return semaines.find(s => s.num === num)
  }

  function elisaPresente(num) {
    return getSemaine(num)?.elisaPresente ?? false
  }

  function tachesHebdoNathys(num) {
    const nb = elisaPresente(num) ? 3 : 4
    return [
      { id: 'mettre_table',      label: TASK_IDS.mettre_table,      occurrences: nb },
      { id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: nb },
    ]
  }

  function tachesHebdoElisa(num) {
    if (!elisaPresente(num)) return []
    return [
      { id: 'mettre_table',      label: TASK_IDS.mettre_table,      occurrences: 4 },
      { id: 'debarrasser_table', label: TASK_IDS.debarrasser_table, occurrences: 4 },
    ]
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

  return (
    <PlanningContext.Provider value={{
      semaines, loading,
      getSemaine, elisaPresente,
      tachesHebdoNathys, tachesHebdoElisa,
      getSemaineMois, getMoisPlanning, getWeeksForMonth, getNumsSemaines,
      addSemaine, updateSemaine, deleteSemaine, seedSemaines,
    }}>
      {children}
    </PlanningContext.Provider>
  )
}

export function usePlanning() {
  return useContext(PlanningContext)
}
