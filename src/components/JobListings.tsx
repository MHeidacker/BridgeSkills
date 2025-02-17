import { useState, useEffect } from 'react'
import { ScrapedJob } from '@/lib/services/job-scraper'
import { EnhancedJobRole } from '@/lib/job-matching'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ExternalLink } from 'lucide-react'

interface JobListingsProps {
  role: EnhancedJobRole
  location?: string
}

export function JobListings({ role, location }: JobListingsProps) {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [sources, setSources] = useState<string[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roleId: role.id,
            location,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch job listings')
        }
        
        const data = await response.json()
        setJobs(data.jobs)
        setSources(data.sources)
      } catch (error) {
        setError('Failed to fetch job listings. Please try again later.')
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [role.id, location])

  const filteredJobs = jobs.filter(job => 
    selectedSource === 'all' || job.source === selectedSource
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Job Listings
          <span className="ml-2 text-sm font-normal text-gray-500">
            {filteredJobs.length} results
          </span>
        </h2>
        
        <Select
          value={selectedSource}
          onValueChange={setSelectedSource}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredJobs.map(job => (
          <Card key={`${job.source}-${job.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    {job.company} • {job.location}
                  </div>
                </div>
                <Badge>{job.source}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  {job.salary && (
                    <div className="text-sm">
                      <span className="font-medium">Salary:</span> {job.salary}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    Posted: {formatDate(job.postedDate)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(job.url, '_blank')}
                >
                  View Job
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No job listings found. Try adjusting your filters or location.
          </div>
        )}
      </div>
    </div>
  )
} 