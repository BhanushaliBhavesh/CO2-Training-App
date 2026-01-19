/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} date
 * @property {'baseline' | 'training'} type
 * @property {number} [maxHold]
 * @property {number} [holdDuration]
 * @property {number} [roundsCompleted]
 * @property {'completed' | 'incomplete'} status
 * @property {string} [notes]
 */

/**
 * @typedef {Object} UserStats
 * @property {number} sessionsToday
 * @property {number} latestMaxHold
 * @property {number} currentStreak
 */

/**
 * @typedef {'prepare' | 'relax' | 'breathe' | 'hold' | 'rest' | 'finished'} TimerPhase
 */

// Enums must be converted to standard JavaScript Objects
export const AppRoute = {
  DASHBOARD: 'dashboard',
  BASELINE: 'baseline',
  TRAINING: 'training',
  HISTORY: 'history',
  SETTINGS: 'settings'
};