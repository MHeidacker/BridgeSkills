import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ResumeUploadResponse, ExtractedData } from '@/lib/types'
import { COMMON_MILITARY_SKILLS } from '@/lib/constants'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest): Promise<NextResponse<ResumeUploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF or Word document.' },
        { status: 400 }
      )
    }

    // TODO: Implement actual NLP processing
    // For now, return sample data
    const sampleData: ExtractedData = {
      skills: ['Leadership', 'Cybersecurity', 'Intelligence Analysis'] as any[], // Type assertion needed due to const array
      experience: [
        {
          title: 'Cyber Operations Officer',
          duration: '3 years',
          organization: 'US Air Force',
          description: 'Led cyber operations team in defensive and offensive operations.'
        }
      ],
      education: ['Bachelor of Science in Computer Science, Air Force Academy'],
      militaryInfo: {
        rank: 'O-3',
        branch: 'Air Force',
        mos: '17S'
      }
    }

    // Store the file in Supabase Storage
    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sampleData
    })
  } catch (error) {
    console.error('Error processing resume:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process resume' },
      { status: 500 }
    )
  }
} 