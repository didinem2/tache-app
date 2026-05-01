import { SEMAINES, CALENDRIER, elisaPresente } from '../data/planning.js'

export default function WeekSelector({ user, week, onChange }) {
  const semaines = user === 'elisa'
    ? SEMAINES.filter(s => elisaPresente(s))
    : SEMAINES

  return (
    <div className="week-selector">
      <button
        className="week-btn"
        onClick={() => {
          const idx = semaines.indexOf(week)
          if (idx > 0) onChange(semaines[idx - 1])
        }}
        disabled={semaines.indexOf(week) === 0}
        aria-label="Semaine précédente"
      >
        ◀
      </button>

      <div className="week-info">
        <span className="week-label">S{week}</span>
        {CALENDRIER[week] && (
          <span className="week-dates">{CALENDRIER[week]}</span>
        )}
      </div>

      <button
        className="week-btn"
        onClick={() => {
          const idx = semaines.indexOf(week)
          if (idx < semaines.length - 1) onChange(semaines[idx + 1])
        }}
        disabled={semaines.indexOf(week) === semaines.length - 1}
        aria-label="Semaine suivante"
      >
        ▶
      </button>
    </div>
  )
}
