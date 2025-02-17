'use client'

import { useState } from 'react'
import { CareerForm } from '@/components/CareerForm'
import { ResumeUpload } from '@/components/ResumeUpload'
import { ExtractedData } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CareerMatchPage() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)

  const handleDataExtracted = (data: ExtractedData) => {
    setExtractedData(data)
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Find Your Perfect Civilian Career Match
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized career recommendations based on your military background
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Tabs defaultValue="quick-start" className="w-full">
            <TabsList className="flex w-full rounded-none border-b">
              <TabsTrigger 
                value="quick-start"
                className="flex-1 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600"
              >
                Manual Entry
              </TabsTrigger>
              <TabsTrigger 
                value="resume"
                className="flex-1 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600"
              >
                Upload Resume
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-start" className="p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
                <p className="text-gray-600 mb-6">
                  Tell us about your military background to receive personalized civilian career recommendations, 
                  salary insights, and industry trends.
                </p>
                <CareerForm initialData={extractedData} />
              </div>
            </TabsContent>
            
            <TabsContent value="resume" className="p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
                <p className="text-gray-600 mb-6">
                  We'll analyze your military experience and skills to provide tailored career recommendations.
                </p>
                <ResumeUpload
                  onDataExtracted={handleDataExtracted}
                  className="max-w-xl mx-auto"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-primary-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tips for Better Results</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Include your most recent MOS/AFSC and any additional specialties</li>
            <li>• List both technical and leadership skills</li>
            <li>• Mention any certifications or specialized training</li>
            <li>• Include your security clearance level (if applicable)</li>
          </ul>
        </div>
      </div>
    </main>
  )
} 