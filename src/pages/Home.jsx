import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <div className="home-header">
        <h1>Suivi des tâches</h1>
        <p className="home-subtitle">Choisissez votre profil</p>
      </div>

      <div className="home-buttons">
        <button
          className="home-btn btn-nathys"
          onClick={() => navigate('/nathys')}
        >
          <span className="btn-emoji">🌸</span>
          <span className="btn-name">Nathys</span>
          <span className="btn-age">16 ans</span>
        </button>

        <button
          className="home-btn btn-elisa"
          onClick={() => navigate('/elisa')}
        >
          <span className="btn-emoji">⭐</span>
          <span className="btn-name">Elisa</span>
          <span className="btn-age">12 ans</span>
        </button>

        <button
          className="home-btn btn-parents"
          onClick={() => navigate('/parents')}
        >
          <span className="btn-emoji">👨‍👩‍👧‍👧</span>
          <span className="btn-name">Parents</span>
          <span className="btn-age">Vue globale</span>
        </button>

        <button
          className="home-btn btn-test"
          onClick={() => navigate('/test')}
        >
          <span className="btn-emoji">🧪</span>
          <span className="btn-name">Compte Test</span>
          <span className="btn-age">Avril 2026</span>
        </button>
      </div>
    </div>
  )
}
