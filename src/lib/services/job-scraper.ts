import puppeteer, { Page } from 'puppeteer'
import { ExtractedData, JobRecommendation } from '@/lib/types'

export interface ScrapedJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary?: string
  url: string
  source: string
  postedDate: Date
  skills: string[]
}

// Enhanced browser configuration for better reliability
const BROWSER_CONFIG = {
  headless: true,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-sandbox',
    '--window-size=1920,1080',
    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
  defaultViewport: {
    width: 1920,
    height: 1080
  }
}

// Enhanced page configuration
const PAGE_CONFIG = {
  waitUntil: 'networkidle0' as const,
  timeout: 60000
}

// Job search sources
const JOB_SOURCES = [
  {
    name: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com/jobs/search',
    searchParams: (query: string) => ({
      keywords: query,
      location: 'United States',
      f_TPR: 'r604800', // Last 7 days
      sortBy: 'R' // Most relevant
    })
  },
  {
    name: 'Indeed',
    baseUrl: 'https://www.indeed.com/jobs',
    searchParams: (query: string) => ({
      q: query,
      l: 'United States',
      fromage: '7', // Last 7 days
      sort: 'date'
    })
  }
]

export class JobScraperService {
  async searchJobs(
    baseRecommendation: JobRecommendation, 
    data: ExtractedData,
    searchKeywords: string[]
  ): Promise<ScrapedJob[]> {
    try {
      console.log(`Starting civilian job search for: ${baseRecommendation.title}`)
      
      // Generate search queries based on civilian role and keywords
      const queries = this.generateSearchQueries(baseRecommendation, searchKeywords)
      
      // Initialize browser
      const browser = await puppeteer.launch(BROWSER_CONFIG)
      const page = await browser.newPage()
      
      const allJobs: ScrapedJob[] = []
      
      // Search each source with each query
      for (const source of JOB_SOURCES) {
        for (const query of queries) {
          try {
            const url = this.constructSearchUrl(source, query)
            await page.goto(url, PAGE_CONFIG)
            
            // Extract job data based on the source
            const jobs = await this.extractJobData(page, source.name)
            allJobs.push(...jobs)
          } catch (error) {
            console.error(`Error searching ${source.name} for query "${query}":`, error)
            continue
          }
        }
      }
      
      await browser.close()
      
      // Remove duplicates and sort by relevance
      const uniqueJobs = this.removeDuplicates(allJobs)
      const sortedJobs = this.sortByRelevance(uniqueJobs, baseRecommendation, searchKeywords)
      
      return sortedJobs.slice(0, 10) // Return top 10 most relevant jobs
    } catch (error) {
      console.error('Error in civilian job search:', error)
      return []
    }
  }
  
  private generateSearchQueries(recommendation: JobRecommendation, keywords: string[]): string[] {
    const queries: string[] = []
    
    // Add role-based queries with keywords
    queries.push(recommendation.title)
    queries.push(`${recommendation.title} ${keywords.slice(0, 2).join(' ')}`)
    
    // Add skill-based queries
    recommendation.requiredSkills.slice(0, 3).forEach(skill => {
      queries.push(`${skill} ${recommendation.title}`)
    })
    
    // Add industry-focused queries
    recommendation.industries.forEach(industry => {
      queries.push(`${industry} ${recommendation.title}`)
    })
    
    return queries
  }
  
  private constructSearchUrl(source: typeof JOB_SOURCES[0], query: string): string {
    const params = new URLSearchParams(source.searchParams(query))
    return `${source.baseUrl}?${params.toString()}`
  }
  
  private async extractJobData(page: Page, sourceName: string): Promise<ScrapedJob[]> {
    try {
      if (sourceName === 'LinkedIn') {
        return this.extractLinkedInJobs(page)
      } else if (sourceName === 'Indeed') {
        return this.extractIndeedJobs(page)
      }
      return []
    } catch (error) {
      console.error(`Error extracting ${sourceName} jobs:`, error)
      return []
    }
  }
  
  private async extractLinkedInJobs(page: Page): Promise<ScrapedJob[]> {
    return await page.evaluate(() => {
      const jobs: ScrapedJob[] = []
      const jobCards = document.querySelectorAll('.job-card-container')
      
      jobCards.forEach((card, index) => {
        const titleElement = card.querySelector('.job-card-list__title')
        const companyElement = card.querySelector('.job-card-container__company-name')
        const locationElement = card.querySelector('.job-card-container__metadata-item')
        const linkElement = card.querySelector('a.job-card-list__title')
        
        if (titleElement && companyElement && linkElement) {
          jobs.push({
            id: `linkedin-${Date.now()}-${index}`,
            title: titleElement.textContent?.trim() || '',
            company: companyElement.textContent?.trim() || '',
            location: locationElement?.textContent?.trim() || 'Remote/Various',
            description: '', // Will be fetched when job is clicked
            url: (linkElement as HTMLAnchorElement).href,
            source: 'LinkedIn',
            postedDate: new Date(),
            skills: []
          })
        }
      })
      
      return jobs
    })
  }
  
  private async extractIndeedJobs(page: Page): Promise<ScrapedJob[]> {
    return await page.evaluate(() => {
      const jobs: ScrapedJob[] = []
      const jobCards = document.querySelectorAll('.job_seen_beacon')
      
      jobCards.forEach((card, index) => {
        const titleElement = card.querySelector('.jobTitle')
        const companyElement = card.querySelector('.companyName')
        const locationElement = card.querySelector('.companyLocation')
        const linkElement = card.querySelector('a.jcs-JobTitle')
        
        if (titleElement && companyElement && linkElement) {
          jobs.push({
            id: `indeed-${Date.now()}-${index}`,
            title: titleElement.textContent?.trim() || '',
            company: companyElement.textContent?.trim() || '',
            location: locationElement?.textContent?.trim() || 'Remote/Various',
            description: '', // Will be fetched when job is clicked
            url: (linkElement as HTMLAnchorElement).href,
            source: 'Indeed',
            postedDate: new Date(),
            skills: []
          })
        }
      })
      
      return jobs
    })
  }
  
  private removeDuplicates(jobs: ScrapedJob[]): ScrapedJob[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  
  private sortByRelevance(
    jobs: ScrapedJob[], 
    recommendation: JobRecommendation,
    keywords: string[]
  ): ScrapedJob[] {
    return jobs.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, recommendation, keywords)
      const scoreB = this.calculateRelevanceScore(b, recommendation, keywords)
      return scoreB - scoreA
    })
  }
  
  private calculateRelevanceScore(
    job: ScrapedJob, 
    recommendation: JobRecommendation,
    keywords: string[]
  ): number {
    let score = 0
    const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase()
    
    // Title match
    if (job.title.toLowerCase().includes(recommendation.title.toLowerCase())) {
      score += 5
    }
    
    // Keyword matches
    keywords.forEach(keyword => {
      if (jobText.includes(keyword.toLowerCase())) {
        score += 2
      }
    })
    
    // Industry matches
    recommendation.industries.forEach(industry => {
      if (jobText.includes(industry.toLowerCase())) {
        score += 2
      }
    })
    
    // Skill matches
    recommendation.requiredSkills.forEach(skill => {
      if (jobText.includes(skill.toLowerCase())) {
        score += 1
      }
    })
    
    return score
  }
}

// Export a singleton instance
export const jobScraperService = new JobScraperService() 