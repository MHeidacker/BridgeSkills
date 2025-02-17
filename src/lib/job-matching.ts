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

export async function calculateJobMatches(data: ExtractedData): Promise<JobRecommendation[]> {
  try {
    // First, translate military experience to civilian equivalents
    const civilianEquivalents = await translateMilitaryToCivilian(data)
    
    // Create search queries for each potential role
    const searchPromises = civilianEquivalents.roles.map(async (role) => {
      const baseRecommendation: JobRecommendation = {
        id: `job-${Date.now()}-${role}`,
        title: role,
        description: 'Civilian equivalent role',
        salaryRange: 'Competitive',
        requiredSkills: civilianEquivalents.skills,
        demandTrend: 'Growing',
        industries: civilianEquivalents.industries,
        matchReason: 'Based on military experience translation',
        matchScore: 0,
        matchDetails: {
          skillMatch: 0,
          experienceMatch: 0,
          mosMatch: 0
        }
      }

      // Pass the search keywords to the job scraper
      return jobScraperService.searchJobs(baseRecommendation, data, civilianEquivalents.keywords)
    })

    // Get all job results
    const allJobResults = await Promise.all(searchPromises)
    const scrapedJobs = allJobResults.flat()

    // Convert scraped jobs to recommendations with enhanced matching
    const recommendations: JobRecommendation[] = scrapedJobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salaryRange: job.salary || 'Competitive',
      requiredSkills: job.skills || [],
      demandTrend: 'Growing',
      industries: determineIndustries(job, civilianEquivalents.industries),
      matchReason: generateMatchReason(job, data, civilianEquivalents),
      matchScore: calculateMatchScore(job, data, civilianEquivalents),
      matchDetails: {
        skillMatch: calculateSkillMatch(job, data, civilianEquivalents),
        experienceMatch: calculateExperienceMatch(job, data),
        mosMatch: calculateMOSMatch(job, data, civilianEquivalents)
      }
    }))

    // Remove duplicates and sort by match score
    const uniqueRecommendations = removeDuplicateJobs(recommendations)
    return uniqueRecommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
  } catch (error) {
    console.error('Error calculating job matches:', error)
    return []
  }
}

async function translateMilitaryToCivilian(data: ExtractedData): Promise<CivilianEquivalent> {
  try {
    const prompt = `
      Given the following military experience, provide civilian equivalents:
      MOS/AFSC: ${data.militaryInfo.mos || 'Not specified'}
      Branch: ${data.militaryInfo.branch || 'Not specified'}
      Skills: ${data.skills.join(', ')}
      Experience: ${data.experience.map(e => e.description).join('; ')}

      Please provide:
      1. Equivalent civilian job titles (focus on technology, cybersecurity, and management roles)
      2. Equivalent civilian skills
      3. Relevant civilian industries
      4. Key search terms for job matching

      Format the response as JSON with the following structure:
      {
        "roles": ["role1", "role2", ...],
        "skills": ["skill1", "skill2", ...],
        "industries": ["industry1", "industry2", ...],
        "keywords": ["keyword1", "keyword2", ...]
      }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert in military to civilian career translation. Focus on technology, cybersecurity, and management roles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })

    return JSON.parse(completion.choices[0].message.content) as CivilianEquivalent
  } catch (error) {
    console.error('Error translating military experience:', error)
    // Provide fallback civilian equivalents if AI translation fails
    return {
      roles: ['Project Manager', 'Technical Program Manager', 'Cybersecurity Analyst'],
      skills: data.skills,
      industries: ['Technology', 'Cybersecurity', 'Consulting'],
      keywords: ['technical', 'management', 'security']
    }
  }
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

function removeDuplicateJobs(jobs: JobRecommendation[]): JobRecommendation[] {
  const seen = new Set<string>()
  return jobs.filter(job => {
    const key = `${job.title}-${job.description}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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