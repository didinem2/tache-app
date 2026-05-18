import { useHistory } from '../context/HistoryContext.jsx'

function fmt(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const day  = String(d.getDate()).padStart(2, '0')
  const mon  = String(d.getMonth() + 1).padStart(2, '0')
  const h    = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${mon} à ${h}:${min}`
}

function CheckboxRow({ label, checked, completedAt, onChange }) {
  return (
    <label className={`checkbox-row ${checked ? 'checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
      {checked && completedAt && (
        <span className="checkbox-date">{fmt(completedAt)}</span>
      )}
    </label>
  )
}

function groupCarryover(items) {
  const map = {}
  items.forEach(item => {
    if (!map[item.taskId]) map[item.taskId] = { taskId: item.taskId, label: item.label, items: [] }
    map[item.taskId].items.push(item)
  })
  return Object.values(map)
}

export default function TaskList({ user, week, tachesHebdo, carryoverItems = [] }) {
  const { isHebdoChecked, getHebdoCompletedAt, toggleHebdo } = useHistory()

  return (
    <div className="task-list">
      {tachesHebdo.length > 0 && (
        <section>
          <h3 className="section-title">Tâches de la semaine</h3>
          {tachesHebdo.map(tache => (
            <div key={tache.id} className="task-group">
              <div className="task-name">{tache.label}</div>
              <div className="occurrences">
                {Array.from({ length: tache.occurrences }, (_, i) => i + 1).map(occ => (
                  <CheckboxRow
                    key={occ}
                    label={`Fois ${occ}`}
                    checked={isHebdoChecked(user, week, tache.id, occ)}
                    completedAt={getHebdoCompletedAt(user, week, tache.id, occ)}
                    onChange={val => toggleHebdo(user, week, tache.id, occ, val)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {tachesHebdo.length === 0 && carryoverItems.length === 0 && (
        <div className="absent-notice">
          Elisa n'est pas présente cette semaine — pas de tâches hebdomadaires.
        </div>
      )}

      {carryoverItems.length > 0 && (
        <section>
          <h3 className="section-title carryover-title">⏩ Reports des semaines précédentes</h3>
          {groupCarryover(carryoverItems).map(group => (
            <div key={group.taskId} className="task-group task-group-carryover">
              <div className="task-name">{group.label}</div>
              <div className="occurrences">
                {group.items.map(item => (
                  <CheckboxRow
                    key={`${item.week}-${item.occurrence}`}
                    label={`Report S${item.week}`}
                    checked={isHebdoChecked(user, item.week, item.taskId, item.occurrence)}
                    completedAt={getHebdoCompletedAt(user, item.week, item.taskId, item.occurrence)}
                    onChange={val => toggleHebdo(user, item.week, item.taskId, item.occurrence, val)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
