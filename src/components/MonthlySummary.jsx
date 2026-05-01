import { useHistory } from '../context/HistoryContext.jsx'
import { TACHES_MENSUELLES } from '../data/planning.js'

export default function MonthlySummary({ user, mois, annee }) {
  const { isMensuelChecked, toggleMensuel } = useHistory()

  const total = TACHES_MENSUELLES.length
  const done = TACHES_MENSUELLES.filter(t => isMensuelChecked(user, t.id, mois, annee)).length
  const pct = Math.round((done / total) * 100)

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
        {TACHES_MENSUELLES.map(tache => {
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
