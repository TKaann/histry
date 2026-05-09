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

  if (error) return <div className="home-error">{error}</div>

  const youtubeId = event?.youtubeUrl ? extractYouTubeId(event.youtubeUrl) : null

  return (
    <main className="home-page">

      {/* ── Row 1: Meta chips ─────────────────────── */}
      <div className="home__meta">
        <span className="home__chip home__chip--date">📅 {displayDate}</span>
        {event?.locationName && (
          <span className="home__chip home__chip--loc">📍 {event.locationName}</span>
        )}
      </div>

      {/* ── Row 2: Left (text + sources) + Right (youtube) ─── */}
      <div className="home__top">

        {/* Left: title, desc, sources */}
        <div className="home__text">
          <h1 className="home__title">{event?.title}</h1>
          <p className="home__desc">{event?.description}</p>

          {event?.sources?.length > 0 && (
            <div className="home__sources">
              <span className="home__sources-label">{t('home.sources')}:</span>
              {event.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="home__source-chip">
                  {s.title} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: YouTube embed (only if exists) */}
        {youtubeId && (
          <div className="home__video-wrap">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Event video"
              allowFullScreen
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
      </div>

      {/* ── Row 3: Map + Game widget ──────────────── */}
      <div className="home__bottom">
        {event?.latitude && event?.longitude ? (
          <div className="home__map-wrap">
            <EventMap lat={event.latitude} lng={event.longitude} locationName={event.locationName} />
          </div>
        ) : (
          <div className="home__map-placeholder">
            <span>🗺</span>
            <p>Konum yok</p>
          </div>
        )}

        <div className="home__game-wrap">
          <YearGuessGame today={today} />
        </div>
      </div>

    </main>
  )
}

function extractYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : ''
}
