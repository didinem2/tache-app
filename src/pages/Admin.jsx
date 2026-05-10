import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PinGate from '../components/PinGate.jsx'
import { usePlanning } from '../context/PlanningContext.jsx'
import { MOIS_NOMS } from '../data/planning.js'

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
    semaines, tachesMensuelles, loading,
    getMoisPlanning, isMonthArchived, archiveMonth, unarchiveMonth,
    addSemaine, updateSemaine, deleteSemaine, seedSemaines,
    addTacheMensuelle, deleteTacheMensuelle, seedTachesMensuelles,
  } = usePlanning()

  const [form, setForm] = useState(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [occEdits, setOccEdits] = useState({})
  const [confirmTache, setConfirmTache] = useState(null)
  // Formulaire d'ajout par mois : { '5-2026': 'label en cours', ... }
  const [newTacheByMois, setNewTacheByMois] = useState({})
  const [showArchived, setShowArchived] = useState(false)

  if (loading) return <div className="page-loading">Chargement…</div>

  const moisPlanning = getMoisPlanning()
  const archivedCount = moisPlanning.filter(({ mois, annee }) => isMonthArchived(mois, annee)).length
  const visibleMois = moisPlanning.filter(({ mois, annee }) =>
    showArchived || !isMonthArchived(mois, annee)
  )

  // ── Occurrences ───────────────────────────────────────────────────────────

  function getEffectiveNathysOcc(s) {
    return occEdits[s.id]?.nathys ?? s.nathysOccurrences ?? (s.elisaPresente ? 3 : 4)
  }

  function getEffectiveElisaOcc(s) {
    return occEdits[s.id]?.elisa ?? s.elisaOccurrences ?? 4
  }

  function handleNathysOccChange(s, val) {
    setOccEdits(prev => ({ ...prev, [s.id]: { ...prev[s.id], nathys: Number(val) } }))
  }

  function handleElisaOccChange(s, val) {
    setOccEdits(prev => ({ ...prev, [s.id]: { ...prev[s.id], elisa: Number(val) } }))
  }

  async function handleOccBlur(s) {
    const edit = occEdits[s.id]
    if (!edit) return
    const updates = {}
    if (edit.nathys !== undefined) updates.nathysOccurrences = edit.nathys
    if (edit.elisa !== undefined) updates.elisaOccurrences = edit.elisa
    if (Object.keys(updates).length > 0) {
      try {
        await updateSemaine(s.id, updates)
      } catch (err) {
        alert('Erreur lors de la sauvegarde : ' + err.message)
      }
    }
    setOccEdits(prev => { const next = { ...prev }; delete next[s.id]; return next })
  }

  // ── Semaines CRUD ─────────────────────────────────────────────────────────

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.num || !form.label) return
    const num = Number(form.num)
    if (semaines.some(s => s.num === num)) {
      alert(`La semaine S${num} existe déjà.`)
      return
    }
    setSaving(true)
    try {
      await addSemaine({
        num,
        label: form.label,
        mois: Number(form.mois),
        annee: Number(form.annee),
        elisaPresente: form.elisaPresente,
      })
      setForm(FORM_EMPTY)
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleElisa(s) {
    try { await updateSemaine(s.id, { elisaPresente: !s.elisaPresente }) }
    catch (err) { alert('Erreur : ' + err.message) }
  }

  async function handleDelete(s) {
    if (confirm === s.id) {
      try { await deleteSemaine(s.id) } catch (err) { alert('Erreur : ' + err.message) }
      setConfirm(null)
    } else {
      setConfirm(s.id)
    }
  }

  async function handleSeed() {
    setSaving(true)
    try { await seedSemaines() }
    catch (err) { alert('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  // ── Tâches mensuelles CRUD ────────────────────────────────────────────────

  function moisKey(mois, annee) { return `${mois}-${annee}` }

  async function handleAddTache(e, mois, annee) {
    e.preventDefault()
    const key = moisKey(mois, annee)
    const label = (newTacheByMois[key] ?? '').trim()
    if (!label) return
    setSaving(true)
    try {
      await addTacheMensuelle(label)
      setNewTacheByMois(prev => ({ ...prev, [key]: '' }))
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTache(t) {
    if (confirmTache === t.id) {
      try { await deleteTacheMensuelle(t.id) } catch (err) { alert('Erreur : ' + err.message) }
      setConfirmTache(null)
    } else {
      setConfirmTache(t.id)
    }
  }

  async function handleSeedTaches() {
    setSaving(true)
    try { await seedTachesMensuelles() }
    catch (err) { alert('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  // ── Archivage ─────────────────────────────────────────────────────────────

  async function handleArchive(mois, annee) {
    try { await archiveMonth(mois, annee) }
    catch (err) { alert('Erreur : ' + err.message) }
  }

  async function handleUnarchive(mois, annee) {
    try { await unarchiveMonth(mois, annee) }
    catch (err) { alert('Erreur : ' + err.message) }
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

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

        {archivedCount > 0 && (
          <button
            className="admin-show-archived-btn"
            onClick={() => setShowArchived(v => !v)}
          >
            {showArchived
              ? `Masquer les mois archivés`
              : `Voir les mois archivés (${archivedCount})`}
          </button>
        )}

        {visibleMois.map(({ mois, annee }) => {
          const weeks = semaines.filter(s => s.mois === mois && s.annee === annee)
          const archived = isMonthArchived(mois, annee)
          const key = moisKey(mois, annee)
          const newLabel = newTacheByMois[key] ?? ''

          return (
            <section key={key} className={`admin-month ${archived ? 'admin-month-archived' : ''}`}>
              {/* En-tête du mois */}
              <div className="admin-month-header">
                <h3 className="section-title">{MOIS_NOMS[mois]} {annee}</h3>
                {archived ? (
                  <button className="admin-unarchive-btn" onClick={() => handleUnarchive(mois, annee)}>
                    ↩ Désarchiver
                  </button>
                ) : (
                  <button className="admin-archive-btn" onClick={() => handleArchive(mois, annee)}>
                    📦 Archiver
                  </button>
                )}
              </div>

              {/* Semaines */}
              <div className="admin-weeks">
                {weeks.map(s => (
                  <div key={s.id} className="admin-week-card">
                    <div className="admin-week-row">
                      <span className="admin-week-num">S{s.num}</span>
                      <span className="admin-week-label">{s.label}</span>
                      <button
                        className={`admin-elisa-toggle ${s.elisaPresente ? 'present' : 'absent'}`}
                        onClick={() => handleToggleElisa(s)}
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

                    <div className="admin-week-occurrences">
                      <span className="admin-occ-user">🌸 Nathys</span>
                      <input
                        className="admin-occ-input"
                        type="number"
                        min="0"
                        max="7"
                        value={getEffectiveNathysOcc(s)}
                        onChange={e => handleNathysOccChange(s, e.target.value)}
                        onBlur={() => handleOccBlur(s)}
                      />
                      <span className="admin-occ-unit">× / tâche</span>
                      {s.elisaPresente && (
                        <>
                          <span className="admin-occ-sep">|</span>
                          <span className="admin-occ-user">⭐ Elisa</span>
                          <input
                            className="admin-occ-input"
                            type="number"
                            min="0"
                            max="7"
                            value={getEffectiveElisaOcc(s)}
                            onChange={e => handleElisaOccChange(s, e.target.value)}
                            onBlur={() => handleOccBlur(s)}
                          />
                          <span className="admin-occ-unit">× / tâche</span>
                        </>
                      )}
                      {(getEffectiveNathysOcc(s) === 0 ||
                        (s.elisaPresente && getEffectiveElisaOcc(s) === 0)) && (
                        <span className="admin-occ-hint">0 = semaine sans tâches</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tâches mensuelles — même encart sur chaque mois */}
              <div className="admin-mensuel-block">
                <div className="admin-mensuel-title">📅 Tâches mensuelles</div>

                {tachesMensuelles.length === 0 ? (
                  <div className="admin-mensuel-empty">
                    <p>Aucune tâche mensuelle.</p>
                    <button className="btn-seed" onClick={handleSeedTaches} disabled={saving}>
                      Initialiser les 4 tâches par défaut
                    </button>
                  </div>
                ) : (
                  <div className="admin-mensuel-list">
                    {tachesMensuelles.map(t => (
                      <div key={t.id} className="admin-mensuel-row">
                        <span className="admin-mensuel-label">{t.label}</span>
                        <button
                          className={`admin-del-btn ${confirmTache === t.id ? 'confirm' : ''}`}
                          onClick={() => handleDeleteTache(t)}
                        >
                          {confirmTache === t.id ? 'Confirmer ?' : '🗑'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form className="admin-mensuel-form" onSubmit={e => handleAddTache(e, mois, annee)}>
                  <input
                    type="text"
                    className="admin-mensuel-input"
                    placeholder="Nouvelle tâche mensuelle…"
                    value={newLabel}
                    onChange={e => setNewTacheByMois(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                  <button
                    type="submit"
                    className="btn-add-semaine"
                    disabled={saving || !newLabel.trim()}
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            </section>
          )
        })}

        {/* Ajouter une semaine */}
        <section className="admin-add-section">
          <h3 className="section-title">Ajouter une semaine</h3>
          <form className="admin-form" onSubmit={handleAdd}>
            <div className="admin-form-row">
              <label>
                N° semaine
                <input
                  type="number" min="1" max="53"
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
                <select value={form.mois} onChange={e => setForm(f => ({ ...f, mois: Number(e.target.value) }))}>
                  {MOIS_OPTIONS.map(m => <option key={m} value={m}>{MOIS_NOMS[m]}</option>)}
                </select>
              </label>
              <label>
                Année
                <input
                  type="number" min="2026" max="2099"
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
            <button type="submit" className="btn-add-semaine" disabled={saving}>Ajouter</button>
          </form>
        </section>
      </div>
    </PinGate>
  )
}
