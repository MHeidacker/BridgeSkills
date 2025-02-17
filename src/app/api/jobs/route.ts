import { NextResponse } from 'next/server'
import { JobScraperService } from '@/lib/services/job-scraper'
import { ENHANCED_JOB_ROLES } from '@/lib/job-matching'

const jobScraperService = new JobScraperService()

export async function POST(request: Request) {
  try {
    const { roleId, location } = await request.json()
    
    // Validate role ID
    const role = ENHANCED_JOB_ROLES.find(r => r.id === roleId)
    if (!role) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }
    
    // Search for jobs
    const jobs = await jobScraperService.searchJobs(role, location)
    
    return NextResponse.json({
      jobs,
      total: jobs.length,
      sources: Array.from(new Set(jobs.map(job => job.source)))
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job listings' },
      { status: 500 }
    )
  }
} 