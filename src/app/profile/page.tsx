'use client'

import { useAuth } from '@/lib/auth-context'
import { ResumeUpload } from '@/components/ResumeUpload'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Your Resume</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Resume Upload</h2>
            <p className="text-gray-600 mb-4">
              Upload your resume to automatically extract your skills and experience.
              We support PDF and Word documents.
            </p>
            <ResumeUpload />
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-2">Manual Entry</h2>
            <p className="text-gray-600">
              Don&apos;t have a resume? No problem! You can manually enter your information.
            </p>
            <button className="mt-4 py-2 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              Enter Details Manually
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 