import { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot,
  addDoc, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { getMonth, getYear } from 'date-fns'
import { db } from '../firebase.js'

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'history'), snapshot => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Lectures (calculées sur history en mémoire) ──────────────────────────

  function isHebdoChecked(user, week, taskId, occurrence) {
    return history.some(h =>
      h.user === user && h.week === week && h.task === taskId &&
      h.occurrence === occurrence && h.type === 'hebdo' && h.completed
    )
  }

  function isMensuelChecked(user, taskId) {
    const mois = getMonth(new Date()) + 1
    const annee = getYear(new Date())
    return history.some(h =>
      h.user === user && h.task === taskId && h.type === 'mensuel' &&
      h.mois === mois && h.annee === annee && h.completed
    )
  }

  // ── Écritures (Firestore) ────────────────────────────────────────────────

  async function toggleHebdo(user, week, taskId, occurrence, checked) {
    const existing = history.find(h =>
      h.user === user && h.week === week && h.task === taskId &&
      h.occurrence === occurrence && h.type === 'hebdo'
    )
    if (checked && !existing) {
      await addDoc(collection(db, 'history'), {
        user, week, task: taskId, occurrence,
        type: 'hebdo',
        completedAt: new Date().toISOString(),
        completed: true,
      })
    } else if (!checked && existing) {
      await deleteDoc(doc(db, 'history', existing.id))
    }
  }

  async function toggleMensuel(user, taskId, checked) {
    const mois = getMonth(new Date()) + 1
    const annee = getYear(new Date())
    const existing = history.find(h =>
      h.user === user && h.task === taskId && h.type === 'mensuel' &&
      h.mois === mois && h.annee === annee
    )
    if (checked && !existing) {
      await addDoc(collection(db, 'history'), {
        user, task: taskId,
        type: 'mensuel', mois, annee,
        completedAt: new Date().toISOString(),
        completed: true,
      })
    } else if (!checked && existing) {
      await deleteDoc(doc(db, 'history', existing.id))
    }
  }

  async function clearWeek(user, week) {
    const batch = writeBatch(db)
    history
      .filter(h => h.user === user && h.week === week && h.type === 'hebdo')
      .forEach(h => batch.delete(doc(db, 'history', h.id)))
    await batch.commit()
  }

  async function clearUser(user) {
    const batch = writeBatch(db)
    history
      .filter(h => h.user === user)
      .forEach(h => batch.delete(doc(db, 'history', h.id)))
    await batch.commit()
  }

  return (
    <HistoryContext.Provider value={{
      history, loading,
      isHebdoChecked, isMensuelChecked,
      toggleHebdo, toggleMensuel,
      clearWeek, clearUser,
    }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  return useContext(HistoryContext)
}
