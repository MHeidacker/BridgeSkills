'use client'

import { TrendingUp, MapPin, Briefcase, BarChart, Bookmark, BookmarkCheck } from 'lucide-react'
import { JobSearchResults } from './JobSearchResults'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobRecommendation, MarketInsights } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'
import { useState } from 'react'

interface LoginPromptProps {
  onClose: () => void
  onLogin: () => void
}

function LoginPrompt({ onClose, onLogin }: LoginPromptProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Sign In Required</h3>
        <p className="text-gray-600 mb-6">
          Please sign in to save job matches to your profile. This allows you to track and compare opportunities over time.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onLogin}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}

interface JobRecommendationsProps {
  recommendations: JobRecommendation[]
  marketInsights: MarketInsights
  location?: string
}

export function JobRecommendations({ recommendations, marketInsights, location }: JobRecommendationsProps) {
  const { user, savedMatches, saveMatch, deleteSavedMatch, signInWithGoogle } = useAuth()
  const { showToast } = useToast()
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [pendingSaveJob, setPendingSaveJob] = useState<JobRecommendation | null>(null)

  const handleSaveMatch = async (job: JobRecommendation) => {
    if (!user) {
      setPendingSaveJob(job)
      setShowLoginPrompt(true)
      return
    }

    try {
      setSavingStates(prev => ({ ...prev, [job.id]: true }))
      await saveMatch(job)
      showToast(`Saved ${job.title} to your matches`, 'success')
    } catch (error) {
      showToast('Failed to save match. Please try again.', 'error')
    } finally {
      setSavingStates(prev => ({ ...prev, [job.id]: false }))
    }
  }

  const handleLoginSuccess = async () => {
    setShowLoginPrompt(false)
    if (pendingSaveJob && user) {
      await handleSaveMatch(pendingSaveJob)
      setPendingSaveJob(null)
    }
  }

  const handleDeleteMatch = async (jobId: string) => {
    const job = recommendations.find(r => r.id === jobId)
    if (!job) return

    try {
      setSavingStates(prev => ({ ...prev, [jobId]: true }))
      await deleteSavedMatch(jobId)
      showToast(`Removed ${job.title} from your matches`, 'success')
    } catch (error) {
      showToast('Failed to remove match. Please try again.', 'error')
    } finally {
      setSavingStates(prev => ({ ...prev, [jobId]: false }))
    }
  }

  const isJobSaved = (jobId: string) => {
    return savedMatches.some(match => match.job_title === recommendations.find(r => r.id === jobId)?.title)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showLoginPrompt && (
        <LoginPrompt
          onClose={() => {
            setShowLoginPrompt(false)
            setPendingSaveJob(null)
          }}
          onLogin={async () => {
            await signInWithGoogle()
            handleLoginSuccess()
          }}
        />
      )}

      <h2 className="text-2xl font-bold mb-8">Your Career Recommendations</h2>

      {/* Job Recommendations */}
      <div className="space-y-8">
        {recommendations.map((job) => (
          <div key={job.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {job.title}
                      <span className="text-sm text-gray-500">
                        {job.matchScore}% Match
                      </span>
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {job.salaryRange}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <BarChart className="w-4 h-4 mr-1" />
                      {job.demandTrend}
                    </Badge>
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isJobSaved(job.id) ? handleDeleteMatch(job.id) : handleSaveMatch(job)}
                        disabled={savingStates[job.id]}
                      >
                        {isJobSaved(job.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    )}
                  </div>
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

                  <div>
                    <h4 className="font-medium mb-2">Salary Insights</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-primary-700 mb-4">
                        {job.salaryRange}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-gray-500 mb-1">Entry Level</div>
                          <div className="font-medium">${job.salaryInsights.byExperience.entry.median.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 mb-1">Mid Level</div>
                          <div className="font-medium">${job.salaryInsights.byExperience.mid.median.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 mb-1">Senior Level</div>
                          <div className="font-medium">${job.salaryInsights.byExperience.senior.median.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Career Progression</h4>
                    <p className="text-sm text-gray-600">{job.careerProgression}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommended Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.recommendedCertifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      ))}
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