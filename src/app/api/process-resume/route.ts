import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ExtractedData, Experience, MilitaryInfo } from '@/lib/types'

export async function POST(request: Request) {
  try {
    // Get the file path from the request
    const { filePath } = await request.json()

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath)

    if (downloadError) {
      throw downloadError
    }

    // Convert file to text
    const text = await fileData.text()

    // Extract data from the resume text
    const extractedData: ExtractedData = {
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      militaryInfo: extractMilitaryInfo(text),
    }

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error('Error processing resume:', error)
    return NextResponse.json(
      { error: 'Failed to process resume' },
      { status: 500 }
    )
  }
}

// Simple regex-based extraction functions
function extractSkills(text: string): string[] {
  // Common technical and military skills
  const skillKeywords = [
    'leadership',
    'management',
    'cybersecurity',
    'intelligence',
    'analysis',
    'operations',
    'security',
    'communication',
    'strategy',
    'planning',
    // Add more keywords as needed
  ]

  const skills = skillKeywords.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  )

  return Array.from(new Set(skills)) // Remove duplicates
}

function extractExperience(text: string): Experience[] {
  const experienceRegex = /(?:^|\n)(.*?(?:specialist|officer|manager|lead|chief|director|coordinator).{0,50}?)(?:\n|$)/gim
  const matches = Array.from(text.matchAll(experienceRegex))
  
  return matches.map(match => ({
    title: match[1].trim(),
    duration: 'Not specified' // TODO: Implement duration extraction
  }))
}

function extractEducation(text: string): string[] {
  const educationRegex = /(?:bachelor|master|phd|certificate|certification|degree)s?\s+(?:of|in)\s+([^.\n]+)/gi
  const matches = Array.from(text.matchAll(educationRegex))
  
  return matches.map(match => match[0].trim())
}

function extractMilitaryInfo(text: string): MilitaryInfo {
  // Common military ranks
  const ranks = [
    'private',
    'corporal',
    'sergeant',
    'lieutenant',
    'captain',
    'major',
    'colonel',
    // Add more ranks as needed
  ]

  // Military branches
  const branches = [
    'army',
    'navy',
    'air force',
    'marines',
    'coast guard',
    'space force',
  ]

  // Simple MOS pattern (can be expanded)
  const mosRegex = /\b\d{2}[A-Z]\b/

  return {
    rank: ranks.find(rank => new RegExp(`\\b${rank}\\b`, 'i').test(text)),
    branch: branches.find(branch => new RegExp(`\\b${branch}\\b`, 'i').test(text)),
    mos: text.match(mosRegex)?.[0],
  }
} 