import { NextResponse } from 'next/server'
import { JobScraperService } from '@/lib/services/job-scraper'
import { JobRecommendation } from '@/lib/types'

const jobScraperService = new JobScraperService()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, location } = body
    
    if (!role || typeof role !== 'object') {
      return NextResponse.json(
        { error: 'Invalid role data' },
        { status: 400 }
      )
    }
    
    // Search for jobs using our scraping service
    const jobs = await jobScraperService.searchJobs(role as JobRecommendation, location)
    
    return NextResponse.json({
      jobs,
      total: jobs.length,
      sources: Array.from(new Set(jobs.map(job => job.source)))
    })
  } catch (error) {
    console.error('Error searching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to search job listings' },
      { status: 500 }
    )
  }
} 