import { useState } from 'react'
import { TASK_IDS } from '../data/planning.js'

export default function HistoryTable({ history }) {
  const [filterUser, setFilterUser] = useState('tous')
  const [filterWeek, setFilterWeek] = useState('toutes')
  const [filterTask, setFilterTask] = useState('toutes')

  const semaines = [...new Set(history.filter(h => h.week).map(h => h.week))].sort((a, b) => a - b)

  const filtered = history.filter(h => {
    if (filterUser !== 'tous' && h.user !== filterUser) return false
    if (filterWeek !== 'toutes' && String(h.week) !== filterWeek) return false
    if (filterTask !== 'toutes' && h.task !== filterTask) return false
    return true
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
  )

  return (
    <div className="history-table-wrapper">
      <div className="filters">
        <label>
          Enfant :
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="nathys">Nathys</option>
            <option value="elisa">Elisa</option>
          </select>
        </label>

        <label>
          Semaine :
          <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)}>
            <option value="toutes">Toutes</option>
            {semaines.map(s => (
              <option key={s} value={String(s)}>S{s}</option>
            ))}
          </select>
        </label>

        <label>
          Tâche :
          <select value={filterTask} onChange={e => setFilterTask(e.target.value)}>
            <option value="toutes">Toutes</option>
            {Object.entries(TASK_IDS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-state">Aucune tâche enregistrée.</p>
      ) : (
        <div className="table-scroll">
          <table className="history-table">
            <thead>
              <tr>
                <th>Enfant</th>
                <th>Semaine</th>
                <th>Tâche</th>
                <th>Occurrence</th>
                <th>Date / Heure</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(h => (
                <tr key={h.id}>
                  <td className={`user-cell user-${h.user}`}>
                    {h.user === 'nathys' ? 'Nathys' : 'Elisa'}
                  </td>
                  <td>{h.week ? `S${h.week}` : `${h.mois}/${h.annee}`}</td>
                  <td>{TASK_IDS[h.task] ?? h.task}</td>
                  <td>{h.occurrence ?? '—'}</td>
                  <td>{new Date(h.completedAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
