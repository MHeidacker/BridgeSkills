'use client'

import { useState, useEffect } from 'react'
import { Loader2, Building2, MapPin, Calendar, ExternalLink, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrapedJob } from '@/lib/services/job-scraper'
import { JobRecommendation } from '@/lib/types'

interface JobSearchResultsProps {
  role: JobRecommendation
  location?: string
}

export function JobSearchResults({ role, location }: JobSearchResultsProps) {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    source: 'all',
    datePosted: 'all',
    experienceLevel: 'all'
  })

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/jobs/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roleId: role.id,
            location,
            filters
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job listings')
        }

        const data = await response.json()
        setJobs(data.jobs)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setError('Failed to load job listings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [role.id, location, filters])

  const filteredJobs = jobs.filter(job => {
    if (filters.source !== 'all' && job.source !== filters.source) return false
    
    if (filters.datePosted !== 'all') {
      const daysAgo = Math.floor((Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24))
      switch (filters.datePosted) {
        case 'today':
          if (daysAgo > 1) return false
          break
        case 'week':
          if (daysAgo > 7) return false
          break
        case 'month':
          if (daysAgo > 30) return false
          break
      }
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2">Searching job listings...</span>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          Job Listings ({filteredJobs.length})
        </h3>

        <div className="flex gap-4">
          <Select
            value={filters.source}
            onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Indeed">Indeed</SelectItem>
              <SelectItem value="HireVeterans">HireVeterans</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.datePosted}
            onValueChange={(value) => setFilters(prev => ({ ...prev, datePosted: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date posted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="today">Last 24 hours</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredJobs.map(job => (
          <a
            key={`${job.source}-${job.id}`}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="hover:border-primary-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-gray-600 text-sm">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {job.company}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(job.postedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge>{job.source}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map(skill => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent the parent link from triggering
                      window.open(job.url, '_blank');
                    }}
                    className="inline-flex items-center"
                  >
                    View Job
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}

        {filteredJobs.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            No job listings found matching your criteria. Try adjusting your filters or location.
          </div>
        )}
      </div>
    </div>
  )
} 