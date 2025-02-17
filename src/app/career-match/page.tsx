'use client'

import { useState } from 'react'
import { CareerForm } from '@/components/CareerForm'
import { ExtractedData, RecommendationResponse } from '@/lib/types'
import { JobRecommendations } from '@/components/JobRecommendations'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'

export default function CareerMatchPage() {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)

  const handleRecommendationsReceived = (data: RecommendationResponse) => {
    setRecommendations(data)
  }

  if (recommendations) {
    return (
      <PageContainer maxWidth="lg">
        <JobRecommendations
          recommendations={recommendations.recommendations}
          marketInsights={recommendations.marketInsights}
        />
        <div className="mt-8 text-center">
          <button
            onClick={() => setRecommendations(null)}
            className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            ← Start New Search
          </button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Find Your Perfect Civilian Career Match
        </h1>
        <p className="text-lg text-gray-600">
          Get personalized career recommendations based on your military background
        </p>
      </div>

      <Card className="mb-12">
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
          <p className="text-gray-600 mb-6">
            Tell us about your military background to receive personalized civilian career recommendations, 
            salary insights, and industry trends.
          </p>
          <CareerForm onSuccess={handleRecommendationsReceived} />
        </div>
      </Card>

      {/* Tips Section */}
      <Card className="bg-primary-50 border-none">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tips for Better Results</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Include your most recent MOS/AFSC and any additional specialties</li>
            <li>• List both technical and leadership skills</li>
            <li>• Mention any certifications or specialized training</li>
            <li>• Include your security clearance level (if applicable)</li>
          </ul>
        </div>
      </Card>
    </PageContainer>
  )
} 