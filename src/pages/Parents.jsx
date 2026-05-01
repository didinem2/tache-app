import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HistoryTable from '../components/HistoryTable.jsx'
import ExportButton from '../components/ExportButton.jsx'
import PinGate from '../components/PinGate.jsx'
import { useHistory } from '../context/HistoryContext.jsx'
import { usePlanning } from '../context/PlanningContext.jsx'
import { TACHES_MENSUELLES, MOIS_NOMS, moisSuivantLabel } from '../data/planning.js'

function countHebdoDone(history, user, week) {
  return history.filter(h => h.user === user && h.week === week && h.type === 'hebdo').length
}

function countMensuelDone(history, user, mois, annee) {
  return history.filter(
    h => h.user === user && h.type === 'mensuel' && h.mois === mois && h.annee === annee,
  ).length
}

function MonthNav({ moisIdx, total, mois, annee, onPrev, onNext }) {
  return (
    <div className="month-nav">
      <button className="month-nav-btn" onClick={onPrev} disabled={moisIdx === 0}>◀</button>
      <span className="month-nav-label">{MOIS_NOMS[mois]} {annee}</span>
      <button className="month-nav-btn" onClick={onNext} disabled={moisIdx === total - 1}>▶</button>
    </div>
  )
}

export default function Parents() {
  const navigate = useNavigate()
  const { history, loading: hLoading, isArgentDonne, getArgentDonneLe, toggleArgentDonne } = useHistory()
  const {
    loading: pLoading,
    getMoisPlanning, getWeeksForMonth, tachesHebdoNathys, tachesHebdoElisa, elisaPresente,
  } = usePlanning()
  const [moisIdx, setMoisIdx] = useState(0)

  if (hLoading || pLoading) return <div className="page-loading">Chargement…</div>

  const moisPlanning = getMoisPlanning()
  if (moisPlanning.length === 0) {
    return (
      <PinGate user="parents">
        <div className="page page-parents">
          <header className="page-header">
            <button className="back-btn" onClick={() => navigate('/')}>← Retour</button>
            <h2>👁️ Compte surveillance</h2>
          </header>
          <div className="admin-empty">
            <p>Aucune semaine configurée dans le planning.</p>
            <button className="btn-seed" onClick={() => navigate('/admin')}>
              Configurer le planning
            </button>
          </div>
        </div>
      </PinGate>
    )
  }

  const idx = Math.min(moisIdx, moisPlanning.length - 1)
  const { mois, annee } = moisPlanning[idx]
  const weeksForMonth = getWeeksForMonth(mois, annee)
  const moisLabel = moisSuivantLabel(mois, annee)
  const moisMensuel = TACHES_MENSUELLES.length

  const nathysArgent = isArgentDonne('nathys', mois, annee)
  const elisaArgent = isArgentDonne('elisa', mois, annee)
  const nathysArgentLe = getArgentDonneLe('nathys', mois, annee)
  const elisaArgentLe = getArgentDonneLe('elisa', mois, annee)

  const elisaWeeks = weeksForMonth.filter(w => elisaPresente(w))

  function expectedHebdo(user, week) {
    const taches = user === 'nathys' ? tachesHebdoNathys(week) : tachesHebdoElisa(week)
    return taches.reduce((acc, t) => acc + t.occurrences, 0)
  }

  return (
    <PinGate user="parents">
      <div className="page page-parents">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Retour</button>
          <h2>👁️ Compte surveillance</h2>
          <button className="admin-link-btn" onClick={() => navigate('/admin')} title="Gérer le planning">
            🔧
          </button>
        </header>

        <MonthNav
          moisIdx={idx}
          total={moisPlanning.length}
          mois={mois}
          annee={annee}
          onPrev={() => setMoisIdx(i => i - 1)}
          onNext={() => setMoisIdx(i => i + 1)}
        />

        {/* ── Nathys ── */}
        <section className="recap-section">
          <h3 className="section-title">🌸 Nathys — {MOIS_NOMS[mois]} {annee}</h3>

          <div className="table-scroll">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Semaine</th>
                  <th>Tâches hebdo (cochées / attendues)</th>
                </tr>
              </thead>
              <tbody>
                {weeksForMonth.length === 0 && (
                  <tr><td colSpan={2} className="absent">Aucune semaine ce mois</td></tr>
                )}
                {weeksForMonth.map(week => {
                  const done = countHebdoDone(history, 'nathys', week)
                  const exp = expectedHebdo('nathys', week)
                  return (
                    <tr key={week}>
                      <td><strong>S{week}</strong></td>
                      <td className={done >= exp && exp > 0 ? 'done' : ''}>
                        {done} / {exp}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="mensuel-line">
            Tâches mensuelles : <strong>{countMensuelDone(history, 'nathys', mois, annee)} / {moisMensuel}</strong>
          </p>

          <label className="argent-label">
            <input
              type="checkbox"
              checked={nathysArgent}
              onChange={e => toggleArgentDonne('nathys', mois, annee, e.target.checked)}
            />
            <span>💰 Argent de poche {moisLabel} donné</span>
            {nathysArgentLe && (
              <span className="argent-date">
                ({new Date(nathysArgentLe).toLocaleDateString('fr-FR')})
              </span>
            )}
          </label>
        </section>

        {/* ── Elisa ── */}
        <section className="recap-section">
          <h3 className="section-title">⭐ Elisa — {MOIS_NOMS[mois]} {annee}</h3>

          <div className="table-scroll">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Semaine</th>
                  <th>Tâches hebdo (cochées / attendues)</th>
                </tr>
              </thead>
              <tbody>
                {elisaWeeks.length === 0 && (
                  <tr><td colSpan={2} className="absent">Absente ce mois</td></tr>
                )}
                {elisaWeeks.map(week => {
                  const done = countHebdoDone(history, 'elisa', week)
                  const exp = expectedHebdo('elisa', week)
                  return (
                    <tr key={week}>
                      <td><strong>S{week}</strong></td>
                      <td className={done >= exp && exp > 0 ? 'done' : ''}>
                        {done} / {exp}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="mensuel-line">
            Tâches mensuelles : <strong>{countMensuelDone(history, 'elisa', mois, annee)} / {moisMensuel}</strong>
          </p>

          <label className="argent-label">
            <input
              type="checkbox"
              checked={elisaArgent}
              onChange={e => toggleArgentDonne('elisa', mois, annee, e.target.checked)}
            />
            <span>💰 Argent de poche {moisLabel} donné</span>
            {elisaArgentLe && (
              <span className="argent-date">
                ({new Date(elisaArgentLe).toLocaleDateString('fr-FR')})
              </span>
            )}
          </label>
        </section>

        {/* ── Historique ── */}
        <section>
          <div className="section-header">
            <h3 className="section-title">Historique complet</h3>
            <div className="export-row">
              <ExportButton history={history} />
            </div>
          </div>
          <HistoryTable history={history} />
        </section>
      </div>
    </PinGate>
  )
}
