import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <div className="home-header">
        <h1>Suivi des tâches</h1>
        <p className="home-subtitle">
          Tâches minimum à effectuer au sein de la vie de famille pour valider
          l'argent de poche du mois prochain (ainsi qu'un bon travail à l'école)
        </p>
      </div>

      <div className="home-buttons">
        <button className="home-btn btn-nathys" onClick={() => navigate('/nathys')}>
          <span className="btn-emoji">🌸</span>
          <span className="btn-name">Nathys</span>
        </button>

        <button className="home-btn btn-elisa" onClick={() => navigate('/elisa')}>
          <span className="btn-emoji">⭐</span>
          <span className="btn-name">Elisa</span>
        </button>

        <button className="home-btn btn-parents" onClick={() => navigate('/parents')}>
          <span className="btn-emoji">👁️</span>
          <span className="btn-name">Compte surveillance</span>
        </button>
      </div>
    </div>
  )
}
