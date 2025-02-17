import { MilitaryRank, MilitaryBranch, MilitarySkill } from './constants'

export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface MilitaryInfo {
  rank?: MilitaryRank
  branch?: MilitaryBranch
  mos?: string
}

export interface Experience {
  title: string
  duration: string
  description?: string
  organization?: string
}

export interface Education {
  type: string
  field: string
}

export interface ExtractedData {
  skills: MilitarySkill[]
  experience: Experience[]
  education: Education[]
  militaryInfo: MilitaryInfo
}

export interface JobRecommendation {
  id: string
  title: string
  description: string
  salaryRange: string
  requiredSkills: string[]
  demandTrend: string
  industries: string[]
  matchReason: string
  matchScore: number
  matchDetails: {
    skillMatch: number
    experienceMatch: number
    mosMatch: number
  }
}

export interface MarketInsights {
  industryGrowth: string
  topLocations: string[]
  keyTrends: string[]
}

export interface RecommendationResponse {
  recommendations: JobRecommendation[]
  marketInsights: MarketInsights
  timestamp: string
}

export interface ResumeUploadResponse {
  success: boolean
  data?: ExtractedData
  error?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
} 