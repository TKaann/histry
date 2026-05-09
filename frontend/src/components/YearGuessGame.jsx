import { useState } from 'react'
import { gameApi } from '../services/api'
import { useGameState } from '../hooks/useGameState'
import { useLocale } from '../context/LocaleContext'
import './YearGuessGame.css'

const MAX_ATTEMPTS = 6

export default function YearGuessGame({ today }) {
  const { t } = useLocale()
  const { gameState, streak, addGuess, alreadyPlayed } = useGameState(today)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const attempt = gameState ? gameState.guesses.length + 1 : 1
  const isDone = alreadyPlayed || gameState?.status === 'won' || gameState?.status === 'lost'

  // correctYear comes from localStorage (persisted on game end), or live from API response
  const storedYear = gameState?.correctYear
  const displayYear = (y) => (y < 0 ? `MÖ ${Math.abs(y)}` : `${y}`)

  const handleGuess = async () => {
    const year = parseInt(input, 10)
    if (isNaN(year) || year < -9999 || year > 2100) {
      setError('Geçerli bir yıl girin (örn: 1945 veya -500)')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await gameApi.guess(year, attempt)
      const { direction, correctYear: revealed } = res.data
      // Pass correctYear to addGuess so it's persisted in localStorage
      addGuess(year, direction, revealed)
      setInput('')
    } catch {
      setError('Bir hata oluştu, tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  const chipClass = (dir) => dir === 'CORRECT' ? 'chip chip--correct' : 'chip chip--hint'
  const chipContent = (year, dir) => {
    if (dir === 'CORRECT') return `${year} ✓`
    if (dir === 'HIGHER')  return `${year} ↑`
    return `${year} ↓`
  }

  const attemptsLeft = MAX_ATTEMPTS - (gameState?.guesses.length || 0)

  return (
    <div className="game">

      <div className="game__header">
        <span className="game__title-label">{t('game.title')}</span>
        {!isDone && (
          <span className="game__attempts-badge">{attemptsLeft} / {MAX_ATTEMPTS}</span>
        )}
      </div>
      <p className="game__subtitle">{t('game.subtitle')}</p>

      {/* Progress dots */}
      <div className="game__dots">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
          const dir = gameState?.directions[i]
          let cls = 'dot'
          if (dir === 'CORRECT')  cls += ' dot--correct'
          else if (dir)           cls += ' dot--used'
          else if (i === (gameState?.guesses.length || 0) && !isDone) cls += ' dot--active'
          return <span key={i} className={cls} />
        })}
      </div>

      {/* Guess chips */}
      {gameState?.guesses.length > 0 && (
        <div className="game__chips">
          {gameState.guesses.map((yr, i) => (
            <span key={i} className={chipClass(gameState.directions[i])}>
              {chipContent(yr, gameState.directions[i])}
            </span>
          ))}
        </div>
      )}

      {/* Input — hidden when done */}
      {!isDone && (
        <div className="game__input-row">
          <input
            className="game__input"
            type="number"
            placeholder={t('game.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGuess()}
            disabled={loading}
            autoFocus
          />
          <button className="game__btn" onClick={handleGuess} disabled={loading}>
            {loading ? '...' : t('game.guess_btn')}
          </button>
        </div>
      )}

      {error && <p className="game__error">{error}</p>}

      {/* Result banners */}
      {gameState?.status === 'won' && (
        <div className="game__result game__result--won">
          🎉 {t('game.won', { n: gameState.guesses.length })}
          {storedYear != null && (
            <span className="game__answer"> — {displayYear(storedYear)}</span>
          )}
        </div>
      )}
      {gameState?.status === 'lost' && (
        <div className="game__result game__result--lost">
          😔 Cevap:{' '}
          <strong>
            {storedYear != null ? displayYear(storedYear) : '—'}
          </strong>
        </div>
      )}
      {alreadyPlayed && gameState?.status !== 'playing' && (
        <p className="game__done">{t('game.already_played')}</p>
      )}

      {/* Stats — only after game ends */}
      {isDone && streak.totalGames > 0 && (
        <div className="game__stats">
          <div className="stat">
            <span className="stat__value">{streak.totalGames}</span>
            <span className="stat__label">Toplam</span>
          </div>
          <div className="stat">
            <span className="stat__value">{streak.totalWins}</span>
            <span className="stat__label">Kazanılan</span>
          </div>
          <div className="stat">
            <span className="stat__value">{streak.current}</span>
            <span className="stat__label">Seri</span>
          </div>
          <div className="stat">
            <span className="stat__value">{streak.max}</span>
            <span className="stat__label">En Uzun</span>
          </div>
        </div>
      )}

    </div>
  )
}
