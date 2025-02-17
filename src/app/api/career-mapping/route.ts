import { NextResponse } from 'next/server'
import { ExtractedData } from '@/lib/types'
import { calculateJobMatches } from '@/lib/job-matching'

export async function POST(request: Request) {
  try {
    const data: ExtractedData = await request.json()
    
    // Get job matches using our matching algorithm
    const recommendations = await calculateJobMatches(data)
    
    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json({
        recommendations: [],
        marketInsights: {
          industryGrowth: 'No matching positions found',
          topLocations: [],
          keyTrends: [
            'Growing demand for veterans in tech roles',
            'Increased focus on cybersecurity expertise',
            'Remote work opportunities expanding'
          ]
        },
        timestamp: new Date().toISOString()
      })
    }
    
    // Generate market insights based on recommendations
    const marketInsights = {
      industryGrowth: `${recommendations.length} relevant positions found`,
      topLocations: Array.from(new Set(recommendations.flatMap(r => r.industries))).slice(0, 3),
      keyTrends: generateKeyTrends(recommendations, data)
    }

    return NextResponse.json({
      recommendations,
      marketInsights,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        recommendations: [],
        marketInsights: {
          industryGrowth: 'Data not available',
          topLocations: [],
          keyTrends: []
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function generateKeyTrends(recommendations: any[], data: ExtractedData): string[] {
  const trends: string[] = []
  
  // Add trends based on recommendations
  const hasSecurityJobs = recommendations.some(r => 
    r.title.toLowerCase().includes('security') || 
    r.description.toLowerCase().includes('security'))
  if (hasSecurityJobs) {
    trends.push('Security clearance highly valued in private sector')
  }
  
  // Add general trends
  trends.push('Growing demand for veterans in leadership roles')
  trends.push('Increased remote work opportunities in tech sector')
  
  // Add skill-specific trends
  if (data.skills.some(skill => skill.toLowerCase().includes('cyber'))) {
    trends.push('Rising demand for cybersecurity professionals with military background')
  }
  
  return Array.from(new Set(trends)).slice(0, 4) // Return unique trends, max 4
} 