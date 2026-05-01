import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PinGate from '../components/PinGate.jsx'
import { usePlanning } from '../context/PlanningContext.jsx'
import { MOIS_NOMS, moisSuivantLabel } from '../data/planning.js'

const MOIS_OPTIONS = [1,2,3,4,5,6,7,8,9,10,11,12]

const FORM_EMPTY = {
  num: '',
  label: '',
  mois: new Date().getMonth() + 1,
  annee: new Date().getFullYear(),
  elisaPresente: false,
}

export default function Admin() {
  const navigate = useNavigate()
  const {
    semaines, loading,
    getMoisPlanning, elisaPresente,
    addSemaine, updateSemaine, deleteSemaine, seedSemaines,
  } = usePlanning()

  const [form, setForm] = useState(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)

  if (loading) return <div className="page-loading">Chargement…</div>

  const moisPlanning = getMoisPlanning()

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.num || !form.label) return
    const num = Number(form.num)
    if (semaines.some(s => s.num === num)) {
      alert(`La semaine S${num} existe déjà.`)
      return
    }
    setSaving(true)
    await addSemaine({
      num,
      label: form.label,
      mois: Number(form.mois),
      annee: Number(form.annee),
      elisaPresente: form.elisaPresente,
    })
    setForm(FORM_EMPTY)
    setSaving(false)
  }

  async function handleToggleElisa(s) {
    await updateSemaine(s.id, { elisaPresente: !s.elisaPresente })
  }

  async function handleDelete(s) {
    if (confirm === s.id) {
      await deleteSemaine(s.id)
      setConfirm(null)
    } else {
      setConfirm(s.id)
    }
  }

  async function handleSeed() {
    setSaving(true)
    await seedSemaines()
    setSaving(false)
  }

  return (
    <PinGate user="parents">
      <div className="page page-parents">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate('/parents')}>← Retour</button>
          <h2>🔧 Planning</h2>
        </header>

        {semaines.length === 0 && (
          <div className="admin-empty">
            <p>Aucune semaine configurée.</p>
            <button className="btn-seed" onClick={handleSeed} disabled={saving}>
              Initialiser mai – juin 2026
            </button>
          </div>
        )}

        {moisPlanning.map(({ mois, annee }) => {
          const weeks = semaines.filter(s => s.mois === mois && s.annee === annee)
          return (
            <section key={`${mois}-${annee}`} className="admin-month">
              <h3 className="section-title">{MOIS_NOMS[mois]} {annee}</h3>
              <div className="admin-weeks">
                {weeks.map(s => (
                  <div key={s.id} className="admin-week-row">
                    <span className="admin-week-num">S{s.num}</span>
                    <span className="admin-week-label">{s.label}</span>
                    <button
                      className={`admin-elisa-toggle ${s.elisaPresente ? 'present' : 'absent'}`}
                      onClick={() => handleToggleElisa(s)}
                      title="Cliquer pour basculer"
                    >
                      {s.elisaPresente ? '⭐ Elisa présente' : '— Elisa absente'}
                    </button>
                    <button
                      className={`admin-del-btn ${confirm === s.id ? 'confirm' : ''}`}
                      onClick={() => handleDelete(s)}
                    >
                      {confirm === s.id ? 'Confirmer ?' : '🗑'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        <section className="admin-add-section">
          <h3 className="section-title">Ajouter une semaine</h3>
          <form className="admin-form" onSubmit={handleAdd}>
            <div className="admin-form-row">
              <label>
                N° semaine
                <input
                  type="number"
                  min="1"
                  max="53"
                  value={form.num}
                  onChange={e => setForm(f => ({ ...f, num: e.target.value }))}
                  required
                />
              </label>
              <label>
                Dates
                <input
                  type="text"
                  placeholder="ex: 7 – 13 juil. 2026"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  required
                />
              </label>
            </div>
            <div className="admin-form-row">
              <label>
                Mois
                <select
                  value={form.mois}
                  onChange={e => setForm(f => ({ ...f, mois: Number(e.target.value) }))}
                >
                  {MOIS_OPTIONS.map(m => (
                    <option key={m} value={m}>{MOIS_NOMS[m]}</option>
                  ))}
                </select>
              </label>
              <label>
                Année
                <input
                  type="number"
                  min="2026"
                  max="2099"
                  value={form.annee}
                  onChange={e => setForm(f => ({ ...f, annee: Number(e.target.value) }))}
                />
              </label>
              <label className="admin-elisa-check">
                <input
                  type="checkbox"
                  checked={form.elisaPresente}
                  onChange={e => setForm(f => ({ ...f, elisaPresente: e.target.checked }))}
                />
                Elisa présente
              </label>
            </div>
            <button type="submit" className="btn-add-semaine" disabled={saving}>
              Ajouter
            </button>
          </form>
        </section>
      </div>
    </PinGate>
  )
}
