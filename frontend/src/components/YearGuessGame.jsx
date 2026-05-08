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

  const handleGuess = async () => {
    const year = parseInt(input, 10)
    if (!year || year < 1 || year > 2100) { setError('Geçerli bir yıl girin'); return }
    setError('')
    setLoading(true)
    try {
      const res = await gameApi.guess(year, attempt)
      const { direction } = res.data
      addGuess(year, direction)
      setInput('')
    } catch (e) {
      setError('Bir hata oluştu, tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  const dirIcon = (dir) => {
    if (dir === 'CORRECT') return <span className="dir-correct">✓</span>
    if (dir === 'HIGHER')  return <span className="dir-higher">↑</span>
    return <span className="dir-lower">↓</span>
  }

  const dirLabel = (dir) => {
    if (dir === 'CORRECT') return t('game.correct')
    if (dir === 'HIGHER')  return t('game.higher')
    return t('game.lower')
  }

  return (
    <section className="game">
      <div className="divider">{t('game.title')}</div>
      <p className="game__subtitle text-muted">{t('game.subtitle')}</p>

      {/* Previous guesses */}
      {gameState?.guesses.length > 0 && (
        <div className="game__history">
          {gameState.guesses.map((yr, i) => (
            <div key={i} className={`game__row game__row--${gameState.directions[i].toLowerCase()}`}>
              <span className="game__year">{yr}</span>
              <span className="game__dir">{dirIcon(gameState.directions[i])}</span>
              <span className="game__hint">{dirLabel(gameState.directions[i])}</span>
            </div>
          ))}
        </div>
      )}

      {/* Game result */}
      {gameState?.status === 'won' && (
        <div className="game__result game__result--won">
          {t('game.won', { n: gameState.guesses.length })}
        </div>
      )}
      {gameState?.status === 'lost' && (
        <div className="game__result game__result--lost">
          {t('game.lost', { year: '?' })}
        </div>
      )}

      {/* Already played today */}
      {alreadyPlayed && gameState?.status !== 'playing' ? (
        <p className="game__done text-muted">{t('game.already_played')}</p>
      ) : (
        /* Input row */
        <div className="game__input-row">
          <input
            className="game__input"
            type="number"
            placeholder={t('game.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGuess()}
            min="1"
            max="2100"
            disabled={loading || alreadyPlayed}
          />
          <button
            className="game__btn"
            onClick={handleGuess}
            disabled={loading || alreadyPlayed}
          >
            {loading ? '...' : t('game.guess_btn')}
          </button>
        </div>
      )}

      {error && <p className="game__error">{error}</p>}

      {/* Attempts counter */}
      {!alreadyPlayed && gameState?.status !== 'won' && (
        <p className="game__attempts text-muted">
          {t('game.attempts_left', { n: MAX_ATTEMPTS - (gameState?.guesses.length || 0) })}
        </p>
      )}

      {/* Streak stats */}
      {streak.totalGames > 0 && (
        <div className="game__stats">
          <span>{t('game.streak', { n: streak.current })}</span>
          <span className="text-muted">{t('game.stats', { total: streak.totalGames, wins: streak.totalWins })}</span>
        </div>
      )}
    </section>
  )
}
