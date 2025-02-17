'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { FileText, Upload, X, Trash2, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Resume {
  id: string
  filename: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
}

interface ResumeUploadProps {
  className?: string
  onUploadComplete?: (resumeId: string) => void
}

export function ResumeUpload({ className = '', onUploadComplete }: ResumeUploadProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch existing resumes
  useEffect(() => {
    async function fetchResumes() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setResumes(data || [])
      } catch (error) {
        console.error('Error fetching resumes:', error)
        showToast('Failed to load resumes', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResumes()
  }, [user, showToast])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error')
        return
      }
      if (!['application/pdf'].includes(file.type)) {
        showToast('Please upload a PDF file', 'error')
        return
      }
      setSelectedFile(file)
    }
  }, [showToast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false
  })

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    try {
      setIsUploading(true)

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, selectedFile)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw uploadError
      }

      // Create resume record in database
      const { data: resume, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          filename: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type,
          file_size: selectedFile.size
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw dbError
      }

      showToast('Resume uploaded successfully', 'success')
      setSelectedFile(null)
      if (resume) {
        setResumes(prev => [resume, ...prev])
        if (onUploadComplete) {
          onUploadComplete(resume.id)
        }
      }
    } catch (error) {
      console.error('Upload error details:', error)
      showToast('Failed to upload resume', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (resume: Resume) => {
    if (!user) return

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.file_path])

      if (storageError) throw storageError

      // Delete record from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resume.id)

      if (dbError) throw dbError

      setResumes(prev => prev.filter(r => r.id !== resume.id))
      showToast('Resume deleted successfully', 'success')
    } catch (error) {
      console.error('Delete error:', error)
      showToast('Failed to delete resume', 'error')
    }
  }

  const handleDownload = async (resume: Resume) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resume.file_path, 60) // URL valid for 60 seconds

      if (error) throw error

      // Open the signed URL in a new tab
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      showToast('Failed to download resume', 'error')
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Section */}
      {selectedFile ? (
        <div className="border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-6
            transition-colors
            ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-primary-600" />
          <p className="text-sm text-gray-600">
            {isDragActive ? (
              'Drop your resume here'
            ) : (
              <>
                Drag and drop your resume here, or <span className="text-primary-600">browse</span>
                <br />
                <span className="text-xs">PDF only, max 5MB</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Existing Resumes List */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Your Resumes</h3>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading resumes...</div>
        ) : resumes.length > 0 ? (
          <div className="border rounded-lg divide-y">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resume.filename}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(resume)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resume)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No resumes uploaded yet</div>
        )}
      </div>
    </div>
  )
} 