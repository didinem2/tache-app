import { useHistory } from '../context/HistoryContext.jsx'
import { usePlanning } from '../context/PlanningContext.jsx'

function fmt(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const mon = String(d.getMonth() + 1).padStart(2, '0')
  const hr  = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${mon} à ${hr}:${min}`
}

export default function MonthlySummary({ user, mois, annee }) {
  const { isMensuelChecked, getMensuelCompletedAt, toggleMensuel } = useHistory()
  const { getTachesMensuellesMois } = usePlanning()
  const tachesMensuelles = getTachesMensuellesMois(mois, annee)

  const total = tachesMensuelles.length
  const done = tachesMensuelles.filter(t => isMensuelChecked(user, t.id, mois, annee)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="encart encart-monthly">
      <div className="encart-monthly-header">
        <span className="encart-monthly-title">📅 Tâches du mois</span>
        <span className="monthly-badge">{done} / {total}</span>
      </div>

      <div className="progress-bar monthly-bar">
        <div className="progress-fill monthly-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="monthly-tasks">
        {tachesMensuelles.length === 0 ? (
          <p className="admin-occ-hint">Aucune tâche mensuelle configurée.</p>
        ) : tachesMensuelles.map(tache => {
          const checked = isMensuelChecked(user, tache.id, mois, annee)
          const completedAt = getMensuelCompletedAt(user, tache.id, mois, annee)
          return (
            <label key={tache.id} className={`checkbox-row ${checked ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => toggleMensuel(user, tache.id, e.target.checked, mois, annee)}
              />
              <span>{tache.label}</span>
              {checked && completedAt && (
                <span className="checkbox-date">{fmt(completedAt)}</span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}
