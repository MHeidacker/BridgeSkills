'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/ui/page-container'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function SavedMatchesPage() {
  const { user, savedMatches, deleteSavedMatch } = useAuth()

  if (!user) {
    return (
      <PageContainer maxWidth="md" className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-600 mb-8">
          Please sign in to view your saved career matches.
        </p>
        <Link 
          href="/career-match"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Get Started
        </Link>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      <h1 className="text-3xl font-bold mb-8">Saved Career Matches</h1>

      {savedMatches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-6">You haven't saved any career matches yet.</p>
            <Link 
              href="/career-match"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Find Career Matches
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {savedMatches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {match.job_title}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {match.salary_range}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {match.match_score}% Match
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedMatch(match.id)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    {match.match_reason}
                  </p>
                  {match.required_skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.required_skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
} 