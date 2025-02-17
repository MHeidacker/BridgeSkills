'use client'

import { useAuth } from '@/lib/auth-context'
import { ResumeUpload } from '@/components/ResumeUpload'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { PageContainer } from '@/components/ui/page-container'
import { Bookmark, FileText, User } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, savedMatches } = useAuth()

  if (!user) {
    return (
      <PageContainer maxWidth="md" className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-600 mb-8">
          Please sign in to view your profile.
        </p>
        <Link 
          href="/auth/sign-in"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Sign In
        </Link>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account and view saved matches
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-full">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account Information</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </CardHeader>
        </Card>

        {/* Saved Matches Card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-full">
                <Bookmark className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Saved Matches</h2>
                <p className="text-gray-600">
                  You have {savedMatches.length} saved career matches
                </p>
              </div>
            </div>
            <Link href="/saved-matches">
              <Button variant="outline">
                View All Matches
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {savedMatches.length > 0 ? (
              <div className="space-y-4">
                {savedMatches.slice(0, 3).map((match) => (
                  <div 
                    key={match.id}
                    className="p-4 border rounded-lg hover:border-primary-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{match.job_title}</h3>
                        <p className="text-sm text-gray-600">{match.salary_range}</p>
                      </div>
                      <span className="text-sm font-medium text-primary-600">
                        {match.match_score}% Match
                      </span>
                    </div>
                  </div>
                ))}
                {savedMatches.length > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    And {savedMatches.length - 3} more matches
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                You haven't saved any matches yet. Start exploring career matches to save them here.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resume Upload Card */}
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-full">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Resume Upload</h2>
              <p className="text-gray-600">
                Upload your resume to get personalized career matches
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ResumeUpload />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}