import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { suggestionApi } from '../services/api'
import './SuggestPage.css'

export default function SuggestPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [applied, setApplied] = useState(false)
  const [motivation, setMotivation] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', suggestedDisplayDate: '', suggestedEventYear: '',
    locationName: '', latitude: '', longitude: '', youtubeUrl: '', locale: 'tr'
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const isApproved = user?.isSuggestionApproved || user?.role === 'ADMIN'

  const handleApply = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await suggestionApi.apply(motivation)
      setApplied(true)
      setMsg('Başvurunuz alındı.')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Hata oluştu')
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await suggestionApi.submit({
        ...form,
        suggestedEventYear: parseInt(form.suggestedEventYear),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      setMsg('Öneriniz gönderildi, inceleme bekleniyor.')
      setForm({ title:'',description:'',suggestedDisplayDate:'',suggestedEventYear:'',locationName:'',latitude:'',longitude:'',youtubeUrl:'',locale:'tr' })
    } catch (err) {
      setMsg(err.response?.data?.message || 'Hata oluştu')
    } finally { setLoading(false) }
  }

  if (!user) return <div className="container" style={{paddingTop:'3rem',textAlign:'center',color:'var(--text-muted)'}}>Bu sayfa için giriş yapmalısınız.</div>

  return (
    <div className="suggest container">
      {!isApproved && !applied && (
        <div className="card">
          <h1 className="suggest__title">{t('suggest.apply_title')}</h1>
          <form onSubmit={handleApply} className="suggest__form">
            <label className="suggest__label">{t('suggest.apply_label')}</label>
            <textarea className="suggest__textarea" rows={4} required
              value={motivation} onChange={e => setMotivation(e.target.value)} />
            <button className="suggest__btn" type="submit" disabled={loading}>
              {loading ? '...' : t('suggest.apply_btn')}
            </button>
          </form>
          {msg && <p className="suggest__msg">{msg}</p>}
        </div>
      )}

      {!isApproved && applied && (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <p className="text-muted">{t('suggest.pending')}</p>
        </div>
      )}

      {isApproved && (
        <div className="card">
          <h1 className="suggest__title">{t('suggest.form_title')}</h1>
          <form onSubmit={handleSubmit} className="suggest__form">
            {[
              ['title',        t('suggest.title_label'),  'text'],
              ['suggestedDisplayDate', t('suggest.date_label'), 'date'],
              ['suggestedEventYear',   t('suggest.year_label'), 'number'],
              ['locationName', t('suggest.loc_label'),    'text'],
              ['latitude',     t('suggest.lat_label'),    'number'],
              ['longitude',    t('suggest.lng_label'),    'number'],
              ['youtubeUrl',   'YouTube URL',              'url'],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="suggest__label">{label}</label>
                <input className="suggest__input" type={type}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required={['title','suggestedDisplayDate','suggestedEventYear'].includes(key)} />
              </div>
            ))}
            <label className="suggest__label">{t('suggest.desc_label')}</label>
            <textarea className="suggest__textarea" rows={5} required
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <label className="suggest__label">Dil / Locale</label>
            <select className="suggest__input" value={form.locale}
              onChange={e => setForm({ ...form, locale: e.target.value })}>
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
            <button className="suggest__btn" type="submit" disabled={loading}>
              {loading ? '...' : t('suggest.submit_btn')}
            </button>
          </form>
          {msg && <p className="suggest__msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}
