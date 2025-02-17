import { JobRecommendation } from '@/lib/types'

export interface SalaryRange {
  min: number
  max: number
  median: number
  currency: string
}

export interface SalaryInsights {
  range: SalaryRange
  experience: {
    entry: SalaryRange
    mid: SalaryRange
    senior: SalaryRange
  }
  location: {
    [key: string]: SalaryRange
  }
  industry: {
    [key: string]: SalaryRange
  }
}

export class SalaryDataService {
  private readonly cache = new Map<string, { data: SalaryInsights; timestamp: number }>()
  private readonly cacheDuration = 24 * 60 * 60 * 1000 // 24 hours

  async getSalaryData(jobTitle: string, location?: string): Promise<SalaryInsights> {
    try {
      // Check cache first
      const cacheKey = `${jobTitle}-${location || 'any'}`
      const cachedData = this.cache.get(cacheKey)
      
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
        return cachedData.data
      }

      // If no cached data or cache expired, get fallback data
      const fallbackData = this.getFallbackSalaryData(jobTitle)
      
      // Cache the fallback data
      this.cache.set(cacheKey, {
        data: fallbackData,
        timestamp: Date.now()
      })

      return fallbackData
    } catch (error) {
      console.error('Error fetching salary data:', error)
      return this.getFallbackSalaryData(jobTitle)
    }
  }

  private getFallbackSalaryData(jobTitle: string): SalaryInsights {
    const baseRange = this.getBaseSalaryRange(jobTitle)
    
    return {
      range: baseRange,
      experience: {
        entry: {
          ...baseRange,
          min: Math.round(baseRange.min * 0.7),
          max: Math.round(baseRange.min * 1.2),
          median: Math.round(baseRange.min * 0.95)
        },
        mid: {
          ...baseRange,
          min: Math.round(baseRange.median * 0.8),
          max: Math.round(baseRange.median * 1.2),
          median: baseRange.median
        },
        senior: {
          ...baseRange,
          min: Math.round(baseRange.max * 0.8),
          max: Math.round(baseRange.max * 1.3),
          median: Math.round(baseRange.max * 1.1)
        }
      },
      location: {
        'San Francisco': {
          ...baseRange,
          min: Math.round(baseRange.min * 1.4),
          max: Math.round(baseRange.max * 1.4),
          median: Math.round(baseRange.median * 1.4)
        },
        'New York': {
          ...baseRange,
          min: Math.round(baseRange.min * 1.3),
          max: Math.round(baseRange.max * 1.3),
          median: Math.round(baseRange.median * 1.3)
        },
        'Remote': {
          ...baseRange,
          min: Math.round(baseRange.min * 0.9),
          max: Math.round(baseRange.max * 0.9),
          median: Math.round(baseRange.median * 0.9)
        }
      },
      industry: {
        'Technology': {
          ...baseRange,
          min: Math.round(baseRange.min * 1.1),
          max: Math.round(baseRange.max * 1.2),
          median: Math.round(baseRange.median * 1.15)
        },
        'Finance': {
          ...baseRange,
          min: Math.round(baseRange.min * 1.2),
          max: Math.round(baseRange.max * 1.3),
          median: Math.round(baseRange.median * 1.25)
        },
        'Defense': {
          ...baseRange,
          min: Math.round(baseRange.min * 1.05),
          max: Math.round(baseRange.max * 1.15),
          median: Math.round(baseRange.median * 1.1)
        }
      }
    }
  }

  private getBaseSalaryRange(jobTitle: string): SalaryRange {
    const title = jobTitle.toLowerCase()
    let base: SalaryRange

    if (title.includes('senior') || title.includes('lead') || title.includes('manager')) {
      base = {
        min: 120000,
        max: 200000,
        median: 160000,
        currency: 'USD'
      }
    } else if (title.includes('engineer') || title.includes('developer')) {
      base = {
        min: 90000,
        max: 160000,
        median: 125000,
        currency: 'USD'
      }
    } else if (title.includes('analyst') || title.includes('specialist')) {
      base = {
        min: 70000,
        max: 120000,
        median: 95000,
        currency: 'USD'
      }
    } else {
      base = {
        min: 60000,
        max: 100000,
        median: 80000,
        currency: 'USD'
      }
    }

    return base
  }
} 