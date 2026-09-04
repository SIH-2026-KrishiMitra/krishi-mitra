// LocalStorage persistence abstraction

const PREFIX = 'km_'

function key(k: string): string {
  return PREFIX + k
}

export const storage = {
  get<T>(k: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(k))
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  set<T>(k: string, value: T): void {
    try {
      localStorage.setItem(key(k), JSON.stringify(value))
    } catch {
      // Quota exceeded or private browsing — silently ignore
    }
  },

  remove(k: string): void {
    localStorage.removeItem(key(k))
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
  },
}
