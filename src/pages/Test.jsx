import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMonth, getYear } from 'date-fns'
import TaskList from '../components/TaskList.jsx'
import MonthlySummary from '../components/MonthlySummary.jsx'
import { useHistory } from '../context/HistoryContext.jsx'
import { tachesHebdoTest, TEST_SEMAINES, TEST_CALENDRIER } from '../data/planning.js'
import { usePlanning } from '../context/PlanningContext.jsx'

const USER = 'test'

function computeCarryover(history, currentWeek) {
  const items = []
  TEST_SEMAINES.filter(s => s < currentWeek).forEach(week => {
    tachesHebdoTest(week).forEach(t => {
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
  tachesHebdoTest(week).forEach(t => {
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

function checkToutValide(history, tachesMois, mois, annee) {
  const semainsDone = TEST_SEMAINES.every(week =>
    tachesHebdoTest(week).every(t =>
      Array.from({ length: t.occurrences }, (_, i) => i + 1).every(occ =>
        history.some(h => h.user === USER && h.week === week && h.task === t.id && h.occurrence === occ && h.type === 'hebdo' && h.completed)
      )
    )
  )
  const mensuelDone = tachesMois.every(t =>
    history.some(h => h.user === USER && h.task === t.id && h.type === 'mensuel' && h.mois === mois && h.annee === annee && h.completed)
  )
  return semainsDone && mensuelDone
}

export default function Test() {
  const navigate = useNavigate()
  const { history, loading, clearWeek, clearUser } = useHistory()
  const { getTachesMensuellesMois } = usePlanning()
  const [week, setWeek] = useState(TEST_SEMAINES[0])

  if (loading) return <div className="page-loading">Chargement…</div>

  const mois = getMonth(new Date()) + 1
  const annee = getYear(new Date())
  const tachesMois = getTachesMensuellesMois(mois, annee)

  const weekIdx = TEST_SEMAINES.indexOf(week)
  const taches = tachesHebdoTest(week)
  const carryover = computeCarryover(history, week)
  const { done, total } = computeProgress(history, week, carryover)
  const semaineComplete = total > 0 && done >= total
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const toutValide = checkToutValide(history, tachesMois, mois, annee)

  return (
    <div className="page page-test">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Retour</button>
        <h2>🧪 Compte Test</h2>
      </header>

      <div className="test-banner test-banner-info">
        <span>Planning basé sur Nathys · Avril 2026 · Données isolées</span>
        <div className="test-actions">
          <button className="test-reset-btn" onClick={() => { if (window.confirm(`Remettre à zéro S${week} ?`)) clearWeek(USER, week) }}>🗑 S{week}</button>
          <button className="test-reset-btn test-reset-all" onClick={() => { if (window.confirm('Effacer toutes les données du compte test ?')) clearUser(USER) }}>🗑 Tout</button>
        </div>
      </div>

      <div className="week-selector">
        <button className="week-btn" onClick={() => setWeek(TEST_SEMAINES[weekIdx - 1])} disabled={weekIdx === 0}>◀</button>
        <div className="week-info">
          <span className="week-label">S{week}</span>
          {TEST_CALENDRIER[week] && <span className="week-dates">{TEST_CALENDRIER[week]}</span>}
          <span className="week-parity-tag">{week % 2 === 0 ? '4× par tâche' : '3× par tâche'}</span>
        </div>
        <button className="week-btn" onClick={() => setWeek(TEST_SEMAINES[weekIdx + 1])} disabled={weekIdx === TEST_SEMAINES.length - 1}>▶</button>
      </div>

      {semaineComplete ? (
        <div className="encart encart-success">
          <span className="encart-icon">✅</span>
          <div>
            <div className="encart-title">Semaine S{week} complétée !</div>
            <div className="encart-sub">Test réussi 🎉</div>
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
            <div className="encart-sub encart-sub-gold">Bravo, tu auras ton argent de poche ! 🎉</div>
          </div>
        </div>
      )}

      <MonthlySummary user={USER} mois={mois} annee={annee} />
      <TaskList user={USER} week={week} tachesHebdo={taches} carryoverItems={carryover} />
    </div>
  )
}
