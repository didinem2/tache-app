import * as XLSX from 'xlsx'
import { TASK_IDS, SEMAINES } from '../data/planning.js'

export default function ExportButton({ history }) {
  function handleExport() {
    // Feuille 1 : Résumé par semaine et par enfant
    const resume = []
    const users = ['nathys', 'elisa']
    SEMAINES.forEach(week => {
      users.forEach(user => {
        const entries = history.filter(h => h.week === week && h.user === user)
        if (entries.length > 0) {
          resume.push({
            Semaine: `S${week}`,
            Enfant: user === 'nathys' ? 'Nathys' : 'Elisa',
            'Tâches cochées': entries.length,
          })
        }
      })
    })

    // Feuille 2 : Historique détaillé
    const detail = history
      .slice()
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .map(h => ({
        Enfant: h.user === 'nathys' ? 'Nathys' : 'Elisa',
        Semaine: h.week ? `S${h.week}` : `${h.mois}/${h.annee}`,
        Tâche: TASK_IDS[h.task] ?? h.task,
        Occurrence: h.occurrence ?? '—',
        'Date/Heure': new Date(h.completedAt).toLocaleString('fr-FR'),
      }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resume), 'Résumé')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detail), 'Historique')
    XLSX.writeFile(wb, 'suivi_taches.xlsx')
  }

  return (
    <button className="export-btn" onClick={handleExport}>
      📥 Exporter en Excel
    </button>
  )
}
