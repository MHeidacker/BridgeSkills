import { ExtractedData, JobRecommendation } from './types'
import { jobScraperService, ScrapedJob } from './services/job-scraper'
import { MilitaryCode, MILITARY_CODES } from '@/lib/constants'
import OpenAI from 'openai'
import { SalaryDataService } from './services/salary-data'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize salary data service
const salaryDataService = new SalaryDataService()

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

// Define AI recommendation interface
interface AIJobRecommendation {
  title: string
  matchPercentages: {
    skillMatch: number
    experienceMatch: number
    mosMatch: number
    technicalMatch: number
    overallMatch: number
  }
  reasonForMatch: string
  requiredSkills: string[]
  suggestedIndustries: string[]
  recommendedCertifications: string[]
  careerProgression: string
}

function parseAIResponse(content: string): AIJobRecommendation[] {
  try {
    // Clean the response of any markdown formatting
    content = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim()
    
    let parsedResponse
    try {
      parsedResponse = JSON.parse(content)
    } catch {
      // If JSON parsing fails, try to extract structured data using regex
      const recommendations: AIJobRecommendation[] = []
      const sections = content.split(/(?=Job Title:)/i)
      
      for (const section of sections) {
        if (!section.trim()) continue
        
        const title = section.match(/Job Title:\s*(.+?)(?:\n|$)/i)?.[1]
        const matchStr = section.match(/Match Percentages?:[\s\S]*?Overall:\s*(\d+)/i)?.[1]
        const reason = section.match(/Reason for Match:\s*(.+?)(?:\n|$)/i)?.[1]
        const skills = section.match(/Required Skills:\s*(.+?)(?:\n|$)/i)?.[1]?.split(/,\s*/)
        const industries = section.match(/Suggested Industries:\s*(.+?)(?:\n|$)/i)?.[1]?.split(/,\s*/)
        const certs = section.match(/Recommended Certifications:\s*(.+?)(?:\n|$)/i)?.[1]?.split(/,\s*/)
        const progression = section.match(/Career Progression:\s*(.+?)(?:\n|$)/i)?.[1]

        if (title) {
          recommendations.push({
            title: title.trim(),
            matchPercentages: {
              skillMatch: 80, // Default values if not specified
              experienceMatch: 75,
              mosMatch: 70,
              technicalMatch: 75,
              overallMatch: parseInt(matchStr || '75')
            },
            reasonForMatch: reason?.trim() || 'Based on skill and experience match',
            requiredSkills: skills?.map(s => s.trim()) || [],
            suggestedIndustries: industries?.map(i => i.trim()) || [],
            recommendedCertifications: certs?.map(c => c.trim()) || [],
            careerProgression: progression?.trim() || 'Standard industry progression path'
          })
        }
      }
      
      return recommendations
    }

    if (Array.isArray(parsedResponse)) {
      return parsedResponse as AIJobRecommendation[]
    } else if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
      return parsedResponse.recommendations as AIJobRecommendation[]
    }
    
    return []
  } catch (error) {
    console.error('Error parsing AI response:', error)
    return []
  }
}

async function convertToJobRecommendations(aiRecs: AIJobRecommendation[]): Promise<JobRecommendation[]> {
  const recommendations = []
  
  for (const rec of aiRecs) {
    try {
      // Get salary data for the job title
      const salaryData = await salaryDataService.getSalaryData(rec.title)
      
      recommendations.push({
        id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: rec.title,
        description: rec.reasonForMatch,
        salaryRange: `$${salaryData.range.min.toLocaleString()} - $${salaryData.range.max.toLocaleString()}`,
        salaryInsights: {
          median: salaryData.range.median,
          byExperience: salaryData.experience,
          byLocation: salaryData.location,
          byIndustry: salaryData.industry
        },
        requiredSkills: rec.requiredSkills,
        demandTrend: rec.matchPercentages.overallMatch > 80 ? 'High' : rec.matchPercentages.overallMatch > 60 ? 'Medium' : 'Low',
        industries: rec.suggestedIndustries,
        matchReason: rec.reasonForMatch,
        matchScore: rec.matchPercentages.overallMatch,
        matchDetails: {
          skillMatch: rec.matchPercentages.skillMatch,
          experienceMatch: rec.matchPercentages.experienceMatch,
          mosMatch: rec.matchPercentages.mosMatch,
          technicalMatch: rec.matchPercentages.technicalMatch
        },
        recommendedCertifications: rec.recommendedCertifications,
        careerProgression: rec.careerProgression
      })
    } catch (error) {
      console.error('Error converting job recommendation:', error)
      // Continue with next recommendation if one fails
      continue
    }
  }
  
  return recommendations
}

export async function calculateJobMatches(data: ExtractedData): Promise<JobRecommendation[]> {
  try {
    const aiRecommendations = await getAIRecommendations(data)
    return convertToJobRecommendations(aiRecommendations)
  } catch (error) {
    console.error('Error calculating job matches:', error)
    return []
  }
}

function generateResumePrompt(resumeText: string): string {
  return `Analyze this military veteran's resume and provide diverse civilian career recommendations. Extract key information and consider both technical and non-technical roles that leverage their experience:

Resume Text:
${resumeText}

Consider these aspects in your analysis and recommendations:
1. Military experience, rank, and responsibilities
2. Leadership and management capabilities demonstrated
3. Technical skills and proficiencies mentioned
4. Project and program management experience
5. Training and mentoring responsibilities
6. Strategic planning and execution examples
7. Cross-functional team coordination
8. Risk management and decision-making instances
9. Communication and interpersonal skills
10. Problem-solving and analytical capabilities

Look for opportunities in diverse sectors such as:
- Technology and IT
- Business Operations
- Project/Program Management
- Training and Development
- Operations and Logistics
- Consulting
- Healthcare Administration
- Financial Services
- Government/Public Sector
- Manufacturing and Supply Chain

Provide your recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Job Title",
      "matchPercentages": {
        "skillMatch": number (0-100),
        "experienceMatch": number (0-100),
        "mosMatch": number (0-100),
        "technicalMatch": number (0-100),
        "overallMatch": number (0-100)
      },
      "reasonForMatch": "Detailed explanation of why this job matches",
      "requiredSkills": ["skill1", "skill2", ...],
      "suggestedIndustries": ["industry1", "industry2", ...],
      "recommendedCertifications": ["cert1", "cert2", ...],
      "careerProgression": "Description of career growth path"
    }
  ]
}`
}

function generateManualPrompt(data: ExtractedData): string {
  return `Analyze this military background and provide diverse civilian career recommendations. Consider both technical and non-technical roles that leverage their experience:

Military Info: ${data.militaryInfo.rank || 'Not specified'} - ${data.militaryInfo.branch || 'Not specified'} - ${data.militaryInfo.mos || 'Not specified'}

Skills: ${data.skills.join(', ') || 'None provided'}

Experience: ${data.experience.map(e => 
  `${e.title} at ${e.organization} (${e.startDate} to ${e.endDate || 'Present'}): ${e.description}`
).join('\n') || 'None provided'}

Education: ${data.education.map(e => 
  `${e.type} in ${e.field} from ${e.institution} (${e.graduationDate})`
).join('\n') || 'None provided'}

Technical Skills: ${data.technicalSkills?.map(skill => 
  `${skill.name} (${skill.proficiency}, ${skill.yearsOfExperience} years)`
).join(', ') || 'None provided'}

Certifications: ${data.certifications?.map(cert => 
  `${cert.name} from ${cert.issuer} (${cert.isActive ? 'Active' : 'Inactive'})`
).join(', ') || 'None provided'}

Consider these aspects in your recommendations:
1. Leadership and management capabilities
2. Project and program management experience
3. Training and mentoring abilities
4. Strategic planning and execution
5. Cross-functional team coordination
6. Risk management and decision-making
7. Technical expertise (if applicable)
8. Communication and interpersonal skills
9. Logistics and operations experience
10. Problem-solving and analytical skills

Look for opportunities in diverse sectors such as:
- Technology and IT
- Business Operations
- Project/Program Management
- Training and Development
- Operations and Logistics
- Consulting
- Healthcare Administration
- Financial Services
- Government/Public Sector
- Manufacturing and Supply Chain

Provide your recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Job Title",
      "matchPercentages": {
        "skillMatch": number (0-100),
        "experienceMatch": number (0-100),
        "mosMatch": number (0-100),
        "technicalMatch": number (0-100),
        "overallMatch": number (0-100)
      },
      "reasonForMatch": "Detailed explanation of why this job matches",
      "requiredSkills": ["skill1", "skill2", ...],
      "suggestedIndustries": ["industry1", "industry2", ...],
      "recommendedCertifications": ["cert1", "cert2", ...],
      "careerProgression": "Description of career growth path"
    }
  ]
}`
}

export async function getAIRecommendations(data: ExtractedData): Promise<AIJobRecommendation[]> {
  const prompt = data.resumeText 
    ? generateResumePrompt(data.resumeText)
    : generateManualPrompt(data)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor specializing in military-to-civilian transitions. Your goal is to identify diverse career opportunities based on transferable skills, leadership experience, and adaptability. Consider both technical and non-technical roles across various industries. Look for opportunities where military experience provides unique value, such as project management, operations, logistics, leadership, training, and strategic planning. Don't limit recommendations to just cybersecurity or technical roles unless they are clearly the best fit."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    if (!completion.choices[0]?.message.content) {
      throw new Error('No content in OpenAI response')
    }

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from OpenAI API')
    }

    const recommendations = parseAIResponse(content)

    if (!recommendations || recommendations.length === 0) {
      return generateFallbackRecommendations(data)
    }

    return recommendations
  } catch (error) {
    console.error('Error getting AI recommendations:', error)
    return generateFallbackRecommendations(data)
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
  // Calculate total years of experience
  const userYears = data.experience.reduce((total, exp) => {
    if (!exp.startDate) return total
    
    const start = new Date(exp.startDate)
    const end = exp.endDate ? new Date(exp.endDate) : new Date()
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    return total + years
  }, 0)

  // Simple scoring based on years of experience
  if (userYears >= 5) return 1
  if (userYears >= 3) return 0.8
  if (userYears >= 1) return 0.6
  return 0.4
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