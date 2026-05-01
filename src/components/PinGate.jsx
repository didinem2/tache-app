import { useState } from 'react'

const PINS = {
  nathys: '0000',
  elisa: '0308',
  parents: '2017',
}

const LABELS = {
  nathys: { emoji: '🌸', nom: 'Nathys' },
  elisa: { emoji: '⭐', nom: 'Elisa' },
  parents: { emoji: '👨‍👩‍👧‍👧', nom: 'Parents' },
}

function sessionKey(user) {
  return `pin_ok_${user}`
}

export function isAuthenticated(user) {
  return sessionStorage.getItem(sessionKey(user)) === 'true'
}

export default function PinGate({ user, children }) {
  const [unlocked, setUnlocked] = useState(isAuthenticated(user))
  const [digits, setDigits] = useState([])
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  if (unlocked) return children

  function press(d) {
    if (digits.length >= 4) return
    const next = [...digits, d]
    setDigits(next)
    setError(false)

    if (next.length === 4) {
      const entered = next.join('')
      if (entered === PINS[user]) {
        sessionStorage.setItem(sessionKey(user), 'true')
        setUnlocked(true)
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => {
          setDigits([])
          setShake(false)
        }, 600)
      }
    }
  }

  function del() {
    setDigits(d => d.slice(0, -1))
    setError(false)
  }

  const { emoji, nom } = LABELS[user]

  return (
    <div className={`pin-screen pin-${user}`}>
      <div className="pin-header">
        <span className="pin-emoji">{emoji}</span>
        <h2 className="pin-title">{nom}</h2>
        <p className="pin-subtitle">Entrez votre code</p>
      </div>

      <div className={`pin-dots ${shake ? 'shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`pin-dot ${digits.length > i ? 'filled' : ''} ${error ? 'error' : ''}`} />
        ))}
      </div>

      {error && <p className="pin-error">Code incorrect</p>}

      <div className="pin-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} className="pin-key" onClick={() => press(String(n))}>{n}</button>
        ))}
        <div className="pin-key pin-key-empty" />
        <button className="pin-key" onClick={() => press('0')}>0</button>
        <button className="pin-key pin-key-del" onClick={del}>⌫</button>
      </div>
    </div>
  )
}
