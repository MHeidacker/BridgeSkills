import { ScrapedJob } from './services/job-scraper'

interface CacheEntry<T> {
  value: T
  timestamp: number
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map()
  private readonly ttl: number // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) { // Default TTL of 60 minutes
    this.ttl = ttlMinutes * 60 * 1000
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key)
      return null
    }

    return entry.value as T
  }

  clear(): void {
    this.store.clear()
  }

  // Remove expired entries
  cleanup(): void {
    const now = Date.now()
    Array.from(this.store.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.ttl) {
        this.store.delete(key)
      }
    })
  }
}

// Create a singleton cache instance for job search results
export const jobCache = new Cache(60) // Cache job results for 60 minutes

export function generateJobSearchCacheKey(roleId: string, location?: string): string {
  return `job-search:${roleId}${location ? `:${location}` : ''}`
}

// Run cleanup every hour
setInterval(() => {
  jobCache.cleanup()
}, 60 * 60 * 1000) 