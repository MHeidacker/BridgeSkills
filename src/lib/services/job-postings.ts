import { EnhancedJobRole } from '../job-matching'

interface JobPosting {
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
  experienceLevel?: string
  employmentType?: string
}

// Base interface for job search providers
interface JobSearchProvider {
  search(query: string, location?: string): Promise<JobPosting[]>
  getJobDetails(id: string): Promise<JobPosting>
}

// USAJobs API integration
class USAJobsProvider implements JobSearchProvider {
  private apiKey: string
  private email: string
  private baseUrl = 'https://data.usajobs.gov/api/search'

  constructor(apiKey: string, email: string) {
    this.apiKey = apiKey
    this.email = email
  }

  async search(query: string, location?: string): Promise<JobPosting[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?Keyword=${encodeURIComponent(query)}${location ? `&LocationName=${encodeURIComponent(location)}` : ''}&ResultsPerPage=25`,
        {
          headers: {
            'Authorization-Key': this.apiKey,
            'Host': 'data.usajobs.gov',
            'User-Agent': this.email
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch job postings from USAJobs')
      }

      const data = await response.json()
      return this.transformUSAJobsResults(data)
    } catch (error) {
      console.error('USAJobs API error:', error)
      return []
    }
  }

  async getJobDetails(id: string): Promise<JobPosting> {
    try {
      const response = await fetch(
        `${this.baseUrl}?PositionID=${id}`,
        {
          headers: {
            'Authorization-Key': this.apiKey,
            'Host': 'data.usajobs.gov',
            'User-Agent': this.email
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch job details from USAJobs')
      }

      const data = await response.json()
      return this.transformUSAJobsJob(data.SearchResult.SearchResultItems[0])
    } catch (error) {
      console.error('USAJobs API error:', error)
      throw error
    }
  }

  private transformUSAJobsResults(data: any): JobPosting[] {
    return data.SearchResult.SearchResultItems.map(this.transformUSAJobsJob)
  }

  private transformUSAJobsJob(job: any): JobPosting {
    const matchedObjectDescriptor = job.MatchedObjectDescriptor
    return {
      id: matchedObjectDescriptor.PositionID,
      title: matchedObjectDescriptor.PositionTitle,
      company: matchedObjectDescriptor.OrganizationName,
      location: matchedObjectDescriptor.PositionLocationDisplay,
      description: matchedObjectDescriptor.UserArea.Details.JobSummary,
      salary: `${matchedObjectDescriptor.PositionRemuneration[0].MinimumRange} - ${matchedObjectDescriptor.PositionRemuneration[0].MaximumRange} ${matchedObjectDescriptor.PositionRemuneration[0].RateIntervalCode}`,
      url: matchedObjectDescriptor.PositionURI,
      source: 'USAJobs',
      postedDate: new Date(matchedObjectDescriptor.PublicationStartDate),
      skills: this.extractSkills(matchedObjectDescriptor.UserArea.Details.JobSummary),
      experienceLevel: matchedObjectDescriptor.JobGrade[0]?.Code || undefined,
      employmentType: matchedObjectDescriptor.PositionSchedule[0]?.Name || undefined
    }
  }

  private extractSkills(description: string): string[] {
    // Extract skills from job description using common keywords
    const skillKeywords = [
      'experience with',
      'knowledge of',
      'proficiency in',
      'skills in',
      'ability to'
    ]

    const skills: string[] = []
    const sentences = description.split(/[.!?]+/)

    sentences.forEach(sentence => {
      skillKeywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword)) {
          const skillPhrase = sentence.substring(
            sentence.toLowerCase().indexOf(keyword) + keyword.length
          ).trim()
          if (skillPhrase) {
            skills.push(skillPhrase)
          }
        }
      })
    })

    return Array.from(new Set(skills))
  }
}

// Aggregate job search results
export class JobSearchService {
  private provider: JobSearchProvider

  constructor(usaJobsApiKey: string, email: string) {
    this.provider = new USAJobsProvider(usaJobsApiKey, email)
  }

  async searchJobPostings(role: EnhancedJobRole, location?: string): Promise<JobPosting[]> {
    try {
      // Create search queries based on role
      const queries = this.generateSearchQueries(role)
      
      // Search using all queries
      const results = await Promise.all(
        queries.map(query => this.provider.search(query, location))
      )

      // Flatten results and remove duplicates
      const allPostings = results.flat()
      const uniquePostings = this.removeDuplicates(allPostings)
      
      // Sort by relevance and date
      return this.sortPostings(uniquePostings, role)
    } catch (error) {
      console.error('Error searching job postings:', error)
      return []
    }
  }

  private generateSearchQueries(role: EnhancedJobRole): string[] {
    const queries = [
      role.title,
      ...role.requiredSkills
    ]

    // Add military-specific terms
    queries.push(`${role.title} veteran`)
    queries.push(`${role.title} military`)

    return queries
  }

  private removeDuplicates(postings: JobPosting[]): JobPosting[] {
    const seen = new Set<string>()
    return postings.filter(posting => {
      const key = `${posting.title}-${posting.company}-${posting.location}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private sortPostings(postings: JobPosting[], role: EnhancedJobRole): JobPosting[] {
    return postings.sort((a, b) => {
      // Calculate relevance scores
      const scoreA = this.calculateRelevanceScore(a, role)
      const scoreB = this.calculateRelevanceScore(b, role)

      // If scores are equal, sort by date
      if (scoreB === scoreA) {
        return b.postedDate.getTime() - a.postedDate.getTime()
      }

      return scoreB - scoreA
    })
  }

  private calculateRelevanceScore(posting: JobPosting, role: EnhancedJobRole): number {
    let score = 0

    // Title match
    if (posting.title.toLowerCase().includes(role.title.toLowerCase())) {
      score += 10
    }

    // Required skills matches
    role.requiredSkills.forEach(skill => {
      if (posting.description.toLowerCase().includes(skill.toLowerCase())) {
        score += 5
      }
    })

    // Preferred skills matches
    role.preferredSkills.forEach(skill => {
      if (posting.description.toLowerCase().includes(skill.toLowerCase())) {
        score += 3
      }
    })

    // Veteran/military friendly
    if (posting.description.toLowerCase().includes('veteran') ||
        posting.description.toLowerCase().includes('military')) {
      score += 5
    }

    return score
  }
} 