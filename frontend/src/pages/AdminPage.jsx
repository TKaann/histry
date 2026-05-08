import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { adminApi } from '../services/api'
import './AdminPage.css'

const TABS = ['events', 'suggestions', 'applicants']

const FIELDS = [
  ['displayDate', 'Gösterim Tarihi', 'date'],
  ['eventYear',   'Tarihsel Yıl',    'number'],
  ['locationName','Konum Adı',       'text'],
  ['latitude',    'Enlem',           'number'],
  ['longitude',   'Boylam',          'number'],
  ['youtubeUrl',  'YouTube URL',     'url'],
  ['trTitle',     'TR Başlık',       'text'],
  ['enTitle',     'EN Title',        'text'],
]

const REQUIRED = ['displayDate', 'eventYear', 'trTitle', 'enTitle']

// ── Reusable kaynak editörü ──────────────────────────────────
function SourcesEditor({ sources, onChange }) {
  const add    = () => onChange([...sources, { sourceTitle: '', sourceUrl: '' }])
  const remove = (i) => onChange(sources.filter((_, idx) => idx !== i))
  const update = (i, field, val) =>
    onChange(sources.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  return (
    <div className="admin__field" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label className="admin__label" style={{ margin: 0 }}>Kaynaklar</label>
        <button type="button" className="admin__add-btn"
          style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
          onClick={add}>+ Kaynak Ekle</button>
      </div>
      {sources.map((src, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
          <input className="admin__input" type="text" placeholder="Başlık (ör: Wikipedia)"
            value={src.sourceTitle} onChange={e => update(i, 'sourceTitle', e.target.value)} />
          <input className="admin__input" type="url" placeholder="https://..."
            value={src.sourceUrl} onChange={e => update(i, 'sourceUrl', e.target.value)} />
          <button type="button" className="admin__btn-reject"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
            onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      {sources.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Henüz kaynak eklenmedi.</p>
      )}
    </div>
  )
}

// ── EventForm: hem create hem edit için kullanılır ───────────
function EventForm({ initial = {}, initialSources = [], onSubmit, submitLabel, onCancel }) {
  const [data, setData] = useState({
    displayDate: '', eventYear: '', locationName: '',
    latitude: '', longitude: '', youtubeUrl: '',
    trTitle: '', trDesc: '', enTitle: '', enDesc: '',
    ...initial
  })
  const [sources, setSources] = useState(initialSources)

  const handle = (e) => {
    e.preventDefault()
    onSubmit(data, sources.filter(s => s.sourceUrl.trim() !== ''))
  }

  return (
    <form className="admin__form card" onSubmit={handle}
      style={onCancel ? { marginTop: 0, borderTop: '2px solid var(--accent)' } : {}}>
      {onCancel && <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent)' }}>✏ Olay Düzenle</p>}
      {FIELDS.map(([k, l, tp]) => (
        <div key={k} className="admin__field">
          <label className="admin__label">{l}</label>
          <input className="admin__input" type={tp}
            value={data[k] ?? ''}
            onChange={e => setData(d => ({ ...d, [k]: e.target.value }))}
            required={REQUIRED.includes(k)} />
        </div>
      ))}
      <label className="admin__label">TR Açıklama</label>
      <textarea className="admin__textarea" rows={3} required
        value={data.trDesc} onChange={e => setData(d => ({ ...d, trDesc: e.target.value }))} />
      <label className="admin__label">EN Description</label>
      <textarea className="admin__textarea" rows={3} required
        value={data.enDesc} onChange={e => setData(d => ({ ...d, enDesc: e.target.value }))} />
      <SourcesEditor sources={sources} onChange={setSources} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button className="admin__btn-approve" type="submit">{submitLabel}</button>
        {onCancel && (
          <button className="admin__btn-reject" type="button" onClick={onCancel}>İptal</button>
        )}
      </div>
    </form>
  )
}

// ── Ana bileşen ──────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading } = useAuth()
  const { t } = useLocale()
  const [tab, setTab]                 = useState('events')
  const [events, setEvents]           = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [applicants, setApplicants]   = useState([])
  const [showForm, setShowForm]       = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [msg, setMsg]                 = useState('')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    if (tab === 'events')      adminApi.listEvents().then(r => setEvents(r.data))
    if (tab === 'suggestions') adminApi.listSuggestions().then(r => setSuggestions(r.data))
    if (tab === 'applicants')  adminApi.listApplicants().then(r => setApplicants(r.data))
  }, [tab, user])

  if (loading) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Yükleniyor...
    </div>
  )
  if (!user || user.role !== 'ADMIN') return (
    <div className="container" style={{ paddingTop: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Yetkisiz erişim.
    </div>
  )

  const buildPayload = (data, sources) => ({
    displayDate:  data.displayDate,
    eventYear:    parseInt(data.eventYear),
    locationName: data.locationName || null,
    latitude:     data.latitude  ? parseFloat(data.latitude)  : null,
    longitude:    data.longitude ? parseFloat(data.longitude) : null,
    youtubeUrl:   data.youtubeUrl || null,
    translations: [
      { locale: 'tr', title: data.trTitle, description: data.trDesc },
      { locale: 'en', title: data.enTitle, description: data.enDesc },
    ],
    sources,
  })

  const createEvent = async (data, sources) => {
    try {
      await adminApi.createEvent(buildPayload(data, sources))
      setMsg('Olay eklendi ✓')
      setShowForm(false)
      adminApi.listEvents().then(r => setEvents(r.data))
    } catch { setMsg('Hata oluştu') }
  }

  const updateEvent = async (id, data, sources) => {
    try {
      await adminApi.updateEvent(id, buildPayload(data, sources))
      setMsg('Olay güncellendi ✓')
      setEditingId(null)
      adminApi.listEvents().then(r => setEvents(r.data))
    } catch { setMsg('Güncelleme hatası') }
  }

  const deleteEvent = async (id) => {
    if (!confirm('Silinsin mi?')) return
    await adminApi.deleteEvent(id)
    setEvents(ev => ev.filter(e => e.id !== id))
  }

  const approve = async (type, id) => {
    if (type === 'suggestion') { await adminApi.approveSuggestion(id, ''); setSuggestions(s => s.filter(x => x.id !== id)) }
    if (type === 'applicant')  { await adminApi.approveApplicant(id);       setApplicants(s => s.filter(x => x.id !== id)) }
  }
  const reject = async (type, id) => {
    if (type === 'suggestion') { await adminApi.rejectSuggestion(id, ''); setSuggestions(s => s.filter(x => x.id !== id)) }
    if (type === 'applicant')  { await adminApi.rejectApplicant(id);       setApplicants(s => s.filter(x => x.id !== id)) }
  }

  // Mevcut event'ten form initial değerlerini üret
  const toInitial = (ev) => {
    const tr = ev.translations?.find(t => t.locale === 'tr') || {}
    const en = ev.translations?.find(t => t.locale === 'en') || {}
    return {
      displayDate:  ev.displayDate  || '',
      eventYear:    ev.eventYear    || '',
      locationName: ev.locationName || '',
      latitude:     ev.latitude     || '',
      longitude:    ev.longitude    || '',
      youtubeUrl:   ev.youtubeUrl   || '',
      trTitle: tr.title       || '',
      trDesc:  tr.description || '',
      enTitle: en.title       || '',
      enDesc:  en.description || '',
    }
  }

  return (
    <div className="admin container">
      <h1 className="admin__title">{t('admin.title')}</h1>

      <div className="admin__tabs">
        {TABS.map(t2 => (
          <button key={t2}
            className={`admin__tab ${tab === t2 ? 'admin__tab--active' : ''}`}
            onClick={() => { setTab(t2); setMsg(''); setEditingId(null); setShowForm(false) }}>
            {t(`admin.${t2}_tab`)}
          </button>
        ))}
      </div>

      {msg && <p className="admin__msg">{msg}</p>}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div>
          <button className="admin__add-btn"
            onClick={() => { setShowForm(f => !f); setEditingId(null) }}>
            {showForm ? '✕ İptal' : `+ ${t('admin.add_event')}`}
          </button>

          {showForm && (
            <EventForm
              submitLabel="Kaydet"
              onSubmit={createEvent}
            />
          )}

          <div className="admin__list">
            {events.map(ev => (
              <div key={ev.id}>
                <div className="admin__row card">
                  <div>
                    <strong>{ev.displayDate}</strong>
                    <span className="admin__badge">{ev.eventYear}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>{ev.locationName}</span>
                    {ev.sources?.length > 0 && (
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: 'var(--accent)' }}>
                        🔗 {ev.sources.length} kaynak
                      </span>
                    )}
                  </div>
                  <div className="admin__actions">
                    <button className="admin__btn-approve"
                      onClick={() => { setEditingId(editingId === ev.id ? null : ev.id); setShowForm(false) }}>
                      {editingId === ev.id ? '✕ Kapat' : '✏ Düzenle'}
                    </button>
                    <button className="admin__btn-reject" onClick={() => deleteEvent(ev.id)}>
                      {t('admin.delete')}
                    </button>
                  </div>
                </div>

                {editingId === ev.id && (
                  <EventForm
                    initial={toInitial(ev)}
                    initialSources={(ev.sources || []).map(s => ({ sourceTitle: s.sourceTitle, sourceUrl: s.sourceUrl }))}
                    submitLabel="Güncelle"
                    onSubmit={(data, sources) => updateEvent(ev.id, data, sources)}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUGGESTIONS ── */}
      {tab === 'suggestions' && (
        <div className="admin__list">
          {suggestions.length === 0 && <p className="text-muted">Bekleyen öneri yok.</p>}
          {suggestions.map(s => (
            <div key={s.id} className="admin__row card">
              <div>
                <strong>{s.title}</strong>
                <span className="admin__badge">{s.suggestedEventYear}</span>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.description?.slice(0, 120)}...</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{s.suggestedDisplayDate} | {s.locale}</p>
              </div>
              <div className="admin__actions">
                <button className="admin__btn-approve" onClick={() => approve('suggestion', s.id)}>{t('admin.approve')}</button>
                <button className="admin__btn-reject"  onClick={() => reject('suggestion',  s.id)}>{t('admin.reject')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── APPLICANTS ── */}
      {tab === 'applicants' && (
        <div className="admin__list">
          {applicants.length === 0 && <p className="text-muted">Bekleyen başvuru yok.</p>}
          {applicants.map(a => (
            <div key={a.id} className="admin__row card">
              <div>
                <strong>User: {a.userId}</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{a.motivation}</p>
              </div>
              <div className="admin__actions">
                <button className="admin__btn-approve" onClick={() => approve('applicant', a.id)}>{t('admin.approve')}</button>
                <button className="admin__btn-reject"  onClick={() => reject('applicant',  a.id)}>{t('admin.reject')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
