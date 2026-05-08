import { useState, useEffect } from 'react'
import { contentApi } from '../services/api'
import { useLocale } from '../context/LocaleContext'
import EventMap from '../components/EventMap'
import YearGuessGame from '../components/YearGuessGame'
import './HomePage.css'

export default function HomePage() {
  const { locale, t } = useLocale()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const displayDate = event?.displayDate
    ? new Date(event.displayDate).toLocaleDateString(
        locale === 'tr' ? 'tr-TR' : 'en-US',
        { day: 'numeric', month: 'long' }
      )
    : ''

  useEffect(() => {
    setLoading(true)
    contentApi.getToday(locale)
      .then(res => setEvent(res.data))
      .catch(() => setError(t('home.no_event')))
      .finally(() => setLoading(false))
  }, [locale])

  if (loading) return (
    <div className="home-loading">
      <div className="home-loading__dot" />
      <div className="home-loading__dot" />
      <div className="home-loading__dot" />
    </div>
  )

  if (error) return (
    <div className="container" style={{ paddingTop: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      {error}
    </div>
  )

  return (
    <main className="home container">

      {/* Date header */}
      <header className="home__header">
        <p className="home__label text-muted">{t('home.todayIn')}</p>
        <h1 className="home__date">{displayDate}</h1>
      </header>

      {/* Map */}
      {event?.latitude && event?.longitude && (
        <EventMap
          lat={event.latitude}
          lng={event.longitude}
          locationName={event.locationName}
        />
      )}

      {/* Event card */}
      <article className="home__event card">
        {event?.locationName && (
          <p className="home__location text-muted">
            <span className="home__pin">📍</span> {event.locationName}
          </p>
        )}
        <h2 className="home__title">{event?.title}</h2>
        <p className="home__description">{event?.description}</p>

        {/* YouTube embed */}
        {event?.youtubeUrl && (
          <div className="home__video">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(event.youtubeUrl)}`}
              title="Event video"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}

        {/* Sources */}
        {event?.sources?.length > 0 && (
          <div className="home__sources">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{t('home.sources')}:</span>
            {event.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="home__source-link">
                {s.title} ↗
              </a>
            ))}
          </div>
        )}
      </article>

      {/* Divider + Game */}
      <YearGuessGame today={today} />

    </main>
  )
}

function extractYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : ''
}
