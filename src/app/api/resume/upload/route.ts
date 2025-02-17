import { NextRequest, NextResponse } from 'next/server'
import { ResumeUploadResponse } from '@/lib/types'
import pdfParse from 'pdf-parse'

// Configure route options
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Define allowed methods
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    }
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<ResumeUploadResponse>> {
  try {
    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Please upload a PDF document' },
        { status: 400 }
      )
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    try {
      console.log('Starting PDF parsing...')
      const pdfData = await pdfParse(buffer)
      
      console.log('PDF Metadata:', {
        numpages: pdfData.numpages,
        info: pdfData.info,
        metadata: pdfData.metadata,
        version: pdfData.version
      })

      const pdfText = pdfData.text
      
      // Log the extracted text
      console.log('\n--- START OF EXTRACTED TEXT ---')
      console.log(pdfText)
      console.log('--- END OF EXTRACTED TEXT ---\n')
      
      console.log('Text Statistics:', {
        totalLength: pdfText.length,
        numberOfLines: pdfText.split('\n').length,
        firstFewWords: pdfText.split(' ').slice(0, 10).join(' ') + '...'
      })
      
      if (!pdfText || pdfText.trim().length === 0) {
        console.error('No text content found in PDF')
        return NextResponse.json(
          { success: false, error: 'No text content found in PDF' },
          { status: 400 }
        )
      }

      // Return success with the extracted text
      return NextResponse.json({
        success: true,
        data: {
          text: pdfText,
          metadata: {
            pages: pdfData.numpages,
            version: pdfData.version
          }
        }
      })

    } catch (error) {
      console.error('PDF parsing error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to parse PDF file' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 