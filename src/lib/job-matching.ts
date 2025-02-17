import { ExtractedData, JobRecommendation } from '@/lib/types'
import { jobScraperService, ScrapedJob } from './services/job-scraper'
import { MilitaryCode, MILITARY_CODES } from '@/lib/constants'
import { OpenAI } from 'openai'

// Initialize OpenAI client with environment variable
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

const openai = new OpenAI({
  apiKey
})

interface SkillWeight {
  skill: string
  weight: number
  relatedSkills: string[]
}

// Skill weights and related skills for better matching
const SKILL_WEIGHTS: SkillWeight[] = [
  {
    skill: 'cybersecurity',
    weight: 1.5,
    relatedSkills: ['security', 'network security', 'information security']
  },
  {
    skill: 'leadership',
    weight: 1.3,
    relatedSkills: ['management', 'team leadership', 'supervision']
  },
  {
    skill: 'intelligence analysis',
    weight: 1.4,
    relatedSkills: ['data analysis', 'threat analysis', 'intelligence']
  },
  {
    skill: 'operations management',
    weight: 1.2,
    relatedSkills: ['project management', 'program management', 'operations']
  }
]

// Enhanced job role definitions with required and preferred skills
export interface EnhancedJobRole {
  id: string
  title: string
  description: string
  salaryRange: string
  requiredSkills: string[]
  preferredSkills: string[]
  minimumYearsExperience: number
  securityClearanceRequired: boolean
  demandTrend: string
  industries: string[]
  relatedMOS: string[]
  skillImportance: Record<string, number> // 0-1 importance score for each skill
}

interface JobMatch {
  role: EnhancedJobRole
  score: number
  matchDetails: {
    skillMatch: number
    experienceMatch: number
    mosMatch: number
    totalScore: number
  }
}

interface CivilianEquivalent {
  roles: string[]
  skills: string[]
  industries: string[]
  keywords: string[]
}

interface AIJobRecommendation {
  title: string
  matchPercentages: {
    skillMatch: number
    experienceMatch: number
    mosMatch: number
    overallMatch: number
  }
  reasonForMatch: string
  requiredSkills: string[]
  suggestedIndustries: string[]
}

export async function calculateJobMatches(data: ExtractedData): Promise<JobRecommendation[]> {
  try {
    // Get AI recommendations with match percentages
    const aiRecommendations = await getAIRecommendations(data)
    
    // Convert AI recommendations directly to JobRecommendation format
    const recommendations: JobRecommendation[] = aiRecommendations.map((rec) => ({
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: rec.title,
      description: rec.reasonForMatch,
      salaryRange: 'Competitive',
      requiredSkills: rec.requiredSkills,
      demandTrend: 'Growing',
      industries: rec.suggestedIndustries,
      matchReason: rec.reasonForMatch,
      matchScore: rec.matchPercentages.overallMatch,
      matchDetails: {
        skillMatch: rec.matchPercentages.skillMatch,
        experienceMatch: rec.matchPercentages.experienceMatch,
        mosMatch: rec.matchPercentages.mosMatch
      }
    }))

    // Sort by match score and remove duplicates
    const uniqueRecommendations = recommendations.reduce((acc, current) => {
      const x = acc.find(item => item.title === current.title)
      if (!x) {
        return acc.concat([current])
      } else {
        return acc
      }
    }, [] as JobRecommendation[])

    return uniqueRecommendations.sort((a, b) => b.matchScore - a.matchScore)
  } catch (error) {
    console.error('Error calculating job matches:', error)
    throw error // Let the API route handle the error
  }
}

async function getAIRecommendations(data: ExtractedData): Promise<AIJobRecommendation[]> {
  if (!data.militaryInfo?.mos) {
    return []
  }

  const prompt = `
    Based on the following military background, provide job recommendations:
    Rank: ${data.militaryInfo?.rank || 'Not specified'}
    Branch: ${data.militaryInfo?.branch || 'Not specified'}
    MOS/AFSC: ${data.militaryInfo?.mos || 'Not specified'}
    Skills: ${data.skills.join(', ') || 'None provided'}
    Experience: ${data.experience.map(e => `${e.title} (${e.duration})`).join(', ') || 'None provided'}
    Education: ${data.education.join(', ') || 'None provided'}

    Provide recommendations in this JSON format:
    [
      {
        "title": "Job Title",
        "matchPercentages": {
          "skillMatch": 85,
          "experienceMatch": 70,
          "mosMatch": 90,
          "overallMatch": 82
        },
        "reasonForMatch": "Detailed explanation of why this job is a good match",
        "requiredSkills": ["skill1", "skill2", "skill3"],
        "suggestedIndustries": ["industry1", "industry2"]
      }
    ]
  `

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in military to civilian career translation, specializing in technology, cybersecurity, and management roles. Provide detailed, accurate job recommendations with realistic match percentages."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })

    if (!completion.choices[0].message.content) {
      return []
    }

    try {
      // Clean the response of any markdown formatting
      let content = completion.choices[0].message.content
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim()
      
      const parsedResponse = JSON.parse(content)
      if (Array.isArray(parsedResponse)) {
        return parsedResponse as AIJobRecommendation[]
      } else if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
        return parsedResponse.recommendations as AIJobRecommendation[]
      } else {
        return []
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return []
    }
  } catch (error) {
    console.error('Error getting AI recommendations:', error)
    return []
  }
}

function removeDuplicateJobs(jobs: JobRecommendation[]): JobRecommendation[] {
  const seen = new Set<string>()
  return jobs.filter(job => {
    const key = `${job.title}-${job.description}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function determineIndustries(job: ScrapedJob, civilianIndustries: string[]): string[] {
  const industries = new Set<string>(civilianIndustries)
  
  // Add additional industries based on job content
  if (job.title.toLowerCase().includes('security') || 
      job.description.toLowerCase().includes('security')) {
    industries.add('Cybersecurity')
  }
  
  return Array.from(industries)
}

function generateMatchReason(job: ScrapedJob, data: ExtractedData, civilian: CivilianEquivalent): string {
  const reasons: string[] = []
  
  // Check for skill matches using civilian equivalent skills
  const matchedSkills = civilian.skills.filter(skill => 
    job.description.toLowerCase().includes(skill.toLowerCase())
  )
  if (matchedSkills.length > 0) {
    reasons.push(`matches your civilian equivalent skills in ${matchedSkills.slice(0, 2).join(', ')}`)
  }
  
  // Check for industry alignment
  const matchedIndustries = civilian.industries.filter(industry =>
    job.description.toLowerCase().includes(industry.toLowerCase())
  )
  if (matchedIndustries.length > 0) {
    reasons.push(`aligns with your target industries`)
  }
  
  return reasons.length > 0 
    ? `This role ${reasons.join(' and ')}`
    : 'This role matches your civilian career profile'
}

function calculateMatchScore(job: ScrapedJob, data: ExtractedData, civilian: CivilianEquivalent): number {
  const skillMatch = calculateSkillMatch(job, data, civilian)
  const experienceMatch = calculateExperienceMatch(job, data)
  const roleMatch = calculateRoleMatch(job, civilian)
  
  return Math.round((skillMatch * 0.4 + experienceMatch * 0.3 + roleMatch * 0.3) * 100)
}

function calculateSkillMatch(job: ScrapedJob, data: ExtractedData, civilian: CivilianEquivalent): number {
  const matchedSkills = civilian.skills.filter(skill => 
    job.description.toLowerCase().includes(skill.toLowerCase())
  )
  return matchedSkills.length / civilian.skills.length
}

function calculateExperienceMatch(job: ScrapedJob, data: ExtractedData): number {
  // Simple experience match based on years
  const userYears = data.experience.reduce((total, exp) => {
    const years = parseInt(exp.duration) || 0
    return total + years
  }, 0)
  
  return userYears >= 3 ? 1 : userYears / 3
}

function calculateMOSMatch(job: ScrapedJob, data: ExtractedData, civilian: CivilianEquivalent): number {
  if (!data.militaryInfo.mos) return 0
  
  const mosCode = MILITARY_CODES.find(code => code.code === data.militaryInfo.mos)
  if (!mosCode) return 0
  
  // Check if job description mentions the MOS title or related keywords
  const mosTitle = mosCode.title.toLowerCase()
  const jobText = `${job.title} ${job.description}`.toLowerCase()
  
  if (jobText.includes(mosTitle)) return 1
  
  // Check for related military keywords
  const militaryKeywords = ['military', 'veteran', 'armed forces', mosCode.branch.toLowerCase()]
  const hasRelatedKeywords = militaryKeywords.some(keyword => jobText.includes(keyword))
  
  return hasRelatedKeywords ? 0.5 : 0
}

function calculateRoleMatch(job: ScrapedJob, civilian: CivilianEquivalent): number {
  const jobText = `${job.title} ${job.description}`.toLowerCase()
  const matchedRoles = civilian.roles.filter(role => 
    jobText.includes(role.toLowerCase())
  )
  return matchedRoles.length > 0 ? 1 : 0
}

function extractSkillsFromDescription(description: string): string[] {
  const commonSkills = [
    'leadership', 'management', 'analysis', 'security', 'development',
    'operations', 'communication', 'strategy', 'technical', 'project management'
  ]
  
  return commonSkills.filter(skill => 
    description.toLowerCase().includes(skill.toLowerCase())
  )
}

function calculateSkillScore(userSkills: string[], role: EnhancedJobRole): number {
  let score = 0
  const totalPossibleScore = calculateTotalPossibleSkillScore(role)

  // Check required skills
  for (const skill of role.requiredSkills) {
    const weight = getSkillWeight(skill)
    const importance = role.skillImportance[skill] || 1
    if (hasMatchingSkill(userSkills, skill)) {
      score += weight * importance
    }
  }

  // Check preferred skills
  for (const skill of role.preferredSkills) {
    const weight = getSkillWeight(skill) * 0.5 // Preferred skills worth half of required
    const importance = role.skillImportance[skill] || 0.5
    if (hasMatchingSkill(userSkills, skill)) {
      score += weight * importance
    }
  }

  return score / totalPossibleScore // Normalize to 0-1
}

function calculateExperienceScore(experience: { duration: string }[], role: EnhancedJobRole): number {
  const totalYears = experience.reduce((sum, exp) => {
    const years = parseYearsFromDuration(exp.duration)
    return sum + years
  }, 0)

  if (totalYears >= role.minimumYearsExperience) {
    return 1
  }

  return totalYears / role.minimumYearsExperience
}

function calculateMOSScore(userMOS: string | undefined, role: EnhancedJobRole): number {
  if (!userMOS) return 0
  return role.relatedMOS.includes(userMOS) ? 1 : 0
}

// Helper functions
function getSkillWeight(skill: string): number {
  const weightData = SKILL_WEIGHTS.find(sw => 
    sw.skill.toLowerCase() === skill.toLowerCase() ||
    sw.relatedSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  )
  return weightData?.weight || 1
}

function hasMatchingSkill(userSkills: string[], targetSkill: string): boolean {
  const skillData = SKILL_WEIGHTS.find(sw => sw.skill.toLowerCase() === targetSkill.toLowerCase())
  
  return userSkills.some(userSkill => 
    userSkill.toLowerCase() === targetSkill.toLowerCase() ||
    skillData?.relatedSkills.some(rs => rs.toLowerCase() === userSkill.toLowerCase())
  )
}

function calculateTotalPossibleSkillScore(role: EnhancedJobRole): number {
  let total = 0
  
  // Sum required skills
  for (const skill of role.requiredSkills) {
    const weight = getSkillWeight(skill)
    const importance = role.skillImportance[skill] || 1
    total += weight * importance
  }
  
  // Sum preferred skills
  for (const skill of role.preferredSkills) {
    const weight = getSkillWeight(skill) * 0.5
    const importance = role.skillImportance[skill] || 0.5
    total += weight * importance
  }
  
  return total
}

function parseYearsFromDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*years?/)
  return match ? parseInt(match[1], 10) : 0
}

function generateFallbackRecommendations(data: ExtractedData): AIJobRecommendation[] {
  // Implementation of generateFallbackRecommendations function
  // This function should return an array of AIJobRecommendation objects
  // based on the fallback logic for when the main AI recommendation fails
  return []
} 