'use client'

import { useState, useEffect } from 'react'
import { Loader2, Building2, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobRecommendation, ExtractedData, RecommendationResponse } from '@/lib/types'

interface JobSearchResultsProps {
  militaryInfo: ExtractedData['militaryInfo']
  skills: ExtractedData['skills']
  experience: ExtractedData['experience']
  education: ExtractedData['education']
}

export function JobSearchResults({ 
  militaryInfo,
  skills,
  experience,
  education 
}: JobSearchResultsProps) {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        setError(null)
        setRecommendations([]) // Clear previous recommendations while loading

        const response = await fetch('/api/jobs/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            militaryInfo,
            skills,
            experience,
            education
          } as ExtractedData)
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job recommendations')
        }

        const data: RecommendationResponse = await response.json()
        console.log('API Response:', data)
        setRecommendations(data.recommendations || [])
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setError('Failed to load job recommendations. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (militaryInfo && skills && experience && education) {
      fetchRecommendations()
    }
  }, [militaryInfo, skills, experience, education])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Analyzing your background...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    )
  }

  if (!loading && recommendations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        No job recommendations found. Please try adjusting your search criteria.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          Job Recommendations ({recommendations.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {recommendations.map(job => (
          <Card key={job.id} className="hover:border-primary-200 hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-gray-600 text-sm">
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {job.industries.join(', ')}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Salary Range: {job.salaryRange}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">
                  Match: {Math.round(job.matchScore)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {job.description}
              </p>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Match Details:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Skills Match</div>
                    <div className="font-medium">{Math.round(job.matchDetails.skillMatch)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Experience Match</div>
                    <div className="font-medium">{Math.round(job.matchDetails.experienceMatch)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">MOS Match</div>
                    <div className="font-medium">{Math.round(job.matchDetails.mosMatch)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 