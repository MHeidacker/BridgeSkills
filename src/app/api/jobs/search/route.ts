import { NextResponse } from 'next/server'
import { calculateJobMatches } from '@/lib/job-matching'
import { ExtractedData, RecommendationResponse } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = body as ExtractedData
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!data.militaryInfo || !data.skills || !data.experience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get job recommendations using AI
    const recommendations = await calculateJobMatches(data)
    
    const response: RecommendationResponse = {
      recommendations,
      marketInsights: {
        industryGrowth: 'Growing',
        topLocations: ['Remote', 'Washington DC', 'New York', 'San Francisco'],
        keyTrends: ['Increasing demand for cybersecurity professionals', 'Remote work opportunities']
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting job recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to get job recommendations' },
      { status: 500 }
    )
  }
} 