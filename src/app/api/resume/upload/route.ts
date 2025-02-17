import { NextRequest, NextResponse } from 'next/server'
import { ResumeUploadResponse, ExtractedData } from '@/lib/types'
import { OpenAI } from 'openai'
import { 
  COMMON_MILITARY_SKILLS, 
  MILITARY_RANKS, 
  MILITARY_BRANCHES,
  MILITARY_CODES 
} from '@/lib/constants'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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

    // Convert file to text
    const text = await file.text()

    // Reduce chunk size to handle token limits (approximately 6000 tokens per chunk)
    const chunkSize = 15000 // Characters, not tokens, but a rough approximation
    const chunks = []
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize))
    }

    // Process each chunk and combine results
    const results = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      // Add delay between chunks to respect rate limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 20000)) // 20 second delay between chunks
      }

      // Optimized prompt to reduce token usage
      const prompt = `Extract military experience from this resume section. Use exact matches only:
Ranks: ${MILITARY_RANKS.join(', ')}
Branches: ${MILITARY_BRANCHES.join(', ')}
Skills: ${COMMON_MILITARY_SKILLS.join(', ')}

Return JSON:
{
  "skills": string[],
  "experience": [{"title": string, "duration": string, "description?": string, "organization?": string}],
  "education": [{"type": string, "field": string}],
  "militaryInfo": {"rank?": string, "branch?": string, "mos?": string}
}

Resume text:
${chunk}`

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert at analyzing military resumes. Extract only explicitly mentioned information, no inference."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1, // Reduced temperature for more consistent results
        })

        if (!completion.choices[0].message.content) {
          console.warn('No content in OpenAI response for chunk ${i + 1}')
          continue
        }

        const extractedData = JSON.parse(completion.choices[0].message.content) as ExtractedData
        results.push(extractedData)
      } catch (error) {
        console.error('Error processing chunk ${i + 1}:', error)
        // Continue with other chunks even if one fails
        continue
      }
    }

    // If no results were processed successfully, throw an error
    if (results.length === 0) {
      throw new Error('Failed to process any parts of the resume')
    }

    // Combine results from all chunks
    const combinedData: ExtractedData = {
      skills: [...new Set(results.flatMap(r => r.skills || []))],
      experience: results.flatMap(r => r.experience || []),
      education: results.flatMap(r => r.education || []),
      militaryInfo: results.reduce((acc, curr) => ({
        rank: acc.rank || curr.militaryInfo?.rank,
        branch: acc.branch || curr.militaryInfo?.branch,
        mos: acc.mos || curr.militaryInfo?.mos
      }), {} as ExtractedData['militaryInfo'])
    }

    // Validate the combined data
    if (!combinedData.skills || !Array.isArray(combinedData.skills)) {
      throw new Error('Invalid skills data')
    }
    if (!combinedData.experience || !Array.isArray(combinedData.experience)) {
      throw new Error('Invalid experience data')
    }
    if (!combinedData.education || !Array.isArray(combinedData.education)) {
      throw new Error('Invalid education data')
    }
    if (!combinedData.militaryInfo || typeof combinedData.militaryInfo !== 'object') {
      throw new Error('Invalid military info')
    }

    // Validate military info against constants
    if (combinedData.militaryInfo.rank && !MILITARY_RANKS.includes(combinedData.militaryInfo.rank as any)) {
      combinedData.militaryInfo.rank = undefined
    }
    if (combinedData.militaryInfo.branch && !MILITARY_BRANCHES.includes(combinedData.militaryInfo.branch as any)) {
      combinedData.militaryInfo.branch = undefined
    }
    if (combinedData.militaryInfo.mos && !MILITARY_CODES.find(code => code.code === combinedData.militaryInfo.mos)) {
      combinedData.militaryInfo.mos = undefined
    }

    // Filter skills to only include valid military skills
    combinedData.skills = Array.from(new Set(combinedData.skills)).filter(skill => 
      COMMON_MILITARY_SKILLS.includes(skill as any)
    )

    return NextResponse.json({
      success: true,
      data: combinedData
    })
  } catch (error) {
    console.error('Error processing resume:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process resume' },
      { status: 500 }
    )
  }
} 