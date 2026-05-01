import { useNavigate } from 'react-router-dom'
import HistoryTable from '../components/HistoryTable.jsx'
import ExportButton from '../components/ExportButton.jsx'
import PinGate from '../components/PinGate.jsx'
import { useHistory } from '../context/HistoryContext.jsx'
import { SEMAINES, tachesHebdoNathys, tachesHebdoElisa, TACHES_MENSUELLES } from '../data/planning.js'
import { getMonth, getYear } from 'date-fns'

function countDoneForUser(history, user, week) {
  return history.filter(h => h.user === user && h.week === week && h.type === 'hebdo').length
}

function expectedForUser(user, week) {
  const taches = user === 'nathys' ? tachesHebdoNathys(week) : tachesHebdoElisa(week)
  return taches.reduce((acc, t) => acc + t.occurrences, 0)
}

function countMensuelDone(history, user) {
  const mois = getMonth(new Date()) + 1
  const annee = getYear(new Date())
  return history.filter(
    h => h.user === user && h.type === 'mensuel' && h.mois === mois && h.annee === annee,
  ).length
}

export default function Parents() {
  const navigate = useNavigate()
  const { history, loading } = useHistory()

  if (loading) return <div className="page-loading">Chargement…</div>

  const moisMensuel = TACHES_MENSUELLES.length

  return (
    <PinGate user="parents">
    <div className="page page-parents">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Retour</button>
        <h2>👁️ Compte surveillance</h2>
      </header>

      <section className="summary-section">
        <h3 className="section-title">Récapitulatif S19 – S27</h3>
        <div className="table-scroll">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Semaine</th>
                <th>🌸 Nathys (cochées / attendues)</th>
                <th>⭐ Elisa (cochées / attendues)</th>
              </tr>
            </thead>
            <tbody>
              {SEMAINES.map(week => {
                const nDone = countDoneForUser(history, 'nathys', week)
                const nExp = expectedForUser('nathys', week)
                const eDone = countDoneForUser(history, 'elisa', week)
                const eExp = expectedForUser('elisa', week)
                return (
                  <tr key={week}>
                    <td><strong>S{week}</strong></td>
                    <td className={nDone >= nExp && nExp > 0 ? 'done' : ''}>
                      {nDone} / {nExp}
                    </td>
                    <td className={eDone >= eExp && eExp > 0 ? 'done' : eExp === 0 ? 'absent' : ''}>
                      {eExp === 0 ? 'Absente' : `${eDone} / ${eExp}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="monthly-summary">
          <h4>Tâches mensuelles (mois en cours)</h4>
          <p>🌸 Nathys : {countMensuelDone(history, 'nathys')} / {moisMensuel}</p>
          <p>⭐ Elisa : {countMensuelDone(history, 'elisa')} / {moisMensuel}</p>
        </div>
      </section>

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
