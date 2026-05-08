import { useState, useEffect } from 'react'

const GAME_PREFIX = 'histry_game_'
const STREAK_KEY  = 'histry_streak'

/**
 * All game state lives in localStorage — Wordle pattern.
 * No server-side tracking for anonymous or logged-in users.
 */
export function useGameState(today) {
  const gameKey = `${GAME_PREFIX}${today}`

  const [gameState, setGameStateRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(gameKey)) || null
    } catch { return null }
  })

  const [streak, setStreakRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STREAK_KEY)) || {
        current: 0, max: 0, lastPlayed: null, totalGames: 0, totalWins: 0
      }
    } catch { return { current: 0, max: 0, lastPlayed: null, totalGames: 0, totalWins: 0 } }
  })

  const saveGameState = (state) => {
    localStorage.setItem(gameKey, JSON.stringify(state))
    setGameStateRaw(state)
  }

  const recordResult = (won) => {
    const last = streak.lastPlayed
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const newStreak = {
      current: last === yesterdayStr ? streak.current + 1 : won ? 1 : 0,
      max: Math.max(streak.max, last === yesterdayStr ? streak.current + 1 : won ? 1 : 0),
      lastPlayed: today,
      totalGames: streak.totalGames + 1,
      totalWins: streak.totalWins + (won ? 1 : 0),
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak))
    setStreakRaw(newStreak)
  }

  const addGuess = (guessedYear, direction) => {
    const current = gameState || { guesses: [], directions: [], status: 'playing' }
    const newGuesses    = [...current.guesses, guessedYear]
    const newDirections = [...current.directions, direction]
    const won    = direction === 'CORRECT'
    const lost   = !won && newGuesses.length >= 6
    const status = won ? 'won' : lost ? 'lost' : 'playing'

    const newState = { guesses: newGuesses, directions: newDirections, status }
    saveGameState(newState)
    if (won || lost) recordResult(won)
    return newState
  }

  const alreadyPlayed = !!gameState && gameState.status !== 'playing'

  return { gameState, streak, addGuess, alreadyPlayed }
}
