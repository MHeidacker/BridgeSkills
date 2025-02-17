'use client'

import { Info } from 'lucide-react'

export function ResumeUpload({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="border rounded-lg p-6 bg-blue-50">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Resume Upload Temporarily Unavailable</h3>
            <p className="mt-1 text-sm text-blue-700">
              Please use the manual entry form below to input your military experience and skills.
              We are working on bringing back the resume upload feature soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 