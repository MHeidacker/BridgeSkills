'use client'

import { useState, useEffect } from 'react'
import { Loader2, Building2, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { EnhancedJobRole } from '@/lib/job-matching'

interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary?: string
  url: string
  source: string
  postedDate: string
  skills: string[]
  experienceLevel?: string
  employmentType?: string
}

interface JobPostingsProps {
  role: EnhancedJobRole
  location?: string
}

export function JobPostings({ role, location }: JobPostingsProps) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    source: 'all',
    employmentType: 'all'
  })

  useEffect(() => {
    async function fetchJobPostings() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/job-postings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roleId: role.id,
            location
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job postings')
        }

        const { data } = await response.json()
        setJobPostings(data)
      } catch (error) {
        console.error('Error fetching job postings:', error)
        setError('Failed to load job postings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobPostings()
  }, [role.id, location])

  const filteredPostings = jobPostings.filter(posting => {
    if (filter.source !== 'all' && posting.source !== filter.source) return false
    if (filter.employmentType !== 'all' && posting.employmentType !== filter.employmentType) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2">Loading job postings...</span>
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
          Available Positions ({filteredPostings.length})
        </h3>
        
        <div className="flex gap-4">
          <select
            className="px-3 py-2 border rounded-md"
            value={filter.source}
            onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
          >
            <option value="all">All Sources</option>
            <option value="Indeed">Indeed</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md"
            value={filter.employmentType}
            onChange={(e) => setFilter(prev => ({ ...prev, employmentType: e.target.value }))}
          >
            <option value="all">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPostings.map(posting => (
          <div
            key={posting.id}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {posting.title}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-gray-600">
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {posting.company}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {posting.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(posting.postedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                  {posting.source}
                </span>
                {posting.employmentType && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {posting.employmentType}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">
              {posting.description}
            </p>

            {posting.salary && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Salary Range:
                </span>
                <span className="ml-2 text-primary-700 font-semibold">
                  {posting.salary}
                </span>
              </div>
            )}

            {posting.skills.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Required Skills:
                </span>
                <div className="flex flex-wrap gap-2">
                  {posting.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <a
                href={posting.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                View Job
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        ))}

        {filteredPostings.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            No job postings found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
} 