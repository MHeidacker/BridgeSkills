import { NextResponse } from 'next/server'
import { calculateJobMatches } from '@/lib/job-matching'
import { ExtractedData } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const data: ExtractedData = await request.json()
    
    // Get job matches using our matching algorithm
    const recommendations = await calculateJobMatches(data)
    
    // Generate market insights based on recommendations
    const marketInsights = {
      industryGrowth: recommendations.length > 0 
        ? `${recommendations.length} relevant positions found`
        : 'Data not available',
      topLocations: Array.from(new Set(recommendations.flatMap(r => r.industries))).slice(0, 3),
      keyTrends: [
        'Growing demand for veterans in tech roles',
        'Increased focus on cybersecurity expertise',
        'Remote work opportunities expanding'
      ]
    }

    return NextResponse.json({
      recommendations,
      marketInsights,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
} 