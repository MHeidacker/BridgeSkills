'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { ExtractedData } from '@/lib/types'

interface ResumeUploadProps {
  onDataExtracted: (data: ExtractedData) => void
  className?: string
}

export function ResumeUpload({ onDataExtracted, className = '' }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    await uploadFile(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload resume')
      }

      if (result.success && result.data) {
        onDataExtracted(result.data)
      } else {
        throw new Error('No data extracted from resume')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload resume')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          transition-colors duration-200 ease-in-out
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <span className="font-semibold text-primary-600">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF or Word Document</p>
          </div>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Your resume will be processed to extract relevant military experience and skills
      </p>
    </div>
  )
} 