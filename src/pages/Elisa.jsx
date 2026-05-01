import { useNavigate } from 'react-router-dom'
import TaskList from '../components/TaskList.jsx'
import MonthlySummary from '../components/MonthlySummary.jsx'
import PinGate from '../components/PinGate.jsx'
import { useHistory } from '../context/HistoryContext.jsx'
import { getCurrentWeek } from '../data/storage.js'
import { tachesHebdoElisa, SEMAINES, CALENDRIER, elisaPresente, TACHES_MENSUELLES, SEMAINE_MOIS } from '../data/planning.js'

const USER = 'elisa'
const SEMAINES_ELISA = SEMAINES.filter(s => elisaPresente(s))

function clampWeekElisa(week) {
  const found = SEMAINES_ELISA.find(s => s >= week)
  return found ?? SEMAINES_ELISA[SEMAINES_ELISA.length - 1]
}

function computeCarryover(history, currentWeek) {
  const items = []
  SEMAINES_ELISA.filter(s => s < currentWeek).forEach(week => {
    tachesHebdoElisa(week).forEach(t => {
      for (let occ = 1; occ <= t.occurrences; occ++) {
        const done = history.some(h =>
          h.user === USER && h.week === week && h.task === t.id &&
          h.occurrence === occ && h.type === 'hebdo' && h.completed
        )
        if (!done) items.push({ week, taskId: t.id, label: t.label, occurrence: occ })
      }
    })
  })
  return items
}

function computeProgress(history, week, carryover) {
  let done = 0, total = 0
  tachesHebdoElisa(week).forEach(t => {
    for (let occ = 1; occ <= t.occurrences; occ++) {
      total++
      if (history.some(h => h.user === USER && h.week === week && h.task === t.id && h.occurrence === occ && h.type === 'hebdo' && h.completed)) done++
    }
  })
  carryover.forEach(item => {
    total++
    if (history.some(h => h.user === USER && h.week === item.week && h.task === item.taskId && h.occurrence === item.occurrence && h.type === 'hebdo' && h.completed)) done++
  })
  return { done, total }
}

function checkToutValide(history, mois, annee) {
  const semainsDone = SEMAINES_ELISA.every(week =>
    tachesHebdoElisa(week).every(t =>
      Array.from({ length: t.occurrences }, (_, i) => i + 1).every(occ =>
        history.some(h => h.user === USER && h.week === week && h.task === t.id && h.occurrence === occ && h.type === 'hebdo' && h.completed)
      )
    )
  )
  const mensuelDone = TACHES_MENSUELLES.every(t =>
    history.some(h => h.user === USER && h.task === t.id && h.type === 'mensuel' && h.mois === mois && h.annee === annee && h.completed)
  )
  return semainsDone && mensuelDone
}

export default function Elisa() {
  const navigate = useNavigate()
  const { history, loading } = useHistory()
  const week = clampWeekElisa(getCurrentWeek())

  if (loading) return <div className="page-loading">Chargement…</div>

  const { mois, annee } = SEMAINE_MOIS[week] ?? { mois: 5, annee: 2025 }
  const taches = tachesHebdoElisa(week)
  const carryover = computeCarryover(history, week)
  const { done, total } = computeProgress(history, week, carryover)
  const semaineComplete = total > 0 && done >= total
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const toutValide = checkToutValide(history, mois, annee)

  return (
    <PinGate user="elisa">
    <div className="page page-elisa">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Retour</button>
        <h2>⭐ Elisa</h2>
      </header>

      <div className="week-display">
        <span className="week-num">S{week}</span>
        {CALENDRIER[week] && <span className="week-dates">{CALENDRIER[week]}</span>}
      </div>

      {semaineComplete ? (
        <div className="encart encart-success">
          <span className="encart-icon">✅</span>
          <div>
            <div className="encart-title">Semaine S{week} complétée !</div>
            <div className="encart-sub">Bravo Elisa ! 🎉</div>
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
            <div className="encart-sub encart-sub-gold">Bravo Elisa, tu auras ton argent de poche ! 🎉</div>
          </div>
        </div>
      )}

      <MonthlySummary user={USER} mois={mois} annee={annee} />
      <TaskList user={USER} week={week} tachesHebdo={taches} carryoverItems={carryover} />
    </div>
    </PinGate>
  )
}
