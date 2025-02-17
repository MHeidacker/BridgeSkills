import { MilitaryBranch, MilitaryRank, MilitarySkill, ServiceType } from './constants'

export type { MilitaryBranch, MilitaryRank, MilitarySkill, ServiceType }

export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export type DegreeType = 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'Doctorate' | 'Certification' | 'Other'

export interface MilitaryInfo {
  serviceType?: ServiceType
  rank?: MilitaryRank
  branch?: MilitaryBranch
  mos?: string
}

export interface Experience {
  title: string
  organization: string
  startDate: string
  endDate?: string
  description: string
  skills: string[]
}

export interface Education {
  type: DegreeType
  field: string
  institution: string
  graduationDate: string
  gpa?: number
}

export interface TechnicalSkill {
  name: string
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  yearsOfExperience: number
}

export interface Certification {
  name: string
  issuer: string
  dateObtained: string
  expirationDate?: string
  isActive: boolean
}

export interface ExtractedData {
  militaryInfo: MilitaryInfo
  skills: MilitarySkill[]
  technicalSkills: TechnicalSkill[]
  certifications: Certification[]
  experience: Experience[]
  education: Education[]
  resumeText?: string
}

interface SalaryRange {
  min: number
  max: number
  median: number
  currency: string
}

export interface JobRecommendation {
  id: string
  title: string
  description: string
  salaryRange: string
  salaryInsights: {
    median: number
    byExperience: {
      entry: SalaryRange
      mid: SalaryRange
      senior: SalaryRange
    }
    byLocation: {
      [key: string]: SalaryRange
    }
    byIndustry: {
      [key: string]: SalaryRange
    }
  }
  requiredSkills: string[]
  demandTrend: string
  industries: string[]
  matchReason: string
  matchScore: number
  matchDetails: {
    skillMatch: number
    experienceMatch: number
    mosMatch: number
    technicalMatch: number
  }
  recommendedCertifications: string[]
  careerProgression: string
}

export interface RecommendationResponse {
  recommendations: JobRecommendation[]
  marketInsights: MarketInsights
  timestamp: string
  error?: string
}

export interface MarketInsights {
  industryGrowth: string
  topLocations: string[]
  keyTrends: string[]
}

export interface ExtractedPdfData {
  text: string
  metadata: {
    pages: number
    version: string
  }
}

export interface ResumeUploadResponse {
  success: boolean
  data?: ExtractedPdfData
  error?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
} 