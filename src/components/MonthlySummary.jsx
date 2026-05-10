import { useHistory } from '../context/HistoryContext.jsx'
import { usePlanning } from '../context/PlanningContext.jsx'

export default function MonthlySummary({ user, mois, annee }) {
  const { isMensuelChecked, toggleMensuel } = useHistory()
  const { tachesMensuelles } = usePlanning()

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
          return (
            <label key={tache.id} className={`checkbox-row ${checked ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => toggleMensuel(user, tache.id, e.target.checked, mois, annee)}
              />
              <span>{tache.label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
