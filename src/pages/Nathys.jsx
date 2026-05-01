import { useNavigate } from 'react-router-dom'
import TaskList from '../components/TaskList.jsx'
import MonthlySummary from '../components/MonthlySummary.jsx'
import PinGate from '../components/PinGate.jsx'
import { useHistory } from '../context/HistoryContext.jsx'
import { usePlanning } from '../context/PlanningContext.jsx'
import { getCurrentWeek } from '../data/storage.js'
import { TACHES_MENSUELLES } from '../data/planning.js'

const USER = 'nathys'

export default function Nathys() {
  const navigate = useNavigate()
  const { history, loading: hLoading } = useHistory()
  const {
    semaines, loading: pLoading,
    getSemaine, getSemaineMois, tachesHebdoNathys, elisaPresente,
    getNumsSemaines,
  } = usePlanning()

  if (hLoading || pLoading) return <div className="page-loading">Chargement…</div>

  const allWeeks = getNumsSemaines()
  const currentIso = getCurrentWeek()
  const week = allWeeks.includes(currentIso)
    ? currentIso
    : (allWeeks.find(w => w >= currentIso) ?? allWeeks[allWeeks.length - 1] ?? currentIso)

  const { mois, annee } = getSemaineMois(week) ?? { mois: new Date().getMonth() + 1, annee: new Date().getFullYear() }

  // Tâches en retard des semaines précédentes
  const carryover = []
  allWeeks.filter(w => w < week).forEach(w => {
    tachesHebdoNathys(w).forEach(t => {
      for (let occ = 1; occ <= t.occurrences; occ++) {
        const done = history.some(h =>
          h.user === USER && h.week === w && h.task === t.id &&
          h.occurrence === occ && h.type === 'hebdo' && h.completed
        )
        if (!done) carryover.push({ week: w, taskId: t.id, label: t.label, occurrence: occ })
      }
    })
  })

  const taches = tachesHebdoNathys(week)
  let done = 0, total = 0
  taches.forEach(t => {
    for (let occ = 1; occ <= t.occurrences; occ++) {
      total++
      if (history.some(h => h.user === USER && h.week === week && h.task === t.id && h.occurrence === occ && h.type === 'hebdo' && h.completed)) done++
    }
  })
  carryover.forEach(item => {
    total++
    if (history.some(h => h.user === USER && h.week === item.week && h.task === item.taskId && h.occurrence === item.occurrence && h.type === 'hebdo' && h.completed)) done++
  })

  const semaineComplete = total > 0 && done >= total
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const toutValide = allWeeks.every(w =>
    tachesHebdoNathys(w).every(t =>
      Array.from({ length: t.occurrences }, (_, i) => i + 1).every(occ =>
        history.some(h => h.user === USER && h.week === w && h.task === t.id && h.occurrence === occ && h.type === 'hebdo' && h.completed)
      )
    )
  ) && TACHES_MENSUELLES.every(t =>
    history.some(h => h.user === USER && h.task === t.id && h.type === 'mensuel' && h.mois === mois && h.annee === annee && h.completed)
  )

  const semaineInfo = getSemaine(week)

  return (
    <PinGate user="nathys">
      <div className="page page-nathys">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Retour</button>
          <h2>🌸 Nathys</h2>
        </header>

        <div className="week-display">
          <span className="week-num">S{week}</span>
          {semaineInfo?.label && <span className="week-dates">{semaineInfo.label}</span>}
        </div>

        {semaineComplete ? (
          <div className="encart encart-success">
            <span className="encart-icon">✅</span>
            <div>
              <div className="encart-title">Semaine S{week} complétée !</div>
              <div className="encart-sub">Bravo Nathys ! 🎉</div>
            </div>
          </div>
        ) : (
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-label">{done} / {total} tâches de la semaine ({pct}%)</span>
          </div>
        )}

        {toutValide && (
          <div className="encart encart-argent-poche">
            <span className="encart-icon">💰</span>
            <div>
              <div className="encart-title encart-title-gold">Tout est complété !</div>
              <div className="encart-sub encart-sub-gold">Bravo Nathys, tu auras ton argent de poche ! 🎉</div>
            </div>
          </div>
        )}

        <MonthlySummary user={USER} mois={mois} annee={annee} />
        <TaskList user={USER} week={week} tachesHebdo={taches} carryoverItems={carryover} />
      </div>
    </PinGate>
  )
}
