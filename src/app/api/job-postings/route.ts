import { NextResponse } from 'next/server'
import { JobSearchService } from '@/lib/services/job-postings'
import { ENHANCED_JOB_ROLES } from '@/lib/job-matching'

// Initialize job search service with API keys
const jobSearchService = new JobSearchService(
  process.env.INDEED_API_KEY || '',
  process.env.LINKEDIN_API_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { roleId, location } = await request.json()

    // Validate role ID
    const role = ENHANCED_JOB_ROLES[roleId]
    if (!role) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    // Search for job postings
    const jobPostings = await jobSearchService.searchJobPostings(role, location)

    return NextResponse.json({
      success: true,
      data: jobPostings
    })
  } catch (error) {
    console.error('Error fetching job postings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
      { status: 500 }
    )
  }
} 