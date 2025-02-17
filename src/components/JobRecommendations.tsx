'use client'

import { TrendingUp, MapPin, Briefcase, BarChart } from 'lucide-react'
import { JobSearchResults } from './JobSearchResults'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobRecommendation, MarketInsights } from '@/lib/types'

interface JobRecommendationsProps {
  recommendations: JobRecommendation[]
  marketInsights: MarketInsights
  location?: string
}

export function JobRecommendations({ recommendations, marketInsights, location }: JobRecommendationsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Your Career Recommendations</h2>

      {/* Job Recommendations */}
      <div className="space-y-8">
        {recommendations.map((job) => (
          <div key={job.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">
                      {job.title}
                      <span className="ml-2 text-sm text-gray-500">
                        {job.matchScore}% Match
                      </span>
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {job.salaryRange}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <BarChart className="w-4 h-4 mr-1" />
                    {job.demandTrend}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Match Details</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Skills Match</div>
                        <div className="font-medium">{job.matchDetails.skillMatch}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Experience Match</div>
                        <div className="font-medium">{job.matchDetails.experienceMatch}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">MOS/AFSC Match</div>
                        <div className="font-medium">{job.matchDetails.mosMatch}%</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Match Reason</h4>
                    <p className="text-sm text-gray-600">{job.matchReason}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Market Insights</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Industry Growth: {job.industries.join(', ')}</p>
                      <p>Demand Trend: {job.demandTrend}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Market Insights */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Market Insights</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-primary-600" />
              Industry Growth
            </h4>
            <p className="text-lg font-semibold text-primary-700">
              {marketInsights.industryGrowth}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-primary-600" />
              Top Locations
            </h4>
            <ul className="space-y-1">
              {marketInsights.topLocations.map((location) => (
                <li key={location} className="text-gray-900">
                  {location}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Trends</h4>
            <ul className="space-y-2">
              {marketInsights.keyTrends.map((trend) => (
                <li key={trend} className="text-gray-900 text-sm">
                  • {trend}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 