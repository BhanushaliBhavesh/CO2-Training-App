// Fix: Import STORAGE_KEYS from constants instead of types
import { STORAGE_KEYS } from "../../constants";

export const storageService = {
  saveSession: (session) => {
    const sessions = storageService.getSessions();
    sessions.unshift(session);
    // Use the constant instead of a hardcoded string
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getSessions: () => {
    // Use the constant instead of a hardcoded string
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  clearAll: () => {
    // Use the constant instead of a hardcoded string
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  },

  getStats: () => {
    const sessions = storageService.getSessions();
    const today = new Date().toDateString();

    const sessionsToday = sessions.filter(
      (s) => new Date(s.date).toDateString() === today
    ).length;

    const baselineSessions = sessions.filter(
      (s) => s.type === "baseline" && s.maxHold
    );
    const latestMaxHold =
      baselineSessions.length > 0 ? baselineSessions[0].maxHold || 0 : 0;

    // Simple streak calculation
    let streak = 0;
    const dates = Array.from(
      new Set(sessions.map((s) => new Date(s.date).toDateString()))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let current = new Date();
    for (const dateStr of dates) {
      if (dateStr === current.toDateString()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      sessionsToday,
      latestMaxHold,
      currentStreak: streak,
    };
  },
};
